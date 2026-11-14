# CuseCompass

**You made it to Newhouse. Now find the room.**

Gen Jam · Product Dev · Option 1: Campus, Upgraded

Try it live: https://cuse-compass.vercel.app

---

## The problem nobody puts on the map

Google Maps gets you to the front doors. Then the real trip starts.

Picture a first-time visitor walking into Newhouse for the summit. They know the building. They don't know the answers to the questions that decide whether they're on time:

- Which of the three connected buildings is my session in?
- Which room, and which floor?
- Am I standing outside the right door?
- Do I have time to get from the keynote to the next talk?

**The part of student life we picked:** the minutes between arriving at a campus building and sitting down in the right room.

---

## How it works: a short conversation

CuseCompass opens by asking one question: **plan your day, or head somewhere?**

**Take me somewhere**
1. Pick a building: Newhouse 1, 2, or 3.
2. See what's happening there, and tap the event you want.
3. Your camera opens. Point it at a door number, and CuseCompass reads it live.
4. A card pops up over the camera: the room, the building, the floor, and what's happening inside. If it isn't your room, it tells you which way to go ("your room is on floor 4, this is floor 2, go up 2 floors"). When you reach the right door, you get a "You found it."

**Plan my day** (made for first-time visitors)
1. Pick a day and what you're into: image, video, and audio; building and coding; or a bit of everything.
2. The AI builds a day from the real schedule, with a one-tap button to save it.
3. Your plan shows what the schedule won't tell you: the building for each stop, a heads-up when you have to **change buildings** with the minutes you have, and a warning when two sessions **overlap**.

It never makes up a room. If the answer isn't in our verified data, it says "I don't know."

---

## Which session is happening where

Every talk is a ticket with its time, building, and room. A few from Day 1:

| Time | Session | Where |
|---|---|---|
| 9:15–10:00 AM | **Opening keynote: Craft, Creativity & Careers in the Age of AI**, Tom Matheu, A+E Networks | Rooms 432/434, Newhouse 3 |
| 12:45–2:15 PM | **Lunch and panel: Art, Creativity, & AI** | Room 101, Newhouse 1 |

### The "Art, Creativity, & AI" panel

Moderated by Ava Swidler, with:

- **Tom Matheu**, A+E Networks
- **Michael Jones**, What Art is Now
- **Nick Bernardone**, screenwriter and TRF faculty

It's also where teams are supposed to be formed for the Gen Jam, so the app shows that reminder on the session. We built CuseCompass as a small, practical answer to that panel's theme: AI as a guide that helps you get to the room, and leaves the creating to people.

---

## Gen AI inside

| What you do | Model |
|---|---|
| Ask anything, plan a day, brainstorm Gen Jam ideas | Claude (text) |
| Point the live camera at a door number | Claude (vision) reads the number. The popup content comes from our verified data, not from the AI's imagination. |
| Talk and hear answers | Your phone's speech input and voice, with an optional ElevenLabs voice |

The camera scans automatically every few seconds, and you can tap **Scan now** any time. No camera, or the AI is down? Type a room number and get the same popup.

---

## Also in the app

- **Scan:** the camera, plus a room lookup and the rooms you've found
- **Schedule:** both days, filter by track, save talks to **My plan**
- **Ask AI:** chat and voice
- **Around:** a dice roll for lunch, nearby restaurants, and bus stops with SU's trolley loops and Centro routes
- **Surprise me:** spin the compass for something real to do

---

## What's verified, and what isn't

Everything the app states comes from a source we can name:

- **Sessions and rooms:** the official 2026 AI Creative Summit event deck
- **Floors and room names:** SU's campus map floor plans, SU IT classroom pages, SU's events calendar
- **Buses and loops:** SU Parking and Transportation Services, 2026–2027 schedules
- **Food:** SU Campus Dining and SU News

What we don't have: a verified location for the Welcome session, the two 3:45 PM Day 1 sessions, and the Startup Garage's building. The app says so instead of guessing. We also don't draw turn-by-turn indoor routes, because SU doesn't publish hallway data. The app links to SU's official floor plans instead.

---

## Try it in 60 seconds

1. Home: tap **Take me somewhere**, then **Newhouse 2**, then **Find it** next to an event.
2. Allow the camera. Write "Room 469" on a piece of paper and point the camera at it. A card pops up with the building, the floor, and the event.
3. Try "Room 206F" or "Room 305" too. Each pops up something different.
4. Home: tap **Plan my day**, pick Day 1, and tap **Build my day**. Tap **Add to my plan**.
5. Schedule, My plan: see the building-change heads-up.
6. Around: roll the dice for lunch.

---

## Team

Everyone contributes equally.

| Name | What they built |
|---|---|
| ____ | ____ |
| ____ | ____ |
| ____ | ____ |

---

# For the team: deploy

## Files

- `index.html`: the whole app
- `api/ask.js`: chat, plan building, and reading door numbers from the camera (Claude, or any OpenAI-compatible model)
- `api/speak.js`: optional ElevenLabs voice. Skip it and the app uses the phone's own voice.
- `vercel.json`: gives the functions up to 60 seconds

## Deploy on Vercel

1. Put these files in a GitHub repo, keeping the `api` folder and `vercel.json`.
2. At vercel.com, import the repo and leave build settings empty.
3. Add this Environment Variable:

| Variable | Needed for | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | chat, plans, camera reading | Your Claude Console key. Default model `claude-haiku-5-5`; set `AI_MODEL` if the Console lists another name. |
| `ELEVENLABS_API_KEY` | optional voice | Skip it and nothing breaks. |

4. Deploy and open the URL on your phone. The camera needs https, which Vercel provides.
5. After changing a variable, redeploy so it takes effect.

**ChatGPT or open-weight models:** set `AI_PROVIDER=openai-compatible`, `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL` for any host with an OpenAI-style API. Camera reading needs a vision-capable model.

## Test it (replace the address)

    curl -X POST https://YOUR-SITE.vercel.app/api/ask -H "content-type: application/json" -d '{"messages":[{"role":"user","content":"When is lunch on Day 2?"}],"context":{"sessions":"d2-lunch | Day 2 | 12:30-2:00 PM | all | Lunch | - | Outside Rooms 222 and 225, Newhouse 1"}}'

You should get JSON with a `text` field. A 502 with a message means the key or model name needs fixing.

## Costs and safety

- Keys live only in Vercel's environment variables. Never put them in the repo or the page.
- Each camera scan is one small request. Auto-scan runs every few seconds and pauses after 24 scans. Set a low spend limit in the Claude Console.
- The functions rate-limit each visitor address (150 requests per 10 minutes, high enough for a room of judges on one Wi-Fi).
- Camera frames are resized on the phone, sent only to your own function and the AI provider, and not stored. Keep people out of frame.
- Rotate or delete the key after the summit.

## Before you submit

- Fill the gaps in `SESSIONS` and `ROOMS` inside `index.html` and compare against the Participant Guide.
- Fill in the team table.
- Submit your Vercel link at https://aicreativesummit.flywheelsites.com before 3:00 PM on Day 2.
