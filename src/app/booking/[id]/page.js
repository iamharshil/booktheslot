"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Printer,
  QrCode,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { cancelBooking, getBookingById } from "../../../lib/api";

export default function BookingConfirmationPage({ params }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [_cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getBookingById(bookingId)
      .then((res) => {
        if (isMounted && res.success) {
          setBooking(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Booking not found");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? Your slot will be released back to the store.",
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      const res = await cancelBooking(
        bookingId,
        "Customer requested cancellation",
      );
      if (res.success) {
        setBooking(res.data);
        setCancelSuccess(true);
      }
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">
          Retrieving your confirmed booking pass...
        </span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-2xl font-bold text-white">Booking Not Found</h2>
        <p className="text-sm text-slate-400">
          {error || "Could not find the requested booking record."}
        </p>
        <Link href="/" className="btn-secondary text-sm mt-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/store/${booking.businessId?.slug || ""}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-3.5 py-1.5 rounded-xl border border-white/[0.08] transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>
      </div>

      {/* Main Digital Ticket Pass */}
      <div className="glass-panel overflow-hidden border border-white/[0.15] shadow-2xl relative">
        {/* Ticket Header */}
        <div
          className={`p-6 sm:p-8 border-b border-white/[0.1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isCancelled
              ? "bg-rose-950/20"
              : "bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isCancelled
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {isCancelled ? (
                <XCircle className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Digital Booking Pass
                </span>
                <span
                  className={`badge ${
                    isCancelled ? "badge-rose" : "badge-emerald"
                  } text-[10px]`}
                >
                  {booking.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {isCancelled ? "Booking Cancelled" : "Appointment Confirmed!"}
              </h1>
            </div>
          </div>

          {/* Reference Badge */}
          <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Booking Reference
            </div>
            <div className="text-lg font-mono font-bold text-indigo-400 tracking-wider">
              {booking.bookingReference}
            </div>
          </div>
        </div>

        {/* Ticket Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Details (8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            {/* Store details */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Storefront
              </div>
              <h2 className="text-lg font-bold text-white">
                {booking.businessId?.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {booking.businessId?.address}, {booking.businessId?.city}
              </p>
              {booking.businessId?.phone && (
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {booking.businessId?.phone}
                </p>
              )}
            </div>

            {/* Scheduled Timing Banner */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Date</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {booking.date}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reserved Slot</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {booking.startTime} – {booking.endTime}
                </div>
              </div>
            </div>

            {/* Service & Customer details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-medium">Service</div>
                <div className="text-white font-bold text-sm mt-0.5">
                  {booking.serviceId?.name}
                </div>
                <div className="text-slate-400 mt-0.5">
                  {booking.durationMinutes} Minutes Session
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-medium">Reserved For</div>
                <div className="text-white font-bold text-sm mt-0.5">
                  {booking.customer?.name}
                </div>
                <div className="text-slate-400 mt-0.5">
                  {booking.customer?.phone}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Payment Status:</span>
                <span className="font-semibold text-emerald-400">
                  {booking.payment?.status} (₹{booking.amount})
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Order: {booking.payment?.orderId || "Mock Dev"}
              </span>
            </div>
          </div>

          {/* Right Pass Visual / QR Code Area (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/[0.08] rounded-xl text-center gap-3">
            <div className="w-32 h-32 bg-white rounded-xl p-2.5 shadow-lg flex items-center justify-center">
              {/* Graphical QR Code Placeholder */}
              <div className="w-full h-full border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-slate-800 p-2">
                <QrCode className="w-16 h-16 text-indigo-900" />
                <span className="text-[8px] font-mono font-bold tracking-tighter text-slate-700 mt-1">
                  {booking.bookingReference}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Present this pass or reference code upon arrival at the
              storefront.
            </div>

            {isConfirmed && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="mt-2 text-xs text-rose-400 hover:text-rose-300 transition-colors underline disabled:opacity-50"
              >
                {cancelling ? "Releasing slot..." : "Cancel Appointment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
