import Link from "next/link";

export default function Footer() {
  return (
    <footer className="app-footer border-t border-[var(--hairline)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-sm text-[var(--muted-ink)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link
          href="/"
          className="font-bold tracking-[-.03em] text-[var(--ink)]"
        >
          booktheslot
        </Link>
        <p>Choose a service. Find a time. Book directly.</p>
        <Link
          href="/register-business"
          className="font-semibold text-[var(--vermilion-ink)]"
        >
          For local businesses ↗
        </Link>
      </div>
    </footer>
  );
}
