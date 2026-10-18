import { Calendar, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070a12] text-slate-400 py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                booktheslot
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade slot scheduling engine. Built for businesses with
              multi-shift hours, afternoon breaks, dynamic closures, variable
              duration services, and multi-staff capacity.
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Overbooking Guarantee
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Razorpay Checkout
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Platform
            </h4>
            <Link
              href="/"
              className="text-sm hover:text-white transition-colors"
            >
              Browse Stores
            </Link>
            <Link
              href="/register-business"
              className="text-sm hover:text-white transition-colors"
            >
              Register Business
            </Link>
            <Link
              href="/dashboard"
              className="text-sm hover:text-white transition-colors"
            >
              Merchant Dashboard
            </Link>
            <Link
              href="/dashboard/schedule"
              className="text-sm hover:text-white transition-colors"
            >
              Shifts & Break Manager
            </Link>
          </div>

          {/* Verified Features */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Engine Architecture
            </h4>
            <span className="text-sm text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Dynamic Slot Stepping
            </span>
            <span className="text-sm text-slate-400">
              Atomic MongoDB Ledgers
            </span>
            <span className="text-sm text-slate-400">
              Multi-Employee Concurrent Slots
            </span>
            <span className="text-sm text-slate-400">
              HMAC-SHA256 Signature Security
            </span>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 booktheslot. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Next.js & Node.js</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>Razorpay Payment Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
