import { useQuery } from "convex/react";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { trackEvent } from "../../lib/analytics";
import { GUEST_MODE_KEY, readSessionStorage } from "../../lib/browser";

export type LandingActionHandlers = {
  handleAuthCta: (placement: string) => void;
};

type LandingActionControllerProps = {
  onReady: (handlers: LandingActionHandlers | null) => void;
};

export function LandingActionController({
  onReady,
}: LandingActionControllerProps) {
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleAuthCta = useCallback(
    (placement: string) => {
      const isGuestSession =
        readSessionStorage(GUEST_MODE_KEY) === "true" ||
        currentUser?.isAnonymous === true;
      const destination = isGuestSession
        ? `/auth?upgrade=guest&utm_source=landing&utm_medium=${placement}&utm_campaign=guest_upgrade`
        : `/auth?utm_source=landing&utm_medium=${placement}&utm_campaign=launch_funnel`;

      trackEvent("landing_cta_click", {
        placement,
        destination,
      });

      navigate(destination);
    },
    [currentUser?.isAnonymous, navigate],
  );

  useEffect(() => {
    onReady({ handleAuthCta });

    return () => onReady(null);
  }, [handleAuthCta, onReady]);

  return null;
}
