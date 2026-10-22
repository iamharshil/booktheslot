"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  getAdminAudit,
  getAdminBusinesses,
  getProfile,
  setAdminBusinessStatus,
} from "../../lib/api";

export default function AdminPage() {
  const [businesses, setBusinesses] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getAdminBusinesses(), getAdminAudit()])
      .then(([profile, businessResult, auditResult]) => {
        if (profile.data?.role !== "platform_admin")
          throw new Error("Platform administrator access required.");
        setBusinesses(businessResult.data || []);
        setAudit(auditResult.data || []);
      })
      .catch((error) => toast.error(error.message || "Admin data could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(business) {
    const active = !business.isActive;
    const reason = active
      ? ""
      : window.prompt("Reason for suspending this business?")?.trim();
    if (!active && !reason) return;
    try {
      const result = await setAdminBusinessStatus(business._id, active, reason);
      setBusinesses((items) =>
        items.map((item) => (item._id === business._id ? result.data : item)),
      );
      const refreshed = await getAdminAudit();
      setAudit(refreshed.data || []);
      toast.success(`${business.name} ${active ? "reactivated" : "suspended"}.`);
    } catch (error) {
      toast.error(error.message || "Business status could not be changed.");
    }
  }

  if (loading)
    return (
      <main className="mx-auto max-w-5xl px-4 py-12" aria-busy="true">
        Loading admin workspace…
      </main>
    );
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <Link href="/" className="text-sm text-[var(--vermilion-ink)]">
        ← BookTheSlot
      </Link>
      <p className="eyebrow mt-5">Platform operations</p>
      <h1 className="mt-2 text-3xl font-bold">Admin workspace</h1>
      <section className="surface mt-6 overflow-x-auto p-5">
        <h2 className="text-xl font-bold">Businesses</h2>
        <table className="mt-4 w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)]">
              <th className="py-2">Business</th>
              <th>Category</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr
                key={business._id}
                className="border-b border-[var(--hairline)]"
              >
                <td className="py-3">
                  <span className="font-semibold">{business.name}</span>
                  <span className="block text-xs text-[var(--muted-ink)]">
                    /{business.slug}
                  </span>
                </td>
                <td>{business.category}</td>
                <td>{business.isActive ? "Active" : "Suspended"}</td>
                <td className="text-right">
                  <button
                    onClick={() => changeStatus(business)}
                    className="secondary-action text-xs"
                  >
                    {business.isActive ? "Suspend" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="surface mt-6 p-5">
        <h2 className="text-xl font-bold">Admin audit trail</h2>
        {audit.length ? (
          <ul className="mt-3 divide-y divide-[var(--hairline)]">
            {audit.map((entry) => (
              <li key={entry._id} className="py-3 text-sm">
                <span className="font-semibold">{entry.action}</span>
                <span className="text-[var(--muted-ink)]">
                  {" "}
                  · {entry.targetId} · {entry.actorId?.email || "Admin"} ·{" "}
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
                {entry.details?.reason && (
                  <p className="mt-1 text-[var(--muted-ink)]">
                    {entry.details.reason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-ink)]">
            No admin actions recorded.
          </p>
        )}
      </section>
    </main>
  );
}
