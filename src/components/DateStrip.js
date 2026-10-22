"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateStrip({
  dates,
  selectedDate,
  onSelect,
  availability,
  startIndex,
  onPageChange,
  disabled = false,
}) {
  const page = dates.slice(startIndex, startIndex + 7);
  const hasPrevious = startIndex > 0;
  const hasNext = startIndex + 7 < dates.length;
  const maxSlots = Math.max(
    0,
    ...page.map((day) => availability[day.dateStr] ?? 0),
  );

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous dates"
        disabled={disabled || !hasPrevious}
        onClick={() => onPageChange(Math.max(0, startIndex - 7))}
        className="min-h-11 min-w-11 rounded-md border border-[var(--hairline)] disabled:opacity-35"
      >
        <ChevronLeft aria-hidden="true" size={17} />
      </button>
      <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5 sm:grid-cols-7">
        {page.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          const count = availability[day.dateStr];
          const density =
            maxSlots > 0 && count !== undefined
              ? Math.max(8, (count / maxSlots) * 100)
              : 0;
          return (
            <button
              key={day.dateStr}
              type="button"
              disabled={disabled}
              className={`date-chip flex min-h-[72px] min-w-0 flex-col items-center justify-center rounded-md border px-1.5 py-2 text-xs transition-colors disabled:opacity-60 ${isSelected ? "border-[var(--vermilion)] bg-[var(--vermilion)] font-bold" : "border-[var(--hairline)] bg-[var(--raised)] hover:bg-[var(--sunken)]"}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(day.dateStr)}
            >
              <span className="eyebrow text-[9px]">
                {day.isToday ? "Today" : day.dayName}
              </span>
              <span className="time my-0.5 text-base">{day.dayNum}</span>
              <span className="text-[10px]">{day.monthName}</span>
              <span
                className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--sunken)]"
                aria-hidden="true"
              >
                <span
                  className="block h-full bg-[var(--pine)]"
                  style={{ width: `${density}%` }}
                />
              </span>
              <span className="sr-only">
                {count === undefined
                  ? "Availability not checked"
                  : count === 0
                    ? "No times currently available"
                    : `${count} available times`}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Next dates"
        disabled={disabled || !hasNext}
        onClick={() => onPageChange(Math.min(dates.length - 1, startIndex + 7))}
        className="min-h-11 min-w-11 rounded-md border border-[var(--hairline)] disabled:opacity-35"
      >
        <ChevronRight aria-hidden="true" size={17} />
      </button>
    </div>
  );
}
