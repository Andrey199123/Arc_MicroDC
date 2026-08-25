import { getAttribution } from "./analytics";
import {
  readLocalStorage,
  removeLocalStorage,
  safeJsonParse,
  writeLocalStorage,
} from "./browser";

export const AFFILIATE_ATTRIBUTION_KEY = "arc-affiliate-attribution";

export type AffiliateAttribution = {
  code: string;
  sessionId: string;
  landingPath: string;
  capturedAt: number;
  referrerUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `aff_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeAffiliateCode(code: string) {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function readAffiliateAttribution(): AffiliateAttribution | null {
  const value = readLocalStorage(AFFILIATE_ATTRIBUTION_KEY);
  if (!value) {
    return null;
  }

  const parsed = safeJsonParse<AffiliateAttribution | null>(value, null);
  if (!parsed || !parsed.code || !parsed.sessionId || !parsed.landingPath) {
    removeLocalStorage(AFFILIATE_ATTRIBUTION_KEY);
    return null;
  }

  return {
    ...parsed,
    code: normalizeAffiliateCode(parsed.code),
  };
}

export function storeAffiliateAttribution(attribution: {
  code: string;
  landingPath: string;
  referrerUrl?: string;
  sessionId?: string;
  capturedAt?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  const existing = readAffiliateAttribution();
  if (existing) {
    return existing;
  }

  const normalizedCode = normalizeAffiliateCode(attribution.code);
  if (!normalizedCode) {
    return null;
  }

  const payload: AffiliateAttribution = {
    code: normalizedCode,
    sessionId: attribution.sessionId || createSessionId(),
    landingPath: attribution.landingPath,
    capturedAt: attribution.capturedAt || Date.now(),
    ...(attribution.referrerUrl ? { referrerUrl: attribution.referrerUrl } : {}),
    ...(attribution.utmSource ? { utmSource: attribution.utmSource } : {}),
    ...(attribution.utmMedium ? { utmMedium: attribution.utmMedium } : {}),
    ...(attribution.utmCampaign ? { utmCampaign: attribution.utmCampaign } : {}),
  };

  writeLocalStorage(AFFILIATE_ATTRIBUTION_KEY, JSON.stringify(payload));
  return payload;
}

export function clearAffiliateAttribution() {
  removeLocalStorage(AFFILIATE_ATTRIBUTION_KEY);
}

export function buildAffiliateLink(origin: string, code: string, next?: string) {
  const url = new URL(`/r/${normalizeAffiliateCode(code)}`, origin);
  if (next !== undefined) {
    const safeNext = resolveAffiliateRedirectTarget(next);
    url.searchParams.set("next", safeNext);
  }
  return url.toString();
}

export function resolveAffiliateRedirectTarget(next?: string | null) {
  if (!next) {
    return "/";
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) {
    return "/";
  }

  if (trimmed.startsWith("//") || trimmed.includes("://")) {
    return "/";
  }

  return trimmed || "/";
}

export function captureAffiliateAttributionFromLocation(
  code: string,
  landingPath: string,
  referrerUrl?: string,
) {
  const utm = typeof window === "undefined" ? {} : getAttribution(window.location.search);

  return storeAffiliateAttribution({
    code,
    landingPath,
    referrerUrl,
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
  });
}
