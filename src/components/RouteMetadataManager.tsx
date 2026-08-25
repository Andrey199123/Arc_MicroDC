import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";

export type PageSchema = Record<string, unknown> | Array<Record<string, unknown>>;

export type PageMetadata = {
  title?: string;
  description?: string;
  robots?: string;
  imageUrl?: string;
  canonicalPath?: string;
  type?: string;
  schema?: PageSchema;
};

type RouteMetadata = {
  pattern: string;
  title: string;
  description: string;
  robots?: string;
  type?: string;
};

const DEFAULT_IMAGE_PATH = "/preview.png";
const SCHEMA_SELECTOR = 'script[data-arc-schema="true"]';

const ROUTE_METADATA: RouteMetadata[] = [
  {
    pattern: "/",
    title: "Arc | AI Goal Planner for High School Students",
    description:
      "Arc helps high school students turn big goals into milestones, weekly tasks, and real progress.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/blog",
    title: "Arc Blog | Student Goal Planning, Productivity, and Growth",
    description:
      "Read Arc updates, launch notes, and practical guidance for students building momentum on long-term goals.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/blog/:postId",
    title: "Arc Blog | Student Goal Planning, Productivity, and Growth",
    description:
      "Read Arc updates, launch notes, and practical guidance for students building momentum on long-term goals.",
    robots: "index, follow",
    type: "article",
  },
  {
    pattern: "/contact",
    title: "Contact Arc",
    description:
      "Get in touch with Arc about partnerships, support, feedback, or launch questions.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/help",
    title: "Arc Help",
    description:
      "Learn how Arc helps students plan goals, track progress, and build skills over time.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/privacy",
    title: "Arc Privacy Policy",
    description: "Read how Arc handles data, privacy, and user information.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/terms",
    title: "Arc Terms of Service",
    description: "Read the terms that govern use of Arc.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/status",
    title: "Arc Status",
    description: "Check the current service status for Arc.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/sitemap",
    title: "Arc Sitemap",
    description: "Browse the public pages available on Arc.",
    robots: "index, follow",
    type: "website",
  },
  {
    pattern: "/auth",
    title: "Sign In to Arc",
    description:
      "Sign in or create your Arc account to access your dashboard, goals, and progress.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/r/:code",
    title: "Redirecting to Arc",
    description:
      "Tracking a branded affiliate redirect before sending visitors back into Arc.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/forgot-password",
    title: "Reset Your Arc Password",
    description: "Request a password reset link for your Arc account.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/reset-password",
    title: "Choose a New Arc Password",
    description: "Reset your Arc account password with a valid reset link.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/settings",
    title: "Arc Settings",
    description: "Manage your Arc account settings and preferences.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/email-tracking",
    title: "Arc Email Tracking Dashboard",
    description: "Internal email tracking dashboard for Arc.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/profile/:userId",
    title: "Arc Profile",
    description: "Public Arc profile.",
    robots: "noindex, nofollow",
    type: "profile",
  },
  {
    pattern: "/dashboard",
    title: "Arc Dashboard",
    description: "Your Arc dashboard.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/missions",
    title: "Arc Missions",
    description: "Your Arc missions and weekly work.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/mini-arcs",
    title: "Arc Mini-Arcs",
    description: "Your Arc mini-arcs and learning paths.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/achievements",
    title: "Arc Achievements",
    description: "Your Arc achievements and streaks.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/skills",
    title: "Arc Skills",
    description: "Your Arc skill growth and experience log.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/resume",
    title: "Arc Resume",
    description: "Your live Arc resume.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/connect",
    title: "ArcConnect",
    description: "Your Arc peer connections.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/shop",
    title: "Arc Shop",
    description: "Your Arc rewards and unlocks.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/timeline",
    title: "Arc Timeline",
    description: "Your Arc calendar and timeline.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/leaderboard",
    title: "Arc Leaderboard",
    description: "Your Arc leaderboard.",
    robots: "noindex, nofollow",
    type: "website",
  },
  {
    pattern: "/goal/:goalId",
    title: "Arc Goal",
    description: "Your Arc goal details.",
    robots: "noindex, nofollow",
    type: "website",
  },
];

function getOrigin() {
  if (typeof window === "undefined") {
    return "https://arcgoalgetter.com";
  }

  return window.location.origin;
}

export function resolveRouteMetadata(pathname: string) {
  const match = ROUTE_METADATA.find((route) =>
    matchPath({ path: route.pattern, end: true }, pathname),
  );

  return (
    match || {
      title: "Arc",
      description:
        "Arc helps students build momentum on long-term goals with AI-powered planning.",
      robots: "noindex, nofollow",
      type: "website",
    }
  );
}

function upsertMeta(
  selector: string,
  create: () => HTMLMetaElement,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = create();
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function clearSchemaScripts() {
  document
    .querySelectorAll<HTMLScriptElement>(SCHEMA_SELECTOR)
    .forEach((script) => script.remove());
}

function injectSchema(schema?: PageSchema) {
  clearSchemaScripts();

  if (!schema) {
    return;
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.arcSchema = "true";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

export function applyMetadata(pathname: string, override?: PageMetadata) {
  const routeMetadata = resolveRouteMetadata(pathname);
  const metadata = {
    ...routeMetadata,
    ...override,
  };
  const origin = getOrigin();
  const canonicalPath = override?.canonicalPath || pathname;
  const canonicalUrl = `${origin}${canonicalPath}`;
  const imageUrl = override?.imageUrl
    ? override.imageUrl.startsWith("http")
      ? override.imageUrl
      : `${origin}${override.imageUrl}`
    : `${origin}${DEFAULT_IMAGE_PATH}`;

  document.title = metadata.title;

  upsertMeta(
    'meta[name="description"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      return meta;
    },
    metadata.description,
  );

  upsertMeta(
    'meta[name="robots"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      return meta;
    },
    metadata.robots || "index, follow",
  );

  upsertMeta(
    'meta[property="og:type"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:type");
      return meta;
    },
    metadata.type || "website",
  );

  upsertMeta(
    'meta[property="og:title"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      return meta;
    },
    metadata.title || routeMetadata.title,
  );

  upsertMeta(
    'meta[property="og:description"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      return meta;
    },
    metadata.description || routeMetadata.description,
  );

  upsertMeta(
    'meta[property="og:url"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:url");
      return meta;
    },
    canonicalUrl,
  );

  upsertMeta(
    'meta[property="og:image"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      return meta;
    },
    imageUrl,
  );

  upsertMeta(
    'meta[property="twitter:card"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "twitter:card");
      return meta;
    },
    "summary_large_image",
  );

  upsertMeta(
    'meta[property="twitter:title"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "twitter:title");
      return meta;
    },
    metadata.title || routeMetadata.title,
  );

  upsertMeta(
    'meta[property="twitter:description"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "twitter:description");
      return meta;
    },
    metadata.description || routeMetadata.description,
  );

  upsertMeta(
    'meta[property="twitter:url"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "twitter:url");
      return meta;
    },
    canonicalUrl,
  );

  upsertMeta(
    'meta[property="twitter:image"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "twitter:image");
      return meta;
    },
    imageUrl,
  );

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", canonicalUrl);
  injectSchema(metadata.schema);
}

export function usePageMetadata(metadata?: PageMetadata) {
  const location = useLocation();

  useEffect(() => {
    if (!metadata) {
      return;
    }

    applyMetadata(location.pathname, metadata);

    return () => {
      applyMetadata(location.pathname);
    };
  }, [location.pathname, metadata]);
}

export function RouteMetadataManager() {
  const location = useLocation();

  useEffect(() => {
    applyMetadata(location.pathname);
  }, [location.pathname]);

  return null;
}
