// CuseCompass assistant endpoint (Vercel serverless function).
// The API key lives in an environment variable on the server, never in the page.
//
// AI_PROVIDER=anthropic (default)  -> needs ANTHROPIC_API_KEY, optional AI_MODEL
// AI_PROVIDER=openai-compatible    -> needs AI_API_KEY, AI_MODEL, optional AI_BASE_URL
//   Works with OpenAI, and with open-weight models served through any OpenAI-compatible API.
//
// Modes: "chat" (default: grounded Q&A, plan building, brainstorming) and "scan" (reads room numbers from a camera frame).

const hits = new Map();
const LIMIT = 150, WINDOW_MS = 10 * 60 * 1000; // generous: many judges may share one Wi-Fi address
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > LIMIT;
}

const clip = (v, n) => String(v || '').slice(0, n);

function chatPrompt(ctx, hasImage) {
  return `You are CuseCompass, the friendly assistant for the Syracuse University AI Creative Summit at the Newhouse School.

RULES
- For questions about the event (sessions, rooms, food, buses, rules), answer ONLY from the DATA below. If the answer is not in the DATA, say you don't know and suggest asking an organizer or a coach.
- If someone asks for ideas or brainstorming for a Gen Jam challenge, you may suggest three creative, PG ideas that a small team could finish in a few hours using common or free AI tools. Label them as ideas, keep each to one or two sentences, and still never invent event facts.
- Never invent times, rooms, buildings, floors, prices, or directions. You do NOT have indoor turn-by-turn directions; point people to the Guide tab (camera and room lookup), a building page on Home, or the official SU campus map instead.
- Where the data says a room or building is not listed, say so plainly.
- "Today" means the day in TODAY below. If TODAY is not set, briefly list the relevant items for both Day 1 and Day 2, then ask which day it is. Never say you cannot tell the date; just ask. Do not mention calendar dates.
- The app has these tabs: Map, Inside, Schedule, Ask AI, and Around. There is no Rooms tab or Guide tab, so never mention one. The Map tab (home) has a live map with the person's location, "Walk to the building" (live map and voice from where they are standing), "Start at the entrance" (camera guide inside a building), and "Where am I inside?" (scan a door number to be placed on the floor plan).
${hasImage ? `- The person attached a photo. Read any room number or sign you can actually see. Match it to ROOMS AND BUILDINGS and say what is there. In Newhouse the first digit of a room number is its floor (2xx is the second floor, 3xx the third), but only say a floor when you can read the number. If you cannot read a number or sign, say so and ask for a closer photo. You cannot tell exactly where someone is standing, so never claim to. Do not describe or identify people in the photo.\n` : ''}- Keep answers short, warm, and PG. Plain text, no markdown. For a day plan, use one short line per session: time, title, room.
- The Inside tab has an indoor route planner for floors 2 to 5 of Newhouse (hallways, elevators, restrooms), traced by hand from SU's floor plans. For routes, elevators, or restrooms on floors 2 to 5, point people to the Inside tab. You do NOT know where elevators, stairs, or restrooms are on floor 1; say so and suggest following the elevator or stair signs.
- Respond ONLY with a JSON object: {"reply": "<your answer>", "add": ["<session id>", ...]}.
- "add" lists session ids from the SESSIONS data the person would want saved to their plan. Fill it only when they ask for a plan or recommendations. Use only ids that appear in SESSIONS. Never schedule two overlapping sessions together. Otherwise use [].

DATA
TODAY: ${clip(ctx.today, 12) || 'not set'}

SESSIONS (id | day | time | track | title | speaker | location):
${clip(ctx.sessions, 9000)}

ROOMS AND BUILDINGS:
${clip(ctx.rooms, 7000)}

FOOD:
${clip(ctx.food, 1500)}

GETTING AROUND:
${clip(ctx.transit, 1800)}

GEN JAM RULES:
${clip(ctx.rules, 2500)}`;
}

function scanPrompt(target) {
  return `You help a first-time visitor find a room inside a university building, using only what one camera frame shows.
${target ? `\nTARGET ROOM: ${target}\n` : ''}
RULES
- "numbers": every room number you can read on door signs, plaques, or directional signs. A room number is three digits with an optional letter, like 206F, 101, or 305. If a sign shows a range like 201-212, return both ends. If it shows 432/434, return both.
- "move": where the visitor should go next to reach the target.
  - "here" only if the target number is clearly on a door sign in view.
  - "ahead", "left", "right", or "back" only when a visible directional sign (an arrow with a room range or name) or the order of door numbers clearly shows the way to the target.
  - "up" or "down" only when a floor sign, stairwell sign, or elevator sign clearly shows the target is on another floor.
  - Otherwise "unknown". Never guess.${target ? '' : ' With no target, always use "unknown".'}
- Read small, blurry, angled, or partly hidden text carefully. Many signs show a room name and a number, like "BARTLETT ROOM 113". Return the three-digit number whenever you can read it, even if the name is unfamiliar.
- "why": at most 14 words naming what in the image tells you, or an empty string.
- Ignore people. Do not describe the scene.
- Respond ONLY with JSON, no markdown: {"numbers": ["206F"], "move": "unknown", "why": ""}`;
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const m of list.slice(-8)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
    const content = String(m.content || '').slice(0, 1000).trim();
    if (!content) continue;
    if (out.length && out[out.length - 1].role === m.role) { out[out.length - 1].content += '\n' + content; continue; }
    out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

function validImage(img) {
  if (!img || typeof img !== 'object') return null;
  const types = ['image/jpeg', 'image/png', 'image/webp'];
  if (!types.includes(img.media_type)) return null;
  const data = String(img.data || '');
  if (!data || data.length > 1800000 || !/^[A-Za-z0-9+/=]+$/.test(data)) return null;
  return { media_type: img.media_type, data };
}

async function callAnthropic(system, messages, image, maxTokens) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
  const msgs = messages.map(m => ({ ...m }));
  if (image) {
    const last = msgs[msgs.length - 1];
    last.content = [
      { type: 'image', source: { type: 'base64', media_type: image.media_type, data: image.data } },
      { type: 'text', text: last.content }
    ];
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-haiku-5-5', max_tokens: maxTokens, system, messages: msgs })
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Anthropic error ' + r.status);
  return (j.content || []).map(b => b.text || '').join('');
}

async function callOpenAICompatible(system, messages, image, maxTokens) {
  if (!process.env.AI_API_KEY || !process.env.AI_MODEL) throw new Error('AI_API_KEY and AI_MODEL must be set');
  const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const msgs = messages.map(m => ({ ...m }));
  if (image) {
    const last = msgs[msgs.length - 1];
    last.content = [
      { type: 'text', text: last.content },
      { type: 'image_url', image_url: { url: `data:${image.media_type};base64,${image.data}` } }
    ];
  }
  const r = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.AI_API_KEY },
    body: JSON.stringify({ model: process.env.AI_MODEL, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, ...msgs] })
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Provider error ' + r.status);
  return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
  if (limited(ip)) return res.status(429).json({ error: 'Too many questions. Try again in a few minutes.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const messages = cleanMessages(body.messages);
  if (!messages.length) return res.status(400).json({ error: 'Send at least one user message.' });

  const mode = body.mode === 'scan' ? 'scan' : 'chat';
  const image = validImage(body.image);
  if (mode === 'scan' && !image) return res.status(400).json({ error: 'Send an image to scan.' });

  try {
    const target = clip(String(body.target || '').replace(/[^\w\s/.,'’()-]/g, ''), 80).trim();
    const system = mode === 'scan' ? scanPrompt(target) : chatPrompt(body.context || {}, !!image);
    const maxTokens = mode === 'scan' ? 200 : 1500;
    const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
    const text = provider === 'anthropic'
      ? await callAnthropic(system, messages, image, maxTokens)
      : await callOpenAICompatible(system, messages, image, maxTokens);
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'The AI service is unavailable right now.', detail: String(e.message || e).slice(0, 200) });
  }
};
