import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "convex/react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { api } from "../../convex/_generated/api";
import {
  clearAffiliateAttribution,
  normalizeAffiliateCode,
  resolveAffiliateRedirectTarget,
  storeAffiliateAttribution,
} from "../lib/affiliate";
import { trackEvent } from "../lib/analytics";

export function AffiliateRedirectPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const recordAffiliateTouch = useMutation(api.affiliates.recordAffiliateTouch);

  useEffect(() => {
    const normalizedCode = normalizeAffiliateCode(code || "");
    if (!normalizedCode) {
      navigate("/", { replace: true });
      return;
    }

    const landingPath = `${location.pathname}${location.search}`;
    const attribution = storeAffiliateAttribution({
      code: normalizedCode,
      landingPath,
      referrerUrl: typeof document === "undefined" ? undefined : document.referrer || undefined,
    });

    if (attribution) {
      void recordAffiliateTouch({
        code: normalizedCode,
        sessionId: attribution.sessionId,
        landingPath: attribution.landingPath,
        referrerUrl: attribution.referrerUrl,
        userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        capturedAt: attribution.capturedAt,
      })
        .then((result) => {
          if (result?.recorded) {
            trackEvent("affiliate_landing", { code: normalizedCode });
            return;
          }

          if (
            result?.reason === "invalid_partner" &&
            attribution.code === normalizedCode
          ) {
            clearAffiliateAttribution();
          }
        })
        .catch((error) => {
          console.error("Failed to record affiliate touch:", error);
        });
    }

    const target = resolveAffiliateRedirectTarget(
      new URLSearchParams(location.search).get("next"),
    );

    navigate(target, { replace: true });
  }, [code, location.pathname, location.search, navigate, recordAffiliateTouch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-space-900)] px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-nebula)] bg-[var(--bg-space-800)]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[var(--accent-cyan)]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--star)]">Redirecting to Arc</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            We&apos;re saving your referral and taking you back to the site.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--accent-cyan)]" />
          Affiliate tracking active
        </div>
      </div>
    </div>
  );
}
