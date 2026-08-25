# Arc

**Arc turns a big goal into today's move.**

Arc is a goal-planning app for high-school students. A student describes what they
want to achieve; Arc refines it into a concrete goal, breaks it into milestones and
weekly tasks, and schedules that work around the time they actually have. Progress
is tracked with streaks, XP, and achievements, and the skills earned along the way
build into a resume.

Released under the [MIT License](./LICENSE).

---

## Features

- **AI goal breakdown** — turns an open-ended goal into milestones and weekly
  tasks, scheduled around the student's stated availability
- **Galaxy dashboard** — goals rendered as orbiting planets with live progress
- **Timeline** — day, week, month, and year views with conflict detection and
  calendar (`.ics`) export
- **Gamification** — XP, coins, ranks, daily streaks, achievements, and a shop
- **Mini-Arcs** — short 1–4 week skill programs that produce a real deliverable
- **Resume builder** — generates a resume from completed goals and logged skills
- **ArcConnect** — peer matching, messaging, and audio calls between students

## AI inference

Arc's planning features run on [MicroDC](https://microdc.ai) using
`gpt-oss:120b` through its OpenAI-compatible API.

Two practical notes for anyone building on the same models:

1. **`gpt-oss` models reject `max_tokens` below 4096** unless you send
   `thinking: false`. For structured or JSON output you generally want thinking
   disabled — it's faster and the response comes back clean.
2. **Budget for cold starts.** A request that has to load a cold model can take
   roughly 60–90 seconds, while warm requests return in a few seconds. Set a
   generous client timeout; Arc uses 120s.

## Tech stack

React 19 · TypeScript · Vite · TailwindCSS · shadcn/ui · Framer Motion ·
React Router 7 · [Convex](https://convex.dev)

## Getting started

```bash
git clone https://github.com/Andrey199123/Arc_MicroDC.git
cd Arc_MicroDC
npm install
cp .env.example .env.local
npm run dev
```

Arc uses [Convex](https://convex.dev) for its database and realtime sync. Point
`VITE_CONVEX_URL` in `.env.local` at your own Convex deployment (the free tier is
enough to run the app).

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | TypeScript check |
| `npm test` | Run the test suite |

## Security note

The `/admin` and usage dashboards are gated by a passphrase read from
`VITE_ADMIN_PASSWORD`. That check runs in the browser, so treat it as a
convenience gate rather than a security boundary — anything shipped to the client
is readable by the user. Enforce real authorization server-side before exposing
those screens to untrusted traffic.

## Contributing

Issues and pull requests are welcome.

## License

[MIT](./LICENSE) © 2026 Andrey Vasilyev
