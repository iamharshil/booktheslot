"use client";

import {
  ArrowRight,
  CalendarCheck,
  Clock,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BusinessCard from "../components/BusinessCard";
import { getBusinesses } from "../lib/api";

export default function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Salon & Spa",
    "Healthcare & Dental",
    "Auto Services",
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
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold w-fit shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Multi-Shift Scheduling Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Every Business. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Any Shift, Any Break.
              </span>{" "}
              <span className="inline-block">Zero Conflicts.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              From afternoon lunch shutdowns to multi-employee concurrent
              bookings. Businesses customize shifts, manage services from 10
              minutes to 2 hours, and take real-time Razorpay payments.
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
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Race-Condition Safe
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">Flex</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Afternoon Shifts
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">
                  Instant
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Razorpay Checkout
                </div>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.14] shadow-2xl shadow-indigo-500/20 group bg-slate-900">
              <img
                src="/hero-banner.jpg"
                alt="booktheslot interactive preview"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#090d16]/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Glass Pill */}
            <div className="absolute bottom-3 left-3 sm:-bottom-4 sm:-left-4 z-20 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/[0.18] p-3 rounded-xl shadow-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight">
                  Atomic Concurrency Lock
                </div>
                <div className="text-[11px] text-slate-400">
                  Guarantees zero double booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Flexible Operating Shifts
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Businesses can shut down for lunch, take afternoon breaks, or
              close anytime. The engine guarantees no service booking ever
              bleeds into a break.
            </p>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
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

          <div className="glass-panel p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
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
            <h2 className="text-3xl font-extrabold text-white">
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
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {cat}
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
