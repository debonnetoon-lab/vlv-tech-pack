export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const payload = req.body;
    // Log payload to Vercel logs and optionally forward to Sentry or a log store
    console.log('CSP report', JSON.stringify(payload));
    // Optionally: forward to Sentry via server DSN or store in a DB
    res.status(204).end();
  } catch (err) {
    console.error('CSP report error', err);
    res.status(500).end();
  }
}
