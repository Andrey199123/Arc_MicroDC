import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../convex/_generated/api";
import { ArcMark } from "./components/ArcMark";
import { ProcessTimeline } from "./components/marketing/ProcessTimeline";
import { SignInForm } from "./SignInForm";
import {
  clearAuthIntent,
  getAttribution,
  readAuthIntent,
  trackEvent,
  type AuthIntent,
} from "./lib/analytics";
import {
  clearGuestSession,
  GUEST_MODE_KEY,
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./lib/browser";

const authSummaryRows = [
  {
    index: "01",
    title: "Clarify the goal",
    description: "Arc asks for the finish line, deadline, and outcome until the mission is specific enough to plan.",
  },
  {
    index: "02",
    title: "Map the milestones",
    description: "The system works backward from the deadline so major checkpoints land on a realistic timeline.",
  },
  {
    index: "03",
    title: "Start the first week",
    description: "Milestones become concrete weekly work, resources, and visible progress instead of vague motivation.",
  },
];

const OnboardingWizard = lazy(async () => {
  const module = await import("./components/OnboardingWizard");
  return { default: module.OnboardingWizard };
});

export function AuthPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [lastAuthIntent, setLastAuthIntent] = useState<AuthIntent | null>(null);
  const saveProgress = useMutation(api.users.saveOnboardingProgress);
  const ensureGuestProfile = useMutation(api.users.ensureGuestProfile);
  const hasTrackedOnboardingStart = useRef(false);
  const isGuestUpgrade =
    new URLSearchParams(location.search).get("upgrade") === "guest" &&
    (readSessionStorage(GUEST_MODE_KEY) === "true" || currentUser?.isAnonymous === true);

  useEffect(() => {
    trackEvent("auth_view", getAttribution(location.search));
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated && currentUser && !currentUser.profile && !profileInitialized) {
      const initializeProfile = currentUser.isAnonymous
        ? ensureGuestProfile()
        : saveProgress({
            step: 0,
            data: {
              interests: undefined,
              motivationLevel: undefined,
              skills: undefined,
              programs: undefined,
              awards: undefined,
              grade: undefined,
              birthday: undefined,
              city: undefined,
              state: undefined,
              schoolName: undefined,
              schoolCity: undefined,
              schoolState: undefined,
            },
          });

      initializeProfile
        .then(() => {
          setProfileInitialized(true);
        })
        .catch((error) => {
          console.error("Failed to initialize profile for new user:", error);
        });
    }
  }, [currentUser, ensureGuestProfile, isAuthenticated, profileInitialized, saveProgress]);

  useEffect(() => {
    if (!isAuthenticated || currentUser === undefined) {
      return;
    }

    const authIntent = readAuthIntent();
    if (!authIntent) {
      return;
    }

    setLastAuthIntent(authIntent);

    if (authIntent.method === "anonymous") {
      trackEvent("guest_session_started", { method: authIntent.method });
    } else if (authIntent.flow === "signUp") {
      trackEvent("signup_success", { method: authIntent.method });
    } else {
      trackEvent("login_success", { method: authIntent.method });
    }

    clearAuthIntent();
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    if (
      isAuthenticated &&
      currentUser?.profile &&
      !currentUser.profile.completedOnboarding &&
      showOnboarding &&
      !hasTrackedOnboardingStart.current
    ) {
      trackEvent("onboarding_start", {
        method: lastAuthIntent?.method || "unknown",
        flow: lastAuthIntent?.flow || "unknown",
      });
      hasTrackedOnboardingStart.current = true;
    }
  }, [currentUser, isAuthenticated, lastAuthIntent, showOnboarding]);

  useEffect(() => {
    if (
      !isGuestUpgrade ||
      !isAuthenticated ||
      !currentUser?.profile ||
      currentUser.profile.completedOnboarding ||
      showOnboarding ||
      !lastAuthIntent ||
      lastAuthIntent.method === "anonymous"
    ) {
      return;
    }

    clearGuestSession();
    removeSessionStorage("skipOnboarding");
    setShowOnboarding(true);
  }, [currentUser, isAuthenticated, isGuestUpgrade, lastAuthIntent, showOnboarding]);

  if (
    isLoading ||
    (isAuthenticated && currentUser === undefined) ||
    (isAuthenticated && currentUser && !currentUser.profile && !profileInitialized)
  ) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated && currentUser?.profile?.completedOnboarding === true) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && currentUser?.isAnonymous && !isGuestUpgrade) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && currentUser?.profile && !currentUser.profile.completedOnboarding) {
    if (showOnboarding) {
      return (
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#06111d]">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-[#6ea8ff]" />
            </div>
          }
        >
          <OnboardingWizard
            onComplete={() => {
              removeSessionStorage("skipOnboarding");
              clearGuestSession();
              navigate("/dashboard", { replace: true });
            }}
          />
        </Suspense>
      );
    }

    if (!isGuestUpgrade) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="mb-4 text-4xl font-bold text-white">
                Welcome back!
              </h1>
              <p className="mb-6 text-lg text-slate-300">
                You have an incomplete profile setup. Would you like to continue?
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full rounded-[14px] border border-[#6b9fff] bg-[#4f86f7] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6394ff]"
                >
                  Continue Setup
                </button>
                <button
                  onClick={() => {
                    writeSessionStorage("skipOnboarding", "true");
                    navigate("/dashboard", { replace: true });
                  }}
                  className="w-full rounded-[14px] border border-[#29476f] bg-[#0d1a2c] px-6 py-3 font-semibold text-slate-200 transition-colors hover:bg-[#13223a]"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111d] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,131,255,0.18),transparent_38%),radial-gradient(circle_at_20%_80%,rgba(24,54,104,0.45),transparent_34%)]" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(122,167,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,167,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#10284b] to-transparent opacity-60" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <section className="order-2 flex flex-col justify-between lg:order-1">
            <div className="max-w-2xl">
              <p className="arc-kicker text-blue-100/72">
                {isGuestUpgrade
                  ? "Keep the goal you already started."
                  : "Create your account first. Build the plan inside Arc."}
              </p>

              <h1 className="arc-display mt-6 max-w-3xl text-[clamp(2.8rem,8vw,4.8rem)] font-bold leading-[0.94] text-white">
                {isGuestUpgrade
                  ? "Continue your Arc account."
                  : "Start your account and get to your first real plan."}
              </h1>

              <p className="arc-copy mt-6 max-w-xl text-[1.05rem] leading-8 text-slate-300">
                {isGuestUpgrade
                  ? "Use email or Google to save what you already started and move into your full Arc account."
                  : "Arc is for students working toward something serious: college applications, a project, a portfolio, a new skill, or another long-term goal that needs structure."}
              </p>
            </div>

            <div className="mt-10 rounded-[22px] border border-[#29476f] bg-[#081423] p-6 shadow-[0_24px_80px_rgba(2,8,18,0.55)]">
              <p className="text-sm font-medium text-blue-100/70">
                What happens next
              </p>
              <ProcessTimeline items={authSummaryRows} compact className="mt-3" />
              <p className="mt-6 text-sm leading-7 text-slate-400">
                The goal is to get students to a useful first week quickly, not trap them in setup.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              Back to landing page
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </section>

          <aside className="order-1 rounded-[22px] border border-[#29476f] bg-[#091626]/95 p-1 shadow-[0_24px_80px_rgba(2,8,18,0.6)] lg:order-2">
            <div className="h-full rounded-[20px] border border-white/6 bg-[#0c1a2d]">
              <div className="border-b border-[#1f3554] px-8 py-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="arc-kicker text-blue-100/70">
                      {isGuestUpgrade ? "Keep going" : "Secure access"}
                    </p>
                    <h2 className="arc-display mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-bold text-white">
                      {isGuestUpgrade ? "Finish setup" : "Welcome to Arc"}
                    </h2>
                    <p className="arc-copy mt-4 max-w-md text-[1rem] leading-7 text-slate-300">
                      {isGuestUpgrade
                        ? "Use email or Google to keep the work you already started and finish setup."
                        : "Email and Google are the fastest ways in."}
                    </p>
                  </div>

                  <div className="relative mt-1 hidden h-20 w-20 shrink-0 items-center justify-center rounded-[20px] border border-[#35547c] bg-[#0d1c31] lg:flex">
                    <ArcMark className="h-10 w-10 text-blue-200" />
                  </div>
                </div>
              </div>

              <div className="px-8 py-8">
                <p className="mb-5 text-sm leading-7 text-slate-400">
                  {isGuestUpgrade
                    ? "Keep your progress and finish setup with a real account."
                    : "Create an account to save your goals, tasks, and progress in one place."}
                </p>
                <SignInForm
                  onSignUpSuccess={() => {
                    if (isGuestUpgrade) {
                      clearGuestSession();
                      removeSessionStorage("skipOnboarding");
                    }
                    setShowOnboarding(true);
                  }}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
