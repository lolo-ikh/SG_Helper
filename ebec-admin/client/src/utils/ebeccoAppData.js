import { supabase } from '../lib/supabase';

export async function fetchAppDataSummary(season = '2026-2027') {
  const sections = [];

  // Meetings
  try {
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id, title, date, time, attendees, attendance, season')
      .eq('season', season)
      .order('date', { ascending: false });

    if (meetings && meetings.length > 0) {
      const total = meetings.length;
      let totalPresent = 0, totalLate = 0, totalAbsent = 0;
      const titles = meetings.map(m => m.title || 'Untitled').slice(0, 10);

      for (const m of meetings) {
        if (m.attendance) {
          const vals = Object.values(m.attendance);
          totalPresent += vals.filter(v => v === 'present').length;
          totalLate += vals.filter(v => v === 'late').length;
          totalAbsent += vals.filter(v => v === 'absent').length;
        }
      }

      const totalTracked = totalPresent + totalLate + totalAbsent;
      const rate = totalTracked > 0 ? Math.round((totalPresent / totalTracked) * 100) : 0;

      sections.push(
        `MEETINGS (${season}): ${total} meetings held.\n` +
        `Titles: ${titles.join(', ')}\n` +
        `Attendance: ${totalPresent} present, ${totalLate} late, ${totalAbsent} absent. Attendance rate: ${rate}%.`
      );
    }
  } catch (err) {
    console.warn('[EBECO] Failed to fetch meetings:', err.message);
  }

  // Tech Cards
  try {
    const { data: cards } = await supabase
      .from('tech_cards')
      .select('id, title, theme, activityType, duration, location, isSponsored, sponsorName, isArchived, season')
      .eq('season', season);

    if (cards && cards.length > 0) {
      const active = cards.filter(c => !c.isArchived);
      const archived = cards.filter(c => c.isArchived);
      const sponsored = active.filter(c => c.isSponsored);
      const byType = { scientific: 0, cultural: 0, sport: 0 };
      active.forEach(c => { if (byType[c.activityType] !== undefined) byType[c.activityType]++; });

      const titles = active.map(c => `${c.title} (${c.activityType}, ${c.location || 'TBD'})`).slice(0, 10);

      sections.push(
        `TECH CARDS (${season}): ${active.length} active, ${archived.length} archived, ${sponsored.length} sponsored.\n` +
        `By type: ${byType.scientific} scientific, ${byType.cultural} cultural, ${byType.sport} sport.\n` +
        `Active cards: ${titles.join('; ') || 'None'}`
      );
    }
  } catch (err) {
    console.warn('[EBECO] Failed to fetch tech cards:', err.message);
  }

  // Managers
  try {
    const { data: managers } = await supabase
      .from('managers')
      .select('name, role, department')
      .eq('season', season);

    if (managers && managers.length > 0) {
      const list = managers.map(m => `${m.name} — ${m.role || 'Manager'}${m.department ? ` (${m.department})` : ''}`).slice(0, 20);
      sections.push(
        `MANAGERS (${season}): ${managers.length} members.\n${list.join('\n')}`
      );
    }
  } catch (err) {
    console.warn('[EBECO] Failed to fetch managers:', err.message);
  }

  const result = sections.join('\n\n');
  console.log(`[EBECO] App data context: ${result.length} chars, ${sections.length} sections`);
  return result;
}
