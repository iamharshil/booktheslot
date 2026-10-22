"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBusinessBookings, getProfile } from "../../../lib/api";

export default function ReportsPage() {
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [range, setRange] = useState("30");

  useEffect(() => {
    getProfile()
      .then((result) => {
        const owned = result.data?.businesses || [];
        setBusinesses(owned);
        setBusinessId(owned[0]?._id || "");
      })
      .catch((reason) =>
        setError(reason.message || "Could not load business."),
      );
  }, []);

  useEffect(() => {
    if (!businessId) return;
    getBusinessBookings(businessId)
      .then((result) => setBookings(result.data || []))
      .catch((reason) =>
        setError(reason.message || "Could not load bookings."),
      );
  }, [businessId]);

  const stats = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - Number(range));
    const recent = bookings.filter(
      (booking) => new Date(`${booking.date}T12:00:00`) >= since,
    );
    return {
      total: recent.length,
      confirmed: recent.filter((item) =>
        ["CONFIRMED", "COMPLETED"].includes(item.status),
      ).length,
      cancelled: recent.filter((item) => item.status === "CANCELLED").length,
      gross: recent
        .filter((item) => ["CONFIRMED", "COMPLETED"].includes(item.status))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    };
  }, [bookings, range]);

  const currency =
    businesses.find((item) => item._id === businessId)?.settings?.currency ||
    "INR";
  const cards = [
    ["Bookings", stats.total],
    ["Confirmed/completed", stats.confirmed],
    ["Cancelled", stats.cancelled],
    ["Recorded gross", `${currency} ${stats.gross}`],
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <Link className="text-sm text-[var(--vermilion-ink)]" href="/dashboard">
        ← Dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Business workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Booking report</h1>
        </div>
        <div className="flex gap-2">
          <select
            aria-label="Business"
            value={businessId}
            onChange={(event) => setBusinessId(event.target.value)}
            className="rounded-md border bg-[var(--raised)] px-3 py-2"
          >
            {businesses.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Report range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="rounded-md border bg-[var(--raised)] px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>
      {error && (
        <p role="alert" className="surface mt-5 p-3 text-sm">
          {error}
        </p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <section className="surface p-5" key={label}>
            <p className="text-sm text-[var(--muted-ink)]">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </section>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--muted-ink)]">
        Gross is based on confirmed booking amounts; refunds, taxes, and
        provider settlement fees are not included.
      </p>
    </main>
  );
}
