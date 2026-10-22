"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resetPassword } from "../../lib/api";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(
    () =>
      setToken(new URLSearchParams(window.location.search).get("token") || ""),
    [],
  );
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await resetPassword(token, password);
      setMessage(result.message);
    } catch (reason) {
      setError(reason.message || "This reset link could not be used.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <section className="surface p-6 sm:p-8">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold">Choose a new password</h1>
        {message && <output className="mt-4 text-sm">{message}</output>}
        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <label className="grid gap-1 text-sm">
            New password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border px-3 py-2"
            />
          </label>
          <button disabled={busy || !token} className="primary-action">
            {busy ? "Saving…" : "Reset password"}
          </button>
        </form>
        {message && (
          <Link
            href="/login"
            className="mt-5 inline-block text-sm text-[var(--vermilion-ink)]"
          >
            Continue to sign in
          </Link>
        )}
      </section>
    </main>
  );
}
