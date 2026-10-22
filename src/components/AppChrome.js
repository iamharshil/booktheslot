"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [navigating, setNavigating] = useState(false);
  const businessWorkspace = pathname?.startsWith("/dashboard");

  useEffect(() => {
    if (previousPathname.current === pathname) return undefined;
    previousPathname.current = pathname;
    setNavigating(true);
    const timer = window.setTimeout(() => setNavigating(false), 460);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {!businessWorkspace && <Navbar />}
      {navigating && (
        <>
          <div className="route-loader" aria-hidden="true">
            <span />
          </div>
          <output className="sr-only">Loading page</output>
        </>
      )}
      <div
        className={`app-main${businessWorkspace ? " app-main-workspace" : ""}`}
      >
        <div
          className={`route-transition${businessWorkspace ? " route-transition-workspace" : ""}`}
          key={businessWorkspace ? undefined : pathname}
        >
          {children}
        </div>
      </div>
      {!businessWorkspace && <Footer />}
    </>
  );
}
