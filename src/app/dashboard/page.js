"use client";

import {
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cancelBooking,
  completeBooking,
  decideBooking,
  getBusinessBookings,
  getProfile,
} from "../../lib/api";

function toMinutes(time) {
  const [hours, minutes] = (time || "0:0").split(":").map(Number);
  return hours * 60 + minutes;
}

function displayTime(value, format = "12h") {
  const [hours, minutes] = (value || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  if (format === "24h")
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function shiftDate(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days, 12));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function displayDate(date) {
  const value = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function dateInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function minutesInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return Number(values.hour) * 60 + Number(values.minute);
}

export default function MerchantDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revealed, setRevealed] = useState({});
  const [cancellingId, setCancellingId] = useState("");
  const [completingId, setCompletingId] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [now, setNow] = useState(() => new Date());
  const timezone = selectedBusiness?.timezone || "Asia/Kolkata";
  const today = dateInTimezone(now, timezone);
  const activeDate = selectedDate || today;
  const isToday = activeDate === today;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setShowWelcome(
      new URLSearchParams(window.location.search).get("welcome") === "1",
    );
  }, []);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((res) => {
        if (!active) return;
        const owned = res.data?.businesses || [];
        setBusinesses(owned);
        if (owned.length) setSelectedBusiness(owned[0]);
      })
      .catch((err) => {
        if (active)
          setLoadError(
            err.message || "Your business list could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBusiness?._id) {
      setBookings([]);
      return undefined;
    }
    let active = true;
    setBookingsLoading(true);
    setLoadError("");
    getBusinessBookings(selectedBusiness._id, { date: activeDate })
      .then((res) => {
        if (active) setBookings(res.data || []);
      })
      .catch((err) => {
        if (active)
          setLoadError(
            err.message || "Today’s appointments could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setBookingsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedBusiness?._id, activeDate]);

  const ordered = useMemo(
    () => [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings],
  );
  const visibleOrdered = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase();
    if (!query) return ordered;
    return ordered.filter((booking) =>
      [
        booking.customer?.name,
        booking.customer?.email,
        booking.serviceId?.name,
        booking.bookingReference,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [bookingSearch, ordered]);
  const nowMinute = minutesInTimezone(now, timezone);
  const nowIndex = isToday
    ? visibleOrdered.findIndex(
        (booking) => toMinutes(booking.startTime) >= nowMinute,
      )
    : -1;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;
  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING_PAYMENT",
  ).length;
  const completedCount = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  function appointmentHasEnded(booking) {
    if (activeDate < today) return true;
    if (activeDate > today) return false;
    return toMinutes(booking.endTime) <= nowMinute;
  }

  async function cancel(booking) {
    if (
      !window.confirm(
        `Cancel the ${displayTime(booking.startTime, selectedBusiness?.settings?.timeFormat)} appointment and release this time?`,
      )
    )
      return;
    setCancellingId(booking._id);
    try {
      await cancelBooking(booking._id, "Cancelled by merchant");
      const result = await getBusinessBookings(selectedBusiness._id, {
        date: activeDate,
      });
      setBookings(result.data || []);
    } catch (err) {
      setLoadError(err.message || "The appointment could not be cancelled.");
    } finally {
      setCancellingId("");
    }
  }

  async function markComplete(booking) {
    if (!window.confirm("Mark this appointment as completed?")) return;
    setCompletingId(booking._id);
    setLoadError("");
    try {
      const result = await completeBooking(booking._id);
      setBookings((items) =>
        items.map((item) =>
          item._id === booking._id
            ? { ...item, status: result.data?.status || "COMPLETED" }
            : item,
        ),
      );
    } catch (err) {
      setLoadError(err.message || "The appointment could not be completed.");
    } finally {
      setCompletingId("");
    }
  }

  async function decide(booking, decision) {
    setCancellingId(booking._id);
    setLoadError("");
    try {
      const result = await decideBooking(booking._id, decision);
      setBookings((items) =>
        items.map((item) =>
          item._id === booking._id
            ? {
                ...item,
                status:
                  result.data?.status ||
                  (decision === "approve" ? "CONFIRMED" : "REJECTED"),
              }
            : item,
        ),
      );
    } catch (err) {
      setLoadError(
        err.message || "The appointment request could not be updated.",
      );
    } finally {
      setCancellingId("");
    }
  }

  if (loading)
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
        <div className="skeleton h-8 w-48" />
        <div className="mt-7 space-y-3">
          {[1, 2, 3].map((item) => (
            <div className="skeleton h-24 w-full" key={item} />
          ))}
        </div>
      </div>
    );

  if (!businesses.length)
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-8">
        <p className="eyebrow">Merchant workspace</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-.06em]">
          Your day, in order.
        </h1>
        <div className="surface mt-8 p-6">
          <h2 className="text-xl font-bold">
            No business is connected to this account.
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Set up a business before adding services and appointment hours.
          </p>
          <Link className="primary-action mt-5" href="/register-business">
            Register a business ↗
          </Link>
        </div>
      </div>
    );

  const rowHeight = 120;
  const height = Math.max(280, visibleOrdered.length * rowHeight + 80);
  const nowPosition =
    48 + (nowIndex === -1 ? visibleOrdered.length : nowIndex) * rowHeight;

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12"
      data-density="compact"
    >
      <div className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            Merchant · {isToday ? "Today" : displayDate(activeDate)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
            Appointments
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            {displayDate(activeDate)} ·{" "}
            {timezone === "Asia/Kolkata"
              ? "India Standard Time (IST)"
              : timezone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="business-picker">
            Business
          </label>
          <select
            id="business-picker"
            value={selectedBusiness?._id || ""}
            onChange={(event) => {
              setSelectedBusiness(
                businesses.find(
                  (business) => business._id === event.target.value,
                ),
              );
              setSelectedDate("");
            }}
            className="min-h-11 max-w-full rounded-md border border-[var(--hairline)] bg-[var(--raised)] px-3 text-sm"
          >
            {businesses.map((business) => (
              <option key={business._id} value={business._id}>
                {business.name}
              </option>
            ))}
          </select>
          <Link
            href={`/store/${selectedBusiness.slug}`}
            className="secondary-action text-sm"
          >
            View business
          </Link>
        </div>
      </div>

      <section className="dashboard-metrics" aria-label="Appointment summary">
        {[
          {
            label: "Appointments",
            value: bookings.length,
            hint: "Selected day",
            icon: CalendarCheck2,
            tone: "pine",
          },
          {
            label: "Confirmed",
            value: confirmedCount,
            hint: "Ready to serve",
            icon: CheckCircle2,
            tone: "green",
          },
          {
            label: "Needs attention",
            value: pendingCount,
            hint: "Payment pending",
            icon: CircleAlert,
            tone: "amber",
          },
          {
            label: "Completed",
            value: completedCount,
            hint: "Finished today",
            icon: ClipboardCheck,
            tone: "neutral",
          },
        ].map(({ label, value, hint, icon: Icon, tone }) => (
          <article
            className={`dashboard-metric dashboard-metric-${tone}`}
            key={label}
          >
            <span className="dashboard-metric-icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="dashboard-metric-label">{label}</span>
            <strong>{value}</strong>
            <span className="dashboard-metric-hint">{hint}</span>
          </article>
        ))}
      </section>

      {showWelcome && selectedBusiness && (
        <section
          className="surface mt-5 p-5 sm:p-6"
          aria-labelledby="welcome-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Setup complete</p>
              <h2 id="welcome-title" className="mt-2 text-xl font-bold">
                {selectedBusiness.name} is ready to take bookings.
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-ink)]">
                Review your opening hours and service details, then share your
                public page with customers.
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss setup message"
              onClick={() => setShowWelcome(false)}
              className="secondary-action self-start text-sm"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/schedule?businessId=${selectedBusiness._id}`}
              className="secondary-action text-sm"
            >
              Review opening hours
            </Link>
            <Link
              href={`/dashboard/services?businessId=${selectedBusiness._id}`}
              className="secondary-action text-sm"
            >
              Manage services
            </Link>
            <Link
              href={`/store/${selectedBusiness.slug}`}
              className="primary-action text-sm"
            >
              View public page <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      )}

      {loadError && (
        <div
          className="mt-5 surface border-l-4 border-l-[#c2370f] p-4 text-sm"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <section className="mt-8" aria-labelledby="timeline-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">
              {isToday ? "Today" : displayDate(activeDate)} · {bookings.length}{" "}
              appointments
            </p>
            <h2
              id="timeline-title"
              className="mt-1 text-2xl font-bold tracking-[-.04em]"
            >
              {isToday ? "Today’s timetable" : "Daily timetable"}
            </h2>
          </div>
          <div className="dashboard-toolbar">
            <label className="dashboard-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search appointments</span>
              <input
                type="search"
                value={bookingSearch}
                onChange={(event) => setBookingSearch(event.target.value)}
                placeholder="Search appointments"
              />
            </label>
            <div className="dashboard-date-controls">
              <button
                type="button"
                className="secondary-action min-h-10 text-sm"
                aria-label="Previous day"
                onClick={() => setSelectedDate(shiftDate(activeDate, -1))}
              >
                ← <span className="hidden sm:inline">Previous</span>
              </button>
              <label className="sr-only" htmlFor="dashboard-date">
                Appointment date
              </label>
              <input
                id="dashboard-date"
                type="date"
                value={activeDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value || today)
                }
                className="min-h-10 rounded-md border px-3 text-sm"
              />
              <button
                type="button"
                className="secondary-action min-h-10 text-sm"
                aria-label="Next day"
                onClick={() => setSelectedDate(shiftDate(activeDate, 1))}
              >
                <span className="hidden sm:inline">Next</span> →
              </button>
              {!isToday && (
                <button
                  type="button"
                  className="secondary-action min-h-10 text-sm"
                  onClick={() => setSelectedDate("")}
                >
                  Today
                </button>
              )}
              <span className="eyebrow hidden lg:block">
                {timezone === "Asia/Kolkata"
                  ? "Times shown in IST"
                  : `Times shown in ${timezone}`}
              </span>
            </div>
          </div>
        </div>
        {bookingsLoading ? (
          <div className="surface mt-5 h-28 animate-pulse" aria-busy="true">
            <span className="sr-only">Loading appointments</span>
          </div>
        ) : !visibleOrdered.length ? (
          <div className="surface mt-5 px-5 py-12 text-center">
            <p className="text-xl font-bold">
              {isToday
                ? "The timetable is clear."
                : "No appointments on this date."}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              {isToday
                ? "New bookings for today will appear here."
                : `Choose another date to review ${selectedBusiness.name}’s bookings.`}
            </p>
          </div>
        ) : (
          <div className="surface mt-5 overflow-hidden">
            <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[86px_1fr]">
              <div
                className="relative border-r border-[var(--hairline)]"
                style={{ minHeight: height }}
                aria-hidden="true"
              >
                <div className="absolute left-2 top-2 eyebrow">TIME</div>
                {visibleOrdered.map((booking, index) => (
                  <span
                    key={booking._id}
                    className="time absolute left-2 text-xs font-semibold"
                    style={{ top: `${48 + index * rowHeight}px` }}
                  >
                    {displayTime(
                      booking.startTime,
                      selectedBusiness?.settings?.timeFormat,
                    )}
                  </span>
                ))}
              </div>
              <div
                className="relative p-3 sm:p-5"
                style={{ minHeight: height }}
              >
                {isToday && nowPosition <= height && (
                  <div
                    className="absolute left-0 right-0 z-10 border-t border-dashed border-[var(--vermilion-ink)]"
                    style={{ top: nowPosition }}
                  >
                    <span className="absolute -top-2.5 left-2 bg-[var(--vermilion)] px-1.5 py-0.5 time text-[10px]">
                      NOW
                    </span>
                  </div>
                )}
                {visibleOrdered.map((booking, index) => {
                  const top = 48 + index * rowHeight;
                  const isRevealed = Boolean(revealed[booking._id]);
                  const phone = booking.customer?.phone || "";
                  const maskedPhone = phone
                    ? `••• ${phone.replace(/\D/g, "").slice(-4)}`
                    : "Customer details hidden";
                  const state =
                    booking.status === "COMPLETED"
                      ? "Completed"
                      : booking.status === "CONFIRMED"
                        ? "Confirmed · paid"
                        : booking.status === "PENDING_APPROVAL"
                          ? "Awaiting your decision"
                          : booking.status === "PENDING_PAYMENT"
                            ? "Payment pending · time held"
                            : booking.status;
                  return (
                    <article
                      key={booking._id}
                      className={`absolute left-3 right-3 min-h-[88px] rounded-md border p-3 sm:left-5 sm:right-5 sm:p-4 ${booking.status === "CONFIRMED" ? "border-[color-mix(in_oklab,var(--pine)_35%,var(--hairline))] bg-[color-mix(in_oklab,var(--pine)_7%,var(--raised))]" : "border-[var(--hairline)] bg-[var(--raised)]"}`}
                      style={{ top, minHeight: 88 }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="time text-sm font-bold">
                              {displayTime(
                                booking.startTime,
                                selectedBusiness?.settings?.timeFormat,
                              )}
                              –
                              {displayTime(
                                booking.endTime,
                                selectedBusiness?.settings?.timeFormat,
                              )}
                            </span>
                            <span className="badge">{state}</span>
                          </div>
                          <h3 className="mt-1 truncate font-bold">
                            {booking.serviceId?.name || "Appointment"}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--muted-ink)]">
                            {isRevealed
                              ? `${booking.customer?.name || "Customer"} · ${phone}`
                              : maskedPhone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.status === "PENDING_APPROVAL" && (
                            <>
                              <button
                                type="button"
                                disabled={Boolean(cancellingId)}
                                onClick={() => decide(booking, "approve")}
                                className="min-h-11 rounded-md bg-[var(--pine)] px-3 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                {cancellingId === booking._id
                                  ? "Saving…"
                                  : "Approve"}
                              </button>
                              <button
                                type="button"
                                disabled={Boolean(cancellingId)}
                                onClick={() => decide(booking, "reject")}
                                className="min-h-11 rounded-md border border-[var(--hairline)] px-3 text-xs font-semibold disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setRevealed((current) => ({
                                ...current,
                                [booking._id]: !current[booking._id],
                              }))
                            }
                            className="min-h-11 rounded-md border border-[var(--hairline)] px-3 text-xs font-semibold"
                          >
                            {isRevealed ? "Hide details" : "Reveal"}
                          </button>
                          {booking.status === "CONFIRMED" &&
                            appointmentHasEnded(booking) && (
                              <button
                                type="button"
                                disabled={
                                  completingId === booking._id ||
                                  cancellingId === booking._id
                                }
                                onClick={() => markComplete(booking)}
                                className="min-h-11 rounded-md border border-[var(--hairline)] px-3 text-xs font-semibold disabled:opacity-50"
                              >
                                {completingId === booking._id
                                  ? "Saving…"
                                  : "Mark complete"}
                              </button>
                            )}
                          {["CONFIRMED", "PENDING_PAYMENT"].includes(
                            booking.status,
                          ) && (
                            <button
                              type="button"
                              disabled={cancellingId === booking._id}
                              onClick={() => cancel(booking)}
                              className="min-h-11 rounded-md px-3 text-xs font-semibold text-[var(--vermilion-ink)] underline disabled:opacity-50"
                            >
                              {cancellingId === booking._id
                                ? "Cancelling"
                                : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
