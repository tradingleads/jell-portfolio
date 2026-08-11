"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronDown, Clock, Globe, Video, MonitorPlay,
  Check, ArrowLeft, User, Mail, CalendarX, Loader2, AlertCircle, ArrowUpRight, Search,
} from "lucide-react";
import { BOOKING_CONFIG, CUSTOM_QUESTIONS, LOCATIONS } from "@/lib/bookingConfig";

type LocationId = (typeof LOCATIONS)[number]["id"];
type Step = "pick" | "details" | "done";
type BusyInterval = { start: string; end: string };

const LOCATION_ICONS: Record<LocationId, typeof Video> = { zoom: Video, meet: MonitorPlay };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TZ_GROUPS: { region: string; zones: { zone: string; label: string }[] }[] = [
  { region: "US/Canada", zones: [
    { zone: "America/Los_Angeles", label: "Pacific Time - US & Canada" },
    { zone: "America/Denver", label: "Mountain Time - US & Canada" },
    { zone: "America/Chicago", label: "Central Time - US & Canada" },
    { zone: "America/New_York", label: "Eastern Time - US & Canada" },
    { zone: "America/Anchorage", label: "Alaska Time" },
    { zone: "Pacific/Honolulu", label: "Hawaii Time" },
  ] },
  { region: "America", zones: [
    { zone: "America/Mexico_City", label: "Mexico City" },
    { zone: "America/Bogota", label: "Bogota / Lima / Quito" },
    { zone: "America/Sao_Paulo", label: "Sao Paulo" },
    { zone: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  ] },
  { region: "Europe", zones: [
    { zone: "Europe/London", label: "London" },
    { zone: "Europe/Paris", label: "Paris / Berlin / Rome" },
    { zone: "Europe/Amsterdam", label: "Amsterdam" },
    { zone: "Europe/Madrid", label: "Madrid" },
    { zone: "Europe/Athens", label: "Athens" },
    { zone: "Europe/Moscow", label: "Moscow" },
  ] },
  { region: "Africa", zones: [
    { zone: "Africa/Cairo", label: "Cairo" },
    { zone: "Africa/Johannesburg", label: "Johannesburg" },
    { zone: "Africa/Lagos", label: "Lagos" },
    { zone: "Africa/Nairobi", label: "Nairobi" },
  ] },
  { region: "Asia", zones: [
    { zone: "Asia/Dubai", label: "Dubai" },
    { zone: "Asia/Karachi", label: "Karachi" },
    { zone: "Asia/Kolkata", label: "Delhi / Kolkata" },
    { zone: "Asia/Dhaka", label: "Dhaka" },
    { zone: "Asia/Bangkok", label: "Bangkok" },
    { zone: "Asia/Jakarta", label: "Jakarta" },
    { zone: "Asia/Singapore", label: "Singapore" },
    { zone: "Asia/Hong_Kong", label: "Hong Kong" },
    { zone: "Asia/Shanghai", label: "Shanghai" },
    { zone: "Asia/Tokyo", label: "Tokyo" },
    { zone: "Asia/Seoul", label: "Seoul" },
    { zone: "Asia/Manila", label: "Manila" },
  ] },
  { region: "Australia", zones: [
    { zone: "Australia/Perth", label: "Perth" },
    { zone: "Australia/Adelaide", label: "Adelaide" },
    { zone: "Australia/Brisbane", label: "Brisbane" },
    { zone: "Australia/Sydney", label: "Sydney / Melbourne" },
  ] },
  { region: "Pacific", zones: [
    { zone: "Pacific/Auckland", label: "Auckland" },
    { zone: "Pacific/Fiji", label: "Fiji" },
  ] },
  { region: "UTC", zones: [
    { zone: "Etc/UTC", label: "UTC" },
  ] },
];

const E = [0.16, 1, 0.3, 1] as const;

/* ── Timezone-aware date helpers ─────────────────────────────────
   JS Date has no named-timezone constructor, so wall-clock times in
   a given IANA zone are resolved by comparing how the same instant
   formats in that zone vs. UTC and correcting for the difference. */
const pad = (n: number) => String(n).padStart(2, "0");

function dateKeyInTz(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function wallTimeToUtc(dateKey: string, hh: number, mm: number, tz: string) {
  const guess = new Date(`${dateKey}T${pad(hh)}:${pad(mm)}:00Z`);
  const asTz = new Date(guess.toLocaleString("en-US", { timeZone: tz }));
  const asUtc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(guess.getTime() + (asUtc.getTime() - asTz.getTime()));
}

function addDaysToKey(dateKey: string, delta: number) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function weekdayOfDateKey(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function cellKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function offsetLabel(tz: string) {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
    .formatToParts(new Date()).find(p => p.type === "timeZoneName");
  return part?.value ?? "";
}

function currentTimeLabel(tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true })
    .formatToParts(new Date());
  const hour = parts.find(p => p.type === "hour")?.value ?? "";
  const minute = parts.find(p => p.type === "minute")?.value ?? "";
  const period = (parts.find(p => p.type === "dayPeriod")?.value ?? "").toLowerCase();
  return `${hour}:${minute}${period}`;
}

/* "1pm" / "1:30pm" — no leading zero on the hour, no ":00" on the hour, lowercase period. */
function formatSlotTime(d: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(d);
  const hour = parts.find(p => p.type === "hour")?.value ?? "";
  const minute = parts.find(p => p.type === "minute")?.value ?? "00";
  const period = (parts.find(p => p.type === "dayPeriod")?.value ?? "").toLowerCase();
  return minute === "00" ? `${hour}${period}` : `${hour}:${minute}${period}`;
}

/* Formats a slot as "start - end" in the given timezone — both endpoints are
   converted from their own absolute UTC instant, so each resolves correctly
   even across a DST or day boundary between them. */
function formatSlotRange(slot: Date, tz: string, durationMinutes: number) {
  const slotEnd = new Date(slot.getTime() + durationMinutes * 60 * 1000);
  return `${formatSlotTime(slot, tz)} - ${formatSlotTime(slotEnd, tz)}`;
}

function buildMonthGrid(viewYear: number, viewMonth: number) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    cells.push({ date: new Date(viewYear, viewMonth, dayNum), inMonth: dayNum >= 1 && dayNum <= daysInMonth });
  }
  return cells;
}

/* 30 min between the start of one appointment slot and the next, so each
   30-min appointment is followed by a 30-min buffer before the next one. */
const SLOT_BUFFER_MINUTES = 30;

/* One host-local day's bookable start times, as absolute UTC instants.
   Slots run every (duration + buffer) minutes from the start of the window;
   whatever trailing gap is left before the window closes gets one final
   back-to-back slot so the last bookable slot always ends exactly at close. */
function hostSlotsForDay(hostDateKey: string, hostTz: string) {
  if (BOOKING_CONFIG.blockedDates.includes(hostDateKey)) return [];
  if (!BOOKING_CONFIG.workingDays.includes(weekdayOfDateKey(hostDateKey))) return [];

  const [sh, sm] = BOOKING_CONFIG.workingHours.start.split(":").map(Number);
  const [eh, em] = BOOKING_CONFIG.workingHours.end.split(":").map(Number);
  const breaks = BOOKING_CONFIG.breaks.map(b => {
    const [bsh, bsm] = b.start.split(":").map(Number);
    const [beh, bem] = b.end.split(":").map(Number);
    return { start: bsh * 60 + bsm, end: beh * 60 + bem };
  });

  const windowStart = sh * 60 + sm;
  const windowEnd = eh * 60 + em;
  const duration = BOOKING_CONFIG.durationMinutes;
  const cadence = duration + SLOT_BUFFER_MINUTES;

  const starts: number[] = [];
  for (let t = windowStart; t + duration <= windowEnd; t += cadence) {
    starts.push(t);
  }
  const finalStart = windowEnd - duration;
  if (starts.length === 0 || finalStart > starts[starts.length - 1]) {
    starts.push(finalStart);
  }

  const slots: Date[] = [];
  for (const t of starts) {
    if (breaks.some(b => t < b.end && t + duration > b.start)) continue;
    slots.push(wallTimeToUtc(hostDateKey, Math.floor(t / 60), t % 60, hostTz));
  }
  return slots;
}

function isBusy(slotStart: Date, durationMinutes: number, busy: BusyInterval[]) {
  const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
  return busy.some(b => slotStart < new Date(b.end) && slotEnd > new Date(b.start));
}

/* ── Root component ────────────────────────────────────────────── */
export default function BookingCalendar() {
  const [visitorTz, setVisitorTz] = useState(BOOKING_CONFIG.hostTimeZone);

  const nowRef = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKeyInTz(nowRef, visitorTz), [nowRef, visitorTz]);

  const initialNow = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(initialNow.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialNow.getMonth());

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  // Locks the card to its very first rendered height (calendar visible, nothing
  // selected/open yet) so opening the timezone dropdown, selecting a date, or
  // moving to the details form never grows the card — each side scrolls
  // internally within this fixed height instead.
  const cardBodyRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = cardBodyRef.current;
    if (!el) return;
    setCardHeight(el.getBoundingClientRect().height);
  }, []);

  const [busyIntervals, setBusyIntervals] = useState<BusyInterval[]>([]);
  const [monthLoading, setMonthLoading] = useState(true);
  const [availabilityConfigured, setAvailabilityConfigured] = useState(true);

  const [location, setLocation] = useState<LocationId>(LOCATIONS[0].id);
  const [step, setStep] = useState<Step>("pick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<string[]>(() => CUSTOM_QUESTIONS.map(() => ""));
  const [errors, setErrors] = useState<{ name?: string; email?: string; answers?: (string | undefined)[] }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ meetLink: string | null; htmlLink: string | null } | null>(null);

  const [tzOpen, setTzOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState("");
  const [tzActiveIndex, setTzActiveIndex] = useState(0);
  const tzContainerRef = useRef<HTMLDivElement>(null);
  const tzInputRef = useRef<HTMLInputElement>(null);
  const tzListRef = useRef<HTMLDivElement>(null);

  // Recomputed whenever the dropdown opens, so the times on display reflect "now".
  const tzGroups = useMemo(
    () => TZ_GROUPS.map(group => ({
      region: group.region,
      zones: group.zones.map(({ zone, label }) => ({ zone, label, time: currentTimeLabel(zone) })),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tzOpen]
  );

  const filteredTzGroups = useMemo(() => {
    const q = tzQuery.trim().toLowerCase();
    if (!q) return tzGroups;
    return tzGroups
      .map(group => ({
        region: group.region,
        zones: group.zones.filter(z => z.label.toLowerCase().includes(q) || group.region.toLowerCase().includes(q)),
      }))
      .filter(group => group.zones.length > 0);
  }, [tzGroups, tzQuery]);

  const flatFilteredZones = useMemo(() => filteredTzGroups.flatMap(g => g.zones), [filteredTzGroups]);
  const tzIndexByZone = useMemo(() => new Map(flatFilteredZones.map((z, i) => [z.zone, i])), [flatFilteredZones]);

  const selectedTzLabel = useMemo(() => {
    for (const group of TZ_GROUPS) {
      const found = group.zones.find(z => z.zone === visitorTz);
      if (found) return `${found.label} (${offsetLabel(visitorTz)})`;
    }
    return visitorTz;
  }, [visitorTz]);

  // Reset search state and focus the input whenever the dropdown opens.
  useEffect(() => {
    if (!tzOpen) return;
    setTzQuery("");
    setTzActiveIndex(0);
    tzInputRef.current?.focus();
  }, [tzOpen]);

  useEffect(() => { setTzActiveIndex(0); }, [tzQuery]);

  // Keep the highlighted option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (!tzOpen) return;
    const el = tzListRef.current?.querySelector(`[data-tz-index="${tzActiveIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [tzActiveIndex, tzOpen]);

  // Close on outside click.
  useEffect(() => {
    if (!tzOpen) return;
    function handleClick(e: MouseEvent) {
      if (tzContainerRef.current && !tzContainerRef.current.contains(e.target as Node)) setTzOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tzOpen]);

  function handleTzKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setTzActiveIndex(i => Math.min(i + 1, flatFilteredZones.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setTzActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = flatFilteredZones[tzActiveIndex];
      if (opt) { setVisitorTz(opt.zone); setTzOpen(false); }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTzOpen(false);
    }
  }

  // Jump the visible month back to "today" (in the newly chosen zone) and
  // drop any in-progress selection, since its meaning has shifted.
  useEffect(() => {
    const [y, m] = todayKey.split("-").map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setSelectedDateKey(null);
    setSelectedSlot(null);
    setStep("pick");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorTz]);

  // Pull real busy blocks for the visible month so slots reflect the actual calendar.
  useEffect(() => {
    setMonthLoading(true);
    const cells = buildMonthGrid(viewYear, viewMonth);
    const first = cells[0].date;
    const last = cells[cells.length - 1].date;
    const rangeStart = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    const rangeEnd = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    const controller = new AbortController();

    fetch(`/api/availability?start=${encodeURIComponent(rangeStart.toISOString())}&end=${encodeURIComponent(rangeEnd.toISOString())}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        setBusyIntervals(Array.isArray(data.busy) ? data.busy : []);
        setAvailabilityConfigured(data.configured !== false);
      })
      .catch(err => { if (err?.name !== "AbortError") setBusyIntervals([]); })
      .finally(() => setMonthLoading(false));

    return () => controller.abort();
  }, [viewYear, viewMonth]);

  const monthAvailability = useMemo(() => {
    const map = new Map<string, Date[]>();
    const cells = buildMonthGrid(viewYear, viewMonth);
    const now = new Date();
    for (const { date, inMonth } of cells) {
      if (!inMonth) continue;
      const key = cellKey(date);
      if (key < todayKey) { map.set(key, []); continue; }
      const candidates = [addDaysToKey(key, -1), key, addDaysToKey(key, 1)]
        .flatMap(hostKey => hostSlotsForDay(hostKey, BOOKING_CONFIG.hostTimeZone));
      const slots = candidates
        .filter(instant => dateKeyInTz(instant, visitorTz) === key)
        .filter(instant => instant.getTime() > now.getTime())
        .filter(instant => !isBusy(instant, BOOKING_CONFIG.durationMinutes, busyIntervals))
        .sort((a, b) => a.getTime() - b.getTime());
      map.set(key, slots);
    }
    return map;
  }, [viewYear, viewMonth, visitorTz, todayKey, busyIntervals]);

  const canGoPrev = !(viewYear === Number(todayKey.slice(0, 4)) && viewMonth === Number(todayKey.slice(5, 7)) - 1);
  const daySlots = selectedDateKey ? (monthAvailability.get(selectedDateKey) ?? []) : [];

  function goToMonth(dir: -1 | 1) {
    setViewMonth(m => {
      let nm = m + dir, ny = viewYear;
      if (nm < 0) { nm = 11; ny -= 1; }
      if (nm > 11) { nm = 0; ny += 1; }
      setViewYear(ny);
      return nm;
    });
  }

  function selectDate(key: string) {
    setSelectedDateKey(key);
    setSelectedSlot(null);
  }

  function jumpToDate(key: string) {
    const [y, m] = key.split("-").map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    selectDate(key);
  }

  function findNextAvailableKey(fromKey: string) {
    let cursor = fromKey;
    for (let i = 0; i < 45; i++) {
      cursor = addDaysToKey(cursor, 1);
      const candidates = [addDaysToKey(cursor, -1), cursor, addDaysToKey(cursor, 1)]
        .flatMap(hostKey => hostSlotsForDay(hostKey, BOOKING_CONFIG.hostTimeZone));
      const has = candidates.some(instant => dateKeyInTz(instant, visitorTz) === cursor && instant.getTime() > Date.now());
      if (has) return cursor;
    }
    return null;
  }

  function pickSlot(slot: Date) {
    setSelectedSlot(slot);
    setStep("details");
  }

  function updateAnswer(i: number, value: string) {
    setAnswers(prev => { const next = [...prev]; next[i] = value; return next; });
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    const next: { name?: string; email?: string; answers?: (string | undefined)[] } = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!email.trim()) next.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";

    const answerErrors = CUSTOM_QUESTIONS.map((_, i) => (answers[i]?.trim() ? undefined : "This field is required"));
    if (answerErrors.some(Boolean)) next.answers = answerErrors;

    setErrors(next);
    if (Object.keys(next).length > 0 || !selectedSlot) return;

    setSubmitError(null);
    setSubmitting(true);

    fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        startIso: selectedSlot.toISOString(),
        durationMinutes: BOOKING_CONFIG.durationMinutes,
        eventTitle: BOOKING_CONFIG.eventTitle,
        location,
        visitorTimeZone: visitorTz,
        answers: CUSTOM_QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] ?? "" })),
      }),
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Something went wrong. Please try again.");
        setBookingResult({ meetLink: data.meetLink ?? null, htmlLink: data.htmlLink ?? null });
        setStep("done");
      })
      .catch(err => setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again."))
      .finally(() => setSubmitting(false));
  }

  const locationLabel = LOCATIONS.find(l => l.id === location)?.label ?? LOCATIONS[0].label;

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[2rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_48px_-16px_rgba(0,0,0,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_20px_48px_-16px_rgba(0,0,0,0.7)] overflow-hidden">
      <div
        ref={cardBodyRef}
        className="grid grid-cols-1 lg:grid-cols-[280px_1fr]"
        style={cardHeight ? { ["--card-h" as string]: `${cardHeight}px` } : undefined}
      >

        {/* ── Event info panel — driven by lib/bookingConfig.ts ──── */}
        <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 lg:h-[var(--card-h)] lg:overflow-y-auto">
          {BOOKING_CONFIG.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={BOOKING_CONFIG.avatarUrl} alt={BOOKING_CONFIG.hostName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-sm font-semibold">
              {BOOKING_CONFIG.avatarInitials}
            </div>
          )}
          <p className="mt-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">{BOOKING_CONFIG.hostName}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug">
            {BOOKING_CONFIG.eventTitle}
          </h3>

          <div className="mt-5 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2.5">
              <Clock size={16} strokeWidth={1.5} className="shrink-0" />
              <span>{BOOKING_CONFIG.duration}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Video size={16} strokeWidth={1.5} className="shrink-0" />
              <span>{BOOKING_CONFIG.locationText}</span>
            </div>
            <div ref={tzContainerRef}>
              <div className="flex items-center gap-2.5">
                <Globe size={16} strokeWidth={1.5} className="shrink-0" />
                <button
                  type="button"
                  onClick={() => setTzOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={tzOpen}
                  aria-label="Timezone"
                  className="flex-1 min-w-0 flex items-center justify-between gap-2 bg-transparent text-sm text-neutral-600 dark:text-neutral-400 border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white pr-4 py-0.5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <span className="truncate text-left">{selectedTzLabel}</span>
                  <ChevronDown
                    size={11}
                    strokeWidth={1.5}
                    className={`shrink-0 text-neutral-400 transition-transform duration-200 ${tzOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {tzOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 px-3 py-2.5">
                        <Search size={14} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
                        <input
                          ref={tzInputRef}
                          value={tzQuery}
                          onChange={e => setTzQuery(e.target.value)}
                          onKeyDown={handleTzKeyDown}
                          placeholder="Search timezone..."
                          aria-label="Search timezone"
                          className="w-full min-w-0 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                        />
                      </div>

                      <div ref={tzListRef} role="listbox" className="max-h-48 overflow-y-auto py-1.5">
                        {flatFilteredZones.length === 0 ? (
                          <p className="px-3 py-4 text-sm text-neutral-400 text-center">No matching timezone</p>
                        ) : (
                          filteredTzGroups.map(group => (
                            <div key={group.region}>
                              <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                                {group.region}
                              </p>
                              {group.zones.map(opt => {
                                const flatIndex = tzIndexByZone.get(opt.zone) ?? -1;
                                const isActive = flatIndex === tzActiveIndex;
                                const isSelected = opt.zone === visitorTz;
                                return (
                                  <button
                                    key={opt.zone}
                                    type="button"
                                    data-tz-index={flatIndex}
                                    role="option"
                                    aria-selected={isSelected}
                                    title={opt.label}
                                    onMouseEnter={() => setTzActiveIndex(flatIndex)}
                                    onClick={() => { setVisitorTz(opt.zone); setTzOpen(false); }}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-left ${
                                      isActive ? "bg-neutral-100 dark:bg-neutral-800" : ""
                                    } ${isSelected ? "text-neutral-900 dark:text-white font-medium" : "text-neutral-600 dark:text-neutral-400"}`}
                                  >
                                    <span className="truncate">{opt.label}</span>
                                    <span className="flex items-center gap-1.5 shrink-0">
                                      {isSelected && <Check size={13} strokeWidth={1.5} />}
                                      <span className="tabular-nums text-neutral-400 dark:text-neutral-500">{opt.time}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!availabilityConfigured && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              <AlertCircle size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
              <span>Live booking isn&apos;t connected yet — reach out directly for now.</span>
            </div>
          )}
        </div>

        {/* ── Right side ────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 lg:h-[var(--card-h)] lg:overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "pick" && (
              <motion.div
                key="pick"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.26, ease: E }}
                className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-8"
              >
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {MONTH_LABELS[viewMonth]} {viewYear}
                    </p>
                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        aria-label="Previous month"
                        disabled={!canGoPrev}
                        onClick={() => goToMonth(-1)}
                        whileHover={canGoPrev ? { scale: 1.06 } : undefined}
                        whileTap={canGoPrev ? { scale: 0.94 } : undefined}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-neutral-100 dark:enabled:hover:bg-neutral-900"
                      >
                        <ChevronLeft size={15} strokeWidth={1.5} />
                      </motion.button>
                      <motion.button
                        type="button"
                        aria-label="Next month"
                        onClick={() => goToMonth(1)}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      >
                        <ChevronRight size={15} strokeWidth={1.5} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-y-1 mb-1">
                    {DAY_LABELS.map(d => (
                      <div key={d} className="text-center text-[0.68rem] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-600 py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-1">
                    {buildMonthGrid(viewYear, viewMonth).map(({ date, inMonth }, i) => {
                      if (!inMonth) return <div key={i} className="h-10" />;
                      const key = cellKey(date);
                      const available = !monthLoading && (monthAvailability.get(key)?.length ?? 0) > 0;
                      const selected = selectedDateKey === key;
                      const isToday = key === todayKey;
                      return (
                        <div key={i} className="flex items-center justify-center">
                          <motion.button
                            type="button"
                            disabled={!available}
                            aria-pressed={selected}
                            aria-label={date.toDateString()}
                            onClick={() => available && selectDate(key)}
                            whileHover={available && !selected ? { scale: 1.08 } : undefined}
                            whileTap={available ? { scale: 0.92 } : undefined}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className={[
                              "relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                              selected
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                : available
                                  ? "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
                                  : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed",
                            ].join(" ")}
                          >
                            {date.getDate()}
                            {isToday && !selected && (
                              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-neutral-900 dark:bg-white" />
                            )}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div aria-live="polite">
                  {!selectedDateKey && (
                    <div className="hidden xl:flex h-full min-h-[220px] flex-col items-center justify-center text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 px-4">
                      <Clock size={18} strokeWidth={1.5} className="text-neutral-300 dark:text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 leading-relaxed">
                        Pick a date to see available times
                      </p>
                    </div>
                  )}

                  {selectedDateKey && (() => {
                    const [yy, mm, dd] = selectedDateKey.split("-").map(Number);
                    const headingDate = new Date(yy, mm - 1, dd);
                    return (
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 text-center">
                          {headingDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </p>

                        {monthLoading && (
                          <div className="grid grid-cols-1 gap-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                            ))}
                          </div>
                        )}

                        {!monthLoading && daySlots.length === 0 && (
                          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4 py-6 text-center">
                            <CalendarX size={18} strokeWidth={1.5} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                              No times available on this day
                            </p>
                            {(() => {
                              const next = findNextAvailableKey(selectedDateKey);
                              if (!next) return null;
                              const [ny, nm, nd] = next.split("-").map(Number);
                              return (
                                <button
                                  type="button"
                                  onClick={() => jumpToDate(next)}
                                  className="text-xs font-medium text-neutral-900 dark:text-white underline underline-offset-2 hover:opacity-70"
                                >
                                  Try {new Date(ny, nm - 1, nd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </button>
                              );
                            })()}
                          </div>
                        )}

                        {!monthLoading && daySlots.length > 0 && (
                          <div className="max-h-[420px] overflow-y-auto pr-1 -mr-1">
                            <div className="grid grid-cols-1 gap-2">
                              {daySlots.map(slot => {
                                const isSelected = selectedSlot?.getTime() === slot.getTime();
                                return (
                                  <motion.button
                                    key={slot.toISOString()}
                                    type="button"
                                    onClick={() => pickSlot(slot)}
                                    aria-pressed={isSelected}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className={[
                                      "w-full min-h-[2.25rem] py-2.5 rounded-full border text-xs font-medium transition-colors",
                                      isSelected
                                        ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                                        : "border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white",
                                    ].join(" ")}
                                  >
                                    {formatSlotRange(slot, visitorTz, BOOKING_CONFIG.durationMinutes)}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {step === "details" && selectedSlot && (
              <motion.form
                key="details"
                onSubmit={handleConfirm}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.26, ease: E }}
                className="max-w-md mx-auto"
                noValidate
              >
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-5"
                >
                  <ArrowLeft size={14} strokeWidth={1.5} /> Back
                </button>

                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 mb-6 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    <Clock size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
                    <span>{BOOKING_CONFIG.duration}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    <Globe size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
                    <span>
                      {selectedSlot.toLocaleDateString("en-US", { timeZone: visitorTz, weekday: "long", month: "long", day: "numeric" })}
                      {" · "}
                      {selectedSlot.toLocaleTimeString("en-US", { timeZone: visitorTz, hour: "numeric", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2.5">
                  Location
                </p>
                <div className="flex gap-2 mb-6">
                  {LOCATIONS.map(({ id, label }) => {
                    const Icon = LOCATION_ICONS[id];
                    return (
                      <motion.button
                        key={id}
                        type="button"
                        onClick={() => setLocation(id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className={[
                          "flex-1 flex items-center justify-center gap-2 h-10 rounded-full text-sm font-medium border transition-colors",
                          location === id
                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900",
                        ].join(" ")}
                      >
                        <Icon size={15} strokeWidth={1.5} /> {label}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                      <User size={13} strokeWidth={1.5} /> Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                      <Mail size={13} strokeWidth={1.5} /> Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
                  </div>

                  {CUSTOM_QUESTIONS.map((question, i) => (
                    <div key={question}>
                      <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                        {question}
                      </label>
                      <input
                        type="text"
                        value={answers[i] ?? ""}
                        onChange={e => updateAnswer(i, e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                      {errors.answers?.[i] && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.answers[i]}</p>}
                    </div>
                  ))}
                </div>

                {submitError && (
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-2.5 text-xs text-red-600 dark:text-red-400 leading-relaxed">
                    <AlertCircle size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.01 } : undefined}
                  whileTap={!submitting ? { scale: 0.98 } : undefined}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="mt-6 w-full h-12 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <><Loader2 size={16} strokeWidth={2} className="animate-spin" /> Confirming…</>
                  ) : (
                    "Confirm Booking"
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === "done" && selectedSlot && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: E }}
                className="max-w-md text-center mx-auto py-4"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                  className="w-14 h-14 mx-auto rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center"
                >
                  <Check size={24} strokeWidth={2.5} />
                </motion.div>

                <h4 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-white">
                  You&apos;re all set{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}!
                </h4>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  A confirmation will be sent to {email}.
                </p>

                <div className="mt-6 text-left rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    <Clock size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
                    <span>
                      {selectedSlot.toLocaleDateString("en-US", { timeZone: visitorTz, weekday: "long", month: "long", day: "numeric" })}
                      {" · "}
                      {selectedSlot.toLocaleTimeString("en-US", { timeZone: visitorTz, hour: "numeric", minute: "2-digit", hour12: true })}
                      {" "}({BOOKING_CONFIG.duration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    {(() => { const Icon = LOCATION_ICONS[location]; return <Icon size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />; })()}
                    <span>{locationLabel}</span>
                  </div>
                </div>

                {location === "meet" && bookingResult?.meetLink && (
                  <a
                    href={bookingResult.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2"
                  >
                    Join with Google Meet <ArrowUpRight size={13} strokeWidth={1.5} />
                  </a>
                )}
                {location === "zoom" && (
                  <p className="mt-5 text-xs text-neutral-400 dark:text-neutral-600">
                    Your Zoom link will be sent by email shortly.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
