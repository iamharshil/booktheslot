"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile, login, register } from "../../lib/api";
import { saveAuthToken } from "../../lib/session";

function getSafeDestination(role, hasBusiness) {
  const requested = new URLSearchParams(window.location.search).get("next");
  if (role === "platform_admin") return "/admin";
  if (role === "merchant") {
    if (requested === "/register-business") return requested;
    if (
      hasBusiness &&
      ["/dashboard", "/dashboard/services", "/dashboard/schedule"].includes(
        requested,
      )
    ) {
      return requested;
    }
    return hasBusiness ? "/dashboard" : "/register-business";
  }
  if (
    requested === "/account" ||
    requested === "/" ||
    requested?.startsWith("/store/") ||
    requested?.startsWith("/booking/")
  ) {
    return requested;
  }
  return "/account";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [accountType, setAccountType] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("mode") === "register") setMode("register");
    if (search.get("accountType") === "merchant") setAccountType("merchant");
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const isRegistering = mode === "register";
      const result = isRegistering
        ? await register({ ...form, role: accountType })
        : await login(form);
      saveAuthToken(result.data.token);

      let user = result.data.user;
      if (!isRegistering) {
        const profile = await getProfile().catch(() => null);
        if (profile?.data) user = profile.data;
      }
      const hasBusiness = Boolean(user?.businesses?.length);
      router.push(getSafeDestination(user?.role, hasBusiness));
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to continue");
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    const search = new URLSearchParams(window.location.search);
    if (nextMode === "register") search.set("mode", "register");
    else search.delete("mode");
    router.replace(`/login?${search.toString()}`, { scroll: false });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-8 sm:py-14">
      <Link
        href="/"
        className="text-sm font-medium text-[var(--vermilion-ink)]"
      >
        ← Back to BookTheSlot
      </Link>
      <section className="glass-panel mt-6 p-5 sm:p-8">
        <p className="eyebrow">
          {mode === "login" ? "Welcome back" : "Get started"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
          {mode === "login" ? "Sign in to your account" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">
          {mode === "login"
            ? "Manage your business or find your upcoming bookings."
            : "Choose how you’ll use BookTheSlot. You can change your details later."}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-200"
          >
            {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "register" && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">
                  I’m here to
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "customer", label: "Book appointments" },
                    { value: "merchant", label: "Run a business" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={accountType === option.value}
                      onClick={() => setAccountType(option.value)}
                      className={`min-h-12 rounded-md border px-3 text-sm font-medium transition-colors ${accountType === option.value ? "border-[var(--vermilion)] bg-[color-mix(in_oklab,var(--vermilion)_10%,var(--raised))]" : "border-[var(--hairline)] bg-[var(--raised)] hover:bg-[var(--sunken)]"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-1 text-sm font-medium">
                Your name
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="rounded-md border px-3.5 py-2.5"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Phone number{" "}
                <span className="font-normal text-[var(--muted-ink)]">
                  (optional)
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  className="rounded-md border px-3.5 py-2.5"
                />
              </label>
            </>
          )}
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className="rounded-md border px-3.5 py-2.5"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input
              required
              type="password"
              minLength={mode === "register" ? 8 : 1}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              className="rounded-md border px-3.5 py-2.5"
            />
            {mode === "register" && (
              <span className="text-xs text-[var(--muted-ink)]">
                Use at least 8 characters.
              </span>
            )}
          </label>
          <button
            type="submit"
            disabled={busy}
            className="primary-action mt-1 w-full disabled:opacity-60"
          >
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : accountType === "merchant"
                  ? "Create merchant account"
                  : "Create customer account"}
          </button>
        </form>
        {mode === "login" && (
          <Link
            className="mt-4 inline-block text-sm text-[var(--vermilion-ink)]"
            href="/forgot-password"
          >
            Forgot your password?
          </Link>
        )}

        <p className="mt-5 text-sm text-[var(--muted-ink)]">
          {mode === "login"
            ? "New to BookTheSlot?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => changeMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-[var(--vermilion-ink)] underline-offset-4 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </div>
  );
}
