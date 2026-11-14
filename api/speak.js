// CuseCompass text-to-speech (Vercel serverless function), powered by ElevenLabs.
// ELEVENLABS_API_KEY  required
// ELEVEN_VOICE_ID     optional (defaults to a premade voice)
// ELEVEN_MODEL        optional, default eleven_multilingual_v2

const hits = new Map();
const LIMIT = 60, WINDOW_MS = 10 * 60 * 1000;
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > LIMIT;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(501).json({ error: 'Voice is not configured.' });

  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
  if (limited(ip)) return res.status(429).json({ error: 'Too many voice requests. Try again in a few minutes.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const text = String((body && body.text) || '').slice(0, 600).trim();
  if (!text) return res.status(400).json({ error: 'Send some text.' });

  try {
    const voice = process.env.ELEVEN_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'xi-api-key': key, accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: process.env.ELEVEN_MODEL || 'eleven_multilingual_v2' })
    });
    if (!r.ok) return res.status(502).json({ error: 'Voice service error.' });
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('content-type', 'audio/mpeg');
    res.setHeader('cache-control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: 'Voice service unavailable.' });
  }
};
