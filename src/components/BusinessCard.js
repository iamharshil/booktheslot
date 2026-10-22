import Link from "next/link";

export default function BusinessCard({ business }) {
  const photo = business.bannerUrl || business.logoUrl;
  return (
    <article className="group overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--raised)]">
      <Link
        href={`/store/${business.slug}`}
        className="block focus-visible:outline-offset-[-3px]"
        aria-label={`View services and booking times at ${business.name}`}
      >
        <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--hairline)] bg-[var(--sunken)]">
          {photo ? (
            <img
              src={photo}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="business-card-art" aria-hidden="true">
              <span className="business-card-art__mark">
                {business.name?.trim()?.charAt(0)?.toUpperCase() || "B"}
              </span>
              <span className="business-card-art__caption">
                {business.category || "Local service"}
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-md border border-[var(--hairline)] bg-[var(--raised)] px-2.5 py-1.5 text-[11px] font-semibold">
            {business.category}
          </span>
        </div>
        <div className="grid gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="text-[21px] font-bold leading-tight tracking-[-.035em]">
              {business.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted-ink)]">
              {[business.city, business.address].filter(Boolean).join(" · ") ||
                "Local appointments"}
            </p>
            {(business.tagline || business.description) && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted-ink)]">
                {business.tagline || business.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-3">
            <span className="eyebrow">Services & times</span>
            <span className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--vermilion-ink)]">
              View availability <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
