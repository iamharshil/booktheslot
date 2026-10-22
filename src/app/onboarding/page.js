"use client";

import { ArrowLeft, ArrowRight, CalendarCheck2, Compass, HeartHandshake, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Brand from "../../components/Brand";

const steps = [
  {
    icon: Compass,
    eyebrow: "Step 1 of 3 · Discover",
    title: "Find a place that feels right.",
    copy: "Explore local services by category or city. See what each business offers before you decide.",
    detail: "Salons · Wellness · Healthcare · and more",
  },
  {
    icon: CalendarCheck2,
    eyebrow: "Step 2 of 3 · Choose a time",
    title: "Your schedule comes first.",
    copy: "Pick a service, compare available times, and choose the appointment that works for your day.",
    detail: "Live availability · Simple online booking",
  },
  {
    icon: HeartHandshake,
    eyebrow: "Step 3 of 3 · You’re all set",
    title: "A little more time for you.",
    copy: "Your bookings stay together in one place, so it’s easy to check what’s coming up whenever you need to.",
    detail: "Your next good appointment is just around the corner.",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const step = steps[current];
  const Icon = step.icon;

  function completeOnboarding() {
    setCompleted(true);
    try {
      const alreadyCelebrated =
        window.localStorage.getItem("booktheslot_onboarding_celebrated") ===
        "true";
      if (!alreadyCelebrated) {
        window.localStorage.setItem("booktheslot_onboarding_celebrated", "true");
        setCelebrating(true);
        window.setTimeout(() => setCelebrating(false), 2600);
      }
    } catch {
      setCelebrating(true);
      window.setTimeout(() => setCelebrating(false), 2600);
    }
  }

  return (
    <main className="onboarding-page mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-8 sm:py-14">
      {celebrating && (
        <div className="onboarding-confetti" aria-hidden="true">
          {Array.from({ length: 56 }, (_, index) => (
            <span
              key={index}
              style={{
                "--confetti-x": `${(index * 47 + 13) % 100}%`,
                "--confetti-delay": `${(index % 14) * 35}ms`,
                "--confetti-hue": `${(index * 37 + 18) % 360}`,
                "--confetti-rotate": `${(index * 53) % 360}deg`,
              }}
            />
          ))}
        </div>
      )}
      <div className="grid w-full overflow-hidden rounded-3xl border border-[var(--hairline)] bg-[var(--raised)] shadow-[0_24px_80px_color-mix(in_oklab,var(--ink)_9%,transparent)] lg:min-h-[560px] lg:grid-cols-[.9fr_1.1fr]">
        <aside className="onboarding-art relative flex min-h-56 flex-col justify-between overflow-hidden p-6 text-white sm:min-h-72 sm:p-9 lg:min-h-full lg:p-12">
          <div className="relative z-10"><Brand inverse /></div>
          <div className="relative z-10 mt-12 max-w-sm lg:mt-0">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/70">A better way to make time</p>
            <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-.04em] sm:text-3xl">Good care starts with a good booking.</p>
          </div>
          <div className="onboarding-orbit onboarding-orbit-one" aria-hidden="true" />
          <div className="onboarding-orbit onboarding-orbit-two" aria-hidden="true" />
        </aside>

        <section className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-14" aria-live="polite">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-medium text-[var(--muted-ink)] hover:text-[var(--ink)]">BookTheSlot</Link>
            <Link href="/#discover" className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted-ink)] hover:bg-[var(--sunken)] hover:text-[var(--ink)]">Skip intro</Link>
          </div>

          <div key={current} className="onboarding-step-enter">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--pine)_11%,var(--raised))] text-[var(--pine)]"><Icon size={25} strokeWidth={1.8} /></div>
            <p className="eyebrow mt-7">{step.eyebrow}</p>
            <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight tracking-[-.045em] sm:text-4xl">{step.title}</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--muted-ink)]">{step.copy}</p>
            <p className="mt-6 inline-flex rounded-full border border-[var(--hairline)] bg-[var(--sunken)] px-3.5 py-2 text-xs font-medium text-[var(--muted-ink)]">{step.detail}</p>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-[var(--hairline)] pt-6">
            <div className="flex items-center gap-2" aria-label={`Page ${current + 1} of 3`}>
              {steps.map((item, index) => <span key={item.eyebrow} className={`h-2 rounded-full transition-all ${index === current ? "w-7 bg-[var(--pine)]" : "w-2 bg-[color-mix(in_oklab,var(--ink)_18%,transparent)]"}`} />)}
            </div>
            {current > 0 && <button type="button" onClick={() => setCurrent(current - 1)} className="secondary-action mr-auto ml-4 min-h-11 px-3" aria-label="Previous step"><ArrowLeft size={17} /></button>}
            {current < steps.length - 1 ? (
              <button type="button" onClick={() => setCurrent(current + 1)} className="primary-action ml-auto min-h-11">Continue <ArrowRight size={17} /></button>
            ) : !completed ? (
              <button type="button" onClick={completeOnboarding} className="primary-action ml-auto min-h-11">Finish onboarding <Sparkles size={17} /></button>
            ) : (
              <Link href="/#discover" className="primary-action ml-auto min-h-11">Explore businesses <ArrowRight size={17} /></Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
