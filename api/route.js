// Walking route from the visitor's location to a Newhouse entrance.
// Data: OpenStreetMap contributors, routed by routing.openstreetmap.de (FOSSGIS, walking profile).
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, list = (hits.get(ip) || []).filter(t => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 120;
}
const PT = /^-?\d{1,3}\.\d{1,6},-?\d{1,3}\.\d{1,6}$/;
const parse = s => { if (!PT.test(String(s || ''))) return null; const [lat, lon] = String(s).split(',').map(Number); return { lat, lon }; };
const inArea = p => p && p.lat > 42.8 && p.lat < 43.3 && p.lon > -76.4 && p.lon < -75.8;
const CARD = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
const card = b => CARD[Math.round((((b % 360) + 360) % 360) / 45) % 8];
function say(step) {
  const m = step.maneuver || {}, mod = m.modifier || '', road = step.name ? ` onto ${step.name}` : '', on = step.name ? ` on ${step.name}` : '';
  const dir = { left: 'left', right: 'right', 'slight left': 'slightly left', 'slight right': 'slightly right', 'sharp left': 'sharp left', 'sharp right': 'sharp right', uturn: 'around' }[mod];
  switch (m.type) {
    case 'depart': return `Head ${card(m.bearing_after || 0)}${on}`;
    case 'arrive': return 'You have arrived at your destination';
    case 'new name': case 'continue': return dir && mod !== 'uturn' ? `Bear ${dir}${road}` : `Continue${on}`;
    case 'roundabout': case 'rotary': return `Take the roundabout${m.exit ? `, exit ${m.exit}` : ''}${road}`;
    default: return dir ? `Turn ${dir}${road}` : `Continue straight${on}`;
  }
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  const ip = String((req.headers && (req.headers['x-forwarded-for'] || '')) || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'Too many route requests. Try again in a few minutes.' });
  let q = req.query;
  if (!q) { try { q = Object.fromEntries(new URL(req.url, 'http://x').searchParams); } catch (e) { q = {}; } }
  const a = parse(q.from), b = parse(q.to);
  if (!a || !b) return res.status(400).json({ error: 'from and to must be lat,lon' });
  if (!inArea(a) || !inArea(b)) return res.status(422).json({ error: 'outside' });
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson&steps=true`;
  const ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'CuseCompass/1.0 (Syracuse University AI Creative Summit project)' } });
    if (!r.ok) throw new Error('routing HTTP ' + r.status);
    const j = await r.json(), rt = j && j.routes && j.routes[0];
    if (!rt || !rt.geometry || !rt.legs || !rt.legs[0]) throw new Error('no route');
    const pts = rt.geometry.coordinates, keep = Math.max(1, Math.ceil(pts.length / 250));
    const coords = pts.filter((_, i) => i % keep === 0 || i === pts.length - 1).map(c => [Number(c[1].toFixed(5)), Number(c[0].toFixed(5))]);
    const steps = rt.legs[0].steps.map(s => ({ text: say(s), road: s.name || '', distance: Math.round(s.distance || 0), lat: Number(s.maneuver.location[1].toFixed(5)), lon: Number(s.maneuver.location[0].toFixed(5)), type: s.maneuver.type }));
    return res.status(200).json({ distance: Math.round(rt.distance), duration: Math.round(rt.duration), coords, steps });
  } catch (e) {
    return res.status(502).json({ error: 'route unavailable' });
  } finally { clearTimeout(to); }
};
