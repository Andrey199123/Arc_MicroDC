import { useState } from "react";
import { ExternalLink, Video, FileText, BookOpen, CalendarClock, Award, Heart, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Curated Resource Microfeed — Delivery Layer A (embedded per-task resources).
 *
 * PHASE 1 (this file): presentational component only. It renders whatever
 * resources it is handed and captures lightweight feedback locally.
 *
 * NOT YET WIRED (Phase 2+, requires backend + keys):
 *  - The curation/recommendation engine that produces these resources
 *  - Persisting favorite / not-relevant feedback to the personalization loop
 *  - The demographic personalization layer (DEFERRED pending product/legal sign-off)
 *
 * Until the backend provides a `resources` array on a task, this renders
 * nothing, so it is safe to mount anywhere.
 */

export type ResourceType = "video" | "article" | "program" | "guide" | "event";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  description: string;
  url: string;
  /** Human-readable deadline for time-sensitive items, e.g. "Apply by July 28". */
  deadline?: string;
}

const TYPE_META: Record<ResourceType, { label: string; icon: typeof Video }> = {
  video: { label: "Video", icon: Video },
  article: { label: "Article", icon: FileText },
  program: { label: "Program", icon: Award },
  guide: { label: "Guide", icon: BookOpen },
  event: { label: "Event", icon: CalendarClock },
};

// Spec: cap embedded recommendations at 3 to avoid overwhelming the user.
const MAX_EMBEDDED = 3;

interface RecommendedResourcesProps {
  resources?: Resource[];
  /** Optional hook for the Phase 2 personalization loop. */
  onFeedback?: (resourceId: string, signal: "favorite" | "not_relevant") => void;
}

export function RecommendedResources({ resources, onFeedback }: RecommendedResourcesProps) {
  const [feedback, setFeedback] = useState<Record<string, "favorite" | "not_relevant">>({});

  if (!resources || resources.length === 0) {
    return null;
  }

  const shown = resources.slice(0, MAX_EMBEDDED);
  const overflow = resources.length - shown.length;

  const handleFeedback = (id: string, signal: "favorite" | "not_relevant") => {
    setFeedback((prev) => {
      const next = { ...prev };
      if (next[id] === signal) {
        delete next[id];
      } else {
        next[id] = signal;
      }
      return next;
    });
    onFeedback?.(id, signal);
    toast.success(signal === "favorite" ? "Saved to favorites" : "We'll show fewer like this");
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
        Recommended Resources
      </h3>
      <div className="space-y-3">
        {shown.map((resource) => {
          const meta = TYPE_META[resource.type];
          const Icon = meta.icon;
          const mark = feedback[resource.id];
          return (
            <div
              key={resource.id}
              className="glass-panel rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[var(--accent-cyan)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      {meta.label}
                    </span>
                    {resource.deadline && (
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
                        {resource.deadline}
                      </span>
                    )}
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-white font-medium hover:text-[var(--accent-cyan)] transition-colors"
                  >
                    <span className="truncate">{resource.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                  </a>
                  <p className="text-sm text-white/60 mt-1">{resource.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleFeedback(resource.id, "favorite")}
                    aria-label="Mark as favorite"
                    aria-pressed={mark === "favorite"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      mark === "favorite" ? "text-pink-400 bg-pink-400/10" : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={mark === "favorite" ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(resource.id, "not_relevant")}
                    aria-label="Not relevant"
                    aria-pressed={mark === "not_relevant"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      mark === "not_relevant" ? "text-white bg-white/10" : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {overflow > 0 && (
        <p className="text-xs text-white/40 mt-3">
          +{overflow} more in the Explore tab
        </p>
      )}
    </div>
  );
}
