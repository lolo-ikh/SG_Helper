import { TOOL_DEFINITIONS, executeTool, isLeaderAction } from './mcpTools';
import { generateEmail, generateBulkEmails } from './emailGenerator';
import { supabase } from '../lib/supabase';
import { fetchAppDataSummary } from './ebeccoAppData';

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export function isActionIntent(userMessage) {
  const lower = userMessage.toLowerCase();
  const patterns = [
    /(?:create|add|make|new|schedule)\s+(?:a\s+)?(?:new\s+)?meeting/,
    /(?:create|add|make|new)\s+(?:a\s+)?(?:new\s+)?tech\s*card/,
    /(?:send|compose|write|draft|email|mail)\s+(?:an?\s+)?(?:email|mail)/,
    /(?:generate|create|write)\s+(?:a\s+)?report/,
    /(?:list|show|get|what(?:'s| are))\s+(?:the\s+)?(?:meetings?|managers?|members?|tech\s*cards?|attendance)/,
    /(?:delete|remove|cancel)\s+(?:a\s+)?(?:meeting|tech\s*card)/,
    /(?:update|edit|change|modify)\s+(?:a\s+)?(?:meeting|tech\s*card)/,
    /(?:how(?:'s| is| are))\s+(?:the\s+)?attendance/,
    /who(?:'s| are)\s+(?:the\s+)?(?:managers?|members?|team)/,
  ];
  return patterns.some(p => p.test(lower));
}

export async function detectToolCall(userMessage, chatHistory = []) {
  if (!GROQ_KEY) return null;

  const appData = await fetchAppDataSummary();

  const systemPrompt = `You are EBECO, an AI admin assistant for EBEC. You can manage meetings, tech cards, emails, and attendance.

Current date: ${new Date().toISOString().slice(0, 10)}
Current season: 2026-2027

Available tools:
${TOOL_DEFINITIONS.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}

Based on the user's message, decide if they want to perform an action (create, update, delete, list, send email, generate report) or just ask a question.

If it's an action, return a JSON tool call. If it's a question, return null.

IMPORTANT: Only use tools the user has permission for. Everyone can list/view. Only leaders can create/update/delete/send.

When sending emails to meeting attendees, set recipient_group to "managers" — the system will resolve attendees automatically from the meeting data. Do NOT list all managers as recipients when the user specifically wants only meeting attendees.

Return EXACTLY one of:
1. A tool call: {"tool": "tool_name", "args": {param1: "value1", ...}}
2. null (if it's just a question, not an action)`;

  const recentHistory = chatHistory.slice(-4).map(m => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentHistory,
          { role: 'user', content: `User message: ${userMessage}\n\nLive app data:\n${appData}` },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.tool || !TOOL_DEFINITIONS.find(t => t.function.name === parsed.tool)) return null;

    return { tool: parsed.tool, args: parsed.args || {} };
  } catch (err) {
    console.warn('[IntentHandler] Detection failed:', err.message);
    return null;
  }
}

const STOP_WORDS = new Set(['send', 'email', 'a', 'an', 'the', 'to', 'those', 'who', 'supposed', 'attend', 'meeting', 'reminder', 'like', 'for', 'of', 'about', 'today', "today's", 'on', 'and', 'or', 'is', 'it', 'this', 'that', 'at', 'from', 'with', 'by', 'as']);

export async function resolveMeetingAttendeeEmails(lowerMsg) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title, date, time, description, attendees')
    .eq('season', '2026-2027')
    .order('date', { ascending: false });

  if (!meetings || meetings.length === 0) return { recipients: [], meeting: null };

  const searchWords = lowerMsg.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  console.log('[EBECO] Attendee resolver — search words:', searchWords);

  let meeting = null;
  let bestScore = 0;

  for (const m of meetings) {
    const mTitle = (m.title || '').toLowerCase();
    const titleWords = mTitle.split(/\s+/).filter(w => w.length > 2);
    let score = 0;
    for (const sw of searchWords) {
      for (const tw of titleWords) {
        if (tw === sw || tw.includes(sw) || sw.includes(tw)) {
          score++;
          break;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      meeting = m;
    }
  }

  if (bestScore === 0) {
    meeting = meetings.find(m => m.date === today) || meetings[0] || null;
  }

  console.log('[EBECO] Attendee resolver — matched meeting:', meeting?.title, 'on', meeting?.date, 'score:', bestScore);

  if (!meeting) return { recipients: [], meeting: null };

  const rawAttendees = meeting.attendees || [];
  if (rawAttendees.length === 0) {
    console.warn('[EBECO] Attendee resolver — meeting has no attendees array');
    return { recipients: [], meeting };
  }

  const { data: managers } = await supabase
    .from('managers')
    .select('name, role, department')
    .eq('season', '2026-2027');

  if (!managers || managers.length === 0) return { recipients: [], meeting };

  console.log('[EBECO] Attendee resolver — meeting attendees:', rawAttendees);
  console.log('[EBECO] Attendee resolver — managers:', managers.map(m => m.name));

  const recipients = [];
  for (const att of rawAttendees) {
    if (typeof att !== 'string' || !att.trim()) continue;
    const aLower = att.toLowerCase().trim();
    const aParts = aLower.split(/\s+/);

    const bestManager = managers.find(m => {
      const mName = m.name.toLowerCase().trim();
      const mParts = mName.split(/\s+/);
      if (mName === aLower) return true;
      if (mName.includes(aLower) || aLower.includes(mName)) return true;
      const aLongParts = aParts.filter(p => p.length > 3);
      const mLongParts = mParts.filter(p => p.length > 3);
      return aLongParts.some(ap => mLongParts.some(mp =>
        ap === mp || ap.includes(mp) || mp.includes(ap)
      ));
    });

    if (bestManager) {
      const exists = recipients.find(r => r.name === bestManager.name);
      if (!exists) {
        recipients.push({
          name: bestManager.name,
          email: `${bestManager.name.toLowerCase().replace(/\s+/g, '.')}@ensia.edu.dz`,
        });
      }
    } else {
      console.warn(`[EBECO] Attendee resolver — no manager match for attendee: "${att}"`);
    }
  }

  console.log('[EBECO] Attendee resolver — final recipients:', recipients.map(r => r.name));
  return { recipients, meeting };
}

export async function handleToolExecution(toolCall, userRole, userMessage = '') {
  const { tool, args } = toolCall;

  if (isLeaderAction(tool) && !userRole.isLeader) {
    return { error: 'You need leader permissions (VP/Vice/SG) to perform this action.' };
  }

  if (tool === 'send_email') {
    const lowerMsg = userMessage.toLowerCase();
    const mentionsAttendees = /(?:attendees?|supposed\s+to\s+attend|attending|those\s+who|who(?:'re|\s+are)\s+(?:going|attending|invited|supposed)|invitees?|participants?|who\s+(?:will|should|need)\s+attend)/i.test(lowerMsg);

    let recipients = [];
    let meetingContext = '';

    if (toolCall._resolvedRecipients && toolCall._resolvedRecipients.length > 0) {
      recipients = toolCall._resolvedRecipients;
      const meeting = toolCall._meetingContext;
      if (meeting) {
        const timeStr = meeting.time || 'TBD';
        const dateStr = meeting.date || new Date().toISOString().slice(0, 10);
        const descStr = meeting.description ? `\nDescription: ${meeting.description}` : '';
        meetingContext = `\n\nMeeting details: "${meeting.title}" on ${dateStr} at ${timeStr}.${descStr}\nInclude the specific time and date in the email body so attendees know exactly when to show up.`;
      }
    } else if (mentionsAttendees) {
      const { recipients: resolved, meeting } = await resolveMeetingAttendeeEmails(lowerMsg);
      recipients = resolved;
      if (meeting) {
        const timeStr = meeting.time || 'TBD';
        const dateStr = meeting.date || new Date().toISOString().slice(0, 10);
        const descStr = meeting.description ? `\nDescription: ${meeting.description}` : '';
        meetingContext = `\n\nMeeting details: "${meeting.title}" on ${dateStr} at ${timeStr}.${descStr}\nInclude the specific time and date in the email body so attendees know exactly when to show up.`;
      }
    }

    if (recipients.length === 0) {
      if (mentionsAttendees) {
        return { error: 'Could not find matching attendees for this meeting. Make sure the meeting has an attendees list.' };
      }
      if (args.recipient_group === 'managers' || args.recipient_group === 'all') {
        const { data: managers } = await supabase
          .from('managers')
          .select('name, role')
          .eq('season', '2026-2027');
        if (managers && managers.length > 0) {
          recipients = managers.map(m => ({ name: m.name, email: `${m.name.toLowerCase().replace(/\s+/g, '.')}@ensia.edu.dz` }));
        }
      } else if (args.recipients && args.recipients.length > 0) {
        recipients = args.recipients.map(r => {
          if (r.includes('@')) return { name: r.split('@')[0], email: r };
          return { name: r, email: `${r.toLowerCase().replace(/\s+/g, '.')}@ensia.edu.dz` };
        });
      }
    }

    try {
      const emailContent = await generateEmail({
        topic: args.topic,
        tone: args.tone || 'formal',
        extra_context: (args.extra_context || '') + meetingContext,
        recipients: recipients.map(r => r.name),
      });

      return {
        type: 'email_preview',
        subject: emailContent.subject,
        body: emailContent.body,
        recipients,
        topic: args.topic,
      };
    } catch (err) {
      return { error: `Failed to generate email: ${err.message}` };
    }
  }

  try {
    const result = await executeTool(tool, args);
    if (result && typeof result === 'object' && result.type === 'email_preview') {
      return result;
    }
    return { success: true, message: result };
  } catch (err) {
    return { error: err.message };
  }
}

export async function sendEmailViaApi(to, subject, body) {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error('API route unavailable');
    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.error || 'Email send failed');
    return data;
  } catch (apiErr) {
    const resendKey = import.meta.env.VITE_RESEND_API_KEY;
    const resendFrom = import.meta.env.VITE_RESEND_FROM || 'EBEC <onboarding@resend.dev>';
    if (!resendKey) throw new Error('Email service not configured');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: body.replace(/\n/g, '<br>'),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Email send failed');
    return { success: true, id: data.id };
  }
}
