export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, body, from_name } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ error: 'Missing required fields: to, subject, body' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  const fromEmail = process.env.RESEND_FROM || 'EBEC <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from_name ? `${from_name} <${fromEmail.split('<')[1]?.replace('>', '') || 'onboarding@resend.dev'}>` : fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: body.replace(/\n/g, '<br>'),
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || 'Email send failed' });

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
