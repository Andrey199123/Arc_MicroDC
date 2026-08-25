import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  Target,
} from "lucide-react";
import {
  getAttribution,
  trackEvent,
} from "./lib/analytics";
import { getLocationSearch } from "./lib/browser";
import { usePageMetadata } from "./components/RouteMetadataManager";
import { HeroMissionPreview } from "./components/marketing/HeroMissionPreview";
import { ProcessTimeline } from "./components/marketing/ProcessTimeline";
import { ProductScreenshotFrame } from "./components/marketing/ProductScreenshotFrame";
import type {
  LandingActionHandlers,
} from "./components/marketing/LandingActionController";

const primaryCtaClass =
  "group inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#5e8fcc] bg-[#4f86f7] px-7 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(42,91,176,0.28)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#6394ff] hover:shadow-[0_22px_40px_rgba(42,91,176,0.34)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111d]";

const operatingSteps = [
  {
    index: "01",
    title: "Define a SMART goal",
    description:
      "Arc asks simple clarifying questions until the outcome, deadline, and finish line are specific enough to plan.",
  },
  {
    index: "02",
    title: "Map the milestones",
    description:
      "The system works backward from the deadline so major checkpoints land on a realistic reverse timeline.",
  },
  {
    index: "03",
    title: "Generate weekly work",
    description:
      "Each milestone becomes concrete weekly tasks and a clear next move for the stage of the goal.",
  },
  {
    index: "04",
    title: "Track skills and momentum",
    description:
      "Completed work feeds the student's Arc profile, skill history, progress view, and resume-ready proof of effort.",
  },
];

const systemCards = [
  {
    icon: Target,
    title: "Smart goal planner",
    description:
      "One long-term goal becomes milestones, weekly execution, and deadline-aware pacing.",
    detail:
      "Arc supports student goals like startups, college apps, writing, portfolios, networking, and learning new skills.",
  },
  {
    icon: BookOpen,
    title: "Focused guidance",
    description:
      "Arc keeps the plan centered on milestones and next actions instead of a noisy feed of links.",
    detail:
      "Students see a clear path forward without needing a separate resource stream.",
  },
  {
    icon: Briefcase,
    title: "Arc profile and resume proof",
    description:
      "Milestones and tasks log skills and experience into a profile that grows with the student.",
    detail:
      "That progress later powers resume generation, opportunity matching, and self-insight.",
  },
  {
    icon: CalendarDays,
    title: "Adaptive execution loop",
    description:
      "Check-ins, pacing changes, buffers, and schedule-aware planning keep the system useful after the first burst of motivation.",
    detail:
      "Arc can adjust the path when a student is ahead, behind, stuck, or missing a prerequisite skill.",
  },
];

const productShowcaseCards = [
  {
    eyebrow: "Goal planner",
    title: "A big goal becomes a milestone map and weekly execution.",
    description:
      "The goal view turns a mission into concrete checkpoints, weekly tasks, and skill-linked progress instead of a vague intention.",
    imageSrc: "/arc-goal-breakdown.png",
    imageAlt:
      "Arc goal detail view showing a student goal, milestone breakdown, and generated weekly tasks.",
    placement: "goal_breakdown_card",
  },
  {
    eyebrow: "Timeline view",
    title: "The plan can live on a real calendar, not just a wish list.",
    description:
      "Timeline mode helps students see when tasks land across the month so the work fits around school, clubs, and deadlines.",
    imageSrc: "/arc-timeline-month.png",
    imageAlt:
      "Arc timeline month view showing scheduled tasks and progress across a student calendar.",
    placement: "timeline_card",
  },
];

const supportedGoalExamples = [
  "Start a project or MVP",
  "Build a personal portfolio",
  "Prepare college applications",
  "Learn a serious new skill",
  "Plan outreach or networking",
];

const guardRailPoints = [
  "Medical or therapy planning",
  "Mental-health or body-goal planning",
  "Fitness, weight-loss, or other body-composition goals",
  "Anything illegal, harmful, or unsafe",
];

const faqItems = [
  {
    question: "Who is Arc for?",
    answer:
      "Arc is built primarily for high school students who want help turning a long-term goal into a step-by-step plan.",
  },
  {
    question: "What kinds of goals are not supported?",
    answer:
      "Arc avoids medical, therapy, mental-health, fitness, weight-loss, and other body-goal planning, plus anything illegal or harmful.",
  },
  {
    question: "Can Arc help with most other student goals?",
    answer:
      "Yes. Arc is open to appropriate student goals that need structure, planning, or accountability.",
  },
];

const landingPageSchema = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Arc",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://arcgoalgetter.com/",
    description:
      "Arc helps high school students turn big goals into milestones, weekly tasks, and real progress.",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
];

const LandingActionController = lazy(async () => {
  const module = await import("./components/marketing/LandingActionController");
  return { default: module.LandingActionController };
});

export function LandingPage() {
  const navigate = useNavigate();
  const hasTrackedLandingView = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [landingActions, setLandingActions] = useState<LandingActionHandlers | null>(null);

  usePageMetadata({
    title: "Arc | AI Goal Planner for High School Students",
    description:
      "Arc helps high school students turn big goals into milestones, weekly tasks, and real progress.",
    robots: "index, follow",
    canonicalPath: "/",
    schema: landingPageSchema,
  });

  useEffect(() => {
    if (hasTrackedLandingView.current) {
      return;
    }

    hasTrackedLandingView.current = true;
    trackEvent("landing_view", {
      ...getAttribution(getLocationSearch()),
    });
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAuthCta = useCallback(
    (placement: string) => {
      if (landingActions) {
        landingActions.handleAuthCta(placement);
        return;
      }

      navigate(`/auth?utm_source=landing&utm_medium=${placement}&utm_campaign=launch_funnel`);
    },
    [landingActions, navigate],
  );

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const preloadController = window.setTimeout(() => {
      void import("./components/marketing/LandingActionController");
    }, 1);

    return () => window.clearTimeout(preloadController);
  }, [isClient]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111d] text-slate-100">
      {isClient ? (
        <Suspense fallback={null}>
          <LandingActionController
            onReady={setLandingActions}
          />
        </Suspense>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,131,255,0.18),transparent_38%),radial-gradient(circle_at_20%_80%,rgba(24,54,104,0.36),transparent_34%)]" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(122,167,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,167,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#10284b] to-transparent opacity-60" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-[#1c304d] bg-[#07111f]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#3a5d8f] bg-[#11233d]">
                <img
                  src="/favicon.ico"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">Arc</p>
                <p className="text-xs font-medium text-blue-100/50">
                  AI goal planning for students
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a
                href="#how-it-works"
                className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                How it works
              </a>
              <a
                href="#inside-arc"
                className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                See the product
              </a>
              <a
                href="#trust"
                className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                FAQ
              </a>
            </nav>

            <button
              onClick={() => handleAuthCta("nav_cta")}
              className="rounded-[14px] border border-[#557fb6] bg-[#4f86f7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6394ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111d]"
            >
              Create account
            </button>
          </div>
        </header>

        <main>
          <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:px-8 lg:pb-20 lg:pt-20">
            <div>
              <p className="arc-kicker text-blue-100/72">
                Built for ambitious high school students with serious long-term goals.
              </p>

              <h1 className="arc-display mt-6 max-w-4xl text-[clamp(3rem,8vw,5.55rem)] font-bold leading-[0.94] text-white">
                Turn one big goal into a plan you can actually follow.
              </h1>

              <p className="arc-copy mt-6 max-w-2xl text-[1.0625rem] leading-8 text-slate-300 md:text-[1.2rem]">
                Arc helps students define the goal, map the milestones, generate the weekly work,
                and keep progress visible from start to finish.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => handleAuthCta("hero_create_account")}
                  className={primaryCtaClass}
                >
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              <p className="arc-copy mt-4 text-sm leading-7 text-slate-400">
                Open the product preview, then create an account when you're ready to save your plan and progress.
              </p>
            </div>

            <div>
              <HeroMissionPreview onClick={() => handleAuthCta("hero_screenshot")} />
            </div>
          </section>

          <section
            id="how-it-works"
            className="mx-auto grid max-w-7xl gap-10 px-6 py-20 [content-visibility:auto] [contain-intrinsic-size:900px] lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
          >
            <div>
              <p className="text-sm font-medium text-blue-100/70">
                How Arc works
              </p>
              <h2 className="arc-display mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold text-white">
                From idea to weekly plan.
              </h2>
              <p className="arc-copy mt-5 max-w-xl text-[1.05rem] leading-8 text-slate-300">
                Arc is meant to answer one question fast: what should I do next to make real progress on this goal?
              </p>
            </div>

            <div className="rounded-[24px] border border-[#223a5d] bg-[#081423] px-6 py-2 shadow-[0_18px_50px_rgba(2,8,18,0.34)] md:px-8">
              <ProcessTimeline items={operatingSteps} />
            </div>
          </section>

          <section
            id="inside-arc"
            className="mx-auto max-w-7xl px-6 py-20 [content-visibility:auto] [contain-intrinsic-size:1200px] lg:px-8"
          >
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-medium text-blue-100/70">
                What students actually use
              </p>
              <h2 className="arc-display mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold text-white">
                See the screens students use to keep the plan moving.
              </h2>
              <p className="arc-copy mt-5 max-w-2xl text-[1.05rem] leading-8 text-slate-300">
                Arc turns one long-term goal into a clear breakdown, a working calendar, and a visible record of progress.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {productShowcaseCards.map((item) => (
                <div
                  key={item.title}
                  className="overflow-hidden rounded-[20px] border border-[#223a5d] bg-[#081423]"
                >
                  <div className="border-b border-[#223a5d] bg-[#0c1728] p-4">
                    <ProductScreenshotFrame
                      imageSrc={item.imageSrc}
                      imageAlt={item.imageAlt}
                      width={item.imageSrc === "/arc-goal-breakdown.png" ? 2952 : 2588}
                      height={item.imageSrc === "/arc-goal-breakdown.png" ? 1428 : 1674}
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      onClick={() => handleAuthCta(item.placement)}
                      buttonAriaLabel={`Open Arc from the ${item.eyebrow} preview`}
                      frameClassName="rounded-[18px] border-[#2d4c74] bg-[#091626] p-0 shadow-none"
                      imageWrapperClassName="rounded-[17px] border-[#314d74] bg-[#091626]"
                      imageClassName="rounded-none"
                      overlay={
                        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-[#07111f]/82 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur-md">
                          Open Arc
                        </div>
                      }
                    />
                  </div>
                  <div className="p-7">
                    <p className="text-sm font-medium text-blue-100/70">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-slate-300">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => handleAuthCta(item.placement)}
                      className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-100/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      See it in Arc
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {systemCards.map(({ icon: Icon, title, description, detail }) => (
                <div
                  key={title}
                  className="rounded-[20px] border border-[#223a5d] bg-[#081423] p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-[13px] border border-[#35547c] bg-[#0d1c31]">
                      <Icon className="h-5 w-5 text-blue-200" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="trust"
            className="mx-auto max-w-7xl px-6 py-20 [content-visibility:auto] [contain-intrinsic-size:960px] lg:px-8"
          >
            <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
              <div className="rounded-[22px] border border-[#223a5d] bg-[#081423] p-8">
                <p className="arc-kicker text-blue-100/70">Where Arc fits</p>
                <h2 className="arc-display mt-4 text-[clamp(2rem,4vw,3rem)] font-bold text-white">
                  Arc is open to a wide range of student goals that need structure.
                </h2>
                <p className="arc-copy mt-5 text-base leading-8 text-slate-300">
                  It is built for ambitious students first, while still giving parents and schools enough clarity to understand the work.
                </p>

                <div className="mt-8">
                <p className="text-sm font-medium text-blue-100/68">Examples of goals Arc can support</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {supportedGoalExamples.map((item) => (
                    <div
                        key={item}
                        className="rounded-[999px] border border-[#35547c] bg-[#0d1c31] px-4 py-2 text-sm text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="rounded-[16px] border border-[#223a5d] bg-[#0b1728] px-5 py-4">
                    <p className="text-sm font-medium text-blue-100/70">Unsupported goals</p>
                    <ul className="mt-3 space-y-2">
                      {guardRailPoints.map((item) => (
                        <li key={item} className="text-sm leading-7 text-slate-300">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#223a5d] bg-[#081423] p-8">
                <p className="arc-kicker text-blue-100/70">Questions people usually ask</p>
                <div className="mt-6 space-y-4">
                  {faqItems.map((item) => (
                    <div
                      key={item.question}
                      className="rounded-[18px] border border-[#223a5d] bg-[#0b1728] px-6 py-5"
                    >
                      <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            className="mx-auto max-w-7xl px-6 pb-32 pt-8 [content-visibility:auto] [contain-intrinsic-size:420px] lg:px-8 lg:pb-24"
          >
            <div className="rounded-[22px] border border-[#557fb6] bg-[#0d1c31] p-8 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="arc-kicker text-blue-100/72">
                    Start here
                  </p>
                  <h2 className="arc-display mt-4 max-w-3xl text-[clamp(2.35rem,5vw,4rem)] font-bold text-white">
                    Start with one goal and leave with a first week already mapped.
                  </h2>
                  <p className="arc-copy mt-5 max-w-2xl text-[1.05rem] leading-8 text-slate-300">
                    Arc is built to answer the question that matters most: what should I do next?
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => handleAuthCta("final_demo_cta")}
                      className={primaryCtaClass}
                    >
                      Create account
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAuthCta("final_auth_cta")}
                      className="group inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#29476f] bg-[#091626] px-7 py-4 text-base font-semibold text-slate-200 transition-colors hover:bg-[#0f1d31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111d]"
                    >
                      Create account
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#1c304d] bg-[#06111d]/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>Arc helps students turn ambitious goals into clear next steps.</p>
            <div className="flex flex-wrap gap-4">
              <a href="/terms" className="transition-colors hover:text-white">Terms</a>
              <a href="/privacy" className="transition-colors hover:text-white">Privacy</a>
              <a href="/contact" className="transition-colors hover:text-white">Contact</a>
            </div>
          </div>
        </footer>

        <div className="fixed inset-x-4 bottom-4 z-30 md:hidden">
          <div className="flex items-center justify-between gap-4 rounded-[20px] border border-[#35547c] bg-[#07111f]/92 px-4 py-3 shadow-[0_18px_40px_rgba(2,8,18,0.42)] backdrop-blur-xl">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-blue-100/55">
                Ready to start
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                Create your Arc account
              </p>
            </div>
            <button
              onClick={() => handleAuthCta("mobile_dock")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-[14px] border border-[#5e8fcc] bg-[#4f86f7] px-4 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#6394ff] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111d]"
            >
              Create account
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
