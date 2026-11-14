# CuseCompass

**From the street to the right room.**

Gen Jam · Product Dev · Option 1: Campus, Upgraded

Try it live: https://cuse-compass.vercel.app

> **Scope today:** CuseCompass works for the three Newhouse buildings (Newhouse 1, 2, and 3). The same approach can grow to every building around Syracuse University: the camera reads each building's own door numbers, and the verified room data is organized by building and floor, so adding a building means adding its rooms and floors. See [Roadmap](#roadmap).

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

## How it works: from where you are to the right door

**Outside: Walk to the building.** Tap **Walk to the building**, allow location and motion, and pick the entrance (the University Place side for Newhouse 1, or the Waverly Avenue side for Newhouse 2 and 3).

- **Away from the building:** the app loads a real street-by-street walking route from where you are (OpenStreetMap data, routed by routing.openstreetmap.de). You get the total distance and time, a small route map with you and the entrance, the next steps, and a voice that speaks each turn as you reach it. The arrow on the camera points at your next turn. If you wander off the route, it fetches a new one.
- **Near the building (about 120 m):** the arrow points straight at the entrance and the door signs take over.
- **At the door:** the building's info pops up on the camera, and one tap continues indoors. If you open **Start at the entrance** while standing there, the app uses your location to pop up the building info for you.
- **Any time:** **Open walking directions in Maps** gives turn-by-turn from your current location. If the route service is down, the app says so and falls back to the arrow plus the Maps button.

**Inside: from the entrance to the right door.**

1. **Stand at the entrance and open the camera.** CuseCompass asks which building you're in, then pops up what that building is used for (from SU's own descriptions).
2. **It asks where you're headed:** plan your day, what's happening in this building, or a specific room. You can tap, type, or just say it. "Take me to the keynote" works.
3. **Tap Guide me.** The camera stays open and a big arrow tells you what to do: keep going straight, turn left, turn right, turn around, or go up to your floor. It speaks every instruction out loud.
4. **Every door you pass pops up** with its building, its floor, and what's happening inside, or what it's used for if there's no summit event.
5. **When you reach the right door,** you get "You're here" and the event.

**Plan my day** (made for first-time visitors): pick a day and what you're into, and the day is built from the real schedule. Your plan shows the building for each stop, a heads-up when you have to **change buildings** with the minutes you have, and a warning when two sessions **overlap**.

Outdoors, the arrow uses your phone's GPS and compass and the entrance points listed under "What's verified". GPS can be off by 10 to 20 meters near buildings, and the compass needs motion access on an iPhone, so the arrow is a guide, not a surveyed route. Without a compass the arrow shows the compass direction instead, with north at the top.

It never makes up a room. If the answer isn't in our verified data, it says "I don't know."

### How the directions work, honestly

No public indoor map of Newhouse's hallways exists, and SU's floor plans don't draw every floor (the ground floor and the 4th floor are missing). So we don't pretend to have a pre-drawn route. Instead, the camera reads the building's own door numbers and directional signs, the way a person would, and the AI only points you when a sign or the order of door numbers actually shows the way. When it can't tell, it says "keep walking" rather than guess. Everything it says about rooms comes from our verified data. Always confirm with your own eyes.

---

### Inside the building: the indoor map (floors 2 and 3)

The **Guide** tab has **Route inside Newhouse**. Type where you are and where you're going (like 206F to 305) and it gives you:

- **Step-by-step directions** along the real hallways: head along the hallway, bear or turn left or right, which room numbers you pass and on which side, and which room is on your left or right at the end.
- **The elevator when you change floors,** by name (NH1, NH2, or NH3 elevator), with "Leave the elevator on floor 3" on the other side.
- **A 3D view** of the two floors stacked, with the route in orange and the elevator lined up between floors, plus one-floor views zoomed to your route.
- **Nearest restroom** and **Nearest elevator** from any mapped room.
- **A Map button in the camera guide** that opens the planner with your target room filled in.

How it was made, honestly: SU doesn't publish a hallway map as data, so we traced the hallway network, elevators, stairs, and restrooms by hand from SU's published floor plans (floor 2 and floor 3 of Newhouse 1, 2, and 3), then built a walking graph and a shortest-path router on top. The drawing is our own redraw of the hallway network, not SU's artwork. Because it is traced by eye from a tilted 3D map, distances are shown as "a few steps / a short walk / a long hallway" and sides are approximate, and rooms deep inside blocks away from a hallway are described as "in this area". Elevators are used for floor changes because we could not confidently match stairs between the two floors. **Floors 1 and 4 are next** (that is where Rooms 101, 102, 432/434, and 469 are), and the Guide tab says so when you ask about them.

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
| Point the camera at doors and signs | Claude (vision) reads door numbers and directional signs. The room popups come from our verified data, not from the AI's imagination. |
| Say where you want to go | Your browser's speech input. It shows your words as you speak, waits until you pause for about two seconds, then sends the whole sentence (tap the mic again to send early). Smart matching then finds the session, room, or building. |
| Walk to the building | OpenStreetMap walking route, plus your phone's GPS and compass |
| Hear the directions and answers | Your phone's English voice, split into short sentences so nothing gets cut off, with an optional ElevenLabs voice. Answers in Ask AI are read aloud when **Read answers aloud** is on, and every answer has a **Play voice** button. |
| Ask anything, build a day, brainstorm Gen Jam ideas | Claude (text) |

The camera scans automatically every few seconds, and you can tap **Scan now** any time. No camera, or the AI is down? Type a room number and get the same popup.

---

## Also in the app

- **Around > Ride:** bus or walking directions from where you are to either Newhouse entrance, or to any building or address you type, opened in Google Maps. Live bus positions and arrival times are in SU's own tracker (linked), because SU's and Centro's live feeds need the agency's own access key, so the app does not pretend to show live arrivals.
- **Home:** real photos of the three buildings, a voice or text box ("Take me to Room 206F" or "How do I get to Newhouse?"), a **Today is Day 1 / Day 2** switch so "what's happening today" just works, and a compass that spins up something real to do
- **Schedule:** both days, filter by track, save talks to **My plan**, and a **Guide me** button on every talk
- **Ask AI:** chat and voice
- **Around:** a dice roll for lunch, nearby restaurants, and bus stops with SU's trolley loops and Centro routes

---

## What's verified, and what isn't

Everything the app states comes from a source we can name:

- **Sessions and rooms:** the official 2026 AI Creative Summit event deck
- **Floors and room names:** SU's campus map floor plans, SU IT classroom pages, SU's events calendar
- **Indoor hallway map (floors 2 and 3):** traced by hand from SU's campus map floor plans (Concept3D), then redrawn as our own walking graph. Approximate by design; always confirm with the door signs.
- **Buses and loops:** SU Parking and Transportation Services, 2026–2027 schedules
- **Food:** SU Campus Dining and SU News
- **Building descriptions:** SU's campus map, SU IT, SU's public art page for Newhouse 3, Wikipedia (the 2014 Newhouse 2 renovation), and the architects' project page (Newhouse 3 connects Newhouse 1 and 2 on all floors)
- **Photos:** Kiran891 on Wikimedia Commons, CC BY-SA 4.0. Credits and links are in the app footer and in Credits below.
- **Street routes:** OpenStreetMap contributors, routed by routing.openstreetmap.de (FOSSGIS). Sent through `/api/route`, which only accepts points near Syracuse and is rate limited.
- **Outdoor entrance points:** approximate, taken from the geotags of those Commons photos (Newhouse 1 side: 43.03987, -76.13563; Waverly Avenue side: 43.04071, -76.13479). Wikipedia lists 43.0399, -76.1352 for the school. These are not surveyed entrance coordinates.

What we don't have: a verified location for the Welcome session, the two 3:45 PM Day 1 sessions, and the Startup Garage's building. The app says so instead of guessing. We also don't draw turn-by-turn indoor routes, because SU doesn't publish hallway data, and we only know where elevators, stairs, and restrooms are on floors 2 and 3 (traced from SU's floor plans). On other floors the app says to follow the elevator and stair signs (the camera reads them) instead of guessing. It tells you which building and floor your room is on, and the camera guides you door by door from there.

---

## Try it in 60 seconds

0. Outside? Home: tap **Walk to Newhouse**, allow location, and follow the arrow.
1. Home: tap **Start at the entrance** and allow the camera.
2. Tap **Newhouse 2**. A card says what the building is for. Tap **What's happening here**, then **Guide me** on an event.
3. Aim the camera at a door number. You'll get a popup for each room you pass, plus an arrow and a spoken direction when a sign shows the way.
4. Home: type "Take me to the keynote" or tap the mic and say it.
5. Home: tap **Plan my day**, pick Day 1, and build it. Tap **Add to my plan**.
6. Around: roll the dice for lunch.

**Judges, you don't need to be in Newhouse:** write "Room 469" on paper and point the camera at it. Or hold up two sheets, "Room 205 ←" and "Room 207 →", and set the target to Room 206F.

---

## Roadmap

- **Now:** Newhouse 1, 2, and 3, with verified rooms, floors, sessions, food, and rides. Street routes work from anywhere near Syracuse.
- **Next:** more campus buildings. The data is already structured as building, floor, room, and what happens there, so each building is a data addition, not a rebuild. SU's campus map floor plans are the source.
- **Next:** trace floors 1, 4, and 5 the same way (floors 2 and 3 are done), match stairs between floors, and walk the routes to check them.
- **Then:** classes and campus events beyond the summit, surveyed entrance coordinates, and more buildings.
- **Known limits:** no public indoor hallway map exists, GPS drifts near buildings, and phone speech features depend on the browser (Chrome and Safari work best).

---

## Credits

- Photos of Newhouse 1, Newhouse 2 (Dick Clark Studios entrance), and Newhouse 3 (First Amendment glass wall) by Kiran891, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons: [Newhouse 1](https://commons.wikimedia.org/wiki/File:Newhouse_1_Building_at_Syracuse_University_02.jpg), [Newhouse 2](https://commons.wikimedia.org/wiki/File:Dick_Clark_Studios_at_Syracuse_University,_Newhouse_2_Building_along_Waverly_Ave.jpg), [Newhouse 3](https://commons.wikimedia.org/wiki/File:Newhouse_3_Building_at_Syracuse_University_–_1st_Amendment_glass_Wall_01.jpg). The photos are linked directly from Wikimedia Commons, not copied into this repo.

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
- `api/route.js`: street walking routes from the visitor to a Newhouse entrance. No key needed.
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
