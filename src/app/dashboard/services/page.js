"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  createService,
  deleteService,
  getProfile,
  getServicesByBusiness,
  uploadBusinessImage,
} from "../../../lib/api";

function ServicesManagerContent() {
  const searchParams = useSearchParams();
  const queryBizId = searchParams.get("businessId");

  const [businesses, setBusinesses] = useState([]);
  const [selectedBizId, setSelectedBizId] = useState(queryBizId || "");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // New Service Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: 45,
    price: 499,
    capacity: 2, // Default 2 employees for concurrent bookings
    bufferMinutes: 0,
    category: "General",
    imageUrl: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const durationPresets = [10, 15, 30, 45, 60, 90, 120];

  // 1. Fetch businesses
  useEffect(() => {
    getProfile()
      .then((res) => {
        const ownedBusinesses = res.data?.businesses || [];
        if (res.success && ownedBusinesses.length > 0) {
          setBusinesses(ownedBusinesses);
          setSelectedBizId((current) => current || ownedBusinesses[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch services for selected business
  useEffect(() => {
    let stale = false;
    if (!selectedBizId)
      return () => {
        stale = true;
      };

    setLoading(true);
    setMessage({ type: "", text: "" });

    getServicesByBusiness(selectedBizId)
      .then((res) => {
        if (!stale && res.success) {
          setServices(res.data);
        }
      })
      .catch((err) => {
        if (stale) return;
        setMessage({
          type: "error",
          text: err.message || "Failed to load services",
        });
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [selectedBizId]);

  // Handle Add Service
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!selectedBizId) return;

    try {
      const res = await createService(selectedBizId, form);
      if (res.success) {
        setServices([...services, res.data]);
        setMessage({
          type: "success",
          text: `Service "${form.name}" created with capacity ${form.capacity}!`,
        });
        setForm({
          name: "",
          description: "",
          durationMinutes: 45,
          price: 499,
          capacity: 2,
          bufferMinutes: 0,
          category: "General",
          imageUrl: "",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create service",
      });
    }
  };

  // Handle Delete Service
  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Deactivate service "${name}"?`)) return;

    try {
      const res = await deleteService(id);
      if (res.success) {
        setServices(services.filter((s) => s._id !== id));
        setMessage({ type: "success", text: `Service "${name}" deactivated!` });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to delete service",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            Services & Staff Capacity
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure service timings (10m to 120m) and employee capacity for
            simultaneous bookings.
          </p>
        </div>

        {/* Store Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Store:</label>
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(e.target.value)}
            className="bg-[var(--raised)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--vermilion-ink)]"
          >
            {businesses.map((biz) => (
              <option key={biz._id} value={biz._id}>
                {biz.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            message.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create New Service Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
              <Plus className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-white">
                  Add New Service
                </h2>
                <p className="text-[11px] text-slate-400">
                  Define duration & number of concurrent employees.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleAddService}
              className="flex flex-col gap-4 text-xs"
            >
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Beard Detailing"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grooming, Diagnostics, Maintenance"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Duration with quick presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-semibold">
                    Duration (Minutes) *
                  </label>
                  <span className="font-bold text-indigo-400">
                    {form.durationMinutes} mins
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {durationPresets.map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() =>
                        setForm({ ...form, durationMinutes: mins })
                      }
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        form.durationMinutes === mins
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="5"
                  max="480"
                  required
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Staff Capacity */}
              <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-indigo-300 font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Staff Capacity (Employees) *
                  </label>
                  <span className="text-sm font-extrabold text-white">
                    {form.capacity}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.15] rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 flex items-start gap-1 leading-relaxed">
                  <Info className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    If this service has 2 employees, the system automatically
                    accepts 2 simultaneous customer bookings for the exact same
                    slot!
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Cleanup buffer (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={form.bufferMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bufferMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Blocks the next slot after this service so staff can reset the
                  room.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Price (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-8 pr-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Detail what is included in this service..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Service image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage || !selectedBizId}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const imageUrl = await uploadBusinessImage(
                        selectedBizId,
                        file,
                      );
                      setForm((current) => ({ ...current, imageUrl }));
                      setMessage({
                        type: "success",
                        text: "Image uploaded. It will be saved with this service.",
                      });
                    } catch (error) {
                      setMessage({
                        type: "error",
                        text: error.message || "Image upload failed",
                      });
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="w-full text-sm text-slate-300"
                />
                {uploadingImage && (
                  <p className="mt-1 text-xs text-slate-400">Uploading…</p>
                )}
                {form.imageUrl && (
                  <p className="mt-1 truncate text-xs text-emerald-400">
                    Image ready to save
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary text-xs py-3 rounded-xl font-semibold mt-2"
              >
                Create Service
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Services List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base font-bold text-white">
                  Active Store Services
                </h2>
                <p className="text-xs text-slate-400">
                  Current offerings available for online booking
                </p>
              </div>
              <span className="text-xs text-slate-400 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.06]">
                {services.length} Services
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading services...
              </div>
            ) : services.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active services configured. Create your first service using
                the form on the left!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((svc) => (
                  <div
                    key={svc._id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {svc.name}
                        </span>
                        <span className="badge badge-purple text-[10px]">
                          {svc.category || "General"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {svc.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs pt-1">
                        <span className="flex items-center gap-1 text-indigo-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {svc.durationMinutes} mins
                          {svc.bufferMinutes
                            ? ` + ${svc.bufferMinutes}m buffer`
                            : ""}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <Users className="w-3 h-3" />
                          Capacity: {svc.capacity}{" "}
                          {svc.capacity > 1 ? "Employees" : "Employee"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                      <div className="text-base font-extrabold text-white">
                        ₹{svc.price}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(svc._id, svc.name)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Deactivate service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span>Loading services manager...</span>
          </div>
        </div>
      }
    >
      <ServicesManagerContent />
    </Suspense>
  );
}
