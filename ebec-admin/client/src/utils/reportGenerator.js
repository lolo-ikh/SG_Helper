const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateMeetingReport(notes, attendance, meetingMeta) {
  const present = Object.entries(attendance || {}).filter(([, v]) => v === 'present').map(([k]) => k);
  const late = Object.entries(attendance || {}).filter(([, v]) => v === 'late').map(([k]) => k);
  const absent = Object.entries(attendance || {}).filter(([, v]) => v === 'absent').map(([k]) => k);

  const notesText = notes?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'No notes taken.';

  const prompt = `Generate a professional meeting report in markdown format based on the following data.

Meeting: ${meetingMeta.title}
Date: ${meetingMeta.date}
Time: ${meetingMeta.time || 'Not specified'}

Attendance Summary:
- Present (${present.length}): ${present.join(', ') || 'None'}
- Late (${late.length}): ${late.join(', ') || 'None'}
- Absent (${absent.length}): ${absent.join(', ') || 'None'}

Meeting Notes:
${notesText}

---

Generate a structured report with these sections:
1. **Overview** — Brief summary of the meeting purpose and outcome
2. **Attendance** — Attendance breakdown with percentages
3. **Key Points Discussed** — Extract main topics from the notes
4. **Decisions Made** — Any decisions mentioned or implied
5. **Action Items** — Tasks or next steps identified
6. **Next Meeting** — Suggest follow-up if applicable

Use clean markdown. Be concise and professional. Do not fabricate information — only use what is provided in the notes and attendance data.`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
