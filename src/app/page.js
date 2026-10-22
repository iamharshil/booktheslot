"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BusinessCard from "../components/BusinessCard";
import { getBusinesses } from "../lib/api";

const categories = [
  "All places",
  "Salon & Spa",
  "Healthcare & Dental",
  "Fitness & Wellness",
  "Auto Services",
  "Professional Services",
  "Other",
];

export default function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All places");
  const [searchQuery, setSearchQuery] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = {};
    if (selectedCategory !== "All places") params.category = selectedCategory;
    if (query) params.search = query;

    getBusinesses(params)
      .then((res) => {
        if (active) setBusinesses(res.data || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Businesses could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCategory, query]);

  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="eyebrow">Appointments across India</p>
          <h1 className="mt-5 max-w-3xl text-wrap text-[clamp(3.4rem,9vw,6.5rem)] font-extrabold leading-[.94] tracking-[-.075em]">
            Make room for{" "}
            <span className="text-[var(--vermilion-ink)]">what’s next.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted-ink)] sm:text-lg">
            Find a local service, choose a time that works, and leave the
            back-and-forth behind.
          </p>
        </div>
        <div className="lg:justify-self-end lg:pb-2">
          <div className="flex items-start gap-4 border-l-2 border-[var(--pine)] pl-4">
            <div>
              <p className="eyebrow">A clearer way to book</p>
              <p className="mt-2 max-w-sm text-base leading-6">
                Available times update as slots are held and confirmed, so two
                appointments don’t claim the same capacity.
              </p>
            </div>
          </div>
          <Link
            href="/register-business"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--vermilion-ink)]"
          >
            Run a business? Set up appointments{" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section
        id="discover"
        className="border-y border-[var(--hairline)] bg-[var(--sunken)]"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Find your next appointment</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] sm:text-[37px]">
                Good time, right place.
              </h2>
            </div>
            <label className="relative w-full md:max-w-sm">
              <span className="sr-only">Search by business or city</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-ink)]"
              />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Business or city"
                className="h-12 w-full rounded-md border border-[var(--hairline)] bg-[var(--raised)] pl-10 pr-3 text-base placeholder:text-[var(--muted-ink)]"
              />
            </label>
          </div>

          <fieldset className="mt-7 flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-2">
            <legend className="sr-only">Filter by business type</legend>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-11 shrink-0 rounded-md border px-3.5 text-sm font-medium transition-colors ${selectedCategory === category ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--hairline)] bg-[var(--raised)] hover:bg-[var(--paper)]"}`}
              >
                {category}
              </button>
            ))}
          </fieldset>

          <div className="mt-7" aria-live="polite">
            {loading ? (
              <div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-busy="true"
              >
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--raised)]"
                  >
                    <div className="skeleton aspect-[16/9]" />
                    <div className="grid gap-3 p-5">
                      <div className="skeleton h-6 w-2/3" />
                      <div className="skeleton h-4 w-1/3" />
                      <div className="mt-3 border-t border-[var(--hairline)] pt-4">
                        <div className="skeleton h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="surface p-6" role="alert">
                <p className="font-semibold">Businesses didn’t load.</p>
                <p className="mt-1 text-sm text-[var(--muted-ink)]">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="secondary-action mt-4 text-sm"
                >
                  Try again
                </button>
              </div>
            ) : businesses.length === 0 ? (
              <div className="surface px-5 py-10 text-center">
                <p className="text-xl font-bold">No matches this time.</p>
                <p className="mt-2 text-sm text-[var(--muted-ink)]">
                  Try another city or service type.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {businesses.map((business) => (
                  <BusinessCard key={business._id} business={business} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="eyebrow">Booking, made straightforward</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold tracking-[-.05em] sm:text-4xl">
            From finding a service to showing up.
          </h2>
          <p className="mt-4 max-w-md leading-7 text-[var(--muted-ink)]">
            BookTheSlot brings local service providers and people who need them
            together, with appointment times you can choose online.
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Find a local service",
              copy: "Search by business or city, then narrow the list by service type.",
            },
            {
              number: "02",
              title: "Choose a time",
              copy: "Review the services and available appointment times before booking.",
            },
            {
              number: "03",
              title: "Confirm your visit",
              copy: "Sign in, complete checkout, and keep your booking details handy.",
            },
          ].map((step) => (
            <li key={step.number} className="surface p-5 sm:p-6">
              <span className="font-mono text-xs text-[var(--vermilion-ink)]">
                {step.number}
              </span>
              <h3 className="mt-7 text-lg font-bold tracking-[-.03em]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[var(--hairline)] bg-[var(--sunken)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-8 sm:py-16 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow">For local businesses</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.05em] sm:text-4xl">
              Make your schedule easier to manage.
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted-ink)]">
              Set up your services, prices, opening hours, and appointment
              capacity. Manage bookings and keep your business information in
              one place.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row md:flex-col md:items-stretch">
            <Link href="/register-business" className="primary-action">
              Set up your business <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/dashboard" className="secondary-action">
              Go to merchant workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
