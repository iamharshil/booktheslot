"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
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
  const [message, setMessage] = useState({ type: "", text: "" });

  // New Date Override Form State
  const [overrideForm, setOverrideForm] = useState({
    date: "",
    isClosed: true,
    reason: "Afternoon Cleaning / Maintenance Shutdown",
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            Shifts, Breaks & Closures
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure weekly multi-shift hours, afternoon shutdowns, and ad-hoc
            emergency closures.
          </p>
        </div>

        {/* Store Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Store:</label>
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

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            message.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading schedule configuration...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Weekly Multi-Interval Shift Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-panel p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Weekly Operating Shifts
                    </h2>
                    <p className="text-xs text-slate-400">
                      Add multiple shifts per day to support lunch breaks or
                      afternoon shutdowns.
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
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3"
                    >
                      {/* Day Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDayClosed(day.dayOfWeek)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
                              !day.isClosed ? "bg-indigo-600" : "bg-slate-700"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                !day.isClosed
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="font-bold text-sm text-white">
                            {dayName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold ${
                              day.isClosed
                                ? "text-slate-500"
                                : "text-emerald-400"
                            }`}
                          >
                            {day.isClosed ? "Closed" : "Open"}
                          </span>

                          {!day.isClosed && (
                            <button
                              type="button"
                              onClick={() => addIntervalToDay(day.dayOfWeek)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Shift</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Intervals List */}
                      {!day.isClosed && day.intervals?.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04]">
                          {day.intervals.map((inv, idx) => (
                            <div
                              key={idx}
                              className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs"
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
                                className="w-full sm:w-36 bg-white/[0.04] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                              />

                              <div className="flex items-center gap-2 w-full sm:w-auto">
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
                                  className="bg-white/[0.04] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                                />
                                <span className="text-slate-500 font-medium">
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
                                  className="bg-white/[0.04] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeIntervalFromDay(day.dayOfWeek, idx)
                                }
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-auto"
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
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Add Date Override Card */}
            <div className="glass-panel p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-base font-bold text-white">
                    Emergency Shutdown / Special Hours
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Shut down the store on an afternoon or set date-specific
                    hours.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddOverride}
                className="flex flex-col gap-4 text-xs"
              >
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={overrideForm.date}
                    onChange={(e) =>
                      setOverrideForm({ ...overrideForm, date: e.target.value })
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
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
                          ? "bg-rose-500/20 border-rose-500 text-rose-300"
                          : "bg-white/[0.02] border-white/[0.08] text-slate-400"
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
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                          : "bg-white/[0.02] border-white/[0.08] text-slate-400"
                      }`}
                    >
                      Modified Hours
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Reason / Notice
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Afternoon Deep Clean Shutdown, Holiday"
                    value={overrideForm.reason}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        reason: e.target.value,
                      })
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {!overrideForm.isClosed && (
                  <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl flex flex-col gap-2">
                    <span className="font-semibold text-slate-300">
                      Special Open Window:
                    </span>
                    <div className="flex items-center gap-2">
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
                        className="bg-white/[0.04] border border-white/[0.1] rounded-lg px-2 py-1.5 text-white font-mono"
                      />
                      <span className="text-slate-500">to</span>
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
                        className="bg-white/[0.04] border border-white/[0.1] rounded-lg px-2 py-1.5 text-white font-mono"
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
              <h3 className="text-sm font-bold text-white">
                Active Special Overrides
              </h3>

              {schedule?.dateOverrides?.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">
                  No date overrides currently set. Standard weekly shifts apply.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {schedule?.dateOverrides?.map((o) => (
                    <div
                      key={o._id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <span>{o.date}</span>
                          <span
                            className={`badge text-[9px] ${
                              o.isClosed ? "badge-rose" : "badge-amber"
                            }`}
                          >
                            {o.isClosed ? "Closed" : "Modified"}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {o.reason}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOverride(o._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
