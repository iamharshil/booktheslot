import assert from "node:assert/strict";
import test from "node:test";
import { buildDateWindow, formatLocalDate } from "./dates.js";

test("formatLocalDate uses the local calendar day, not UTC", () => {
  const local = new Date(2026, 10, 2, 23, 30, 0);
  assert.equal(formatLocalDate(local), "2026-11-02");
});

test("buildDateWindow honours maxAdvanceDays and marks today", () => {
  const start = new Date(2026, 0, 1, 9, 0, 0);
  const list = buildDateWindow(7, start);
  assert.equal(list.length, 8);
  assert.equal(list[0].dateStr, "2026-01-01");
  assert.equal(list[0].isToday, true);
  assert.equal(list[7].dateStr, "2026-01-08");
});

test("a zero-day advance window includes today only", () => {
  const list = buildDateWindow(0, new Date(2026, 0, 1, 9, 0, 0));
  assert.equal(list.length, 1);
  assert.equal(list[0].dateStr, "2026-01-01");
});
