"use client";

import {
  BarChart3,
  CalendarDays,
  Clock3,
  LogOut,
  Scissors,
  Settings2,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import Brand from "../../components/Brand";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "../../lib/api";
import {
  authChangeEvent,
  clearAuthToken,
  getAuthToken,
} from "../../lib/session";

const workspaceLinks = [
  { href: "/dashboard", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];
const manageLinks = [
  { href: "/dashboard/services", label: "Services", icon: Scissors },
  { href: "/dashboard/staff", label: "Team", icon: UsersRound },
  { href: "/dashboard/schedule", label: "Hours & closures", icon: Clock3 },
  { href: "/dashboard/settings", label: "Business profile", icon: Settings2 },
];

export default function MerchantLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState("checking");
  const [error, setError] = useState("");
  const [workspaceLabel, setWorkspaceLabel] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      setState("checking");
      setError("");
      if (!getAuthToken()) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      try {
        const result = await getProfile();
        if (!active) return;
        const user = result.data;
        if (user?.role !== "merchant") {
          router.replace("/account");
          return;
        }
        if (!user.businesses?.length && pathname !== "/dashboard") {
          router.replace("/register-business");
          return;
        }
        setWorkspaceLabel(
          user.businesses?.length > 1
            ? `${user.businesses.length} businesses`
            : user.businesses?.[0]?.name || "Business workspace",
        );
        setUserName(user.name || "Business owner");
        setState("allowed");
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          clearAuthToken();
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setError(err.message || "Your merchant account could not be checked.");
        setState("error");
      }
    }
    checkAccess();
    window.addEventListener(authChangeEvent, checkAccess);
    return () => {
      active = false;
      window.removeEventListener(authChangeEvent, checkAccess);
    };
  }, [pathname, router]);

  if (state === "allowed") {
    const renderLinks = (links) =>
      links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            prefetch
            aria-current={active ? "page" : undefined}
            className="business-nav-link"
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      });

    return (
      <div className="business-shell">
        <aside className="business-sidebar">
          <Brand href="/dashboard" compact />
          <nav
            className="business-sidebar-nav"
            aria-label="Business navigation"
          >
            <div className="business-nav-group">
              <p className="business-nav-label">Workspace</p>
              {renderLinks(workspaceLinks)}
            </div>
            <div className="business-nav-group">
              <p className="business-nav-label">Manage</p>
              {renderLinks(manageLinks)}
            </div>
          </nav>
          <div className="business-sidebar-bottom">
            <div className="business-user-card">
              <span className="business-avatar" aria-hidden="true">
                {userName.trim().charAt(0).toUpperCase() || "B"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {userName}
                </span>
                <span className="block truncate text-xs text-[var(--muted-ink)]">
                  {workspaceLabel}
                </span>
              </span>
            </div>
            <button
              className="business-logout"
              type="button"
              onClick={clearAuthToken}
            >
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </div>
        </aside>
        <div className="business-main">
          <header className="business-topbar">
            <div>
              <p className="eyebrow">Business workspace</p>
              <p className="text-sm font-semibold">{workspaceLabel}</p>
            </div>
            <div className="business-topbar-actions">
              <button
                className="business-mobile-logout"
                type="button"
                onClick={clearAuthToken}
                aria-label="Sign out"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
              <span className="business-topbar-greeting">
                <span className="text-xs text-[var(--muted-ink)]">
                  Signed in as
                </span>
                <span className="text-sm font-semibold">{userName}</span>
              </span>
            </div>
          </header>
          <div className="business-content">
            <div className="dashboard-page-transition" key={pathname}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-8">
        <section className="surface p-6 sm:p-8" role="alert">
          <p className="eyebrow">Merchant workspace</p>
          <h1 className="mt-2 text-2xl font-bold">
            We couldn’t verify access.
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="secondary-action mt-5"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="skeleton h-8 w-52" />
      <div className="mt-7 grid gap-3">
        {[1, 2].map((item) => (
          <div key={item} className="skeleton h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
