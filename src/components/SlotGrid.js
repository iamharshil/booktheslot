"use client";

import { Check } from "lucide-react";

export default function SlotGrid({
  slots,
  selectedSlot,
  onSelect,
  disabled = false,
}) {
  if (!slots?.length)
    return (
      <div className="hatch rounded-md border border-[var(--hairline)] px-5 py-8 text-center text-sm">
        No times are available for this date. Choose another day.
      </div>
    );

  return (
    <fieldset className="grid min-w-0 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 max-h-64">
      <legend className="sr-only">Available appointment times</legend>
      {slots.map((slot) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;
        const fewLeft = slot.totalCapacity > 1 && slot.remainingCapacity === 1;
        return (
          <button
            key={slot.startTime}
            type="button"
            aria-pressed={isSelected}
            data-slot-chip="true"
            disabled={disabled}
            aria-label={`${slot.startTimeDisplay} to ${slot.endTimeDisplay}${fewLeft ? ", one place left" : ""}`}
            tabIndex={
              selectedSlot
                ? isSelected
                  ? 0
                  : -1
                : slots[0]?.startTime === slot.startTime
                  ? 0
                  : -1
            }
            onKeyDown={(event) => {
              const buttons = [
                ...event.currentTarget.parentElement.querySelectorAll(
                  '[data-slot-chip="true"]:not([disabled])',
                ),
              ];
              const direction = {
                ArrowRight: 1,
                ArrowDown: 1,
                ArrowLeft: -1,
                ArrowUp: -1,
              }[event.key];
              if (direction) {
                event.preventDefault();
                const current = buttons.indexOf(event.currentTarget);
                const next =
                  (current + direction + buttons.length) % buttons.length;
                buttons[next]?.focus();
                buttons[next]?.click();
              }
            }}
            onClick={() => onSelect(slot)}
            className="slot-chip flex min-h-12 flex-col justify-between rounded-md border border-[var(--hairline)] bg-[var(--raised)] p-3 text-left"
          >
            <span className="flex w-full items-center justify-between">
              <span className="time text-sm font-bold">
                {slot.startTimeDisplay}
              </span>
              {isSelected && <Check aria-hidden="true" size={16} />}
            </span>
            <span className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[var(--muted-ink)]">
              <span>Ends {slot.endTimeDisplay}</span>
              {slot.totalCapacity > 1 && (
                <span className="font-semibold">
                  {slot.remainingCapacity} {fewLeft ? "left" : "places"}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
