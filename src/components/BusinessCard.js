import {
  ArrowRight,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function BusinessCard({ business }) {
  const categoryBadgeColors = {
    "Salon & Spa": "bg-purple-500/15 text-purple-300 border-purple-500/30",
    "Healthcare & Dental":
      "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "Auto Services": "bg-amber-500/15 text-amber-300 border-amber-500/30",
    "Fitness & Wellness": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  const badgeClass =
    categoryBadgeColors[business.category] ||
    "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";

  return (
    <div className="glass-panel overflow-hidden flex flex-col group hover:border-indigo-500/40 relative">
      {/* Banner Image with Overlay */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={
            business.bannerUrl ||
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
          }
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1626] via-[#0f1626]/40 to-black/20" />

        {/* Top Badges Row */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-sm ${badgeClass}`}
          >
            {business.category}
          </span>

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>4.9</span>
          </div>
        </div>

        {/* Floating City & Verified Status */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-slate-300">
          {business.city && (
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{business.city}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Shifts</span>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div>
          <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition-colors tracking-tight">
            {business.name}
          </h3>
          <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {business.tagline || business.description}
          </p>

          {/* Shift & Staff feature highlights */}
          <div className="mt-4 pt-4 border-t border-white/[0.07] flex flex-col gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 font-medium">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
              <span className="truncate">
                Afternoon Break & Multi-Shift Hours
              </span>
            </div>

            <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-medium">
              <Users className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
              <span className="truncate">
                Multi-Employee Concurrent Bookings
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Instant Hold
            </span>
            <div className="text-xs font-semibold text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Conflicts</span>
            </div>
          </div>

          <Link
            href={`/store/${business.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
