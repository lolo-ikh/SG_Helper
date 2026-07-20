const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateEmail({ topic, tone, extra_context, recipients, sender_name }) {
  if (!GROQ_KEY) throw new Error('Groq API key not configured');

  const prompt = `You are an email composer for EBEC (Ensia Business and Entrepreneurship Club), a student organization at ENSIA.

Write a complete email based on this request:
- Topic: ${topic}
- Tone: ${tone || 'formal'}
${extra_context ? `- Extra details: ${extra_context}` : ''}
${recipients ? `- Recipients: ${recipients.join(', ')}` : ''}

Write ONLY the email content in this exact format:
SUBJECT: <email subject line>
BODY:
<the email body>

Rules:
- Be professional but match the requested tone
- Keep it concise (3-5 paragraphs max)
- If it's a meeting reminder, include what, when, where
- If it's a general announcement, be clear and actionable
- Use proper email formatting (greeting, body, closing)
- Sign off as "EBEC Team" or "EBEC Admin"
- Do NOT include any text outside the SUBJECT:/BODY: format`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  const subjectMatch = text.match(/^SUBJECT:\s*(.+)$/m);
  const bodyMatch = text.match(/BODY:\s*\n([\s\S]*)/);

  return {
    subject: subjectMatch?.[1]?.trim() || topic,
    body: bodyMatch?.[1]?.trim() || text,
  };
}

export async function generateBulkEmails({ topic, tone, extra_context, recipient_list }) {
  const emails = [];
  for (const recipient of recipient_list) {
    const email = await generateEmail({
      topic,
      tone,
      extra_context: `${extra_context || ''}\nRecipient name: ${recipient.name || recipient.email}`,
      recipients: [recipient.name || recipient.email],
    });
    emails.push({ to: recipient.email, name: recipient.name, ...email });
  }
  return emails;
}
