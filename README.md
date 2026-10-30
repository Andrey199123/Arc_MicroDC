# Arc

### Turn a big goal into today's move.

**An AI-powered planning app for high school students, with goal-planning inference powered by MicroDC.**

[Explore Arc](https://arcgoalgetter.com) · [MicroDC integration](#ai-inference) · [Engineering](#engineering-behind-the-experience)

Arc is a goal-planning app for high school students. A student describes what they want to achieve, and Arc turns it into a concrete goal, breaks it into milestones and weekly tasks, and schedules that work around the time they actually have. Progress is tracked with streaks, XP, and achievements, and the skills earned along the way build into a resume.

**200+ monthly users** · **3rd place in the Ventura pitch competition, among 1,300+ students**

*Product traction and competition results reported by the Arc team.*

> This repository showcases Arc's frontend and its backend integration points. The production Convex backend and server-side MicroDC implementation are maintained privately. This is not a standalone, self-hostable release.

## From intention to execution

### Make the next step concrete

AI-assisted goal breakdown connects an open-ended ambition to milestones and weekly tasks, scheduled around the student's availability.

![Arc breaking a goal into milestones and weekly tasks](public/arc-goal-breakdown.png)

### See the bigger picture

The galaxy dashboard represents goals as planets, giving students a visual way to follow progress across multiple ambitions.

![Personal galaxy dashboard, with each goal shown as a planet](public/arc-personal-galaxy.png)

### Put the plan on a calendar

Day, week, month, and year views connect individual tasks to longer-term milestones. Conflict detection and calendar export help students take their plans beyond the app.

![Month view of the timeline](public/arc-timeline-month.png)

## Features

- **AI goal breakdown.** Turns an open-ended goal into milestones and weekly tasks, scheduled around the student's availability.
- **Galaxy dashboard.** Goals show up as orbiting planets with live progress.
- **Timeline.** Day, week, month, and year views with conflict detection and calendar (`.ics`) export.
- **Gamification.** XP, coins, ranks, daily streaks, achievements, and a shop.
- **Mini-Arcs.** Short 1 to 4 week skill programs that end with a real deliverable.
- **Resume builder.** Generates a resume from completed goals and logged skills.
- **ArcConnect.** Peer matching, messaging, and audio calls between students.

## AI inference

Arc's planning integration uses [MicroDC](https://microdc.ai) to access `gpt-oss:120b` through an OpenAI-compatible API. The frontend invokes Convex actions for goal conversations, validation, milestone generation, and task generation. Model requests are handled by the private backend.

```text
Student's goal and availability
              ↓
React frontend → Convex actions → MicroDC inference
              ↓
Milestones, weekly tasks, and a scheduled plan
```

The public integration surface is visible in [AIService.ts](src/services/AIService.ts). It shows how the interface calls the backend, not the private inference configuration or prompts.

### Lessons from the integration

1. **Reasoning settings affect structured output.** In the team's tested configuration, `gpt-oss` rejected `max_tokens` values below 4096 unless `thinking: false` was supplied. Disabling thinking was useful for the team's structured-output requests. This is an observation about that configuration, not a guarantee across providers or model versions.
2. **Cold starts need a different latency budget.** The team observed cold requests taking approximately 60–90 seconds, compared with a few seconds for warm requests, and used a 120-second request timeout. These are integration observations, not a published benchmark or latency guarantee.

## Engineering behind the experience

The frontend separates presentation, service calls, and shared interaction logic so the planning experience can evolve without coupling every screen directly to backend details.

- **Typed service boundaries** for goals, milestones, tasks, scheduling, calendars, and AI actions in [`src/services/`](src/services/).
- **Dedicated timeline components** for day-to-year planning views in [`src/components/timeline/`](src/components/timeline/).
- **Client resilience utilities** for connectivity checks, message queuing, chat persistence, and circuit-breaker state in [`src/hooks/`](src/hooks/).
- **Reusable interface components** built with Tailwind CSS, shadcn/ui, and Radix primitives.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router 7, and [Convex](https://convex.dev).

## Repository scope

```text
src/components/    Product screens, galaxy views, timeline, and shared UI
src/services/      Frontend interfaces to backend actions and data
src/hooks/         Shared state and interaction utilities
src/lib/           Date, browser, analytics, and other utilities
convex/            Generated client bindings and shared category policy
public/            Product screenshots and static assets
```

The `convex/` directory is not the full backend. Generated bindings reference private modules that are deliberately absent here. Creating a blank Convex deployment or supplying an environment URL alone will not reproduce the working app. Use the [live product](https://arcgoalgetter.com) to explore the complete experience.

## Team and contribution

Arc is built by **Andrey Vasilyev, Garv, and Aditya**.

Andrey's engineering responsibilities include frontend-to-backend API integration, application deployment and hosting, and integrating MicroDC inference into Arc's AI planning features. The source links above provide entry points for exploring the public frontend; the private backend implementation is outside this repository's scope.

## License

The source published in this repository is available under the [MIT License](LICENSE). The private backend is not included in this release.

© 2026 Andrey Vasilyev
