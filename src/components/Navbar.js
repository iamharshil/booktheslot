"use client";

import { Calendar, PlusCircle, Sparkles, Store } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group text-decoration-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">
                booktheslot
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-xs text-slate-400 -mt-0.5">
              Smart Booking & Shifts
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Discover Stores</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Merchant Portal</span>
          </Link>

          <Link
            href="/register-business"
            className="btn-primary text-sm py-2 px-4 rounded-xl flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Your Business</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
