import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Copy, Download, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { buildAffiliateLink } from "../../lib/affiliate";

type AffiliatePartnerRow = {
  _id: string;
  code: string;
  name: string;
  email?: string;
  notes?: string;
  active: boolean;
  payoutPerQualifiedUserCents: number;
  createdAt: number;
  updatedAt: number;
  touchCount: number;
  claimedTouchCount: number;
  qualifiedCount: number;
  qualifiedThisMonth: number;
  totalPayoutCents: number;
  currentMonthPayoutCents: number;
  lastQualifiedAt: number | null;
};

type AffiliatePayoutRow = {
  _id: string;
  partnerCode: string;
  partnerName: string;
  qualifiedMonth: string;
  qualifiedUsers: number;
  payoutPerQualifiedUserCents: number;
  totalPayoutCents: number;
  status: string;
  exportedAt?: number;
  createdAt: number;
  updatedAt: number;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDateTime(timestamp?: number | null) {
  if (!timestamp) {
    return "—";
  }

  return new Date(timestamp).toLocaleString();
}

function slugifyCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function toCsv(rows: Array<Record<string, string | number | boolean | null | undefined>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined) {
      return "";
    }

    const text = String(value);
    if (/["\n,]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");
}

export function AffiliateDashboard() {
  const dashboard = useQuery(api.affiliates.getAdminDashboard);
  const upsertAffiliatePartner = useMutation(api.affiliates.upsertAffiliatePartner);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [payoutDollars, setPayoutDollars] = useState("0.25");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    dashboard?.payouts?.forEach((payout) => months.add(payout.qualifiedMonth));
    if (dashboard?.currentMonth) {
      months.add(dashboard.currentMonth);
    }
    return Array.from(months).sort((left, right) => right.localeCompare(left));
  }, [dashboard?.currentMonth, dashboard?.payouts]);

  const visibleMonth = selectedMonth || dashboard?.currentMonth || monthOptions[0] || "";
  const visiblePayouts = useMemo(
    () => dashboard?.payouts?.filter((row) => row.qualifiedMonth === visibleMonth) || [],
    [dashboard?.payouts, visibleMonth],
  );

  const totals = useMemo(() => {
    const partners = dashboard?.partners || [];
    return {
      partners: partners.length,
      activePartners: partners.filter((partner) => partner.active).length,
      qualifiedThisMonth: partners.reduce((sum, partner) => sum + partner.qualifiedThisMonth, 0),
      payoutThisMonthCents: partners.reduce((sum, partner) => sum + partner.currentMonthPayoutCents, 0),
    };
  }, [dashboard?.partners]);

  const handleCreatePartner = async (event: FormEvent) => {
    event.preventDefault();

    const payoutCents = Math.max(0, Math.round(Number(payoutDollars || "0") * 100));
    const suggestedCode = slugifyCode(code || name);

    if (!name.trim()) {
      toast.error("Partner name is required.");
      return;
    }

    try {
      await upsertAffiliatePartner({
        name: name.trim(),
        code: suggestedCode || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        active,
        payoutPerQualifiedUserCents: payoutCents,
      });

      toast.success("Affiliate partner saved.");
      setName("");
      setCode("");
      setEmail("");
      setNotes("");
      setActive(true);
      setPayoutDollars("0.25");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save partner.");
    }
  };

  const copyLink = async (partnerCode: string) => {
    try {
      const link = buildAffiliateLink(window.location.origin, partnerCode);
      await navigator.clipboard.writeText(link);
      toast.success("Affiliate link copied.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy link.");
    }
  };

  const exportMonthCsv = () => {
    if (!visiblePayouts.length) {
      toast.error("No payout rows for this month yet.");
      return;
    }

    const csv = toCsv(
      visiblePayouts.map((row) => ({
        month: row.qualifiedMonth,
        partner_name: row.partnerName,
        partner_code: row.partnerCode,
        qualified_users: row.qualifiedUsers,
        payout_per_user: formatCurrency(row.payoutPerQualifiedUserCents),
        total_payout: formatCurrency(row.totalPayoutCents),
        status: row.status,
        exported_at: formatDateTime(row.exportedAt || null),
      })),
    );

    downloadTextFile(`arc-affiliate-payouts-${visibleMonth}.csv`, csv);
    toast.success("Monthly payout CSV downloaded.");
  };

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[var(--star)]">Affiliate Dashboard</h2>
        <p className="max-w-3xl text-sm text-[var(--text-muted)]">
          Create branded referral links, track first-touch attribution, and export monthly payout rows for partners who
          bring in active users.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Partners", value: totals.partners },
          { label: "Active partners", value: totals.activePartners },
          { label: "Qualified this month", value: totals.qualifiedThisMonth },
          { label: "Payout this month", value: formatCurrency(totals.payoutThisMonthCents) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)] p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--star)]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form
          onSubmit={handleCreatePartner}
          className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)] p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--accent-cyan)]" />
            <h3 className="text-lg font-semibold text-[var(--star)]">Create Partner</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Name</label>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!code.trim()) {
                  setCode(slugifyCode(event.target.value));
                }
              }}
              className="w-full rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none transition-colors focus:border-[var(--accent-cyan)]"
              placeholder="Acme Creator Network"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Code</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none transition-colors focus:border-[var(--accent-cyan)]"
              placeholder="Auto-generated from the name"
            />
            <p className="text-xs text-[var(--text-muted)]">Leave blank and we&apos;ll generate a clean code from the name.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Contact email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none transition-colors focus:border-[var(--accent-cyan)]"
                placeholder="partner@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Payout / user</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={payoutDollars}
                onChange={(event) => setPayoutDollars(event.target.value)}
                className="w-full rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none transition-colors focus:border-[var(--accent-cyan)]"
                placeholder="0.25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none transition-colors focus:border-[var(--accent-cyan)]"
              placeholder="Anything the team should remember..."
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)]">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--border-nebula)] bg-transparent text-[var(--accent-cyan)]"
            />
            Partner is active
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Save Partner
          </button>
        </form>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)]">
            <div className="flex flex-col gap-3 border-b border-[var(--border-nebula)] p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--star)]">Partners</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Copy clean links and review first-touch attribution counts.
                </p>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Current month: <span className="text-[var(--star)]">{dashboard?.currentMonth || "—"}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border-nebula)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Link</th>
                    <th className="px-6 py-4">Touches</th>
                    <th className="px-6 py-4">Qualified</th>
                    <th className="px-6 py-4">Payout / user</th>
                    <th className="px-6 py-4">This month</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.partners || []).map((partner: AffiliatePartnerRow) => {
                    const link = buildAffiliateLink(window.location.origin, partner.code);
                    return (
                      <tr key={partner._id} className="border-b border-[var(--border-nebula)] last:border-b-0">
                        <td className="px-6 py-4 align-top">
                          <div className="font-semibold text-[var(--star)]">{partner.name}</div>
                          <div className="mt-1 text-xs text-[var(--text-muted)]">
                            <span className="font-mono text-[var(--accent-cyan)]">{partner.code}</span>
                            {partner.email ? ` · ${partner.email}` : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <div className="max-w-[240px] break-all rounded-lg border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-3 py-2 font-mono text-xs text-[var(--star)]">
                              {link}
                            </div>
                            <button
                              type="button"
                              onClick={() => copyLink(partner.code)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-nebula)] text-[var(--star)] transition-colors hover:bg-[var(--bg-space-700)]"
                              aria-label={`Copy link for ${partner.name}`}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          {partner.notes ? (
                            <p className="mt-2 max-w-[280px] text-xs text-[var(--text-muted)]">{partner.notes}</p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 align-top text-[var(--star)]">{partner.touchCount}</td>
                        <td className="px-6 py-4 align-top text-[var(--star)]">{partner.qualifiedCount}</td>
                        <td className="px-6 py-4 align-top text-[var(--star)]">
                          {formatCurrency(partner.payoutPerQualifiedUserCents)}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-[var(--star)]">{partner.qualifiedThisMonth}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {formatCurrency(partner.currentMonthPayoutCents)}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              partner.active
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-slate-500/15 text-slate-300"
                            }`}
                          >
                            {partner.active ? "Active" : "Paused"}
                          </span>
                          <div className="mt-2 text-xs text-[var(--text-muted)]">
                            Updated {formatDateTime(partner.updatedAt)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {(!dashboard?.partners || dashboard.partners.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
                        No partners yet. Create the first affiliate partner on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)] p-6 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--star)]">Monthly payout export</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Download the payout rows for a selected month as CSV.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={visibleMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] px-4 py-3 text-sm text-[var(--star)] outline-none"
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={exportMonthCsv}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-nebula)] px-4 py-3 text-sm font-medium text-[var(--star)] transition-colors hover:bg-[var(--bg-space-700)]"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border-nebula)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Qualified users</th>
                    <th className="px-4 py-3">Payout / user</th>
                    <th className="px-4 py-3">Total payout</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePayouts.map((row: AffiliatePayoutRow) => (
                    <tr key={row._id} className="border-b border-[var(--border-nebula)] last:border-b-0">
                      <td className="px-4 py-3 text-[var(--star)]">
                        <div className="font-medium">{row.partnerName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{row.partnerCode}</div>
                      </td>
                      <td className="px-4 py-3 text-[var(--star)]">{row.qualifiedMonth}</td>
                      <td className="px-4 py-3 text-[var(--star)]">{row.qualifiedUsers}</td>
                      <td className="px-4 py-3 text-[var(--star)]">
                        {formatCurrency(row.payoutPerQualifiedUserCents)}
                      </td>
                      <td className="px-4 py-3 text-[var(--star)]">{formatCurrency(row.totalPayoutCents)}</td>
                      <td className="px-4 py-3 text-[var(--star)]">
                        <div className="text-sm">{row.status}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Exported {formatDateTime(row.exportedAt || null)}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visiblePayouts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                        No payout rows for {visibleMonth || "the selected month"} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)] p-6">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[var(--accent-cyan)]" />
                <h3 className="text-lg font-semibold text-[var(--star)]">Recent touches</h3>
              </div>
              <div className="mt-4 space-y-3">
                {(dashboard?.recentTouches || []).slice(0, 6).map((touch) => (
                  <div key={touch._id} className="rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-[var(--star)]">{touch.partnerName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{touch.landingPath}</div>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{formatDateTime(touch.firstSeenAt)}</div>
                    </div>
                  </div>
                ))}
                {(dashboard?.recentTouches || []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border-nebula)] p-4 text-sm text-[var(--text-muted)]">
                    No touches recorded yet.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-nebula)] bg-[var(--bg-space-800)] p-6">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[var(--accent-cyan)]" />
                <h3 className="text-lg font-semibold text-[var(--star)]">Recent conversions</h3>
              </div>
              <div className="mt-4 space-y-3">
                {(dashboard?.recentConversions || []).slice(0, 6).map((conversion) => (
                  <div key={conversion._id} className="rounded-xl border border-[var(--border-nebula)] bg-[var(--bg-space-700)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-[var(--star)]">{conversion.partnerName}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {conversion.qualifiedMonth} · {formatCurrency(conversion.payoutCents)}
                        </div>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{formatDateTime(conversion.qualifiedAt)}</div>
                    </div>
                  </div>
                ))}
                {(dashboard?.recentConversions || []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border-nebula)] p-4 text-sm text-[var(--text-muted)]">
                    No conversions recorded yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
