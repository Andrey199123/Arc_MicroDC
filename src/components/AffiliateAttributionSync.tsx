import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  clearAffiliateAttribution,
  readAffiliateAttribution,
} from "../lib/affiliate";

export function AffiliateAttributionSync() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <AffiliateAttributionSyncClient />;
}

function AffiliateAttributionSyncClient() {
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser, isAuthenticated ? undefined : "skip");
  const claimAffiliateTouch = useMutation(api.affiliates.claimAffiliateTouchForCurrentUser);
  const retryTimerRef = useRef<number | null>(null);
  const inFlightKeyRef = useRef<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (!isAuthenticated || currentUser === undefined || !currentUser || currentUser.isAnonymous) {
      return;
    }

    const attribution = readAffiliateAttribution();
    if (!attribution) {
      return;
    }

    const claimKey = `${attribution.code}:${attribution.sessionId}`;
    if (inFlightKeyRef.current === claimKey) {
      return;
    }

    let cancelled = false;
    inFlightKeyRef.current = claimKey;

    void claimAffiliateTouch({
      code: attribution.code,
      sessionId: attribution.sessionId,
      landingPath: attribution.landingPath,
      referrerUrl: attribution.referrerUrl,
      userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      capturedAt: attribution.capturedAt,
      qualifiedMonth: new Date().toLocaleDateString("en-CA").slice(0, 7),
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        inFlightKeyRef.current = null;

        if (result?.claimed || result?.reason === "duplicate_session" || result?.reason === "invalid_partner") {
          clearAffiliateAttribution();
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to claim affiliate attribution:", error);
        inFlightKeyRef.current = null;
        retryTimerRef.current = window.setTimeout(() => {
          setRetryNonce((value) => value + 1);
        }, 4000);
      });

    return () => {
      cancelled = true;
    };
  }, [
    claimAffiliateTouch,
    currentUser?.id,
    currentUser?.isAnonymous,
    isAuthenticated,
    retryNonce,
  ]);

  return null;
}
