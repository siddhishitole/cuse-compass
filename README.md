# CuseCompass

**You made it to Newhouse. Now find the room.**

Gen Jam · Product Dev · Option 1: Campus, Upgraded

Try it live: https://YOUR-SITE.vercel.app *(replace with your Vercel link)*

---

## The problem nobody puts on the map

Google Maps gets you to the front doors. Then the real trip starts.

Picture a first-time visitor walking into Newhouse for the summit. They know the building. They don't know the answers to the questions that decide whether they're on time:

- Which of the three connected buildings is my session in?
- Which floor? Which hallway? Where are the stairs?
- Do I have time to get from the keynote to the next talk?
- Where do I eat, and which bus gets me home?

**The part of student life we picked:** the minutes between arriving at a campus building and sitting down in the right room. CuseCompass answers every question on that list.

---

## Plan your day: built for first-time visitors

Open the app and ask, in your own words:

> "Plan my Day 1. I like image generation."

1. **The AI builds a day** from the real summit schedule and adds a one-tap button to save it.
2. **Your plan shows what the schedule won't tell you:**
   - which building each stop is in (NH1, NH2, NH3)
   - a heads-up when you have to **change buildings**, with the minutes you have between sessions
   - a warning when two sessions **overlap**
3. **Tap any room** to see its building, its floor, and a link to SU's official floor plan.
4. **Not sure where you are?** Point the **live camera** at the room sign. The answer appears right over the camera view.

It never makes up a room. If the answer isn't in our verified data, it says "I don't know" and points you to an organizer.

---

## Which session is happening where

Every talk is a ticket with its time, its building, and its room. A few from Day 1:

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

## The camera is your pointer

- **Live camera:** tap it, point your phone at a door sign, and tap **Read the sign**. Claude's vision reads the number and answers from our verified directory, including the floor (in Newhouse, the first digit of a room number is its floor). The answer shows up over the live view.
- **Snap a sign:** prefer a photo? Same result from a picture.
- **Talk to it:** ask by voice and hear the answer read aloud.

**Judges, try this anywhere:** write "Room 206F" on a piece of paper, open the live camera, and point it at the paper.

---

## Gen AI inside

| What you do | Model |
|---|---|
| Ask, plan a day, brainstorm Gen Jam ideas | Claude (text) |
| Live camera and Snap a sign | Claude (vision) |
| Talk and hear answers | Your phone's speech input and voice, with an optional ElevenLabs voice |

You can swap in ChatGPT or an open-weight model with a few settings (see below).

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

1. Home: spin the compass for something real to do.
2. Ask AI: "Plan my Day 1. I like image generation." Tap **Add to my plan**.
3. Schedule, My plan: see the building-change heads-up.
4. Rooms: open Newhouse 1, then SU's floor plan.
5. Ask AI: tap **Live camera** and point it at a room number.
6. Around: roll the dice for lunch, or find the nearest bus stop.

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
- `api/ask.js`: chat, plan building, and sign reading (Claude, or any OpenAI-compatible model)
- `api/speak.js`: optional ElevenLabs voice. Skip it and the app uses the phone's own voice.
- `vercel.json`: gives the functions up to 60 seconds

## Deploy on Vercel

1. Make a GitHub repo and upload these files, keeping the `api` folder and `vercel.json`. Upload only what is listed above.
2. At vercel.com, sign in with GitHub, Add New Project, import the repo, and leave build settings empty.
3. Add this Environment Variable before deploying:

| Variable | Needed for | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | chat, plans, camera reading | Your Claude Console key. Default model `claude-haiku-5-5`; set `AI_MODEL` if the Console lists another name. |
| `ELEVENLABS_API_KEY` | optional voice | Skip it and nothing breaks. |

4. Deploy and open the URL on your phone. The camera needs https, which Vercel provides.

**ChatGPT or open-weight models:** set `AI_PROVIDER=openai-compatible`, `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL` for any host with an OpenAI-style API. Camera reading needs a vision-capable model.

## Test it (replace the address)

    curl -X POST https://YOUR-SITE.vercel.app/api/ask -H "content-type: application/json" -d '{"messages":[{"role":"user","content":"When is lunch on Day 2?"}],"context":{"sessions":"d2-lunch | Day 2 | 12:30-2:00 PM | all | Lunch | - | Outside Rooms 222 and 225, Newhouse 1"}}'

You should get JSON with a `text` field. A 502 with a message means the key or model name needs fixing.

## Costs and safety

- Keys live only in Vercel's environment variables. Never put them in the repo or the page.
- Set a low spend limit in the Claude Console. The functions cap answer length and rate-limit each visitor, and each camera read is one request.
- Camera frames are resized on the phone, sent only to your own function and the AI provider, and not stored. Keep people out of frame.
- Rotate or delete the key after the summit.

## Before you submit

- Fill the gaps in `SESSIONS` and `ROOMS` inside `index.html` and compare against the Participant Guide.
- Put your real link at the top of this README.
- Submit your Vercel link at https://aicreativesummit.flywheelsites.com before 3:00 PM on Day 2.
