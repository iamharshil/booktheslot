"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Scissors,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Brand from "../../../components/Brand";
import ImagePicker from "../../../components/ImagePicker";
import {
  createBusiness,
  createService,
  getProfile,
  updateBusiness,
  uploadBusinessImage,
} from "../../../lib/api";
import { notifyAuthChange } from "../../../lib/session";

const categories = [
  "Salon & Spa",
  "Healthcare & Dental",
  "Fitness & Wellness",
  "Auto Services",
  "Professional Services",
  "Other",
];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cover, setCover] = useState(null);
  const [servicePhotos, setServicePhotos] = useState([]);
  const [addService, setAddService] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    category: "Salon & Spa",
    email: "",
    phone: "",
    city: "",
    address: "",
    tagline: "",
    description: "",
  });
  const [service, setService] = useState({
    name: "",
    description: "",
    durationMinutes: 30,
    price: "",
    capacity: 1,
  });

  useEffect(() => {
    getProfile()
      .then((result) => {
        setProfile((current) => ({
          ...current,
          email: current.email || result.data?.email || "",
        }));
      })
      .catch(() => {});
  }, []);

  function setProfileField(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function setServiceField(key, value) {
    setService((current) => ({ ...current, [key]: value }));
  }

  async function finishSetup(event) {
    event.preventDefault();
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const selectedFiles = [...(cover ? [cover] : []), ...(addService ? servicePhotos : [])];
    if (addService && (servicePhotos.length < 1 || servicePhotos.length > 5)) {
      setError("Choose between one and five photos for your service.");
      return;
    }
    if (selectedFiles.some((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError("Choose JPG, PNG, WebP, or GIF photos that are 5 MB or smaller.");
      return;
    }
    setBusy(true);
    setError("");
    let businessId = "";
    let setupStage = "cover";
    try {
      const result = await createBusiness(profile);
      businessId = result.data?._id;
      if (!businessId) throw new Error("Your business profile could not be created.");
      notifyAuthChange();

      if (cover) {
        const bannerUrl = await uploadBusinessImage(businessId, cover);
        await updateBusiness(businessId, { bannerUrl });
      }

      if (addService) {
        setupStage = "service";
        const imageUrls = [];
        for (const file of servicePhotos) {
          imageUrls.push(await uploadBusinessImage(businessId, file));
        }
        await createService(businessId, {
          ...service,
          durationMinutes: Number(service.durationMinutes),
          price: Number(service.price),
          capacity: Number(service.capacity),
          imageUrls,
          imageUrl: imageUrls[0],
        });
      } else {
        setupStage = "complete";
      }

      router.push("/dashboard?welcome=1");
    } catch (submitError) {
      if (businessId) {
        notifyAuthChange();
        router.push(
          addService
            && setupStage === "service"
            ? `/dashboard/services?businessId=${businessId}&setup=service`
            : "/dashboard/settings?setup=cover",
        );
        return;
      }
      setError(submitError.message || "We couldn’t finish setting up your business.");
      setBusy(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-[var(--hairline)] bg-[var(--raised)] px-3.5 py-3 text-[var(--ink)]";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-8 sm:px-8 sm:py-12">
      <div className="w-full overflow-hidden rounded-3xl border border-[var(--hairline)] bg-[var(--raised)] shadow-[0_24px_80px_color-mix(in_oklab,var(--ink)_9%,transparent)]">
        <header className="border-b border-[var(--hairline)] bg-[var(--sunken)] px-6 py-6 sm:px-10 sm:py-8">
          <Brand />
          <p className="eyebrow mt-7">Your business, ready to book</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
            Let’s get your business set up.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-ink)]">
            Add the essentials now. You can polish your storefront and schedule any time.
          </p>
          <div className="mt-6 flex max-w-md items-center gap-3" aria-label={`Setup step ${step + 1} of 2`}>
            {["Business profile", "First service (optional)"].map((label, index) => (
              <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index <= step ? "bg-[var(--pine)] text-white" : "bg-[var(--raised)] text-[var(--muted-ink)]"}`}>
                  {index < step ? <Check size={15} /> : index + 1}
                </span>
                <span className={`hidden truncate text-xs font-semibold sm:block ${index === step ? "text-[var(--ink)]" : "text-[var(--muted-ink)]"}`}>{label}</span>
                {index === 0 && <span className="h-px min-w-4 flex-1 bg-[var(--hairline)]" />}
              </div>
            ))}
          </div>
        </header>

        {error && <p role="alert" className="mx-6 mt-5 rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-ink)] sm:mx-10">{error}</p>}

        <form onSubmit={step === 0 ? (event) => { event.preventDefault(); setError(""); setStep(1); } : finishSetup} className="p-6 sm:p-10">
          {step === 0 ? (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--pine)_10%,var(--raised))] text-[var(--pine)]"><Building2 size={20} /></span>
                <div><p className="eyebrow">Step 1 · Business profile</p><h2 className="mt-1 text-xl font-bold">How should customers find you?</h2></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Business name *<input className={inputClass} required maxLength={120} autoComplete="organization" value={profile.name} onChange={(event) => setProfileField("name", event.target.value)} placeholder="e.g. Studio Kesar" /></label>
                <label className="grid gap-1.5 text-sm font-semibold">Category *<select className={inputClass} required value={profile.category} onChange={(event) => setProfileField("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="grid gap-1.5 text-sm font-semibold">City *<input className={inputClass} required value={profile.city} onChange={(event) => setProfileField("city", event.target.value)} placeholder="e.g. Bengaluru" /></label>
                <label className="grid gap-1.5 text-sm font-semibold">Contact email *<input className={inputClass} type="email" required autoComplete="email" value={profile.email} onChange={(event) => setProfileField("email", event.target.value)} /></label>
                <label className="grid gap-1.5 text-sm font-semibold">Phone <span className="font-normal text-[var(--muted-ink)]">(optional)</span><input className={inputClass} type="tel" autoComplete="tel" value={profile.phone} onChange={(event) => setProfileField("phone", event.target.value)} placeholder="+91 98765 43210" /></label>
                <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Street address <span className="font-normal text-[var(--muted-ink)]">(optional)</span><input className={inputClass} autoComplete="street-address" value={profile.address} onChange={(event) => setProfileField("address", event.target.value)} placeholder="Street, area, and building" /></label>
                <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Short introduction <span className="font-normal text-[var(--muted-ink)]">(optional)</span><input className={inputClass} maxLength={180} value={profile.tagline} onChange={(event) => setProfileField("tagline", event.target.value)} placeholder="A warm welcome in a few words" /></label>
                <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">About your business <span className="font-normal text-[var(--muted-ink)]">(optional)</span><textarea className={inputClass} rows={3} value={profile.description} onChange={(event) => setProfileField("description", event.target.value)} placeholder="Tell customers what makes your business special." /></label>
                <div className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  <span>Cover photo <span className="font-normal text-[var(--muted-ink)]">(optional)</span></span>
                  <ImagePicker
                    files={cover ? [cover] : []}
                    maxFiles={1}
                    onFilesChange={(files) => setCover(files[0] || null)}
                    onError={setError}
                    hint="A wide photo works best · JPG, PNG, WebP, or GIF · Up to 5 MB"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end border-t border-[var(--hairline)] pt-6">
                <button type="submit" className="primary-action">Continue <ArrowRight size={17} /></button>
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--vermilion)_10%,var(--raised))] text-[var(--vermilion-ink)]"><Scissors size={20} /></span>
                <div><p className="eyebrow">Step 2 · First service</p><h2 className="mt-1 text-xl font-bold">Give customers something to book.</h2></div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--hairline)] p-4 hover:bg-[var(--sunken)]">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={addService} onChange={(event) => setAddService(event.target.checked)} />
                <span><span className="block text-sm font-semibold">Add my first service now</span><span className="mt-1 block text-xs leading-5 text-[var(--muted-ink)]">Set a price, duration, and at least one photo. You can also do this later.</span></span>
              </label>
              {addService && (
                <div className="mt-5 grid gap-4 rounded-2xl border border-[var(--hairline)] bg-[var(--sunken)] p-4 sm:grid-cols-2 sm:p-6">
                  <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Service name *<input className={inputClass} required maxLength={100} value={service.name} onChange={(event) => setServiceField("name", event.target.value)} placeholder="e.g. Haircut and styling" /></label>
                  <label className="grid gap-1.5 text-sm font-semibold">Price (₹) *<input className={inputClass} required type="number" min="0" step="1" value={service.price} onChange={(event) => setServiceField("price", event.target.value)} placeholder="500" /></label>
                  <label className="grid gap-1.5 text-sm font-semibold">Duration (minutes) *<input className={inputClass} type="number" min="5" max="480" step="1" required value={service.durationMinutes} onChange={(event) => setServiceField("durationMinutes", event.target.value)} /><span className="text-xs font-normal text-[var(--muted-ink)]">Choose 5 minutes to 8 hours.</span></label>
                  <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Description <textarea className={inputClass} rows={2} value={service.description} onChange={(event) => setServiceField("description", event.target.value)} placeholder="What’s included in this service?" /></label>
                  <div className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                    <span>Service photos *</span>
                    <ImagePicker
                      files={servicePhotos}
                      maxFiles={5}
                      onFilesChange={setServicePhotos}
                      onError={setError}
                      hint="Choose 1–5 photos · JPG, PNG, WebP, or GIF · Up to 5 MB each"
                    />
                  </div>
                </div>
              )}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--hairline)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" disabled={busy} onClick={() => setStep(0)} className="secondary-action"><ArrowLeft size={16} /> Back</button>
                <button type="submit" disabled={busy} className="primary-action disabled:opacity-60">{busy ? "Setting things up…" : addService ? "Create business & service" : "Skip service & finish setup"}<ArrowRight size={17} /></button>
              </div>
            </section>
          )}
        </form>
      </div>
    </main>
  );
}
