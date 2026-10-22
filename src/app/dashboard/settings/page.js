"use client";

import Link from "next/link";
import { toast } from "sonner";
import ImagePicker from "../../../components/ImagePicker";
import { useEffect, useState } from "react";
import {
  getProfile,
  updateBusiness,
  uploadBusinessImage,
} from "../../../lib/api";

const defaults = {
  name: "",
  category: "Other",
  tagline: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  logoUrl: "",
  bannerUrl: "",
  timezone: "Asia/Kolkata",
  paymentMode: "full",
  timeFormat: "12h",
  bookingApprovalMode: "automatic",
  depositAmount: 0,
  cancellationCutoffHours: 24,
  maxAdvanceDays: 5,
};

export default function BusinessSettingsPage() {
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [form, setForm] = useState(defaults);
  const setNotice = (text, type = "error") => {
    if (text) toast[type](text);
  };
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [uploadFiles, setUploadFiles] = useState({});
  async function uploadImage(fieldName, file) {
    if (!file || !businessId) return;
    setUploading(fieldName);
    setNotice("");
    try {
      const url = await uploadBusinessImage(businessId, file);
      setForm((current) => ({ ...current, [fieldName]: url }));
      setNotice("Photo uploaded. Save settings to publish it on your profile.", "success");
    } catch (error) {
      setNotice(error.message || "Could not upload image.");
    } finally {
      setUploading("");
      setUploadFiles((current) => ({ ...current, [fieldName]: [] }));
    }
  }
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("setup") === "cover") {
      setNotice("Your business profile is ready. The cover photo did not finish uploading, so you can try again below.", "warning");
    }
    getProfile()
      .then((result) => {
        const list = result.data?.businesses || [];
        setBusinesses(list);
        setBusinessId(list[0]?._id || "");
      })
      .catch((error) =>
        setNotice(error.message || "Could not load business profile."),
      );
  }, []);
  useEffect(() => {
    const business = businesses.find((item) => item._id === businessId);
    if (!business) return;
    setForm({
      ...defaults,
      ...business,
      paymentMode: business.settings?.paymentMode || "full",
      timeFormat: business.settings?.timeFormat || "12h",
      bookingApprovalMode:
        business.settings?.bookingApprovalMode || "automatic",
      depositAmount: business.settings?.depositAmount || 0,
      cancellationCutoffHours: business.settings?.cancellationCutoffHours ?? 24,
      maxAdvanceDays: business.settings?.maxAdvanceDays ?? 5,
    });
  }, [businessId, businesses]);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const old = businesses.find((item) => item._id === businessId);
      await updateBusiness(businessId, {
        name: form.name,
        category: form.category,
        tagline: form.tagline,
        description: form.description,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl,
        timezone: form.timezone,
        settings: {
          ...old?.settings,
          paymentMode: form.paymentMode,
          timeFormat: form.timeFormat,
          bookingApprovalMode: form.bookingApprovalMode,
          depositAmount: Number(form.depositAmount),
          cancellationCutoffHours: Number(form.cancellationCutoffHours),
          maxAdvanceDays: Number(form.maxAdvanceDays),
        },
      });
      const result = await getProfile();
      setBusinesses(result.data?.businesses || []);
      setNotice("Business profile and booking policies saved.", "success");
    } catch (error) {
      setNotice(error.message || "Could not save business settings.");
    } finally {
      setBusy(false);
    }
  }
  const field = (key, label, type = "text") => (
    <label className="grid gap-1 text-sm" key={key}>
      {label}
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className="rounded-md border bg-[var(--raised)] px-3 py-2"
      />
    </label>
  );
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <Link className="text-sm text-[var(--vermilion-ink)]" href="/dashboard">
        ← Dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Business workspace</p>
          <h1 className="mt-2 text-3xl font-bold">
            Profile & booking policies
          </h1>
        </div>
        <select
          aria-label="Business"
          value={businessId}
          onChange={(event) => setBusinessId(event.target.value)}
          className="rounded-md border bg-[var(--raised)] px-3 py-2"
        >
          {businesses.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={save} className="surface mt-6 grid gap-6 p-5 sm:p-7">
        <section>
          <h2 className="text-lg font-bold">Public profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("name", "Business name")}
            {field("category", "Category")}
            {field("tagline", "Tagline")}
            {field("phone", "Phone", "tel")}
            {field("email", "Contact email", "email")}
            {field("city", "City")}
            {field("address", "Address")}
            {field("timezone", "IANA time zone")}
            {field("logoUrl", "Logo image URL", "url")}
            {field("bannerUrl", "Cover photo URL", "url")}
            {[
              ["logoUrl", "Upload logo"],
              ["bannerUrl", "Upload cover photo"],
            ].map(([key, label]) => (
              <div className="grid gap-1.5 text-sm" key={`${key}-upload`}>
                <span>{label}</span>
                <ImagePicker
                  files={uploadFiles[key] || []}
                  maxFiles={1}
                  disabled={!businessId || (Boolean(uploading) && uploading !== key)}
                  uploading={uploading === key}
                  onFilesChange={(files) => {
                    setUploadFiles((current) => ({ ...current, [key]: files }));
                    if (files[0]) uploadImage(key, files[0]);
                  }}
                  onError={setNotice}
                  hint="JPG, PNG, WebP, or GIF · Up to 5 MB"
                />
                {form[key] && (
                  <img
                    src={form[key]}
                    alt={key === "bannerUrl" ? "Business cover preview" : "Business logo preview"}
                    className={key === "bannerUrl" ? "mt-2 h-36 w-full rounded-xl object-cover" : "mt-2 h-24 w-24 rounded-xl object-cover"}
                  />
                )}
                {uploading === key && (
                  <span className="text-xs text-[var(--muted-ink)]">
                    Uploading…
                  </span>
                )}
              </div>
            ))}
            <label className="grid gap-1 text-sm sm:col-span-2">
              Description
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="rounded-md border bg-[var(--raised)] px-3 py-2"
              />
            </label>
          </div>
        </section>
        <section className="border-t border-[var(--hairline)] pt-5">
          <h2 className="text-lg font-bold">Appointments</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Time format
              <select
                value={form.timeFormat}
                onChange={(event) =>
                  setForm({ ...form, timeFormat: event.target.value })
                }
                className="rounded-md border bg-[var(--raised)] px-3 py-2"
              >
                <option value="12h">12-hour (2:30 PM)</option>
                <option value="24h">24-hour (14:30)</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Booking approval
              <select
                value={form.bookingApprovalMode}
                onChange={(event) =>
                  setForm({ ...form, bookingApprovalMode: event.target.value })
                }
                className="rounded-md border bg-[var(--raised)] px-3 py-2"
              >
                <option value="automatic">
                  Automatically confirm bookings
                </option>
                <option value="manual">Review each request</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Booking window (days ahead)
              <input
                type="number"
                min="0"
                max="365"
                step="1"
                required
                value={form.maxAdvanceDays}
                onChange={(event) =>
                  setForm({ ...form, maxAdvanceDays: event.target.value })
                }
                className="rounded-md border bg-[var(--raised)] px-3 py-2"
              />
              <span className="text-xs text-[var(--muted-ink)]">
                Customers can book today and up to {form.maxAdvanceDays || 0} days ahead. Set 0 to allow today only.
              </span>
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-ink)]">
            Requests awaiting review reserve their selected time until you
            approve or reject them. Online payment is collected before review.
          </p>
        </section>
        <section className="border-t border-[var(--hairline)] pt-5">
          <h2 className="text-lg font-bold">Payments & cancellations</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Payment option
              <select
                value={form.paymentMode}
                onChange={(event) =>
                  setForm({ ...form, paymentMode: event.target.value })
                }
                className="rounded-md border bg-[var(--raised)] px-3 py-2"
              >
                <option value="full">Full payment online</option>
                <option value="deposit">Deposit online</option>
                <option value="pay_at_visit">Pay at visit</option>
              </select>
            </label>
            {form.paymentMode === "deposit" && (
              <label className="grid gap-1 text-sm">
                Deposit amount
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.depositAmount}
                  onChange={(event) =>
                    setForm({ ...form, depositAmount: event.target.value })
                  }
                  className="rounded-md border bg-[var(--raised)] px-3 py-2"
                />
              </label>
            )}
            <label className="grid gap-1 text-sm">
              Cancellation cutoff (hours)
              <input
                type="number"
                min="0"
                max="720"
                value={form.cancellationCutoffHours}
                onChange={(event) =>
                  setForm({
                    ...form,
                    cancellationCutoffHours: event.target.value,
                  })
                }
                className="rounded-md border bg-[var(--raised)] px-3 py-2"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-ink)]">
            Online refunds are not automated yet. Process refund requests with
            your payment provider.
          </p>
        </section>
        <button
          disabled={busy || !businessId}
          className="primary-action justify-self-start disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
      </form>
    </main>
  );
}
