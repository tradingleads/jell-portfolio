"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Clock, Globe, Video, MonitorPlay,
  Check, ArrowLeft, User, Mail, MessageSquare, CalendarX, Loader2,
  ArrowUpRight,
} from "lucide-react";

/* ── Event config ──────────────────────────────────────────────── */
const EVENT = {
  title: "Free 30-min Discovery Call",
  duration: "30 min",
  host: "Jell Urmeneta",
  description:
    "A no-pressure chat about your project — what you need, what's possible, and whether we're a fit to work together.",
};

const LOCATIONS = [
  { id: "zoom", label: "Zoom", Icon: Video },
  { id: "meet", label: "Google Meet", Icon: MonitorPlay },
] as const;

type LocationId = (typeof LOCATIONS)[number]["id"];
type Step = "pick" | "details" | "done";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const BASE_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const E = [0.16, 1, 0.3, 1] as const;

/* ── Date helpers ──────────────────────────────────────────────── */
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
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

/* Deterministic mock availability — no backend behind this yet, so
   slots are derived from the date itself rather than random per render. */
function slotsForDate(date: Date) {
  const seed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  if (seed % 9 === 0) return [];
  const start = seed % 3;
  const count = 6 + (seed % 6);
  return BASE_SLOTS.slice(start, start + count);
}

function findNextAvailable(from: Date, today: Date) {
  const d = new Date(from);
  for (let i = 0; i < 45; i++) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d) && d >= today && slotsForDate(d).length > 0) return new Date(d);
  }
  return null;
}

function parseTimeOnDate(date: Date, time: string) {
  const match = time.match(/(\d+):(\d+)\s?(AM|PM)/i);
  const d = new Date(date);
  if (!match) return d;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (/pm/i.test(match[3]) && h !== 12) h += 12;
  if (/am/i.test(match[3]) && h === 12) h = 0;
  d.setHours(h, m, 0, 0);
  return d;
}

function googleCalendarUrl(opts: { title: string; description: string; start: Date; end: Date; location: string }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(opts.end)}`,
    details: opts.description,
    location: opts.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ── Root component ────────────────────────────────────────────── */
export default function BookingCalendar() {
  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [location, setLocation] = useState<LocationId>("zoom");
  const [step, setStep] = useState<Step>("pick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const tz = useMemo(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" })
      .formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value ?? "";
    return `${zone}${offset ? ` (${offset})` : ""}`;
  }, []);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const daySlots = useMemo(() => (selectedDate ? slotsForDate(selectedDate) : []), [selectedDate]);
  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    const t = setTimeout(() => setSlotsLoading(false), 380);
    return () => clearTimeout(t);
  }, [selectedDate]);

  useEffect(() => {
    if (!submitting) return;
    const t = setTimeout(() => { setSubmitting(false); setStep("done"); }, 650);
    return () => clearTimeout(t);
  }, [submitting]);

  function goToMonth(dir: -1 | 1) {
    setViewMonth(m => {
      let nm = m + dir, ny = viewYear;
      if (nm < 0) { nm = 11; ny -= 1; }
      if (nm > 11) { nm = 0; ny += 1; }
      setViewYear(ny);
      return nm;
    });
  }

  function selectDate(d: Date) {
    setSelectedDate(d);
    setSelectedTime(null);
  }

  function jumpToDate(d: Date) {
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    selectDate(d);
  }

  function pickTime(time: string) {
    setSelectedTime(time);
    setStep("details");
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!email.trim()) next.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
  }

  function reset() {
    setSelectedDate(null);
    setSelectedTime(null);
    setName(""); setEmail(""); setNotes(""); setErrors({});
    setStep("pick");
  }

  const startDate = selectedDate && selectedTime ? parseTimeOnDate(selectedDate, selectedTime) : null;
  const endDate = startDate ? new Date(startDate.getTime() + 30 * 60 * 1000) : null;
  const locationLabel = LOCATIONS.find(l => l.id === location)?.label ?? "Zoom";

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[2rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_48px_-16px_rgba(0,0,0,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_20px_48px_-16px_rgba(0,0,0,0.7)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">

        {/* ── Event info panel ─────────────────────────────────── */}
        <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
          <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-sm font-semibold">
            {EVENT.host.split(" ").map(w => w[0]).join("")}
          </div>
          <p className="mt-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">{EVENT.host}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug">
            {EVENT.title}
          </h3>

          <div className="mt-5 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2.5">
              <Clock size={16} strokeWidth={1.5} className="shrink-0" />
              <span>{EVENT.duration}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Video size={16} strokeWidth={1.5} className="shrink-0" />
              <span>Zoom or Google Meet</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="break-words">{tz}</span>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-[38ch]">
            {EVENT.description}
          </p>
        </div>

        {/* ── Right side ────────────────────────────────────────── */}
        <div className="p-6 sm:p-8">
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
                    {cells.map(({ date, inMonth }, i) => {
                      if (!inMonth) return <div key={i} className="h-10" />;
                      const past = date < today;
                      const weekend = isWeekend(date);
                      const available = !past && !weekend;
                      const selected = selectedDate && sameDay(date, selectedDate);
                      const isToday = sameDay(date, today);
                      return (
                        <div key={i} className="flex items-center justify-center">
                          <motion.button
                            type="button"
                            disabled={!available}
                            aria-pressed={!!selected}
                            aria-label={date.toDateString()}
                            onClick={() => available && selectDate(date)}
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
                  {!selectedDate && (
                    <div className="hidden xl:flex h-full min-h-[220px] flex-col items-center justify-center text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 px-4">
                      <Clock size={18} strokeWidth={1.5} className="text-neutral-300 dark:text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 leading-relaxed">
                        Pick a date to see available times
                      </p>
                    </div>
                  )}

                  {selectedDate && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>

                      {slotsLoading && (
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                          ))}
                        </div>
                      )}

                      {!slotsLoading && daySlots.length === 0 && (
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4 py-6 text-center">
                          <CalendarX size={18} strokeWidth={1.5} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                            No times available on this day
                          </p>
                          {(() => {
                            const next = findNextAvailable(selectedDate, today);
                            if (!next) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => jumpToDate(next)}
                                className="text-xs font-medium text-neutral-900 dark:text-white underline underline-offset-2 hover:opacity-70"
                              >
                                Try {next.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </button>
                            );
                          })()}
                        </div>
                      )}

                      {!slotsLoading && daySlots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {daySlots.map(time => (
                            <motion.button
                              key={time}
                              type="button"
                              onClick={() => pickTime(time)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ type: "spring", stiffness: 100, damping: 20 }}
                              className="h-9 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white transition-colors"
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === "details" && selectedDate && selectedTime && (
              <motion.form
                key="details"
                onSubmit={handleConfirm}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.26, ease: E }}
                className="max-w-md"
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
                    <span>{EVENT.duration}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    <Globe size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
                    <span>
                      {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {selectedTime}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2.5">
                  Location
                </p>
                <div className="flex gap-2 mb-6">
                  {LOCATIONS.map(({ id, label, Icon }) => (
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
                  ))}
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

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                      <MessageSquare size={13} strokeWidth={1.5} /> What's on your mind? <span className="text-neutral-300 dark:text-neutral-700 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="A little context helps me prepare"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none"
                    />
                  </div>
                </div>

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

            {step === "done" && selectedDate && selectedTime && (
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
                  You're all set{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}!
                </h4>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  A confirmation will be sent to {email}.
                </p>

                <div className="mt-6 text-left rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    <Clock size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
                    <span>
                      {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {selectedTime} ({EVENT.duration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                    {location === "zoom" ? <Video size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" /> : <MonitorPlay size={15} strokeWidth={1.5} className="shrink-0 text-neutral-400" />}
                    <span>{locationLabel}</span>
                  </div>
                </div>

                {startDate && endDate && (
                  <a
                    href={googleCalendarUrl({ title: EVENT.title, description: notes || EVENT.description, start: startDate, end: endDate, location: locationLabel })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2"
                  >
                    Add to Google Calendar <ArrowUpRight size={13} strokeWidth={1.5} />
                  </a>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs font-medium text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Book another time
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
