"use client";

import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBusinessBookings, getBusinesses } from "../../lib/api";

export default function MerchantDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch businesses
  useEffect(() => {
    getBusinesses()
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setBusinesses(res.data);
          setSelectedBusiness(res.data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch bookings when selectedBusiness changes
  useEffect(() => {
    if (!selectedBusiness?._id) return;

    getBusinessBookings(selectedBusiness._id)
      .then((res) => {
        if (res.success) {
          setBookings(res.data);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedBusiness]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading merchant dashboard...</span>
      </div>
    );
  }

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (b.amount || 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Top Bar: Store Switcher & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Merchant Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your schedule, breaks, services, staff capacity, and incoming
            bookings.
          </p>
        </div>

        {/* Store Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400">
            Active Store:
          </label>
          <select
            value={selectedBusiness?._id || ""}
            onChange={(e) => {
              const b = businesses.find((x) => x._id === e.target.value);
              if (b) setSelectedBusiness(b);
            }}
            className="bg-[#0f172a] border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {businesses.map((biz) => (
              <option key={biz._id} value={biz._id}>
                {biz.name} ({biz.category})
              </option>
            ))}
          </select>

          {selectedBusiness && (
            <Link
              href={`/store/${selectedBusiness.slug}`}
              target="_blank"
              className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>View Live Store</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">
              Total Bookings
            </span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {bookings.length}
          </div>
          <div className="text-[11px] text-slate-500">
            {confirmedBookings.length} confirmed via Razorpay
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">
              Gross Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Instant settlements enabled
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">
              Shift Flexibility
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">Multi-Shift</div>
          <div className="text-[11px] text-slate-500">
            Lunch breaks & shutdown support
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">
              Concurrency Engine
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400">Atomic</div>
          <div className="text-[11px] text-slate-500">
            Multi-staff & zero overbooking
          </div>
        </div>
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={`/dashboard/schedule?businessId=${selectedBusiness?._id || ""}`}
          className="glass-panel p-6 flex items-center justify-between group hover:border-indigo-500/40 transition-all text-decoration-none"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                Hours, Breaks & Closures Manager
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure opening/closing times, afternoon lunch shutdowns, and
                ad-hoc closures.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href={`/dashboard/services?businessId=${selectedBusiness?._id || ""}`}
          className="glass-panel p-6 flex items-center justify-between group hover:border-emerald-500/40 transition-all text-decoration-none"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Services & Staff Capacity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set durations (10m, 60m, 90m), pricing, and assign 2+ employees
                for concurrent slots.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="glass-panel p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-bold text-white">
              Recent Appointments
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live feed of all customer reservations
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.06]">
            {bookings.length} Total
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No bookings recorded yet for this business. Book a slot from the
            store page to see it here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 font-mono font-bold text-indigo-400">
                      {b.bookingReference}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-white">
                        {b.customer?.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.customer?.phone}
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{b.serviceId?.name || "General Service"}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.durationMinutes} mins
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-white font-medium">{b.date}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.startTime} – {b.endTime}
                      </div>
                    </td>
                    <td className="py-3 font-bold text-white">₹{b.amount}</td>
                    <td className="py-3">
                      <span
                        className={`badge ${
                          b.status === "CONFIRMED"
                            ? "badge-emerald"
                            : b.status === "PENDING_PAYMENT"
                              ? "badge-amber"
                              : "badge-rose"
                        } text-[10px]`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/booking/${b._id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                      >
                        View Pass
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
