"use client";

import {
  ArrowLeft,
  Clock,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  addDateOverride,
  getProfile,
  getSchedule,
  removeDateOverride,
  updateWeeklySchedule,
} from "../../../lib/api";
import { formatLocalDate } from "../../../lib/dates";

function ScheduleManagerContent() {
  const searchParams = useSearchParams();
  const queryBizId = searchParams.get("businessId");

  const [businesses, setBusinesses] = useState([]);
  const [selectedBizId, setSelectedBizId] = useState(queryBizId || "");
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const setMessage = (nextMessage) => {
    if (!nextMessage?.text) return;
    toast[nextMessage.type === "success" ? "success" : "error"](
      nextMessage.text,
    );
  };

  // New Date Override Form State
  const [overrideForm, setOverrideForm] = useState({
    date: "",
    isClosed: true,
    reason: "Special hours / temporary closure",
    intervals: [{ open: "09:00", close: "13:00", label: "Morning Only" }],
  });

  useEffect(() => {
    setOverrideForm((prev) => ({
      ...prev,
      date: formatLocalDate(new Date()),
    }));
  }, []);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // 1. Fetch businesses list
  useEffect(() => {
    getProfile()
      .then((res) => {
        const ownedBusinesses = res.data?.businesses || [];
        if (res.success && ownedBusinesses.length > 0) {
          setBusinesses(ownedBusinesses);
          setSelectedBizId((current) => current || ownedBusinesses[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch schedule for selected business
  useEffect(() => {
    let stale = false;
    if (!selectedBizId)
      return () => {
        stale = true;
      };

    setLoading(true);
    setMessage({ type: "", text: "" });

    getSchedule(selectedBizId)
      .then((res) => {
        if (!stale && res.success) {
          setSchedule(res.data);
        }
      })
      .catch((err) => {
        if (stale) return;
        setMessage({
          type: "error",
          text: err.message || "Failed to load schedule",
        });
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [selectedBizId]);

  // Handle Day Open/Closed Toggle
  const toggleDayClosed = (dayIndex) => {
    const updated = { ...schedule };
    const day = updated.weeklyHours.find((d) => d.dayOfWeek === dayIndex);
    if (day) {
      day.isClosed = !day.isClosed;
      if (!day.isClosed && (!day.intervals || day.intervals.length === 0)) {
        day.intervals = [
          { open: "09:00", close: "18:00", label: "General Shift" },
        ];
      }
      setSchedule(updated);
    }
  };

  // Add interval / break to a day
  const addIntervalToDay = (dayIndex) => {
    const updated = { ...schedule };
    const day = updated.weeklyHours.find((d) => d.dayOfWeek === dayIndex);
    if (day) {
      if (!day.intervals) day.intervals = [];
      day.intervals.push({
        open: "14:30",
        close: "20:30",
        label: "Evening Shift",
      });
      setSchedule(updated);
    }
  };

  // Remove interval from a day
  const removeIntervalFromDay = (dayIndex, intervalIndex) => {
    const updated = { ...schedule };
    const day = updated.weeklyHours.find((d) => d.dayOfWeek === dayIndex);
    if (day?.intervals) {
      day.intervals.splice(intervalIndex, 1);
      setSchedule(updated);
    }
  };

  // Update interval time
  const updateIntervalValue = (dayIndex, intervalIndex, field, value) => {
    const updated = { ...schedule };
    const day = updated.weeklyHours.find((d) => d.dayOfWeek === dayIndex);
    if (day?.intervals?.[intervalIndex]) {
      day.intervals[intervalIndex][field] = value;
      setSchedule(updated);
    }
  };

  // Save Weekly Schedule
  const handleSaveWeeklySchedule = async () => {
    if (!selectedBizId || !schedule) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateWeeklySchedule(
        selectedBizId,
        schedule.weeklyHours,
      );
      if (res.success) {
        setMessage({
          type: "success",
          text: "Weekly shifts and breaks saved successfully!",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save schedule",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add Special Date Override / Emergency Closure
  const handleAddOverride = async (e) => {
    e.preventDefault();
    if (!selectedBizId) return;

    try {
      const payload = {
        date: overrideForm.date,
        isClosed: overrideForm.isClosed,
        reason: overrideForm.reason,
        intervals: overrideForm.isClosed ? [] : overrideForm.intervals,
      };

      const res = await addDateOverride(selectedBizId, payload);
      if (res.success) {
        setSchedule(res.data);
        setMessage({
          type: "success",
          text: `Date override added for ${overrideForm.date}!`,
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to add date override",
      });
    }
  };

  // Remove Date Override
  const handleRemoveOverride = async (overrideId) => {
    if (!selectedBizId) return;

    try {
      const res = await removeDateOverride(selectedBizId, overrideId);
      if (res.success) {
        setSchedule(res.data);
        setMessage({ type: "success", text: "Date override removed!" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to remove date override",
      });
    }
  };

  return (
    <div className="schedule-manager mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[var(--hairline)] pb-6 md:flex-row md:items-center">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-[var(--pine)] transition-colors hover:text-[var(--pine-deep)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[var(--ink)]">
            Shifts, Breaks & Closures
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">
            Set weekly opening hours, split shifts, and date-specific closures.
          </p>
        </div>

        {/* Store Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[var(--muted-ink)]">Store:</label>
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(e.target.value)}
            className="bg-[var(--raised)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--vermilion-ink)]"
          >
            {businesses.map((biz) => (
              <option key={biz._id} value={biz._id}>
                {biz.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--muted-ink)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--pine)] border-t-transparent" />
          <span className="text-sm">Loading schedule configuration...</span>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.9fr)] xl:gap-8">
          {/* Left Column: Weekly Multi-Interval Shift Editor (7 cols) */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="glass-panel flex min-w-0 flex-col gap-6 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--hairline)] pb-4">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-5 w-5 text-[var(--pine)]" />
                  <div>
                    <h2 className="text-lg font-bold text-[var(--ink)]">
                      Weekly Operating Shifts
                    </h2>
                    <p className="text-xs text-[var(--muted-ink)]">
                      Add multiple opening windows per day around breaks or
                      other planned closures.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveWeeklySchedule}
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Shifts"}</span>
                </button>
              </div>

              {/* Days Accordion */}
              <div className="flex flex-col gap-4">
                {schedule?.weeklyHours?.map((day) => {
                  const dayName = dayNames[day.dayOfWeek];

                  return (
                    <div
                      key={day.dayOfWeek}
                      className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--sunken)] p-4"
                    >
                      {/* Day Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDayClosed(day.dayOfWeek)}
                            aria-label={`${day.isClosed ? "Open" : "Close"} ${dayName}`}
                            aria-pressed={!day.isClosed}
                            className={`relative h-6 w-11 rounded-full border p-0.5 transition-colors ${
                              !day.isClosed ? "border-[var(--pine)] bg-[var(--pine)]" : "border-[var(--hairline)] bg-[var(--raised)]"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                !day.isClosed
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="text-sm font-bold text-[var(--ink)]">
                            {dayName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold ${
                              day.isClosed
                                ? "text-[var(--muted-ink)]"
                                : "text-[var(--pine)]"
                            }`}
                          >
                            {day.isClosed ? "Closed" : "Open"}
                          </span>

                          {!day.isClosed && (
                            <button
                              type="button"
                              onClick={() => addIntervalToDay(day.dayOfWeek)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[color-mix(in_oklab,var(--pine)_28%,var(--hairline))] bg-[color-mix(in_oklab,var(--pine)_9%,var(--raised))] px-2.5 py-1 text-xs font-semibold text-[var(--pine)] transition-colors hover:bg-[color-mix(in_oklab,var(--pine)_15%,var(--raised))]"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Shift</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Intervals List */}
                      {!day.isClosed && day.intervals?.length > 0 && (
                        <div className="flex flex-col gap-2 border-t border-[var(--hairline)] pt-2">
                          {day.intervals.map((inv, idx) => (
                            <div
                              key={idx}
                              className="flex min-w-0 flex-wrap items-center gap-2 text-xs xl:flex-nowrap"
                            >
                              <input
                                type="text"
                                placeholder="Label (e.g. Morning)"
                                value={inv.label || ""}
                                onChange={(e) =>
                                  updateIntervalValue(
                                    day.dayOfWeek,
                                    idx,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                className="w-full min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--raised)] px-2.5 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--muted-ink)] focus:border-[var(--pine)] focus:outline-none sm:w-36"
                              />

                              <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                                <input
                                  type="time"
                                  value={inv.open}
                                  onChange={(e) =>
                                    updateIntervalValue(
                                      day.dayOfWeek,
                                      idx,
                                      "open",
                                      e.target.value,
                                    )
                                  }
                                  className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--raised)] px-2.5 py-2 text-xs text-[var(--ink)] focus:border-[var(--pine)] focus:outline-none"
                                />
                                <span className="font-medium text-[var(--muted-ink)]">
                                  to
                                </span>
                                <input
                                  type="time"
                                  value={inv.close}
                                  onChange={(e) =>
                                    updateIntervalValue(
                                      day.dayOfWeek,
                                      idx,
                                      "close",
                                      e.target.value,
                                    )
                                  }
                                  className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--raised)] px-2.5 py-2 text-xs text-[var(--ink)] focus:border-[var(--pine)] focus:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeIntervalFromDay(day.dayOfWeek, idx)
                                }
                                className="ml-auto rounded-lg p-2 text-[var(--muted-ink)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger-ink)]"
                                title="Remove shift"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Date Overrides & Temporary Closures (5 cols) */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* Add Date Override Card */}
            <div className="glass-panel flex min-w-0 flex-col gap-5 p-4 sm:p-6">
              <div className="flex items-center gap-2.5 border-b border-[var(--hairline)] pb-4">
                <ShieldAlert className="h-5 w-5 text-[var(--warning-ink)]" />
                <div>
                  <h2 className="text-base font-bold text-[var(--ink)]">
                    Special Hours or Closure
                  </h2>
                  <p className="text-[11px] text-[var(--muted-ink)]">
                    Close for a date or set different hours for that day.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddOverride}
                className="flex flex-col gap-4 text-xs"
              >
                <div>
                  <label className="mb-1 block font-semibold text-[var(--muted-ink)]">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={overrideForm.date}
                    onChange={(e) =>
                      setOverrideForm({ ...overrideForm, date: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--raised)] px-3.5 py-2 font-mono text-[var(--ink)] focus:border-[var(--pine)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[var(--muted-ink)]">
                    Closure Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOverrideForm({ ...overrideForm, isClosed: true })
                      }
                      className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                        overrideForm.isClosed
                          ? "border-[color-mix(in_oklab,var(--vermilion)_35%,var(--hairline))] bg-[var(--danger-soft)] text-[var(--danger-ink)]"
                          : "border-[var(--hairline)] bg-[var(--raised)] text-[var(--muted-ink)]"
                      }`}
                    >
                      Full Day Closed
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOverrideForm({ ...overrideForm, isClosed: false })
                      }
                      className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                        !overrideForm.isClosed
                          ? "border-[color-mix(in_oklab,var(--pine)_35%,var(--hairline))] bg-[color-mix(in_oklab,var(--pine)_10%,var(--raised))] text-[var(--pine)]"
                          : "border-[var(--hairline)] bg-[var(--raised)] text-[var(--muted-ink)]"
                      }`}
                    >
                      Modified Hours
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[var(--muted-ink)]">
                    Reason / Notice
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Holiday closure or private event"
                    value={overrideForm.reason}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        reason: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--raised)] px-3.5 py-2 text-[var(--ink)] placeholder:text-[var(--muted-ink)] focus:border-[var(--pine)] focus:outline-none"
                  />
                </div>

                {!overrideForm.isClosed && (
                  <div className="flex flex-col gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--sunken)] p-3">
                    <span className="font-semibold text-[var(--ink)]">
                      Special Open Window:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={overrideForm.intervals[0]?.open || "09:00"}
                        onChange={(e) =>
                          setOverrideForm({
                            ...overrideForm,
                            intervals: [
                              {
                                ...overrideForm.intervals[0],
                                open: e.target.value,
                              },
                            ],
                          })
                        }
                        className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--raised)] px-2 py-2 font-mono text-[var(--ink)]"
                      />
                      <span className="text-[var(--muted-ink)]">to</span>
                      <input
                        type="time"
                        value={overrideForm.intervals[0]?.close || "13:00"}
                        onChange={(e) =>
                          setOverrideForm({
                            ...overrideForm,
                            intervals: [
                              {
                                ...overrideForm.intervals[0],
                                close: e.target.value,
                              },
                            ],
                          })
                        }
                        className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--raised)] px-2 py-2 font-mono text-[var(--ink)]"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 rounded-xl font-semibold mt-1"
                >
                  Apply Date Override
                </button>
              </form>
            </div>

            {/* Active Date Overrides List */}
            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[var(--ink)]">
                Active Special Overrides
              </h3>

              {schedule?.dateOverrides?.length === 0 ? (
                <div className="py-4 text-center text-xs text-[var(--muted-ink)]">
                  No date overrides currently set. Standard weekly shifts apply.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {schedule?.dateOverrides?.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between rounded-xl border border-[var(--hairline)] bg-[var(--sunken)] p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-mono font-bold text-[var(--ink)]">
                          <span>{o.date}</span>
                          <span
                            className={`badge text-[9px] ${
                              o.isClosed ? "badge-rose" : "badge-amber"
                            }`}
                          >
                            {o.isClosed ? "Closed" : "Modified"}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--muted-ink)]">
                          {o.reason}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOverride(o._id)}
                        className="rounded-lg p-2 text-[var(--muted-ink)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger-ink)]"
                        title="Remove override"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScheduleManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span>Loading schedule manager...</span>
          </div>
        </div>
      }
    >
      <ScheduleManagerContent />
    </Suspense>
  );
}
