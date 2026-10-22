"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Download,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { cancelBooking, getBookingById } from "../../../lib/api";

function displayTime(value, format = "12h") {
  const [hours, minutes] = (value || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  if (format === "24h")
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function displayDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BookingConfirmationPage({ params }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
        setBooking((current) => ({
          ...current,
          status: res.data?.status || "CANCELLED",
        }));
      }
    } catch (err) {
      toast.error(`Failed to cancel: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector("#qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `booking-${booking.bookingReference}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-slate-400">
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
  const isExpired = booking.status === "EXPIRED";
  const isPending = booking.status === "PENDING_PAYMENT";
  const isAwaitingApproval = booking.status === "PENDING_APPROVAL";
  const isRejected = booking.status === "REJECTED";
  const isCompleted = booking.status === "COMPLETED";
  const statusTitle = isRejected
    ? "Request declined"
    : isAwaitingApproval
      ? "Awaiting business approval"
      : isCancelled
        ? "Booking Cancelled"
        : isExpired
          ? "Reservation Expired"
          : isPending
            ? "Payment Pending"
            : isCompleted
              ? "Appointment completed"
              : "Appointment confirmed";
  const statusBadgeClass =
    isCancelled || isRejected || isExpired
      ? "badge-rose"
      : isPending
        ? "badge-amber"
        : "badge-emerald";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-8 sm:py-12">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      <div className="ticket-cut glass-panel overflow-hidden border border-white/[0.15] relative">
        {/* Ticket Header */}
        <div
          className={`p-6 sm:p-8 border-b border-white/[0.1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isCancelled || isExpired
              ? "bg-rose-950/20"
              : isPending
                ? "bg-amber-950/20"
                : "pass-confirmed"
          }`}
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Digital Booking Pass
                </span>
                <span className={`badge ${statusBadgeClass} text-[10px]`}>
                  {booking.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {statusTitle}
              </h1>
            </div>
          </div>

          {/* Reference Badge */}
          <div className="max-w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-right sm:shrink-0">
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
                  {displayDate(booking.date)}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reserved Slot</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {displayTime(
                    booking.startTime,
                    booking.businessId?.settings?.timeFormat,
                  )}{" "}
                  –{" "}
                  {displayTime(
                    booking.endTime,
                    booking.businessId?.settings?.timeFormat,
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {booking.businessId?.timezone === "Asia/Kolkata" ||
                  !booking.businessId?.timezone
                    ? "India Standard Time (IST)"
                    : booking.businessId.timezone}
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
                  {booking.customer?.name || "Your appointment"}
                </div>
                {booking.customer?.phone && (
                  <div className="text-slate-400 mt-0.5">
                    {booking.customer.phone}
                  </div>
                )}
                {!booking.customer && (
                  <div className="text-slate-400 mt-0.5">
                    Customer details are private on this public pass.
                  </div>
                )}
                {booking.customer?.notes ? (
                  <div className="text-slate-500 mt-1 italic">
                    “{booking.customer.notes}”
                  </div>
                ) : null}
              </div>
            </div>

            {/* Payment Details */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-xs">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Payment Status:</span>
                <span className="font-semibold text-emerald-400">
                  {booking.payment?.status} (₹
                  {new Intl.NumberFormat("en-IN").format(booking.amount)})
                </span>
              </div>
              {booking.payment?.orderId && (
                <span className="font-mono text-[11px] text-slate-500">
                  Order: {booking.payment.orderId}
                </span>
              )}
            </div>
          </div>

          {/* Right Pass Visual / QR Code Area (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/[0.08] rounded-xl text-center gap-3">
            <div className="w-32 h-32 bg-white rounded-xl p-2.5 shadow-lg flex items-center justify-center">
              <QRCodeSVG
                id="qr-code-svg"
                value={booking.bookingReference}
                size={112}
                level="H"
                includeMargin={false}
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadQR}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR Code</span>
            </button>

            <div className="text-[11px] text-slate-400">
              Present this pass or reference code upon arrival at the
              storefront.
            </div>

            {(isConfirmed || isPending) && booking.userId && (
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
