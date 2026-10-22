"use client";

import { Menu, Store, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Brand from "./Brand";
import { getProfile } from "../lib/api";
import { authChangeEvent, clearAuthToken, getAuthToken } from "../lib/session";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    async function syncUser() {
      if (!getAuthToken()) {
        setUser(null);
        return;
      }
      try {
        const profile = await getProfile();
        if (active) setUser(profile.data);
      } catch (error) {
        if (error.status === 401) clearAuthToken();
        if (active) setUser(null);
      }
    }
    syncUser();
    window.addEventListener(authChangeEvent, syncUser);
    return () => {
      active = false;
      window.removeEventListener(authChangeEvent, syncUser);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[color-mix(in_oklab,var(--paper)_94%,transparent)]">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Brand />
          <span className="hidden border-l border-[var(--hairline)] pl-3 text-[11px] text-[var(--muted-ink)] md:inline">
            Appointments, on your time
          </span>
        </div>
        <nav
          className="main-desktop-nav hidden items-center gap-4 lg:gap-6 md:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/#discover"
            className="text-sm font-medium text-[var(--muted-ink)] hover:text-[var(--ink)]"
          >
            Discover
          </Link>
          {user?.role === "customer" ? (
            <Link href="/account" className="text-sm font-semibold">
              My bookings
            </Link>
          ) : user?.role === "merchant" && user.businesses?.length ? (
            <Link href="/dashboard" className="text-sm font-semibold">
              Merchant workspace
            </Link>
          ) : null}
          {user ? (
            <button
              type="button"
              onClick={clearAuthToken}
              className="secondary-action text-sm"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--muted-ink)] hover:text-[var(--ink)]"
            >
              Sign in
            </Link>
          )}
          {user?.role === "merchant" && !user.businesses?.length ? (
            <Link href="/register-business" className="primary-action text-sm">
              Set up your business <span aria-hidden="true">↗</span>
            </Link>
          ) : !user || user.role === "customer" ? (
            <Link
              href={user ? "/#discover" : "/register-business"}
              className="primary-action text-sm"
            >
              {user ? "Find an appointment" : "For local businesses"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          ) : null}
        </nav>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="main-menu-toggle inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--hairline)] md:hidden"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {menuOpen && (
        <nav
          className="main-mobile-nav grid gap-1 border-t border-[var(--hairline)] bg-[var(--raised)] p-3 md:hidden"
          aria-label="Mobile navigation"
        >
          <Link
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-3 text-sm"
            href="/#discover"
          >
            Discover businesses
          </Link>
          {user?.role === "customer" ? (
            <Link
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 text-sm"
              href="/account"
            >
              My bookings
            </Link>
          ) : user?.role === "merchant" && user.businesses?.length ? (
            <Link
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 text-sm"
              href="/dashboard"
            >
              Merchant workspace
            </Link>
          ) : null}
          {user ? (
            <button
              type="button"
              onClick={() => {
                clearAuthToken();
                setMenuOpen(false);
              }}
              className="secondary-action justify-start rounded-md px-3 py-3 text-sm"
            >
              Sign out
            </button>
          ) : (
            <Link
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 text-sm"
              href="/login"
            >
              Sign in
            </Link>
          )}
          {user?.role === "merchant" && !user.businesses?.length ? (
            <Link
              onClick={() => setMenuOpen(false)}
              className="primary-action mt-1 text-sm"
              href="/register-business"
            >
              <Store size={16} /> Set up your business
            </Link>
          ) : !user || user.role === "customer" ? (
            <Link
              onClick={() => setMenuOpen(false)}
              className="primary-action mt-1 text-sm"
              href={user ? "/#discover" : "/register-business"}
            >
              <Store size={16} />
              {user ? "Find an appointment" : "For local businesses"}
            </Link>
          ) : null}
        </nav>
      )}
    </header>
  );
}
