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

export async function handleToolExecution(toolCall, userRole) {
  const { tool, args } = toolCall;

  if (isLeaderAction(tool) && !userRole.isLeader) {
    return { error: 'You need leader permissions (VP/Vice/SG) to perform this action.' };
  }

  if (tool === 'send_email') {
    let recipients = [];

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

    try {
      const emailContent = await generateEmail({
        topic: args.topic,
        tone: args.tone,
        extra_context: args.extra_context,
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
  const response = await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Email send failed');
  return data;
}
