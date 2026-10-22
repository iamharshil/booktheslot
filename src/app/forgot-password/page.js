"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (reason) {
      setError(reason.message || "Could not request a password reset.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <section className="surface p-6 sm:p-8">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          Enter your account email and we’ll send a reset link if the account
          exists.
        </p>
        {message && <output className="mt-4 text-sm">{message}</output>}
        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <label className="grid gap-1 text-sm">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </label>
          <button className="primary-action" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <Link
          href="/login"
          className="mt-5 inline-block text-sm text-[var(--vermilion-ink)]"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
