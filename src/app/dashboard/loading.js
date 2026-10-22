export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton mt-4 h-10 w-64 max-w-full rounded-lg" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-[var(--hairline)] bg-[var(--raised)] p-5"
          >
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton mt-4 h-8 w-32 rounded" />
            <div className="skeleton mt-3 h-4 w-40 rounded" />
          </div>
        ))}
      </div>
      <div className="skeleton mt-8 h-64 rounded-xl" />
    </main>
  );
}
