# Discover & Collect

Build a polished mobile-first prototype for a gamified real-world discovery app. This is an MVP demo, not production. Use React/TypeScript/Tailwind/shadcn. No backend or real auth required; use local mock state and localStorage so progress persists.

PRODUCT CONCEPT
The core loop is: DISCOVER → GO → CHECK IN → LEARN → COLLECT → NEXT.
The real world is the game board. Experiences are quests. Stops are collectibles. Check-ins are rewards.

APP NAME
Use a tasteful placeholder brand name "Atlas" for now. Subtitle: "Collect the world."

DESIGN DIRECTION
Premium, contemporary travel + gaming product. Think Apple Maps / Airbnb / Duolingo-level polish, not childish gamification. Mobile app frame first (iPhone proportions) but responsive on desktop. Clean typography, large imagery, restrained motion, soft cards, subtle progress animation. Avoid generic dashboard feel. Make the achievement moment feel satisfying but elegant.

BOTTOM NAV
Explore
My Experiences
Collection
Profile

HOME / EXPLORE
Header: "Explore Paris"
Show two featured experience cards:

1) "Louvre: 5 Paintings with Vladimir Raevsky"
Creator: Vladimir Raevsky
Category: Art / Museum
Price: €9.99
5 stops
~60 min
Short copy: "Five works. One hour. A completely different way to walk through the Louvre."
Primary CTA: View Experience

2) "3 Specialty Coffee Shops in Paris"
Creator: Jules Martin
Category: Coffee
Price: €4.99
3 stops
~2 hours
Short copy: "Three Paris coffee shops worth crossing town for."
Primary CTA: View Experience

Also show a "Continue" section if an experience has progress, and a Creators section with Vladimir Raevsky and a Follow button.

EXPERIENCE DETAIL — LOUVRE
Hero image of Louvre / art.
Title: "5 Paintings in the Louvre"
By Vladimir Raevsky
Metadata: 5 stops · ~60 min · Louvre Museum · Art
Description: "Five works. One hour. A completely different way to walk through the Louvre."
CTA initially: "Buy Experience — €9.99"
This is a fake purchase: clicking instantly unlocks and changes CTA to "Start Experience".
Also include "Follow Vladimir".

Louvre stops:
1. Mona Lisa — Leonardo da Vinci
2. The Wedding Feast at Cana — Paolo Veronese
3. Liberty Leading the People — Eugène Delacroix
4. The Coronation of Napoleon — Jacques-Louis David
5. Venus de Milo — treat technically as a generic Stop even though it is sculpture.

IMPORTANT DATA MODEL
Call each route item a "Stop", never hard-code product logic around paintings because later Stops can be sculptures, restaurants, dishes, buildings, viewpoints, shops, hotels.

ROUTE / STOP FLOW
When Start Experience is tapped, show Stop 1 of 5.
Show title, artist, thumbnail, progress bar, approximate "350 m away", and a small map-like card / simple route visualization.
Before arrival: button disabled/locked: "Check in when you're nearby".
Add a visible demo-only control: "Simulate arrival".
After Simulate arrival, state becomes "You're here" and enable large CHECK IN button.

CHECK-IN MOMENT
On CHECK IN, show an elegant full-screen success animation/modal:
"FOUND"
"Mona Lisa"
"1 / 5 discovered"
"+100 XP"
If this is the user's first ever check-in, also unlock:
Achievement: "First Discovery" — "You discovered your first artwork."
Then continue to content.

STOP CONTENT
After check-in show the stop detail:
Large artwork image.
Title / creator / dates.
Audio control: "Listen — 2:14" (mock player is fine).
Secondary media CTA: "Watch Vladimir explain this work" (mock).
Section "Why this matters" with 2–3 concise paragraphs of plausible editorial content.
Button: "Mark as explored" or auto-complete after content view.
Then show "Next artwork".

COLLECTION
Checked-in stops automatically appear in Collection.
Collection landing should have categories such as Art and Coffee.
Each saved item card shows title, venue, city, and date.
For demo, display date as "8 Sep 2026".
At first check-in show:
Art
1 artwork discovered
Mona Lisa — Louvre Museum — Paris — 8 Sep 2026

PROGRESS
After each stop, update:
1 of 5 complete
20%
Continue / Next artwork.
Persist progress in localStorage.

COMPLETION
After Louvre stop 5:
Experience Complete
5 / 5 discovered
Achievement: "Louvre Explorer"
"Completed Vladimir Raevsky's 5 Paintings in the Louvre."
+500 XP
Show all 5 collected cards.
Buttons: View Collection, Share Achievement, Discover another Experience.

COFFEE EXPERIENCE
Same generic Stop engine, not separate custom logic.
Title: "3 Specialty Coffee Shops in Paris"
Creator: Jules Martin
Price €4.99
Stops:
1. Substance Café
2. Motors Coffee
3. KB CaféShop
Each stop content should use fields:
Why this place
What to order
Best time
Don't miss
Completion achievement: "Paris Coffee Explorer".
Check-in loop identical.

MY EXPERIENCES
Tabs/sections:
In Progress
Completed
Show cards with progress, e.g. Louvre 2/5.

CREATOR PROFILE
Vladimir Raevsky profile:
Art, architecture & culture
12.4K followers
Follow button
Experiences:
5 Paintings in the Louvre — €9.99
Modern Paris Architecture — Coming soon
Musée d'Orsay Essentials — Coming soon

SUBSCRIPTION
Profile or Explore should expose a premium upsell:
"Explorer — €9.99 / month"
Includes:
Access to selected experiences
Unlimited collection
Exclusive creator drops
Subscriber achievements
CTA "Start Subscription"
Fake interaction is okay.

PROFILE / GAME LAYER
Show:
Level 3 — Explorer
850 XP
Achievements:
First Discovery
Museum Starter
Louvre Explorer
Coffee Explorer
Completed Experiences
Discovered Places
Keep this visually tasteful.

INTERACTIONS
All primary flows must actually work in-browser:
- fake buy
- start
- simulate arrival
- check in
- achievement modal
- content view
- next stop
- progress persistence
- complete route
- collect item
- follow creator
- fake subscription
- bottom nav
Provide a "Reset demo" control in Profile so we can replay.

DO NOT BUILD
No AR
No camera/photo upload
No computer vision
No real marketplace creator dashboard
No comments/social feed
No quizzes
No AI
No real payments
No complex GPS
No recommendation engine
No authentication/database unless absolutely necessary

COPY / POSITIONING
Avoid Tripadvisor-like language. This should feel like a game for discovering the physical world.
Use the core phrase sparingly: "Don't just visit places. Collect them."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/920730ac-2533-4ce4-ae27-b9a221604244).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
