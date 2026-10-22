"use client";

import { AlertCircle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImagePicker from "../../components/ImagePicker";
import {
  createBusiness,
  createService,
  getProfile,
  uploadBusinessImage,
} from "../../lib/api";
import {
  authChangeEvent,
  clearAuthToken,
  getAuthToken,
  notifyAuthChange,
} from "../../lib/session";

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
    logoUrl: "",
    bannerUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasMerchantSession, setHasMerchantSession] = useState(null);
  const [accountRole, setAccountRole] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [initialService, setInitialService] = useState({
    name: "",
    durationMinutes: 30,
    price: "",
    capacity: 1,
  });
  const [servicePhotos, setServicePhotos] = useState([]);

  useEffect(() => {
    let active = true;
    async function syncSession() {
      setSessionError("");
      if (!getAuthToken()) {
        setAccountRole("");
        setHasMerchantSession(false);
        return;
      }
      try {
        const res = await getProfile();
        if (!active) return;
        setAccountRole(res.data?.role || "");
        setHasMerchantSession(res.data?.role === "merchant");
      } catch (err) {
        if (!active) return;
        if (err.status === 401) clearAuthToken();
        else
          setSessionError(err.message || "We could not verify your account.");
        setHasMerchantSession(false);
      }
    }
    syncSession();
    window.addEventListener(authChangeEvent, syncSession);
    return () => {
      active = false;
      window.removeEventListener(authChangeEvent, syncSession);
    };
  }, []);

  const categories = [
    "Salon & Spa",
    "Healthcare & Dental",
    "Fitness & Wellness",
    "Auto Services",
    "Professional Services",
    "Other",
  ];

  function signOutCustomer() {
    clearAuthToken();
    setAccountRole("");
    setHasMerchantSession(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (servicePhotos.length < 1 || servicePhotos.length > 5) {
      setError("Add between one and five photos for your first service.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await createBusiness(form);
      if (res.success) {
        notifyAuthChange();
        const businessId = res.data?._id;
        try {
          const imageUrls = [];
          for (const file of servicePhotos) {
            imageUrls.push(await uploadBusinessImage(businessId, file));
          }
          await createService(businessId, {
            ...initialService,
            durationMinutes: Number(initialService.durationMinutes),
            price: Number(initialService.price),
            capacity: Number(initialService.capacity),
            imageUrls,
            imageUrl: imageUrls[0],
          });
        } catch (serviceError) {
          router.push(`/dashboard/services?businessId=${businessId}&setup=service`);
          return;
        }
        router.push("/dashboard?welcome=1");
      }
    } catch (err) {
      setError(err.message || "Failed to register business");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <Sparkles className="w-4 h-4" />
          <span>Launch Your Storefront</span>
        </div>
        <h1 className="max-w-2xl text-3xl font-extrabold tracking-[-.05em] text-white sm:text-4xl">
          Bring your business to BookTheSlot
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create your personalized booking page with multi-shift scheduling,
          lunch breaks, and Razorpay payments.
        </p>
      </div>

      {hasMerchantSession === false && !sessionError && (
        <section className="surface p-6">
          <p className="eyebrow">Merchant account required</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">
            {accountRole === "customer"
              ? "Sign in with a merchant account."
              : "Start with your account."}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            {accountRole === "customer"
              ? "This account is set up for booking appointments. Sign out and use a separate merchant account to list a business."
              : "Create a merchant account first. You’ll return here to add your business and first service."}
          </p>
          {accountRole === "customer" ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/login?mode=register&accountType=merchant&next=%2Fregister-business"
                className="primary-action"
              >
                Create a merchant account ↗
              </Link>
              <button
                type="button"
                className="secondary-action"
                onClick={signOutCustomer}
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login?mode=register&accountType=merchant&next=%2Fregister-business"
                className="primary-action mt-5"
              >
                Create merchant account ↗
              </Link>
              <p className="mt-3 text-sm text-[var(--muted-ink)]">
                Already registered?{" "}
                <Link
                  className="font-semibold text-[var(--vermilion-ink)]"
                  href="/login?next=%2Fregister-business"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </section>
      )}

      {hasMerchantSession === false && sessionError && (
        <section className="surface p-6" role="alert">
          <h2 className="text-lg font-bold">
            We couldn’t verify your account.
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">{sessionError}</p>
          <button
            type="button"
            className="secondary-action mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      )}

      {hasMerchantSession && error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {hasMerchantSession && (
        <form
          onSubmit={handleSubmit}
          className="glass-panel flex flex-col gap-6 p-5 text-sm sm:p-8"
        >
          <div>
            <p className="eyebrow">Step 1 · Business details</p>
            <h2 className="mt-2 text-xl font-bold tracking-[-.03em]">
              Tell customers about your business.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Studio Kesar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--raised)] px-3.5 py-2.5 text-[var(--ink)] placeholder:text-[var(--muted-ink)] focus:outline-none focus:border-[var(--vermilion)]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--raised)] px-3.5 py-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--vermilion)]"
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

          <section className="border-t border-[var(--hairline)] pt-6">
            <p className="eyebrow">Step 2 · Your first service</p>
            <h2 className="mt-2 text-xl font-bold tracking-[-.03em]">
              Give customers something to book.
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-ink)]">
              Add at least one photo so customers can see what you offer. You can add more services later.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 font-medium sm:col-span-2">
                Service name *
                <input
                  required
                  maxLength={100}
                  value={initialService.name}
                  onChange={(event) =>
                    setInitialService({
                      ...initialService,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Haircut and styling"
                  className="w-full rounded-md border px-3.5 py-2.5"
                />
              </label>
              <div className="grid gap-1.5 font-medium sm:col-span-2">
                <span>Service photos *</span>
                <ImagePicker
                  files={servicePhotos}
                  maxFiles={5}
                  onFilesChange={setServicePhotos}
                  onError={setError}
                  hint="Choose 1–5 photos · JPG, PNG, WebP, or GIF · Up to 5 MB each"
                />
              </div>
              <label className="grid gap-1 font-medium">
                Price (₹) *
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={initialService.price}
                  onChange={(event) =>
                    setInitialService({
                      ...initialService,
                      price: event.target.value,
                    })
                  }
                  placeholder="500"
                  className="w-full rounded-md border px-3.5 py-2.5"
                />
              </label>
              <label className="grid gap-1 font-medium">
                Duration (minutes) *
                <input
                  type="number"
                  min="5"
                  max="480"
                  step="1"
                  required
                  value={initialService.durationMinutes}
                  onChange={(event) =>
                    setInitialService({
                      ...initialService,
                      durationMinutes: event.target.value,
                    })
                  }
                  className="w-full rounded-md border px-3.5 py-2.5"
                />
                <span className="text-xs font-normal text-[var(--muted-ink)]">Choose 5 minutes to 8 hours.</span>
              </label>
              <label className="grid gap-1 font-medium">
                Simultaneous appointments
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={initialService.capacity}
                  onChange={(event) =>
                    setInitialService({
                      ...initialService,
                      capacity: event.target.value,
                    })
                  }
                  className="w-full rounded-md border px-3.5 py-2.5"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-[var(--hairline)] pt-6">
            <p className="eyebrow">Step 3 · Opening hours</p>
            <h2 className="mt-2 text-xl font-bold tracking-[-.03em]">
              Your schedule starts with these hours.
            </h2>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="surface flex items-center justify-between gap-3 px-4 py-3">
                <span className="shrink-0 font-semibold">Monday–Friday</span>
                <span className="text-right text-[var(--muted-ink)]">
                  9:00–13:00 · 14:30–20:00
                </span>
              </div>
              <div className="surface flex items-center justify-between px-4 py-3">
                <span className="font-semibold">Saturday</span>
                <span className="text-[var(--muted-ink)]">10:00–18:00</span>
              </div>
              <div className="surface flex items-center justify-between px-4 py-3 sm:col-span-2">
                <span className="font-semibold">Sunday</span>
                <span className="text-[var(--muted-ink)]">Closed</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--muted-ink)]">
              Change opening hours, breaks, and holiday closures from your
              workspace after setup.
            </p>
          </section>

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
      )}

      {hasMerchantSession === null && (
        <output className="surface p-5 text-sm text-[var(--muted-ink)]">
          Checking your merchant account…
        </output>
      )}
    </div>
  );
}
