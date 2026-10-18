"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAvailableSlots, holdSlotAndOrder, verifyPayment } from "../lib/api";

export default function SlotPickerModal({
  isOpen,
  onClose,
  business,
  service,
}) {
  const router = useRouter();

  // Selected date state (defaults to today or tomorrow on client)
  const [selectedDate, setSelectedDate] = useState("");
  const [datesList, setDatesList] = useState([]);
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

  // Generate next 14 dates on client mount
  useEffect(() => {
    const curr = new Date();
    const list = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(curr);
      d.setDate(curr.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      list.push({ dateStr, dayName, monthName, dayNum, isToday: i === 0 });
    }
    setDatesList(list);
    setSelectedDate(list[0].dateStr);
  }, []);

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
      const holdRes = await holdSlotAndOrder({
        businessId: business._id,
        serviceId: service._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        customer,
      });

      const { booking, razorpayOrder, razorpayKeyId, isMockMode } =
        holdRes.data;

      // 2. Open Razorpay Checkout or handle Mock Development Mode
      if (typeof window !== "undefined" && window.Razorpay && !isMockMode) {
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
            color: "#6366f1",
          },
          handler: async (response) => {
            // 3. Verify Payment Signature
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
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setErrorMessage("Payment was dismissed. You can try again.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Development Sandbox Simulation: Automatically simulate seamless payment
        // Simulate short gateway confirmation delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const verifyRes = await verifyPayment({
          bookingId: booking._id,
          orderId: razorpayOrder.id,
          paymentId: `pay_dev_${Date.now()}`,
          signature: "dev_mock_signature",
        });

        if (verifyRes.success) {
          setPaymentSuccess(verifyRes.data);
          router.push(`/booking/${booking._id}`);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      if (err.status === 409 || err.code === "SLOT_UNAVAILABLE") {
        setIsConflict(true);
        setErrorMessage(
          err.message ||
            "This slot was just taken by another user. Please choose another time.",
        );
        // Refresh slot list to show updated availability
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Book Appointment</h2>
              <p className="text-xs text-slate-400">
                {business.name} • {service.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Snapshot Card */}
        <div className="px-6 py-3.5 bg-indigo-950/30 border-b border-indigo-500/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Duration: {service.durationMinutes} mins
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <Users className="w-3.5 h-3.5" />
              Staff Capacity: {service.capacity}{" "}
              {service.capacity > 1 ? "Employees" : "Employee"}
            </span>
          </div>
          <div className="text-base font-bold text-white">
            ₹{service.price}{" "}
            <span className="text-xs font-normal text-slate-400">
              inc. taxes
            </span>
          </div>
        </div>

        <form
          onSubmit={handleProceedToPayment}
          className="p-6 flex flex-col gap-6"
        >
          {/* Step 1: Date Selector Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Choose Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {datesList.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    type="button"
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-105"
                        : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {d.isToday ? "Today" : d.dayName}
                    </span>
                    <span className="text-base font-extrabold my-0.5">
                      {d.dayNum}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operating Shifts & Afternoon Break Notice */}
          {slotData?.intervals && (
            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">
                Daily Operating Shifts:
              </span>
              <div className="flex flex-wrap gap-2">
                {slotData.intervals.map((inv, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/20"
                  >
                    {inv.label || `Shift ${idx + 1}`}: {inv.open} – {inv.close}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Time Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Select Available Slot
              </label>
              {slotData && !slotData.isClosed && (
                <span className="text-xs text-slate-400">
                  {slotData.totalSlotsAvailable} slots open for{" "}
                  {service.durationMinutes}m session
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-xs">
                  Computing real-time slot availability...
                </span>
              </div>
            ) : slotData?.isClosed ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-300 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Store Closed</div>
                  <div className="text-amber-200/80">
                    {slotData.reason || "No hours scheduled for this date."}
                  </div>
                </div>
              </div>
            ) : slotData?.slots?.length === 0 ? (
              <div className="p-4 bg-slate-800/50 border border-white/[0.08] rounded-xl text-center text-xs text-slate-400">
                No available slots remaining for this date. Please pick another
                day.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {slotData?.slots?.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  const isMultiEmployee = slot.totalCapacity > 1;

                  return (
                    <button
                      type="button"
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500"
                          : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm text-white">
                          {slot.startTimeDisplay}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>to {slot.endTimeDisplay}</span>
                        {isMultiEmployee && (
                          <span
                            className={`font-semibold ${
                              slot.remainingCapacity === 1
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {slot.remainingCapacity} left
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
                <span className="font-semibold">
                  {isConflict ? "Slot Conflict: " : "Notice: "}
                </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Step 3: Customer Details Form */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              3. Customer Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
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
                  required
                  placeholder="Phone Number (e.g. +91 9876543210) *"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
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
              disabled={isSubmitting || !selectedSlot || slotData?.isClosed}
              className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing Slot & Launching Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{service.price} via Razorpay & Confirm Slot</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Atomic slot reservation lock prevents overbooking</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
