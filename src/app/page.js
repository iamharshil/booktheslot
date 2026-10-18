"use client";

import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BusinessCard from "../components/BusinessCard";
import { getBusinesses } from "../lib/api";

function HeroBookingSimulator() {
  const [selectedSlot, setSelectedSlot] = useState("09:30 AM");
  const [simStep, setSimStep] = useState(1); // 1 = 1st booking, 2 = 2nd booking concurrent, 3 = 3rd rejected
  const [alertMsg, setAlertMsg] = useState({
    type: "success",
    text: "Stylist 1 Assigned! Atomic lock acquired for 10:00 mins.",
  });

  const slots = [
    { time: "09:30 AM", status: "open", capacity: 2, label: "2 Spots Open" },
    { time: "10:15 AM", status: "open", capacity: 2, label: "2 Spots Open" },
    { time: "11:00 AM", status: "partial", capacity: 1, label: "1 Spot Left" },
    { time: "01:00 PM", status: "break", capacity: 0, label: "Lunch Shutdown" },
    { time: "02:30 PM", status: "open", capacity: 2, label: "2 Spots Open" },
    { time: "04:00 PM", status: "open", capacity: 2, label: "2 Spots Open" },
  ];

  const handleSlotClick = (slot) => {
    if (slot.status === "break") {
      setAlertMsg({
        type: "error",
        text: "⛔ Blocked: Slot collides with Afternoon Break (1:00 - 2:30 PM). Zero break violations.",
      });
      return;
    }
    setSelectedSlot(slot.time);
    setSimStep(1);
    setAlertMsg({
      type: "success",
      text: `Customer #1 reserved ${slot.time}! Stylist 1 assigned with atomic hold lock.`,
    });
  };

  const handleSimulateSecondUser = () => {
    if (simStep === 1) {
      setSimStep(2);
      setAlertMsg({
        type: "info",
        text: "⚡ Customer #2 booked same slot! Stylist 2 assigned. Multi-employee concurrency handled seamlessly.",
      });
    } else if (simStep === 2) {
      setSimStep(3);
      setAlertMsg({
        type: "warning",
        text: "🛡️ Capacity Reached (2/2)! Customer #3 attempt atomically blocked. Zero double-booking guarantee.",
      });
    }
  };

  const handleReset = () => {
    setSelectedSlot("09:30 AM");
    setSimStep(1);
    setAlertMsg({
      type: "success",
      text: "Stylist 1 Assigned! Atomic lock acquired for 10:00 mins.",
    });
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.14] bg-[#0c1220]/95 backdrop-blur-2xl shadow-2xl shadow-indigo-500/20 flex flex-col">
      {/* Top Window Bar */}
      <div className="px-4 py-3 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <span className="text-xs font-mono text-slate-400 ml-2">
            Atomic Shift & Concurrency Engine 2.0
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Demo</span>
        </div>
      </div>

      {/* Simulator Content */}
      <div className="p-5 flex flex-col gap-4 text-xs">
        {/* Store & Service Profile */}
        <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
          <div>
            <div className="font-bold text-white text-sm">
              Luxe Studio & Spa
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Service: Hair Styling & Detox (45 min) • ₹799
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>Capacity: 2 Staff</span>
          </div>
        </div>

        {/* Operating Shifts Visualizer */}
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              Daily Schedule:
            </span>
            <span className="text-[10px] text-slate-400">
              2 Shifts Configured
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
            <span className="bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
              Morning 09:00 – 13:00
            </span>
            <span className="bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono flex items-center gap-1">
              ☕ Lunch 13:00 – 14:30
            </span>
            <span className="bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
              Evening 14:30 – 20:00
            </span>
          </div>
        </div>

        {/* Interactive Slots Grid */}
        <div>
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2 font-medium">
            <span>Click any slot to simulate real-time lock:</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => {
              const isSelected = selectedSlot === s.time;
              const isBreak = s.status === "break";
              return (
                <button
                  type="button"
                  key={s.time}
                  onClick={() => handleSlotClick(s)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    isBreak
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-300/80 cursor-not-allowed opacity-80"
                      : isSelected
                        ? "bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                        : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="font-bold text-[12px] flex items-center justify-between">
                    <span>{s.time}</span>
                    {isBreak ? (
                      <span className="text-[10px]">☕</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Simulation Feedback Banner */}
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
            alertMsg.type === "error"
              ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
              : alertMsg.type === "warning"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                : alertMsg.type === "info"
                  ? "bg-purple-500/15 border-purple-500/30 text-purple-200"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
          }`}
        >
          {alertMsg.type === "error" ? (
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : alertMsg.type === "warning" ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="text-[11px] font-medium leading-relaxed">
              {alertMsg.text}
            </div>
            {/* Visual Stylist Assignment Badges */}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  simStep >= 1
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-white/[0.05] text-slate-500"
                }`}
              >
                Stylist #1: {simStep >= 1 ? "Booked" : "Idle"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  simStep >= 2
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-white/[0.05] text-slate-500"
                }`}
              >
                Stylist #2: {simStep >= 2 ? "Booked" : "Idle"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  simStep >= 3
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-white/[0.05] text-slate-500"
                }`}
              >
                User #3: {simStep >= 3 ? "Blocked" : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button to test concurrent booking */}
        <button
          type="button"
          onClick={handleSimulateSecondUser}
          className="w-full py-2.5 px-4 bg-indigo-600/30 hover:bg-indigo-600/50 active:scale-[0.99] border border-indigo-500/40 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {simStep === 1
              ? "Simulate 2nd Customer Booking Same Slot"
              : simStep === 2
                ? "Simulate 3rd Overbooking Attempt"
                : "Stress Test Passed (All Guardrails Active)"}
          </span>
        </button>
      </div>

      {/* Floating Glass Pill */}
      <div className="p-3 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 px-4">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Atomic Conditional Hold Active</span>
        </div>
        <span>MongoDB Concurrency Safe</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { label: "All", icon: "✨" },
    { label: "Salon & Spa", icon: "💇‍♀️" },
    { label: "Healthcare & Dental", icon: "🩺" },
    { label: "Auto Services", icon: "🚗" },
    { label: "Fitness & Wellness", icon: "🧘‍♀️" },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = {};
    if (selectedCategory !== "All") {
      params.category = selectedCategory;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    getBusinesses(params)
      .then((res) => {
        if (isMounted && res.success) {
          setBusinesses(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load businesses:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold w-fit shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Multi-Shift Scheduling Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Every Business. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Any Shift, Any Break.
              </span>{" "}
              <span className="inline-block">Zero Conflicts.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              From afternoon lunch shutdowns to multi-employee concurrent
              bookings. Customize shifts, manage services from 10 minutes to 2
              hours, and accept real-time Razorpay payments.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#explore-stores"
                className="btn-primary text-base px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30"
              >
                <span>Explore Live Stores</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/register-business"
                className="btn-secondary text-base px-6 py-3.5 rounded-xl"
              >
                <Store className="w-4 h-4 text-slate-400" />
                <span>Create Your Store</span>
              </Link>
            </div>

            {/* Micro Stats Pill */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/[0.08] max-w-md">
              <div>
                <div className="text-2xl font-extrabold text-white">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Race-Condition Safe
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-indigo-400">
                  Flex
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Afternoon Breaks
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-400">
                  Instant
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Razorpay Checkout
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Live Concurrency Simulator */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            <HeroBookingSimulator />
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 flex flex-col gap-3 group hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Flexible Operating Shifts
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Businesses shut down for lunch, take afternoon breaks, or adjust
              schedules dynamically. The engine guarantees no service booking
              ever bleeds into a break.
            </p>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-3 group hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Multi-Staff Concurrency
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              If a service has 2 stylists or 3 mechanics, booktheslot takes
              concurrent bookings at that exact same slot until capacity is
              legitimately full.
            </p>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-3 group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Instant Razorpay Checkout
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Customers hold their slot for 10 minutes, complete payment via
              UPI, card, or netbanking, and receive a cryptographically verified
              booking pass.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Stores Showcase Section */}
      <section
        id="explore-stores"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              <CalendarCheck className="w-4 h-4" />
              <span>Verified Storefronts</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Discover & Book Nearby Businesses
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select any store below to browse services, pick available slots,
              and confirm appointments.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search store, city, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.label
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102"
                  : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Business Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="glass-panel h-80 animate-pulse bg-white/[0.02]"
              />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-3">
            <Store className="w-12 h-12 text-slate-500" />
            <h3 className="text-lg font-bold text-white">
              No businesses found
            </h3>
            <p className="text-sm text-slate-400">
              Try adjusting your search criteria or register a new store!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((biz) => (
              <BusinessCard key={biz._id} business={biz} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
