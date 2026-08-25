import { useMemo, useState, type FormEvent } from "react";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIService, type WebResearchResult } from "../../services";

function truncateText(value: string, maxLength = 220) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}…`;
}

function SourceCard({ index, title, url, searchSnippet, pageExcerpt, fetched }: WebResearchResult["sources"][number]) {
  return (
    <article className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-cyan)]/15 text-xs font-semibold text-[var(--accent-cyan)]">
              {index}
            </span>
            <h4 className="font-semibold text-[var(--star)]">{title}</h4>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-all text-xs text-[var(--accent-cyan)] hover:underline"
          >
            {url}
          </a>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${
            fetched ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"
          }`}
        >
          {fetched ? "Fetched" : "Snippet"}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-[var(--star)]">
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Search snippet</div>
          <p className="leading-6 text-[var(--star)]">{truncateText(searchSnippet || "No snippet returned.")}</p>
        </div>
        {pageExcerpt ? (
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Page excerpt</div>
            <p className="leading-6 text-[var(--text-muted)]">{truncateText(pageExcerpt, 280)}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function WebResearchPanel() {
  const researchWeb = AIService.useWebResearch();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<WebResearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const sourceCount = useMemo(() => result?.sources.length || 0, [result]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Enter a research query first.");
      return;
    }

    setIsSearching(true);
    try {
      const nextResult = await researchWeb({ query: trimmed, maxResults: 5 });
      setResult(nextResult);

      if (nextResult.fallbackReason) {
        toast.message("Research completed with fallback.", {
          description: nextResult.fallbackReason,
        });
      } else {
        toast.success("Live web research complete.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Web research failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const quickPrompts = [
    "What are the latest marketing attribution best practices?",
    "What tools help track monthly active users for affiliate payouts?",
    "How are top creator platforms handling referral links?",
  ];

  return (
    <section className="mt-8 space-y-6 rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)] p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" />
          <h2 className="text-2xl font-bold text-[var(--star)]">Live Web Research</h2>
        </div>
        <p className="max-w-3xl text-sm text-[var(--text-muted)]">
          Search the live web, fetch the top pages, and inspect the citation bundle before plugging it into the AI
          flows.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Research query</label>
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-24 w-full rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none transition-colors focus:border-[var(--accent-cyan)]"
            placeholder="Ask for recent sources, market data, product comparisons, or policy updates..."
          />
        </div>

        <div className="flex flex-col justify-end gap-3 lg:w-56">
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Searching..." : "Search the web"}
          </button>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Quick prompts</div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="rounded-full border border-[var(--border-nebula)] px-3 py-1.5 text-left text-xs text-[var(--star)] transition-colors hover:bg-[var(--bg-space-700)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Provider</div>
              <div className="mt-2 text-lg font-semibold text-[var(--star)]">{result.provider}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Sources</div>
              <div className="mt-2 text-lg font-semibold text-[var(--star)]">{sourceCount}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Fallback</div>
              <div className="mt-2 text-lg font-semibold text-[var(--star)]">
                {result.fallbackReason ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {result.fallbackReason ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              {result.fallbackReason}
            </div>
          ) : null}

          <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Prompt context</div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-900)] p-4 text-xs leading-6 text-[var(--star)]">
              {result.renderedContext}
            </pre>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {result.sources.map((source) => (
              <SourceCard key={`${source.index}-${source.url}`} {...source} />
            ))}
            {result.sources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-6 text-sm text-[var(--text-muted)]">
                No sources were returned for this search.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
