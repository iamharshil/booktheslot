"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  createStaff,
  deactivateStaff,
  getProfile,
  getServicesByBusiness,
  getStaffByBusiness,
} from "../../../lib/api";

export default function StaffPage() {
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceIds: [],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProfile()
      .then((result) => {
        const owned = result.data?.businesses || [];
        setBusinesses(owned);
        setBusinessId(owned[0]?._id || "");
      })
      .catch((reason) => toast.error(reason.message || "Could not load your businesses."));
  }, []);

  useEffect(() => {
    if (!businessId) return;
    Promise.all([
      getServicesByBusiness(businessId),
      getStaffByBusiness(businessId),
    ])
      .then(([serviceResult, staffResult]) => {
        setServices(serviceResult.data || []);
        setStaff(staffResult.data || []);
      })
      .catch((reason) => toast.error(reason.message || "Could not load staff."));
  }, [businessId]);

  async function addMember(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await createStaff(businessId, form);
      setStaff((items) =>
        [...items, result.data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm({ name: "", email: "", phone: "", serviceIds: [] });
      toast.success("Team member added.");
    } catch (reason) {
      toast.error(reason.message || "Could not add staff member.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(member) {
    if (!window.confirm(`Deactivate ${member.name}?`)) return;
    try {
      await deactivateStaff(member._id);
      setStaff((items) => items.filter((item) => item._id !== member._id));
      toast.success(`${member.name} was deactivated.`);
    } catch (reason) {
      toast.error(reason.message || "Could not deactivate staff member.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <Link className="text-sm text-[var(--vermilion-ink)]" href="/dashboard">
        ← Dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Business workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Staff</h1>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Link qualified staff to services so bookings can be assigned to an
            eligible team member.
          </p>
        </div>
        <select
          aria-label="Business"
          value={businessId}
          onChange={(event) => setBusinessId(event.target.value)}
          className="rounded-md border bg-[var(--raised)] px-3 py-2"
        >
          {businesses.map((business) => (
            <option key={business._id} value={business._id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={addMember} className="surface grid gap-4 p-5">
          <h2 className="text-lg font-bold">Add team member</h2>
          <label className="grid gap-1 text-sm">
            Name
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Qualified services</legend>
            {services.map((service) => (
              <label
                key={service._id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.serviceIds.includes(service._id)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      serviceIds: event.target.checked
                        ? [...form.serviceIds, service._id]
                        : form.serviceIds.filter((id) => id !== service._id),
                    })
                  }
                />
                {service.name}
              </label>
            ))}
            {!services.length && (
              <p className="text-sm text-[var(--muted-ink)]">
                Add services first, then link them to staff.
              </p>
            )}
          </fieldset>
          <button
            disabled={busy || !businessId}
            className="primary-action disabled:opacity-50"
          >
            {busy ? "Saving…" : "Add staff member"}
          </button>
        </form>
        <section className="surface p-5">
          <h2 className="text-lg font-bold">Team roster</h2>
          {staff.length ? (
            <ul className="mt-3 divide-y divide-[var(--hairline)]">
              {staff.map((member) => (
                <li
                  key={member._id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-[var(--muted-ink)]">
                      {member.serviceIds?.length || 0} qualified services
                      {member.email ? ` · ${member.email}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMember(member)}
                    className="secondary-action text-sm"
                  >
                    Deactivate
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted-ink)]">
              No active staff members yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
