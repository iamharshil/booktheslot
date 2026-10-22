"use client";

import { AlertCircle, Clock, CreditCard, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getAvailableSlots,
  getProfile,
  holdSlotAndOrder,
  verifyPayment,
} from "../lib/api";
import { buildDateWindow } from "../lib/dates";
import { getAuthToken } from "../lib/session";
import DateStrip from "./DateStrip";
import HoldTimer from "./HoldTimer";
import SlotGrid from "./SlotGrid";

export default function SlotPickerModal({
  isOpen,
  onClose,
  business,
  service,
}) {
  const router = useRouter();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Selected date state (defaults to today or tomorrow on client)
  const [selectedDate, setSelectedDate] = useState("");
  const [datesList, setDatesList] = useState([]);
  const [datePage, setDatePage] = useState(0);
  const [densityByDate, setDensityByDate] = useState({});
  const [slotData, setSlotData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Customer form state
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Booking & payment processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConflict, setIsConflict] = useState(false);
  const [_paymentSuccess, setPaymentSuccess] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [holdDeadline, setHoldDeadline] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  useEffect(() => {
    if (!isOpen || !getAuthToken()) return undefined;
    let active = true;
    getProfile()
      .then((res) => {
        if (!active) return;
        const profile = res.data || {};
        setCustomer((current) => ({
          ...current,
          name: current.name || profile.name || "",
          email: current.email || profile.email || "",
          phone: current.phone || profile.phone || "",
        }));
      })
      .catch(() => {
        // The API will require a valid account session before it creates a hold.
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Use the store's bookable window, in the browser's local calendar (not UTC)
  useEffect(() => {
    const configuredDays = Number(business?.settings?.maxAdvanceDays ?? 5);
    const maxDays = Math.max(
      0,
      Math.min(Number.isFinite(configuredDays) ? configuredDays : 5, 365),
    );
    const list = buildDateWindow(
      maxDays,
      new Date(),
      business?.timezone || "Asia/Kolkata",
    );
    setDatesList(list);
    setDatePage(0);
    setSelectedDate((current) =>
      list.some((d) => d.dateStr === current) ? current : list[0].dateStr,
    );
  }, [business?.settings?.maxAdvanceDays, business?.timezone]);

  useEffect(() => {
    if (!isOpen || !business?._id || !service?._id || !datesList.length)
      return undefined;
    let active = true;
    const visibleDates = datesList.slice(datePage, datePage + 7);
    Promise.all(
      visibleDates.map(async ({ dateStr }) => {
        try {
          const result = await getAvailableSlots({
            businessId: business._id,
            serviceId: service._id,
            date: dateStr,
          });
          return [dateStr, result.data?.totalSlotsAvailable ?? 0];
        } catch {
          return [dateStr, undefined];
        }
      }),
    ).then((entries) => {
      if (active)
        setDensityByDate((current) => ({
          ...current,
          ...Object.fromEntries(
            entries.filter(([, count]) => count !== undefined),
          ),
        }));
    });
    return () => {
      active = false;
    };
  }, [isOpen, business?._id, service?._id, datesList, datePage]);

  useEffect(() => {
    if (!holdDeadline || !isOpen) return undefined;
    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((holdDeadline - Date.now()) / 1000),
      );
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        setPendingCheckout(null);
        setHoldDeadline(null);
        setRemainingSeconds(null);
        setErrorMessage(
          "Your hold ended. Choose a time again to start a new booking.",
        );
      }
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [holdDeadline, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    dialogRef.current?.querySelector("button, input, textarea")?.focus();
    return () => previousFocusRef.current?.focus?.();
  }, [isOpen]);

  // Load available slots whenever date or service changes
  useEffect(() => {
    if (!isOpen || !business?._id || !service?._id || !selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setErrorMessage("");
    setIsConflict(false);
    setSelectedSlot(null);

    getAvailableSlots({
      businessId: business._id,
      serviceId: service._id,
      date: selectedDate,
    })
      .then((res) => {
        if (isMounted && res.success) {
          setSlotData(res.data);
          setDensityByDate((current) => ({
            ...current,
            [selectedDate]: res.data?.totalSlotsAvailable ?? 0,
          }));
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || "Failed to fetch slots for this date");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingSlots(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, business?._id, service?._id, selectedDate]);

  if (!isOpen || !service) return null;

  // Handle Booking & Razorpay Payment
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!getAuthToken()) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!selectedSlot) {
      setErrorMessage("Please select a time slot.");
      return;
    }
    if (!customer.name || !customer.email || !customer.phone) {
      setErrorMessage("Please fill in your name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setIsConflict(false);

    try {
      // 1. Atomic Hold Slot & Order Creation
      let checkout = pendingCheckout;
      const holdMatchesSelection =
        pendingCheckout?.booking?.date === selectedDate &&
        pendingCheckout?.booking?.startTime === selectedSlot.startTime &&
        String(pendingCheckout?.booking?.businessId) === String(business._id) &&
        String(pendingCheckout?.booking?.serviceId) === String(service._id);
      if (
        !checkout ||
        !holdMatchesSelection ||
        !holdDeadline ||
        holdDeadline <= Date.now()
      ) {
        const holdRes = await holdSlotAndOrder({
          businessId: business._id,
          serviceId: service._id,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          customer,
        });
        const expiresAt = new Date(
          holdRes.data.holdExpiresAt || Date.now() + 600000,
        ).getTime();
        checkout = {
          ...holdRes.data,
          expiresAt,
          selectedDate,
          startTime: selectedSlot.startTime,
        };
        setPendingCheckout(checkout);
        setHoldDeadline(expiresAt);
      }
      const { booking, razorpayOrder, razorpayKeyId, isMockMode } = checkout;

      if (checkout.requiresPayment === false) {
        router.push(`/booking/${booking._id}`);
        return;
      }

      // 2. Open Razorpay Checkout or handle Mock Development Mode
      if (!isMockMode && typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: business.name,
          description: `${service.name} (${service.durationMinutes} mins)`,
          order_id: razorpayOrder.id,
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone,
          },
          theme: {
            color: "#ff5b2e",
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: "Pay by UPI",
                  instruments: [{ method: "upi" }],
                },
                other: {
                  name: "Other payment methods",
                  instruments: [
                    { method: "card" },
                    { method: "netbanking" },
                    { method: "wallet" },
                  ],
                },
              },
              sequence: ["block.upi", "block.other"],
              preferences: { show_default_blocks: false },
            },
          },
          handler: async (response) => {
            try {
              const verifyRes = await verifyPayment({
                bookingId: booking._id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                setPaymentSuccess(verifyRes.data);
                router.push(`/booking/${booking._id}`);
              }
            } catch (err) {
              setIsSubmitting(false);
              setErrorMessage(
                err.message ||
                  "Payment succeeded but confirmation failed. Contact the business before retrying.",
              );
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setErrorMessage("Payment was dismissed. You can try again.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          setIsSubmitting(false);
          setErrorMessage(
            response.error?.description || "Payment failed. You can try again.",
          );
        });
        rzp.open();
      } else if (isMockMode) {
        // Development Sandbox Simulation: Automatically simulate seamless payment
        // Simulate short gateway confirmation delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockPaymentId =
          checkout.mockPaymentId || `pay_dev_${booking._id}`;
        checkout = { ...checkout, mockPaymentId };
        setPendingCheckout(checkout);
        const verifyRes = await verifyPayment({
          bookingId: booking._id,
          orderId: razorpayOrder.id,
          paymentId: mockPaymentId,
          signature: "mock_signature",
        });

        if (verifyRes.success) {
          setPaymentSuccess(verifyRes.data);
          router.push(`/booking/${booking._id}`);
        }
      } else {
        throw new Error(
          "Payment checkout did not load. Try again when you have a stable connection.",
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      if (err.status === 409 || err.code === "SLOT_UNAVAILABLE") {
        setIsConflict(true);
        setErrorMessage(
          err.message ||
            "This slot was just taken by another user. Please choose another time.",
        );
        getAvailableSlots({
          businessId: business._id,
          serviceId: service._id,
          date: selectedDate,
        }).then((res) => {
          if (res.success) setSlotData(res.data);
        });
      } else {
        setErrorMessage(
          err.message || "Something went wrong. Please try again.",
        );
      }
    }
  };

  return (
    <div className="slot-picker-overlay fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/45 p-0 sm:items-center sm:p-5">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-picker-title"
        className="slot-picker-dialog relative my-0 max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-[var(--hairline)] bg-[var(--raised)] shadow-[var(--floating-shadow)] sm:rounded-2xl"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !isSubmitting) onClose();
          if (event.key !== "Tab") return;
          const focusable = [
            ...event.currentTarget.querySelectorAll(
              "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]",
            ),
          ];
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div>
              <h2
                id="slot-picker-title"
                className="text-lg font-bold tracking-tight"
              >
                Choose a time
              </h2>
              <p className="text-xs text-slate-400">
                {business.name} • {service.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close time picker"
            className="h-11 w-11 rounded-md flex items-center justify-center hover:bg-[var(--sunken)] disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Snapshot Card */}
        <div className="px-5 py-4 border-b border-[var(--hairline)] flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="eyebrow">
              Duration · {service.durationMinutes} min
            </span>
            <span className="eyebrow">
              Up to {service.capacity} bookings at once
            </span>
          </div>
          <div className="price text-xl font-bold">
            ₹{new Intl.NumberFormat("en-IN").format(service.price)}{" "}
            <span className="text-[11px] font-normal text-slate-400">
              all-inclusive
            </span>
          </div>
        </div>

        <form
          onSubmit={handleProceedToPayment}
          className="p-4 sm:p-6 flex flex-col gap-6"
        >
          {/* Step 1: Date Selector Chips */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Pick Date
              </label>
              <span className="text-[11px] text-indigo-400 font-medium">
                {Math.max(0, datesList.length - 1)} days ahead
              </span>
            </div>
            <DateStrip
              dates={datesList}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              availability={densityByDate}
              startIndex={datePage}
              onPageChange={setDatePage}
              disabled={Boolean(pendingCheckout && remainingSeconds > 0)}
            />
          </div>

          {/* Step 2: Time Slots Grid with Shifts & Afternoon Break Highlighting */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Available Time Slots
              </label>
              {slotData && !slotData.isClosed && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  {slotData.totalSlotsAvailable} available times ·{" "}
                  {service.durationMinutes}m session
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white/[0.01] rounded-2xl border border-white/[0.05]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs font-medium">
                  Checking available times...
                </span>
              </div>
            ) : slotData?.isClosed ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-300 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-bold">Store Closed On This Date</div>
                  <div className="text-amber-200/80 mt-0.5">
                    {slotData.reason ||
                      "No scheduled shifts or custom shutdown in place."}
                  </div>
                </div>
              </div>
            ) : slotData?.slots?.length === 0 ? (
              <div className="p-5 bg-slate-800/40 border border-white/[0.08] rounded-xl text-center text-xs text-slate-400">
                No bookable times are available for this day. Please select
                another date.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Visual Shift / Afternoon Break Divider if 2+ shifts exist */}
                {slotData?.intervals?.length > 1 && (
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Operating Shifts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {slotData.intervals.map((inv, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px] font-mono"
                        >
                          {inv.label || `Shift ${idx + 1}`}: {inv.open}–
                          {inv.close}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Slots Grid */}
                <SlotGrid
                  slots={slotData?.slots}
                  selectedSlot={selectedSlot}
                  onSelect={(slot) => {
                    if (remainingSeconds === 0) {
                      setPendingCheckout(null);
                      setHoldDeadline(null);
                      setRemainingSeconds(null);
                    }
                    setSelectedSlot(slot);
                  }}
                  disabled={Boolean(pendingCheckout && remainingSeconds > 0)}
                />

                {/* Selected Slot Confirmation Pill */}
                {selectedSlot && (
                  <div className="p-2.5 bg-[var(--sunken)] border border-[var(--hairline)] rounded-md flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>
                        Selected:{" "}
                        <strong>
                          {selectedSlot.startTimeDisplay} –{" "}
                          {selectedSlot.endTimeDisplay}
                        </strong>
                      </span>
                    </div>
                    <span className="eyebrow">Selected</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {pendingCheckout &&
            remainingSeconds !== null &&
            remainingSeconds > 0 && (
              <HoldTimer
                remainingSeconds={remainingSeconds}
                businessName={business.name}
                serviceName={service.name}
                date={selectedDate}
                time={selectedSlot?.startTimeDisplay || selectedSlot?.startTime}
              />
            )}

          {/* Concurrency Conflict or Error Notification */}
          {errorMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                isConflict
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {isConflict ? "Slot Conflict: " : "Notice: "}
                </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Step 3: Customer Details Form */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              3. Customer Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  autoComplete="name"
                  disabled={Boolean(pendingCheckout && remainingSeconds > 0)}
                  aria-label="Your name"
                  required
                  placeholder="Full Name *"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  autoComplete="email"
                  disabled={Boolean(pendingCheckout && remainingSeconds > 0)}
                  aria-label="Email address"
                  required
                  placeholder="Email Address *"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={Boolean(pendingCheckout && remainingSeconds > 0)}
                  aria-label="Phone number with country code"
                  required
                  placeholder="Phone Number (e.g. +91 9876543210) *"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <textarea
                  rows="2"
                  disabled={Boolean(pendingCheckout && remainingSeconds > 0)}
                  aria-label="Notes for the business"
                  placeholder="Notes for the store (optional)"
                  value={customer.notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, notes: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit / Checkout Button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedSlot ||
                slotData?.isClosed ||
                remainingSeconds === 0
              }
              className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Continue to payment · ₹
                    {new Intl.NumberFormat("en-IN").format(service.price)}
                  </span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <span>
                The selected time is held for 10 minutes while you complete
                payment.
              </span>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
