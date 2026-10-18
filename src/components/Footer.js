import { Calendar, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#070a12]/90 text-slate-400 py-14 mt-24 overflow-hidden">
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                booktheslot
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade slot scheduling engine. Built for businesses with
              multi-shift hours, afternoon breaks, dynamic closures, variable
              duration services, and multi-staff capacity.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Zero Overbooking Guarantee
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Zap className="w-4 h-4" />
                Real-Time Razorpay Checkout
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Platform
            </h4>
            <Link
              href="/#explore-stores"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Browse Live Stores
            </Link>
            <Link
              href="/register-business"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Register New Store
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Merchant Dashboard
            </Link>
            <Link
              href="/dashboard/schedule"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Shifts & Break Manager
            </Link>
            <Link
              href="/dashboard/services"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Services & Staff Manager
            </Link>
          </div>

          {/* Verified Features */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Engine Architecture
            </h4>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Dynamic Slot Stepping
            </span>
            <span className="text-xs text-slate-400">
              Atomic MongoDB Ledgers
            </span>
            <span className="text-xs text-slate-400">
              Multi-Employee Concurrent Slots
            </span>
            <span className="text-xs text-slate-400">
              HMAC-SHA256 Signature Security
            </span>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 booktheslot. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Scheduling Systems Operational</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:inline-block" />
            <span className="hidden sm:inline-block">Razorpay Dev Mode</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
