export function formatDisplayDate(value, fallback = "-") {
  if (!value) return fallback;

  const raw = String(value);
  const datePart = raw.split("T")[0];
  const isoMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${month}/${day}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDateTime(value, fallback = "-") {
  if (!value) return fallback;

  const raw = String(value);
  const date = formatDisplayDate(raw, fallback);
  const timeMatch = raw.match(/T(\d{2}:\d{2})/);

  if (timeMatch) return `${date} · ${timeMatch[1]}`;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return date;

  return `${date} · ${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed)}`;
}
