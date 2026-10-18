"use client";

import { Calendar, PlusCircle, Sparkles, Store } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070a12]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3.5 group text-decoration-none"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070a12] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                booktheslot
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5 font-medium">
              Multi-Shift Scheduling & Capacity Engine
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/#explore-stores"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
          >
            <Store className="w-4 h-4 text-slate-400" />
            <span>Discover Stores</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Merchant Portal</span>
          </Link>

          <Link
            href="/register-business"
            className="btn-primary text-xs py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5 font-semibold tracking-wide"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Business</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
