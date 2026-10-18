import { ArrowRight, Clock, MapPin, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function BusinessCard({ business }) {
  const categoryBadgeColors = {
    "Salon & Spa": "badge-purple",
    "Healthcare & Dental": "badge-emerald",
    "Auto Services": "badge-amber",
    "Fitness & Wellness": "badge-rose",
  };

  const badgeClass = categoryBadgeColors[business.category] || "badge-purple";

  return (
    <div className="glass-panel overflow-hidden flex flex-col group">
      {/* Banner Image with Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img
          src={
            business.bannerUrl ||
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
          }
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-85 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-black/30" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${badgeClass} backdrop-blur-md shadow-sm`}>
            {business.category}
          </span>
        </div>

        {/* City Badge */}
        {business.city && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{business.city}</span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {business.name}
          </h3>
          <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {business.tagline || business.description}
          </p>

          {/* Shift & Staff feature highlights */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Shift & Afternoon Breaks</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Concurrent Employee Capacity</span>
            </span>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Slot Hold</span>
          </div>

          <Link
            href={`/store/${business.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30 group-hover:translate-x-0.5"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
