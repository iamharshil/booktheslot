export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-8"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="skeleton h-4 w-32 rounded" />
      <div className="skeleton mt-5 h-12 w-2/3 max-w-xl rounded-lg" />
      <div className="skeleton mt-3 h-5 w-full max-w-md rounded" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--raised)]"
          >
            <div className="skeleton aspect-[16/9]" />
            <div className="grid gap-3 p-5">
              <div className="skeleton h-6 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton mt-3 h-4 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
