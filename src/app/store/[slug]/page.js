"use client";

import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import SlotPickerModal from "../../../components/SlotPickerModal";
import { getBusinessBySlug } from "../../../lib/api";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function displayTime(value, format = "12h") {
  const [hours, minutes] = value.split(":").map(Number);
  if (format === "24h")
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

export default function StorePage({ params }) {
  // In Next.js App router, unwrap params
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState(-1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getBusinessBySlug(slug)
      .then((res) => {
        if (isMounted && res.success) {
          setBusiness(res.data);
          const currentBusinessDay = new Intl.DateTimeFormat("en-US", {
            timeZone: res.data.timezone || "Asia/Kolkata",
            weekday: "long",
          }).format(new Date());
          setCurrentDay(dayNames.indexOf(currentBusinessDay));
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

  useEffect(() => {
    const footer = document.querySelector(".app-footer");
    if (!footer || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleBookService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-slate-400">
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
    <div className="public-store-page flex flex-col gap-10 pb-32 sm:gap-12 lg:pb-24">
      {/* Store Banner Hero */}
      <div
        className={`public-store-banner relative h-56 sm:h-80 w-full overflow-hidden border-b border-[var(--hairline)] bg-[var(--sunken)] ${business.bannerUrl ? "" : "public-store-banner-empty"}`}
      >
        {business.bannerUrl ? (
          <img
            src={business.bannerUrl}
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="public-store-banner-overlay h-full w-full"
          />
        )}

        <div className="absolute top-6 left-4 sm:left-8">
          <Link
            href="/"
            className="secondary-action bg-[var(--raised)] text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Stores</span>
          </Link>
        </div>
      </div>

      {/* Store Details Header Card */}
      <div className="relative z-10 mx-auto -mt-20 w-full max-w-7xl px-4 sm:-mt-28 sm:px-8">
        <div className="public-store-profile glass-panel p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start justify-between border-white/[0.14] shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[var(--hairline)] bg-[var(--sunken)] flex-shrink-0">
              {business.logoUrl || business.bannerUrl ? (
                <img
                  src={business.logoUrl || business.bannerUrl}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="public-store-logo-placeholder h-full w-full"
                >
                  {business.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title & Contact */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="badge badge-purple text-xs font-bold">
                  {business.category}
                </span>
                <span className="eyebrow">Appointments by schedule</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {business.name}
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {business.tagline || business.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-medium">
                {(business.address || business.city) && (
                  <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {[business.address, business.city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {business.phone}
                  </span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
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
              className="btn-primary text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-indigo-600/30"
            >
              <span>Book Appointment</span>
            </a>
            <div className="text-[11px] text-slate-400">
              Times shown in{" "}
              {business.timezone === "Asia/Kolkata" || !business.timezone
                ? "IST"
                : business.timezone}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Services + Working Hours Breakdown */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 sm:px-8 lg:grid-cols-12">
        {/* Left Column: Services Catalog (8 cols) */}
        <div
          id="services-section"
          className="flex scroll-mt-24 flex-col gap-6 lg:col-span-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Available Services
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose a service to see its currently available times.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              {business.services?.length || 0} Services
            </span>
          </div>

          {business.services?.length ? (
            <div className="flex flex-col gap-4">
              {business.services?.map((svc) => {
                const photos = svc.imageUrls?.length
                  ? svc.imageUrls
                  : svc.imageUrl
                    ? [svc.imageUrl]
                    : [];
                return (
                <div
                  key={svc._id}
                  className="public-service-card glass-panel p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group hover:border-indigo-500/40 transition-all"
                >
                  <div className="public-service-art" aria-hidden="true">
                    {photos[0] ? (
                      <img src={photos[0]} alt="" loading="lazy" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {svc.name}
                      </h3>
                      <span className="badge badge-purple text-[11px]">
                        {svc.category || "General"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {svc.description}
                    </p>

                    {photos.length > 1 && (
                      <div className="service-photo-strip" aria-label={`${photos.length} service photos`}>
                        {photos.slice(1).map((photo, index) => (
                          <img key={photo} src={photo} alt={`${svc.name} photo ${index + 2}`} loading="lazy" />
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
                      <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{svc.durationMinutes} mins duration</span>
                      </span>

                      <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Up to {svc.capacity} bookings at once</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                    <div className="price text-2xl font-bold">
                      ₹{new Intl.NumberFormat("en-IN").format(svc.price)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookService(svc)}
                      className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-md shadow-indigo-600/30"
                    >
                      <span>Book Slot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="surface px-5 py-10 text-sm text-[var(--muted-ink)]">
              This business has not added bookable services yet.
            </div>
          )}
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
                  View regular opening hours and listed closures.
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
                          Scheduled
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
                              {displayTime(
                                inv.open,
                                business.settings?.timeFormat,
                              )}{" "}
                              –{" "}
                              {displayTime(
                                inv.close,
                                business.settings?.timeFormat,
                              )}
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

      {business.services?.[0] && !isModalOpen && !footerVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--hairline)] bg-[var(--raised)] p-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {business.services[0].name}
              </p>
              <p className="price text-sm">
                ₹
                {new Intl.NumberFormat("en-IN").format(
                  business.services[0].price,
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleBookService(business.services[0])}
              className="primary-action shrink-0 text-sm"
            >
              Choose a time
            </button>
          </div>
        </div>
      )}

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
