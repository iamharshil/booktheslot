export function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDateWindow(days, start = new Date(), timeZone) {
  const parsedDays = Number(days);
  const windowDays = Number.isFinite(parsedDays)
    ? Math.max(1, Math.floor(parsedDays) + 1)
    : 15;
  const list = [];
  const startDate = timeZone
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(start)
    : formatLocalDate(start);
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(`${startDate}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    list.push({
      dateStr,
      dayName: d.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }),
      monthName: d.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      dayNum: d.getUTCDate(),
      isToday: i === 0,
    });
  }
  return list;
}
