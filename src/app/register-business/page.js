"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBusiness } from "../../lib/api";

export default function RegisterBusinessPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "Salon & Spa",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "Bengaluru",
    logoUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Salon & Spa",
    "Healthcare & Dental",
    "Fitness & Wellness",
    "Auto Services",
    "Professional Services",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await createBusiness(form);
      if (res.success) {
        // Redirect to new store page!
        router.push(`/store/${res.data.slug}`);
      }
    } catch (err) {
      setError(err.message || "Failed to register business");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Launch Your Storefront</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Register Your Business on booktheslot
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create your personalized booking page with multi-shift scheduling,
          lunch breaks, and Razorpay payments.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="glass-panel p-6 sm:p-8 flex flex-col gap-6 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Velvet Touch Salon & Spa"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#0f172a] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              City *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bengaluru, Mumbai, Delhi"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Premier Haircare & Rejuvenation Therapy"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Business Email *
            </label>
            <input
              type="email"
              required
              placeholder="store@domain.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Full Street Address
            </label>
            <input
              type="text"
              placeholder="e.g. 104 Sapphire Arcade, 100 Feet Road"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              About Store & Description
            </label>
            <textarea
              rows="3"
              placeholder="Tell your customers about your team, facilities, and hygiene standards..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Feature note */}
        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-slate-400 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-200">
              Automatic Shift Initialization:{" "}
            </span>
            Your store is initialized with flexible morning (9:00 - 13:00) and
            evening (14:30 - 20:00) shifts, with an afternoon lunch break. You
            can customize shifts or add emergency closures anytime from your
            Merchant Portal!
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Creating Storefront...</span>
          ) : (
            <>
              <span>Create Storefront & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
