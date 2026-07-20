import { supabase } from '../lib/supabase';

const SEASON = '2026-2027';

export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'create_meeting',
      description: 'Create a new EBEC meeting. Only for leaders (VP/vice/SG).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Meeting title' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Time in HH:MM format (24h)' },
          description: { type: 'string', description: 'Brief description of the meeting' },
          attendees: { type: 'array', items: { type: 'string' }, description: 'List of attendee names' },
        },
        required: ['title', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_meeting',
      description: 'Update an existing meeting. Only for leaders.',
      parameters: {
        type: 'object',
        properties: {
          meeting_id: { type: 'number', description: 'ID of the meeting to update' },
          title: { type: 'string' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Time in HH:MM format' },
          description: { type: 'string' },
        },
        required: ['meeting_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_meeting',
      description: 'Delete a meeting. Only for leaders. This is destructive.',
      parameters: {
        type: 'object',
        properties: {
          meeting_id: { type: 'number', description: 'ID of the meeting to delete' },
        },
        required: ['meeting_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_meetings',
      description: 'List meetings for the current season. Anyone can use.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['all', 'upcoming', 'past'], description: 'Filter by status' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_attendance',
      description: 'Get attendance data for a specific meeting or summary across all meetings.',
      parameters: {
        type: 'object',
        properties: {
          meeting_id: { type: 'number', description: 'Specific meeting ID (omit for overall summary)' },
          period: { type: 'string', enum: ['this_week', 'this_month', 'this_season'], description: 'Time period for summary' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_tech_card',
      description: 'Create a new technical card/activity. Only for leaders.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Activity title' },
          theme: { type: 'string', description: 'Theme or topic' },
          activityType: { type: 'string', enum: ['scientific', 'cultural', 'sport'], description: 'Type of activity' },
          duration: { type: 'string', description: 'Duration (e.g., "2 hours")' },
          location: { type: 'string', description: 'Location' },
        },
        required: ['title', 'activityType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_tech_cards',
      description: 'List tech cards with optional filters.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'archived', 'all'], description: 'Filter by status' },
          activityType: { type: 'string', enum: ['scientific', 'cultural', 'sport'], description: 'Filter by type' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_managers',
      description: 'List all managers/team members for the current season.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_report',
      description: 'Generate an AI meeting report from notes and attendance data.',
      parameters: {
        type: 'object',
        properties: {
          meeting_id: { type: 'number', description: 'ID of the meeting to generate report for' },
        },
        required: ['meeting_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: 'Generate and send an email. The AI writes the content dynamically. Only for leaders.',
      parameters: {
        type: 'object',
        properties: {
          recipients: { type: 'array', items: { type: 'string' }, description: 'Names or emails of recipients' },
          recipient_group: { type: 'string', enum: ['managers', 'all'], description: 'Or send to a group' },
          topic: { type: 'string', description: 'What the email is about — the AI will write the full content' },
          tone: { type: 'string', enum: ['formal', 'casual', 'friendly', 'urgent'], description: 'Email tone' },
          extra_context: { type: 'string', description: 'Additional details for the AI to include in the email' },
        },
        required: ['topic'],
      },
    },
  },
];

const today = () => new Date().toISOString().slice(0, 10);

const EXECUTORS = {
  create_meeting: async (args) => {
    const checkin_token = crypto.randomUUID();
    const { data: maxRow } = await supabase.from('meetings').select('id').order('id', { ascending: false }).limit(1).single();
    const nextId = (maxRow?.id || 0) + 1;
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        id: nextId,
        title: args.title,
        date: args.date,
        time: args.time || null,
        description: args.description || null,
        attendees: args.attendees || [],
        attendance: {},
        season: SEASON,
        checkin_token,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return `Meeting created: "${data.title}" on ${data.date}${data.time ? ` at ${data.time}` : ''}. (ID: ${data.id})`;
  },

  update_meeting: async (args) => {
    const updates = {};
    if (args.title) updates.title = args.title;
    if (args.date) updates.date = args.date;
    if (args.time) updates.time = args.time;
    if (args.description) updates.description = args.description;
    if (Object.keys(updates).length === 0) return 'Nothing to update.';
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', args.meeting_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return `Updated meeting "${data.title}" (ID: ${data.id}).`;
  },

  delete_meeting: async (args) => {
    const { error } = await supabase.from('meetings').delete().eq('id', args.meeting_id);
    if (error) throw new Error(error.message);
    return `Meeting (ID: ${args.meeting_id}) deleted.`;
  },

  list_meetings: async (args) => {
    let query = supabase.from('meetings').select('id, title, date, time, attendees, attendance').eq('season', SEASON).order('date', { ascending: false });
    const now = today();
    if (args.status === 'upcoming') query = query.gte('date', now);
    else if (args.status === 'past') query = query.lt('date', now);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return 'No meetings found.';
    return data.map(m => {
      const present = m.attendance ? Object.values(m.attendance).filter(v => v === 'present').length : 0;
      return `- ${m.title} (${m.date}${m.time ? ' ' + m.time : ''}) — ${m.attendees?.length || 0} invited, ${present} present`;
    }).join('\n');
  },

  get_attendance: async (args) => {
    if (args.meeting_id) {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('title, date, attendees, attendance')
        .eq('id', args.meeting_id)
        .single();
      if (error) throw new Error(error.message);
      const att = meeting.attendance || {};
      const present = Object.entries(att).filter(([, v]) => v === 'present').map(([k]) => k);
      const late = Object.entries(att).filter(([, v]) => v === 'late').map(([k]) => k);
      const absent = Object.entries(att).filter(([, v]) => v === 'absent').map(([k]) => k);
      return `Attendance for "${meeting.title}" (${meeting.date}):\nPresent (${present.length}): ${present.join(', ') || 'None'}\nLate (${late.length}): ${late.join(', ') || 'None'}\nAbsent (${absent.length}): ${absent.join(', ') || 'None'}`;
    }
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('title, date, attendance')
      .eq('season', SEASON)
      .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    let totalP = 0, totalL = 0, totalA = 0;
    for (const m of (meetings || [])) {
      if (m.attendance) {
        const vals = Object.values(m.attendance);
        totalP += vals.filter(v => v === 'present').length;
        totalL += vals.filter(v => v === 'late').length;
        totalA += vals.filter(v => v === 'absent').length;
      }
    }
    const total = totalP + totalL + totalA;
    const rate = total > 0 ? Math.round((totalP / total) * 100) : 0;
    return `Attendance summary (${SEASON}): ${meetings?.length || 0} meetings.\nPresent: ${totalP}, Late: ${totalL}, Absent: ${totalA}. Rate: ${rate}%.`;
  },

  create_tech_card: async (args) => {
    const { data: maxRow } = await supabase.from('tech_cards').select('id').order('id', { ascending: false }).limit(1).single();
    const nextId = (maxRow?.id || 0) + 1;
    const { data, error } = await supabase
      .from('tech_cards')
      .insert({
        id: nextId,
        title: args.title,
        theme: args.theme || null,
        activityType: args.activityType,
        duration: args.duration || null,
        location: args.location || null,
        isArchived: false,
        isSponsored: false,
        season: SEASON,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return `Tech card created: "${data.title}" (${data.activityType}). (ID: ${data.id})`;
  },

  list_tech_cards: async (args) => {
    let query = supabase.from('tech_cards').select('id, title, activityType, location, isArchived, isSponsored').eq('season', SEASON);
    if (args.status === 'active') query = query.eq('isArchived', false);
    else if (args.status === 'archived') query = query.eq('isArchived', true);
    if (args.activityType) query = query.eq('activityType', args.activityType);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return 'No tech cards found.';
    return data.map(c => `- ${c.title} (${c.activityType}, ${c.location || 'TBD'})${c.isSponsored ? ' [Sponsored]' : ''}${c.isArchived ? ' [Archived]' : ''}`).join('\n');
  },

  list_managers: async () => {
    const { data, error } = await supabase
      .from('managers')
      .select('name, role, department')
      .eq('season', SEASON);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return 'No managers found.';
    return data.map(m => `- ${m.name} — ${m.role || 'Manager'}${m.department ? ` (${m.department})` : ''}`).join('\n');
  },

  generate_report: async (args) => {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', args.meeting_id)
      .single();
    if (error) throw new Error(error.message);
    const { generateMeetingReport } = await import('./reportGenerator');
    const report = await generateMeetingReport(meeting.notes, meeting.attendance, meeting);
    return report;
  },

  send_email: async (args) => {
    return { type: 'email_preview', args };
  },
};

export async function executeTool(name, args) {
  const executor = EXECUTORS[name];
  if (!executor) throw new Error(`Unknown tool: ${name}`);
  return await executor(args);
}

export function isLeaderAction(toolName) {
  return ['create_meeting', 'update_meeting', 'delete_meeting', 'create_tech_card', 'send_email'].includes(toolName);
}
