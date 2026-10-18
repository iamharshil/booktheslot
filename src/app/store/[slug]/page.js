"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import SlotPickerModal from "../../../components/SlotPickerModal";
import { getBusinessBySlug } from "../../../lib/api";

export default function StorePage({ params }) {
  // In Next.js App router, unwrap params
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(-1);

  useEffect(() => {
    setCurrentDay(new Date().getDay());
  }, []);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getBusinessBySlug(slug)
      .then((res) => {
        if (isMounted && res.success) {
          setBusiness(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Store not found");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleBookService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading storefront...</span>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-2xl font-bold text-white">
          Storefront Unavailable
        </h2>
        <p className="text-sm text-slate-400">
          {error || "This store could not be found."}
        </p>
        <Link href="/" className="btn-secondary text-sm mt-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Stores</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Store Banner Hero */}
      <div className="relative h-64 sm:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={
            business.bannerUrl ||
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
          }
          alt={business.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/50 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Stores</span>
          </Link>
        </div>
      </div>

      {/* Store Details Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10 w-full">
        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/15 bg-slate-800 shadow-xl flex-shrink-0">
              <img
                src={business.logoUrl || business.bannerUrl}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Contact */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="badge badge-purple text-xs">
                  {business.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live & Accepting Bookings
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {business.name}
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {business.tagline || business.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                {business.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {business.address}, {business.city}
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {business.phone}
                  </span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    {business.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick CTA Card */}
          <div className="flex flex-col gap-2 sm:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
            <a
              href="#services-section"
              className="btn-primary text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Select Service & Slot</span>
            </a>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay Verified Merchant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Services + Working Hours Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Services Catalog (8 cols) */}
        <div
          id="services-section"
          className="lg:col-span-8 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Available Services
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose a service to view open slots tailored to its exact
                duration and staff capacity.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
              {business.services?.length || 0} Services
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {business.services?.map((svc) => (
              <div
                key={svc._id}
                className="glass-panel p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
              >
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {svc.name}
                    </h3>
                    <span className="badge badge-purple text-[11px]">
                      {svc.category || "General"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    {svc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      Duration: {svc.durationMinutes} mins
                    </span>

                    <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <Users className="w-3.5 h-3.5" />
                      Capacity: {svc.capacity}{" "}
                      {svc.capacity > 1 ? "Concurrent Staff" : "Staff"}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                  <div className="text-xl font-extrabold text-white">
                    ₹{svc.price}
                  </div>

                  <button
                    onClick={() => handleBookService(svc)}
                    className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <span>Book Slot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Schedule & Afternoon Break Breakdown (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Business Hours & Shifts
                </h3>
                <p className="text-[11px] text-slate-400">
                  Includes multi-shift hours & afternoon breaks
                </p>
              </div>
            </div>

            {/* Weekly Days List */}
            <div className="flex flex-col gap-3 text-xs">
              {business.schedule?.weeklyHours?.map((day) => {
                const dayName = dayNames[day.dayOfWeek];
                const isToday = currentDay === day.dayOfWeek;

                return (
                  <div
                    key={day.dayOfWeek}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-colors ${
                      isToday
                        ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        {dayName}
                        {isToday && (
                          <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-bold">
                            Today
                          </span>
                        )}
                      </span>
                      {day.isClosed ? (
                        <span className="text-rose-400 font-medium">
                          Closed
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">
                          Open
                        </span>
                      )}
                    </div>

                    {!day.isClosed && day.intervals?.length > 0 && (
                      <div className="flex flex-col gap-1 pl-1">
                        {day.intervals.map((inv, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] text-slate-400"
                          >
                            <span>{inv.label || `Shift ${idx + 1}`}</span>
                            <span className="font-mono text-slate-200">
                              {inv.open} – {inv.close}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Date Overrides / Special Closures Notice */}
            {business.schedule?.dateOverrides?.length > 0 && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">
                    Special Hours / Closures:
                  </span>
                  <div className="mt-1 flex flex-col gap-1 text-[11px] text-amber-200/80">
                    {business.schedule.dateOverrides.map((o) => (
                      <span key={o._id || o.date}>
                        {o.date}:{" "}
                        {o.reason ||
                          (o.isClosed ? "Closed All Day" : "Modified Hours")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slot Booking Modal */}
      <SlotPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        business={business}
        service={selectedService}
      />
    </div>
  );
}
