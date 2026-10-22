"use client";

import { ArrowRight, CalendarDays, Check, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  cancelBooking,
  getMyBookings,
  getProfile,
  updateProfile,
} from "../../lib/api";
import {
  authChangeEvent,
  clearAuthToken,
  getAuthToken,
} from "../../lib/session";

const filters = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

function dateInTimezone(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function bookingDate(date, timezone) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeZone: timezone || "Asia/Kolkata",
  }).format(value);
}

function bookingTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function bookingGroup(booking, today) {
  if (["CANCELLED", "EXPIRED"].includes(booking.status)) return "cancelled";
  if (booking.status === "COMPLETED" || booking.date < today) return "past";
  return "upcoming";
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" });
  const [profileDraft, setProfileDraft] = useState({ name: "", phone: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleAuthChange() {
      const activeSession = Boolean(getAuthToken());
      setSignedIn(activeSession);
      setSessionReady(true);
      if (!activeSession) setBookings([]);
    }
    window.addEventListener(authChangeEvent, handleAuthChange);
    return () => window.removeEventListener(authChangeEvent, handleAuthChange);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!getAuthToken()) {
        setLoading(false);
        setSessionReady(true);
        return;
      }
      setSignedIn(true);
      try {
        const result = await getProfile();
        if (!active) return;
        if (result.data?.role === "merchant") {
          router.replace(
            result.data.businesses?.length
              ? "/dashboard"
              : "/register-business",
          );
          return;
        }
        const details = {
          name: result.data?.name || "",
          phone: result.data?.phone || "",
          email: result.data?.email || "",
        };
        setProfile(details);
        setProfileDraft({ name: details.name, phone: details.phone });
        const bookingsResult = await getMyBookings();
        if (active) setBookings(bookingsResult.data || []);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          clearAuthToken();
          setSignedIn(false);
        }
        setError(err.message || "Your account could not be loaded.");
      } finally {
        if (active) {
          setLoading(false);
          setSessionReady(true);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [router]);

  const bookingCounts = useMemo(() => {
    const counts = { upcoming: 0, past: 0, cancelled: 0 };
    for (const booking of bookings) {
      const today = dateInTimezone(now, booking.businessId?.timezone);
      counts[bookingGroup(booking, today)] += 1;
    }
    return counts;
  }, [bookings, now]);

  const visibleBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            bookingGroup(
              booking,
              dateInTimezone(now, booking.businessId?.timezone),
            ) === filter,
        )
        .sort((a, b) =>
          filter === "upcoming"
            ? `${a.date} ${a.startTime}`.localeCompare(
                `${b.date} ${b.startTime}`,
              )
            : `${b.date} ${b.startTime}`.localeCompare(
                `${a.date} ${a.startTime}`,
              ),
        ),
    [bookings, filter, now],
  );

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const result = await updateProfile({
        name: profileDraft.name.trim(),
        phone: profileDraft.phone.trim(),
      });
      const details = {
        name: result.data?.name || profileDraft.name.trim(),
        phone: result.data?.phone || "",
        email: profile.email,
      };
      setProfile(details);
      setProfileDraft({ name: details.name, phone: details.phone });
      setEditingProfile(false);
      setProfileMessage("Your details have been saved.");
    } catch (err) {
      setProfileMessage(err.message || "Your details could not be saved.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCancel(booking) {
    if (
      !window.confirm(
        `Cancel your ${booking.serviceId?.name || "appointment"} on ${bookingDate(booking.date, booking.businessId?.timezone)} at ${bookingTime(booking.startTime)}?`,
      )
    )
      return;
    setCancellingId(booking._id);
    setActionError("");
    try {
      const result = await cancelBooking(
        booking._id,
        "Customer requested cancellation",
      );
      setBookings((items) =>
        items.map((item) =>
          item._id === booking._id
            ? { ...item, status: result.data?.status || "CANCELLED" }
            : item,
        ),
      );
      setFilter("cancelled");
    } catch (err) {
      setActionError(err.message || "This appointment could not be cancelled.");
    } finally {
      setCancellingId("");
    }
  }

  if (sessionReady && !signedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
        <p className="eyebrow">Customer account</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-.05em] sm:text-4xl">
          Sign in to see your appointments.
        </h1>
        <Link href="/login?next=%2Faccount" className="primary-action mt-6">
          Sign in <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div
        className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8 sm:py-14"
        aria-busy="true"
      >
        <div className="skeleton h-9 w-56" />
        <div className="surface mt-8 h-28 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="customer-account-page mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
      <p className="eyebrow">Your BookTheSlot account</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] sm:text-4xl">
        Welcome back{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-ink)]">
        Keep track of upcoming visits, review past bookings, and update the
        details businesses use to reach you.
      </p>

      <section className="customer-summary-grid" aria-label="Booking summary">
        {[
          {
            label: "Upcoming",
            value: bookingCounts.upcoming,
            helper: "Your next visits",
          },
          {
            label: "Past visits",
            value: bookingCounts.past,
            helper: "Completed appointments",
          },
          {
            label: "Cancelled",
            value: bookingCounts.cancelled,
            helper: "Cancelled or expired",
          },
        ].map((item, index) => (
          <article
            className={`customer-summary-card${index === 0 ? " customer-summary-primary" : ""}`}
            key={item.label}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.helper}</small>
          </article>
        ))}
      </section>

      <section
        className="surface mt-6 p-5 sm:p-6"
        aria-labelledby="profile-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserRound
              aria-hidden="true"
              className="text-[var(--vermilion-ink)]"
              size={20}
            />
            <div>
              <h2 id="profile-heading" className="font-bold">
                Account details
              </h2>
              <p className="text-sm text-[var(--muted-ink)]">
                Manage the details used for your bookings.
              </p>
            </div>
          </div>
          {!editingProfile && (
            <button
              type="button"
              className="secondary-action text-sm"
              onClick={() => {
                setProfileMessage("");
                setEditingProfile(true);
              }}
            >
              Edit details
            </button>
          )}
        </div>
        {editingProfile ? (
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={saveProfile}
          >
            <label className="grid gap-1.5 text-sm font-medium">
              Name
              <input
                required
                maxLength={80}
                autoComplete="name"
                value={profileDraft.name}
                onChange={(event) =>
                  setProfileDraft({ ...profileDraft, name: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Phone{" "}
              <span className="font-normal text-[var(--muted-ink)]">
                (optional)
              </span>
              <input
                type="tel"
                maxLength={30}
                autoComplete="tel"
                value={profileDraft.phone}
                onChange={(event) =>
                  setProfileDraft({
                    ...profileDraft,
                    phone: event.target.value,
                  })
                }
              />
            </label>
            <div className="text-sm text-[var(--muted-ink)] sm:col-span-2">
              {profile.email}
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                className="primary-action"
                disabled={savingProfile}
              >
                <Check aria-hidden="true" size={16} />{" "}
                {savingProfile ? "Saving…" : "Save details"}
              </button>
              <button
                type="button"
                className="secondary-action"
                disabled={savingProfile}
                onClick={() => {
                  setProfileDraft({ name: profile.name, phone: profile.phone });
                  setEditingProfile(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span>{profile.name}</span>
            <span className="text-[var(--muted-ink)]">{profile.email}</span>
            {profile.phone && (
              <span className="text-[var(--muted-ink)]">{profile.phone}</span>
            )}
          </div>
        )}
        {profileMessage && (
          <output className="mt-3 block text-sm text-[var(--muted-ink)]">
            {profileMessage}
          </output>
        )}
      </section>

      <section className="mt-10" aria-labelledby="appointments-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="appointments-heading"
              className="text-2xl font-bold tracking-[-.04em]"
            >
              Your appointments
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-ink)]">
              Bookings made while signed in will appear here.
            </p>
          </div>
          <Link href="/#discover" className="secondary-action text-sm">
            Find a service <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-3" aria-busy="true" aria-live="polite">
            {[1, 2].map((item) => (
              <div key={item} className="surface h-28 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="surface mt-6 p-5" role="alert">
            <p className="font-semibold">We couldn’t load your account.</p>
            <p className="mt-1 text-sm text-[var(--muted-ink)]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="secondary-action mt-4"
            >
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="surface mt-6 p-6 sm:p-8">
            <CalendarDays
              aria-hidden="true"
              className="text-[var(--vermilion-ink)]"
              size={24}
            />
            <h3 className="mt-4 text-xl font-bold">No appointments yet.</h3>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              Find a local business and book a time that suits you.
            </p>
            <Link href="/#discover" className="primary-action mt-5">
              Discover services <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        ) : (
          <>
            <fieldset className="mt-6 flex flex-wrap gap-2">
              <legend className="sr-only">Filter appointments</legend>
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    filter === item.id ? "primary-action" : "secondary-action"
                  }
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}{" "}
                  <span className="text-xs opacity-75">
                    {bookingCounts[item.id]}
                  </span>
                </button>
              ))}
            </fieldset>
            {actionError && (
              <p
                className="mt-3 text-sm text-rose-700 dark:text-rose-300"
                role="alert"
              >
                {actionError}
              </p>
            )}
            {visibleBookings.length === 0 ? (
              <div className="surface mt-3 p-5 text-sm text-[var(--muted-ink)]">
                No {filter} appointments.
              </div>
            ) : (
              <ul className="mt-3 grid gap-3">
                {visibleBookings.map((booking) => {
                  const timezone = booking.businessId?.timezone;
                  const today = dateInTimezone(now, timezone);
                  const canCancel =
                    ["CONFIRMED", "PENDING_PAYMENT"].includes(booking.status) &&
                    booking.date >= today;
                  return (
                    <li
                      key={booking._id}
                      className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-ink)]">
                          {bookingDate(booking.date, timezone)} ·{" "}
                          {bookingTime(booking.startTime)}
                        </p>
                        <h3 className="mt-1 truncate text-lg font-bold">
                          {booking.serviceId?.name || "Appointment"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--muted-ink)]">
                          {booking.businessId?.name} ·{" "}
                          {booking.bookingReference}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                        <span
                          className={`badge ${booking.status === "CONFIRMED" ? "badge-emerald" : booking.status === "CANCELLED" || booking.status === "EXPIRED" ? "badge-rose" : "badge-amber"}`}
                        >
                          {booking.status.replaceAll("_", " ")}
                        </span>
                        <Link
                          href={`/booking/${booking._id}`}
                          className="secondary-action shrink-0 text-sm"
                        >
                          View pass
                        </Link>
                        {canCancel && (
                          <button
                            type="button"
                            className="secondary-action shrink-0 text-sm"
                            disabled={cancellingId === booking._id}
                            onClick={() => handleCancel(booking)}
                          >
                            {cancellingId === booking._id
                              ? "Cancelling…"
                              : "Cancel booking"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
