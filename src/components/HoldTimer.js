export default function HoldTimer({
  remainingSeconds,
  totalSeconds = 600,
  businessName,
  serviceName,
  date,
  time,
}) {
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");
  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  return (
    <div className="ticket-cut surface-flat overflow-hidden">
      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="eyebrow">Your time is held while you pay</p>
          <p className="mt-1 font-semibold">
            {businessName} · {serviceName}
          </p>
          <p className="time mt-1 text-sm">
            {date} · {time}
          </p>
          <p className="time mt-2 text-lg font-bold" aria-live="off">
            {minutes}:{seconds}
          </p>
        </div>
        <p className="eyebrow text-right">
          {remainingSeconds > 0 ? "hold remaining" : "hold ended"}
        </p>
      </div>
      <div
        className="hold-track"
        role="progressbar"
        aria-label="Time remaining in your slot hold"
        aria-valuemin={0}
        aria-valuemax={totalSeconds}
        aria-valuenow={remainingSeconds}
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
