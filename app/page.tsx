"use client";

import { useEffect, useState, memo, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";
import Lightbox from "@/components/Lightbox";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { OrbState } from "@/components/AIOrb";

const Chat          = dynamic(() => import("@/components/Chat"),          { ssr: false });
const FloatingDock  = dynamic(() => import("@/components/FloatingDock"),  { ssr: false });
const MouseGradient = dynamic(() => import("@/components/MouseGradient"), { ssr: false });
const IconCloud      = dynamic(() => import("@/components/ui/interactive-icon-cloud").then(m => m.IconCloud), { ssr: false });
const BookingCalendar = dynamic(() => import("@/components/BookingCalendar"), { ssr: false });

import {
  ArrowRight, Zap, Bot, Database, Film, Users, FileText,
  MessageSquare, Mail,
  ArrowUpRight, Sparkles, Activity, Phone, Linkedin, MapPin,
  Search, Wrench, Rocket, Maximize2, Menu, X,
  ChevronLeft, ChevronRight,
  RefreshCw, Settings2,
  Loader2, Check, AlertCircle,
  Quote, TrendingDown, Clock, Repeat,
} from "lucide-react";

/* ── Constants ─────────────────────────────────────────── */
const WHATSAPP       = "https://api.whatsapp.com/send/?phone=639485530304&type=phone_number&app_absent=0";

/* ── Animation helpers ─────────────────────────────────── */
const E = [0.16, 1, 0.3, 1] as const;
const up = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: E },
});

/* ── Animated counter ──────────────────────────────────── */
// Re-counts every time it scrolls into view (not just once) — resets to 0
// the moment it scrolls off-screen so it's ready to count up again on the
// way back. Uses a motion value + imperative `animate()` (not useState) so
// the ~60fps tick never triggers a React re-render — only the text node
// updates, per the perf rule for continuous animation values.
const AnimatedCounter = memo(function AnimatedCounter({
  to, prefix = "", suffix = "", duration = 1.4, style,
}: { to: number; prefix?: string; suffix?: string; duration?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const count = useMotionValue(0);
  const display = useTransform(count, v => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] });
      return controls.stop;
    }
    count.set(0);
  }, [inView, to, duration, count]);

  return <motion.p ref={ref} style={style}>{display}</motion.p>;
});

/* ── Floating particles ─────────────────────────────────── */
const Particles = memo(function Particles() {
  const [pts, setPts] = useState<{ id: number; x: number; y: number; s: number; d: number; dl: number }[]>([]);
  useEffect(() => {
    setPts(Array.from({ length: 18 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 2 + 1, d: Math.random() * 5 + 4, dl: Math.random() * 3,
    })));
  }, []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pts.map(p => (
        <motion.div key={p.id}
          style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, borderRadius: "50%", background: "var(--ld-accent)" }}
          animate={{ y: [0, -18, 0], opacity: [0.08, 0.3, 0.08] }}
          transition={{ duration: p.d, repeat: Infinity, delay: p.dl, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
});

/* ── Animated chat preview (hero centerpiece) ───────────── */
const DEMO = [
  { id: 1, role: "user",  text: "What kind of AI systems do you build?",       t: 800  },
  { id: 2, role: "ai",    text: "Mostly systems that remove manual work — lead qualification, customer support, content distribution, CRM updates. Things teams spend hours on every week.", t: 2200 },
  { id: 3, role: "card",  title: "AI Lead Enrichment", desc: "Qualifies leads in <60 seconds", metric: "–70% manual work", t: 3800 },
  { id: 4, role: "user",  text: "How quickly can you build?",                    t: 5600 },
  { id: 5, role: "ai",    text: "Most systems are ready in 7–21 days. It depends on complexity. Happy to take a look at your workflow if you want a real estimate.", t: 7000 },
];
const LOOP = 10000;

const ChatPreview = memo(function ChatPreview() {
  const [visible, setVisible] = useState<number[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function run() {
      setVisible([]);
      setTyping(false);
      DEMO.forEach((msg, i) => {
        const show = msg.t;
        const typeStart = msg.t - 600;
        if (msg.role === "ai" || msg.role === "card") {
          timers.push(setTimeout(() => setTyping(true), typeStart));
        }
        timers.push(setTimeout(() => {
          setTyping(false);
          setVisible(v => [...v, msg.id]);
        }, show));
      });
      timers.push(setTimeout(run, LOOP));
    }
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-scroll within the fixed-height panel only — never affects page layout.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [visible, typing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: E }}
      style={{ width: "100%", maxWidth: 460, margin: "0 auto", contain: "layout" }}
    >
      {/* Browser chrome */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 0 0 1px var(--ld-border)",
        background: "var(--ld-card)",
      }}>
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "12px 16px",
          background: "var(--ld-card2)",
          borderBottom: "1px solid var(--ld-border)",
        }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
          <div style={{
            flex: 1, marginLeft: 8,
            background: "var(--ld-bg)",
            border: "1px solid var(--ld-border)",
            borderRadius: 6, padding: "4px 10px",
            fontSize: "0.7rem", color: "var(--ld-muted)",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            jell.ai/automation
          </div>
        </div>

        {/* Chat header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid var(--ld-border)",
          background: "var(--ld-card)",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--ld-accent), var(--ld-blue))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px var(--ld-glow)",
          }}>
            <Sparkles size={14} strokeWidth={2} style={{ color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--ld-text)", marginBottom: 2 }}>Business Automation Assistant</p>
            <p style={{ fontSize: "0.65rem", color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
              Online · Replies instantly · Available 24/7
            </p>
          </div>
        </div>

        {/* Messages — fixed height + internal scroll so accumulating messages
            can never grow this box or shift anything outside the Hero. */}
        <div
          ref={scrollRef}
          className="hide-scrollbar h-[260px] sm:h-[280px]"
          style={{
            padding: "16px", display: "flex", flexDirection: "column", gap: 10,
            overflowY: "auto", overscrollBehavior: "contain",
            contain: "layout",
          }}
        >
          <AnimatePresence initial={false}>
            {DEMO.map(msg => {
              if (!visible.includes(msg.id)) return null;
              if (msg.role === "user") return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  style={{ alignSelf: "flex-end", maxWidth: "78%" }}
                >
                  <div style={{
                    background: "linear-gradient(135deg, var(--ld-accent), var(--ld-blue))",
                    color: "#fff", borderRadius: "14px 14px 3px 14px",
                    padding: "9px 13px", fontSize: "0.8rem", lineHeight: 1.5,
                    boxShadow: "0 2px 12px var(--ld-glow)",
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              );
              if (msg.role === "ai") return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  style={{ alignSelf: "flex-start", maxWidth: "82%" }}
                >
                  <div style={{
                    background: "var(--ld-bg)", border: "1px solid var(--ld-border)",
                    borderRadius: "14px 14px 14px 3px",
                    padding: "9px 13px", fontSize: "0.8rem", lineHeight: 1.6,
                    color: "var(--ld-text)",
                    boxShadow: "var(--ld-shadow)",
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              );
              if (msg.role === "card") return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ alignSelf: "flex-start" }}
                >
                  <div style={{
                    background: "var(--ld-bg)", border: "1px solid var(--ld-borderC)",
                    borderRadius: 12, padding: "10px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                    boxShadow: "0 0 16px var(--ld-glow)",
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--ld-glow)", border: "1px solid var(--ld-borderC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Zap size={14} style={{ color: "var(--ld-accent)" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ld-text)", marginBottom: 2 }}>{msg.title}</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--ld-muted)" }}>{msg.desc}</p>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--ld-accent)", marginLeft: "auto", whiteSpace: "nowrap" }}>{msg.metric}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ld-muted)" }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div style={{
          padding: "10px 12px 12px",
          borderTop: "1px solid var(--ld-border)",
          background: "var(--ld-card)",
        }}>
          <div style={{
            padding: "9px 14px", borderRadius: 10,
            background: "var(--ld-bg)", border: "1px solid var(--ld-border)",
            fontSize: "0.75rem", color: "var(--ld-muted)",
          }}>
            Common questions business owners ask...
          </div>
        </div>
      </div>

      {/* CTA below preview */}
      <motion.div
        style={{ textAlign: "center", marginTop: 16 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <a
          href="#portfolio"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          <motion.p
            whileHover={{ textShadow: "0 0 20px var(--ld-accent)" }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: "0.9rem", fontWeight: 700,
              color: "var(--ld-accent)",
              display: "inline-flex", alignItems: "center", gap: 7,
              letterSpacing: "0.01em",
            }}
          >
            Explore My Services with AI
            <ArrowRight size={14} strokeWidth={2.5} />
          </motion.p>
          <p style={{
            fontSize: "0.72rem", color: "var(--ld-muted)",
            marginTop: 5, letterSpacing: "0.01em", lineHeight: 1.5,
          }}>
            Instant answers about projects, pricing, systems &amp; results.
          </p>
        </a>
      </motion.div>
    </motion.div>
  );
});

/* ── Nav items ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Services", href: "#services" },
  { label: "Process",  href: "#process"  },
  { label: "Projects", href: "#projects" },
];
const NAV_ABOUT     = { label: "About",   href: "#about"   };
const NAV_CONTACT   = { label: "Contact", href: "#contact" };
const NAV_CTA = { label: "Book a Call", href: "#book-a-call" };

/* ── Navbar ────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [logoHovered,  setLogoHovered]  = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: E }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? "var(--ld-nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid var(--ld-border)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Desktop / Tablet */}
      <div className="hidden lg:flex" style={{
        maxWidth: 1200, margin: "0 auto", padding: scrolled ? "10px 28px" : "14px 28px",
        alignItems: "center", justifyContent: "space-between",
        transition: "padding 0.3s ease",
      }}>
        {/* Desktop logo */}
        {/* Desktop logo */}
        <motion.a
          href="#"
          onHoverStart={() => setLogoHovered(true)}
          onHoverEnd={() => setLogoHovered(false)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: E }}
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}
        >
          {/* Monogram badge */}
          <motion.div
            animate={{
              background: logoHovered
                ? "linear-gradient(135deg, rgba(59,130,246,0.30), rgba(139,92,246,0.22))"
                : "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(139,92,246,0.10))",
              boxShadow: logoHovered
                ? "0 0 22px rgba(59,130,246,0.45), 0 0 8px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.14)"
                : "inset 0 1px 0 rgba(255,255,255,0.06)",
              borderColor: logoHovered ? "rgba(59,130,246,0.55)" : "rgba(59,130,246,0.22)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              border: "1px solid rgba(59,130,246,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <motion.span
              animate={{ scale: logoHovered ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{ fontSize: "0.78rem", fontWeight: 900, letterSpacing: "0.03em", color: "var(--ld-accent)", fontFamily: "var(--font-display)", lineHeight: 1 }}
            >JU</motion.span>
          </motion.div>

          {/* Name */}
          <motion.span
            animate={{ opacity: logoHovered ? 1 : 0.88, x: logoHovered ? 1 : 0 }}
            transition={{ duration: 0.22 }}
            style={{ cursor: "pointer", display: "flex", alignItems: "baseline", gap: 6, position: "relative", overflow: "hidden" }}
          >
            <motion.span
              animate={{ color: logoHovered ? "#FFFFFF" : "var(--ld-text)", textShadow: logoHovered ? "0 0 24px rgba(255,255,255,0.25)" : "none" }}
              transition={{ duration: 0.25 }}
              style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "0.06em", fontFamily: "var(--font-display)", lineHeight: 1, textTransform: "uppercase" }}
            >
              Jell
            </motion.span>
            <motion.span
              animate={{ filter: logoHovered ? "brightness(1.2) drop-shadow(0 0 8px rgba(139,92,246,0.55))" : "brightness(1)" }}
              transition={{ duration: 0.25 }}
              className="ld-text-shimmer"
              style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.06em", fontFamily: "var(--font-display)", lineHeight: 1, textTransform: "uppercase" }}
            >
              Urmeneta
            </motion.span>
            {/* Idle glow sweep */}
            <motion.span
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.18) 50%, transparent 100%)" }}
              animate={{ x: ["-100%", "110%"], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 7, ease: "easeInOut" }}
            />
          </motion.span>
        </motion.a>

        <nav style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          {NAV_ITEMS.map(({ label, href }) => (
            <a key={label} href={href}
              style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ld-muted)", textDecoration: "none", padding: "7px 13px", borderRadius: 8, transition: "all 0.18s ease" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--ld-text)"; el.style.background = "var(--ld-glow)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--ld-muted)"; el.style.background = "transparent"; }}
            >{label}</a>
          ))}

          {/* Book a Call — highest-intent nav item */}
          <motion.a
            href={NAV_CTA.href}
            whileHover="hover"
            initial="rest"
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: "0.8125rem", fontWeight: 700,
              color: "var(--ld-accent)", textDecoration: "none",
              padding: "7px 14px", borderRadius: 8,
              marginLeft: 6,
              border: "1px solid var(--ld-borderC)",
              background: "var(--ld-glow)",
              transition: "box-shadow 0.22s ease, border-color 0.22s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px var(--ld-glow), inset 0 0 12px var(--ld-glow)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--ld-accent)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--ld-borderC)";
            }}
          >
            {NAV_CTA.label}
            <motion.span
              variants={{
                rest:  { opacity: 0, x: -4 },
                hover: { opacity: 1, x: 0  },
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </motion.span>
          </motion.a>

          <a href={NAV_CONTACT.href}
            style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ld-muted)", textDecoration: "none", padding: "7px 13px", borderRadius: 8, marginLeft: 2, transition: "all 0.18s ease" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--ld-text)"; el.style.background = "var(--ld-glow)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--ld-muted)"; el.style.background = "transparent"; }}
          >{NAV_CONTACT.label}</a>
        </nav>

        <div style={{ marginLeft: 24 }}>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="flex lg:hidden" style={{ padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <motion.a
          href="#"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: E }}
          whileHover="hovered"
          whileTap="hovered"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {/* Monogram badge */}
          <motion.div
            variants={{
              hovered: { boxShadow: "0 0 20px rgba(59,130,246,0.45), 0 0 8px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.14)", borderColor: "rgba(59,130,246,0.55)", background: "linear-gradient(135deg, rgba(59,130,246,0.30), rgba(139,92,246,0.22))" },
            }}
            transition={{ duration: 0.25 }}
            style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(139,92,246,0.10))", border: "1px solid rgba(59,130,246,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.span
              variants={{ hovered: { scale: 1.1 } }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--ld-accent)", fontFamily: "var(--font-display)", lineHeight: 1 }}
            >JU</motion.span>
          </motion.div>

          {/* Name */}
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4, position: "relative", overflow: "hidden" }}>
            <motion.span
              variants={{ hovered: { color: "#FFFFFF", textShadow: "0 0 22px rgba(255,255,255,0.25)" } }}
              transition={{ duration: 0.22 }}
              style={{ fontSize: "1.125rem", fontWeight: 900, letterSpacing: "0.05em", color: "var(--ld-text)", fontFamily: "var(--font-display)", lineHeight: 1, textTransform: "uppercase" }}
            >Jell</motion.span>
            <motion.span
              variants={{ hovered: { color: "var(--ld-blue)", textShadow: "0 0 18px rgba(59,130,246,0.55)" } }}
              transition={{ duration: 0.22 }}
              className="ld-text-shimmer"
              style={{ fontSize: "1.125rem", fontWeight: 800, letterSpacing: "0.05em", fontFamily: "var(--font-display)", lineHeight: 1, textTransform: "uppercase" }}
            >Urmeneta</motion.span>
            {/* Sweep */}
            <motion.span
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.18) 50%, transparent 100%)" }}
              animate={{ x: ["-100%", "110%"], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 7, ease: "easeInOut" }}
            />
          </div>
        </motion.a>

        {/* Theme toggle + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <motion.button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            whileTap={{ scale: 0.92 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: menuOpen ? "var(--ld-glow)" : "var(--ld-card)", border: `1px solid ${menuOpen ? "var(--ld-borderC)" : "var(--ld-border)"}`, cursor: "pointer", color: "var(--ld-text)", transition: "all 0.2s ease" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={menuOpen ? "x" : "menu"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: "flex" }}>
                {menuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

    </motion.header>

    {/* Full-screen mobile overlay — outside header to avoid transform stacking context */}
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: E }}
          className="lg:hidden"
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "var(--ld-bg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "flex-start",
            paddingTop: 72,
          }}
        >
          {/* Close button */}
          <motion.button
            type="button"
            onClick={() => setMenuOpen(false)}
            whileTap={{ scale: 0.92 }}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 40, height: 40, borderRadius: 10,
              background: "var(--ld-card)", border: "1px solid var(--ld-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--ld-text)",
            }}
          >
            <X size={18} strokeWidth={2} />
          </motion.button>

          {/* Inner content — left-aligned, consistent spacing */}
          <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", display: "flex", flexDirection: "column" }}>

            {/* Nav links */}
            {[...NAV_ITEMS, NAV_ABOUT, { label: "Book a Call", href: NAV_CTA.href }, NAV_CONTACT].map(({ label, href }, i) => (
              <motion.a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.22, ease: E }}
                style={{
                  fontSize: "1.125rem", fontWeight: 600,
                  color: label === "Book a Call" ? "var(--ld-accent)" : "var(--ld-text)",
                  textDecoration: "none", padding: "14px 0",
                  textAlign: "left", display: "block",
                  borderBottom: "1px solid var(--ld-border)",
                  letterSpacing: "-0.01em",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.6")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                {label}
              </motion.a>
            ))}

          </div>{/* end inner content */}
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

/* ── Hero ──────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section style={{ minHeight: "clamp(600px, 100dvh, 900px)", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 68, contain: "layout" }}>
      {/* Hero dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, var(--ld-borderC) 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.25, pointerEvents: "none" }} />
      {/* Spotlight — blue top center */}
      <div className="ld-ambient-glow" style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* Violet accent — right */}
      <div className="ld-ambient-glow" style={{ position: "absolute", top: "15%", right: "0%", width: 480, height: 480, background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* Blue accent — bottom left */}
      <div className="ld-ambient-glow" style={{ position: "absolute", bottom: "10%", left: "0%", width: 320, height: 320, background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
      <Particles />

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(28px, 6vw, 60px) clamp(24px, 5vw, 28px)", width: "100%", gap: 48, alignItems: "center" }}>

        {/* Left */}
        <div className="text-center sm:text-left order-1">

          <h1 className="hero-fade-item" style={{ animationDelay: "0.05s", fontSize: "clamp(2.2rem, 6vw, 4.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--ld-text)", fontFamily: "var(--font-display)", marginBottom: 16 }}>
            <span className="ld-gradient">Build Better Business Systems.</span>
          </h1>

          <p className="hero-fade-item mx-auto sm:mx-0" style={{ animationDelay: "0.15s", fontSize: "1.0625rem", fontWeight: 500, lineHeight: 1.65, color: "var(--ld-text)", opacity: 0.88, maxWidth: "42ch", marginBottom: "clamp(20px, 4vw, 32px)" }}>
            I build zero-touch workflows, AI automations, and system integrations that remove bottlenecks, reduce manual work, and keep your business moving.
          </p>

          <div className="hero-fade-item flex-col sm:flex-row justify-center sm:justify-start" style={{ animationDelay: "0.25s", display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
            <motion.a href="#book-a-call"
              whileHover={{ scale: 1.03, boxShadow: "0 0 32px var(--ld-glow)" }} whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto justify-center"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 28px", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none", boxShadow: "0 0 20px var(--ld-glow)" }}>
              Book a Call <ArrowRight size={16} strokeWidth={2.5} />
            </motion.a>
            <motion.a href="#projects"
              whileHover={{ borderColor: "var(--ld-accent)", color: "var(--ld-accent)" }}
              className="w-full sm:w-auto justify-center"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 26px", borderRadius: 100, border: "1px solid var(--ld-borderC)", color: "var(--ld-muted)", fontWeight: 600, fontSize: "0.9375rem", textDecoration: "none", transition: "all 0.2s ease" }}>
              View My Work <ArrowUpRight size={15} strokeWidth={2} />
            </motion.a>
          </div>

        </div>

        {/* Right — animated chat preview (secondary, follows headline on mobile) */}
        <div className="order-2">
          <ChatPreview />
        </div>
      </div>
    </section>
  );
}

/* ── Social proof (results bar + testimonials) ────────────────
   Numbers mirror real figures already shown in the Projects section
   (facebook-ai, content-machine, appointment-setter, asana-crm) —
   no invented stats. Testimonials array is empty-friendly: fill it in
   with real { quote, name, title } objects when available and the
   composed empty state below is replaced automatically. */
const RESULT_STATS = [
  { Icon: TrendingDown, to: 70,  prefix: "–", suffix: "%", label: "Support cost cut" },
  { Icon: Clock,        to: 3,   prefix: "<", suffix: "s", label: "AI response time" },
  { Icon: Repeat,       to: 10,  prefix: "",  suffix: "×", label: "Content output" },
  { Icon: Check,        to: 100, prefix: "",  suffix: "%", label: "Lead follow-up rate" },
];

interface Testimonial { quote: string; name: string; title: string }
const TESTIMONIALS: Testimonial[] = [];

function SocialProofSection() {
  return (
    <section style={{ padding: "20px 28px 8px", background: "var(--ld-bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 14 }}>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)" }}>
            Live Results
          </p>
        </div>

        {/* Results strip */}
        <motion.div {...up()} style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1,
          border: "1px solid var(--ld-border)", borderRadius: 18, overflow: "hidden",
          background: "var(--ld-border)", boxShadow: "var(--ld-shadow)",
        }}>
          {RESULT_STATS.map(({ Icon, to, prefix, suffix, label }) => (
            <div key={label} style={{ background: "var(--ld-card)", padding: "20px 18px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
              <Icon size={16} strokeWidth={1.5} style={{ color: "var(--ld-accent)", marginBottom: 2 }} />
              <AnimatedCounter to={to} prefix={prefix} suffix={suffix}
                style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1 }} />
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ld-muted)" }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials — composed empty state until real quotes are added */}
        <motion.div {...up(0.1)} style={{ marginTop: 24 }}>
          {TESTIMONIALS.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {TESTIMONIALS.map(t => (
                <div key={t.name} style={{ padding: "22px 22px", background: "var(--ld-card)", border: "1px solid var(--ld-border)", borderRadius: 16, boxShadow: "var(--ld-shadow)" }}>
                  <Quote size={18} strokeWidth={1.5} style={{ color: "var(--ld-accent)", opacity: 0.6, marginBottom: 10 }} />
                  <p style={{ fontSize: "0.9rem", color: "var(--ld-text)", lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--ld-text)" }}>{t.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--ld-muted)" }}>{t.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8,
              padding: "26px 24px", borderRadius: 16, border: "1px dashed var(--ld-borderC)", background: "var(--ld-card2)",
            }}>
              <Quote size={18} strokeWidth={1.5} style={{ color: "var(--ld-muted)", opacity: 0.6 }} />
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ld-muted)" }}>Client testimonials coming soon</p>
              <p style={{ fontSize: "0.75rem", color: "var(--ld-muted)", maxWidth: "46ch" }}>
                In the meantime, the results above are pulled straight from live projects — see the full breakdown in each project above.
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}

/* ── Trust bar (interactive icon cloud) ───────────────────────── */
const TOOL_SLUGS = [
  "notion",
  "elevenlabs",
  "airtable",
  "openai",          // ChatGPT
  "googlegemini",    // Gemini
  "claude",          // Claude
  "github",          // GitHub (not Copilot)
  "visualstudiocode", // VS Code
  "microsoftcopilot", // Microsoft Copilot
  "zapier",
  "make",
  "n8n",
  "xero",
  "slack",
  "gmail",
  "google",
  "asana",
  "googlesheets",
  "javascript",
  "googleappsscript",
  "supabase",
];

// Full-width, no card/border/background of its own — flows directly into the
// page's own background so it reads as part of the page, not a boxed panel.
function TrustBar() {
  return (
    <section style={{ padding: "clamp(32px, 8vw, 56px) 28px", background: "var(--ld-bg)" }}>
      <p style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 28 }}>Tools &amp; Technologies</p>
      <div style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconCloud iconSlugs={TOOL_SLUGS} />
      </div>
    </section>
  );
}

/* ── Services ──────────────────────────────────────────────── */
const SERVICES = [
  { Icon: Zap,       c: "var(--ld-accent)",  t: "Zero-Touch Workflows",       d: "Hands-free workflows that run automatically from start to finish." },
  { Icon: RefreshCw, c: "var(--ld-purple)",  t: "End-to-End Automation",      d: "Complete workflow automation that removes bottlenecks and reduces manual work." },
  { Icon: Database,  c: "var(--ld-blue)",    t: "System Integrations",        d: "Connect Airtable, Google Sheets, Notion, Slack, Gmail, CRMs, and other business tools." },
  { Icon: Bot,       c: "var(--ld-accent)",  t: "AI-Powered Workflows",       d: "Use AI to automate repetitive tasks and support daily operations." },
  { Icon: FileText,  c: "var(--ld-purple)",  t: "SOP-Ready Systems",          d: "Every workflow includes clear documentation for easy handoff." },
  { Icon: Wrench,    c: "var(--ld-blue)",    t: "Custom Automation Solutions", d: "Automation solutions tailored to your unique business processes." },
];

function ServicesSection() {
  return (
    <section id="services" style={{ padding: "clamp(36px, 8vw, 60px) 28px", background: "var(--ld-card2)", scrollMarginTop: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...up()} className="text-center" style={{ marginBottom: "clamp(24px, 6vw, 40px)" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 10 }}>What I Deliver</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)" }}>
            Where Automation Removes the Busywork
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {SERVICES.map(({ Icon, c, t, d }, i) => (
            <motion.div key={t} {...up(i * 0.07)}
              whileHover={{ y: -4, borderColor: c, boxShadow: `0 0 0 1px ${c}25, 0 16px 48px rgba(0,0,0,0.55), 0 0 32px ${c}08` }}
              className="text-center sm:text-left"
              style={{ padding: "26px 22px", background: "var(--ld-card)", border: "1px solid var(--ld-border)", borderRadius: 20, transition: "all 0.28s ease", boxShadow: "var(--ld-shadow)" }}
            >
              <div className="mx-auto sm:mx-0" style={{ width: "clamp(38px, 9vw, 46px)", height: "clamp(38px, 9vw, 46px)", borderRadius: 13, marginBottom: "clamp(14px, 4vw, 20px)", background: `${c}12`, border: `1px solid ${c}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} strokeWidth={1.5} style={{ color: c }} />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ld-text)", fontFamily: "var(--font-display)", marginBottom: 10 }}>{t}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--ld-muted)", lineHeight: 1.65 }}>{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Projects ──────────────────────────────────────────────── */
/* ── Projects data ─────────────────────────────────────────── */
// Counts computed dynamically from PROJ_DATA — never hardcode these
const PROJ_CAT_DEFS = [
  { id: "all",     label: "All Projects"       },
  { id: "lead",    label: "Lead Generation"    },
  { id: "support", label: "AI Support"         },
  { id: "content", label: "Content Automation" },
  { id: "crm",     label: "CRM & Ops"          },
  { id: "ai",      label: "AI Agents"          },
];

interface ProjItem {
  id: string; cat: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any; color: string; platform: string;
  title: string; outcome: string;
  roi: string; roiColor: string;
  tools: string[]; summary: string;
  img: string; status: string;
  problem: string;
  workflowSteps: string[];
  beforeAfter: { before: string; after: string };
  metrics: { label: string; val: string; color: string }[];
  extraImages?: { src: string; label: string }[];
  featured?: boolean;
  role?: string;
}

const PROJ_DATA: ProjItem[] = [
  {
    id:"facebook-ai", cat:"support", Icon:MessageSquare, color:"#22d3ee", platform:"n8n", status:"Live",
    featured:true, role:"Solo automation engineer — scoped the flow, built the n8n pipeline, integrated Gemini AI and the Facebook API, and handled deployment and handoff.",
    title:"Facebook AI Sales Assistant", outcome:"Replied to 100% of leads instantly — 24/7, no staff needed.",
    roi:"–70% support cost", roiColor:"#34d399", img:"/projects/ai-agent-facebook.png",
    tools:["n8n","Gemini AI","Facebook API","Webhooks"],
    summary:"An AI agent connected to Facebook Messenger that intercepts leads, qualifies intent with Gemini AI, and responds instantly. The client replaced a 2-person support team with this single automation.",
    problem:"Support teams work 8-hour shifts. Every after-hours message sits unanswered for hours. Competitors who reply first win the sale — this business was losing 60% of after-hours leads.",
    workflowSteps:["Facebook message received via Webhook","AI detects lead intent and urgency level","Gemini generates a personalized, on-brand reply","Response sent in under 3 seconds","Lead and conversation logged to CRM automatically"],
    beforeAfter:{ before:"2+ hour response time overnight. 60% of after-hours leads lost to faster competitors.", after:"Instant replies 24/7. Zero missed leads. Support team now handles only complex escalations." },
    metrics:[{ label:"Response time", val:"<3s", color:"#22d3ee" },{ label:"Leads recovered", val:"+40%", color:"#34d399" },{ label:"Support cost", val:"–70%", color:"#fb923c" }],
  },
  {
    id:"lead-enrichment", cat:"lead", Icon:Database, color:"#34d399", platform:"Zapier", status:"Deployed",
    featured:true, role:"End-to-end build — designed the enrichment and scoring logic, configured the Zapier pipeline across Apollo, Sheets, Gmail and Slack, and trained the team on the new flow.",
    title:"Lead Enrichment Engine", outcome:"New leads qualified and enriched automatically in under 60 seconds.",
    roi:"<60s per lead", roiColor:"#22d3ee", img:"/projects/leads-enrichment.png",
    tools:["Zapier","Apollo","Google Sheets","Gmail","Slack"],
    summary:"A Zapier workflow that enriches new contacts via Apollo, scores lead quality with AI, routes high-priority leads to Slack, and drafts a personalized follow-up — all before a human even opens their inbox.",
    problem:"Sales reps wasted 2 hours daily manually researching leads. By the time they reached out, the lead had gone cold or moved on to a competitor.",
    workflowSteps:["New lead enters CRM or form submission captured","Apollo enriches contact and company data automatically","AI scores lead quality 1–10 based on fit criteria","High-priority leads routed to Slack instantly","Personalized follow-up email drafted and sent within 60s"],
    beforeAfter:{ before:"2 hours of manual research per lead. 40% of leads never followed up due to volume.", after:"Under 60 seconds per lead. 100% follow-up rate. Reps only speak to pre-qualified prospects." },
    metrics:[{ label:"Time per lead", val:"<60s", color:"#34d399" },{ label:"Lead quality", val:"+65%", color:"#22d3ee" },{ label:"Follow-up rate", val:"100%", color:"#a78bfa" }],
  },
  {
    id:"appointment-setter", cat:"lead", Icon:Bot, color:"#a78bfa", platform:"Zapier", status:"Live",
    featured:true, role:"Sole developer — mapped the multi-channel intake logic, built the Zapier automation, and set up calendar, reminder, and reschedule handling end to end.",
    title:"AI Appointment Setter", outcome:"Booked calls and appointments automatically across every channel, 24/7.",
    roi:"24/7 active", roiColor:"#a78bfa", img:"/projects/ai-appointment-setter.png",
    tools:["Zapier","Google Calendar","Gmail","SMS"],
    summary:"A multi-path automation handling the full appointment lifecycle — intake, availability, confirmation, reminders, and rescheduling — across email, forms, and messaging channels without any human input.",
    problem:"Scheduling was a back-and-forth nightmare consuming hours per week. Missed follow-ups and double-bookings were costing the business clients and credibility.",
    workflowSteps:["Inquiry received via email, form, or messaging app","AI checks real-time Google Calendar availability","Booking confirmation sent with calendar invite","24h and 1h reminder emails dispatched automatically","Reschedule requests handled by AI without human input"],
    beforeAfter:{ before:"3–5 email exchanges to book one meeting. 30% no-show rate from lack of reminders.", after:"One message books the call instantly. Automated reminders cut no-shows by 50%." },
    metrics:[{ label:"Booking friction", val:"1 message", color:"#a78bfa" },{ label:"No-shows", val:"–50%", color:"#34d399" },{ label:"Availability", val:"24/7", color:"#22d3ee" }],
  },
  {
    id:"content-machine", cat:"content", Icon:Film, color:"#fbbf24", platform:"Zapier", status:"Running",
    featured:true, role:"Built solo — designed the trigger/transcription/caption pipeline in Zapier and wired up distribution to every platform, then documented it as a self-serve SOP.",
    title:"AI Content Machine", outcome:"One upload generates and publishes content across all platforms automatically.",
    roi:"10× output", roiColor:"#fbbf24", img:"/projects/ai-content-repurposing.png",
    tools:["Zapier","Google Drive","AI by Zapier","LinkedIn","Facebook","Instagram"],
    summary:"Triggered when a file lands in Google Drive, this workflow generates AI transcriptions, writes platform-specific captions, and distributes posts to Facebook, LinkedIn, and Instagram automatically.",
    problem:"Creating content for multiple platforms took 6+ hours per video. The team was publishing less than they should because manual effort was the bottleneck, not ideas.",
    workflowSteps:["File uploaded to designated Google Drive folder","AI transcription generated from audio/video content","Platform-specific captions written by AI for each channel","Content formatted to each platform's specs automatically","Posts published to Facebook, LinkedIn, and Instagram simultaneously"],
    beforeAfter:{ before:"6 hours per video. Maximum 3 posts per week across all channels.", after:"20-minute one-time setup. Now publishes 30+ pieces of content per month with zero effort." },
    metrics:[{ label:"Output increase", val:"10×", color:"#fbbf24" },{ label:"Time per post", val:"0 min", color:"#34d399" },{ label:"Platforms", val:"3+", color:"#22d3ee" }],
  },
  {
    id:"rag-agents", cat:"ai", Icon:Database, color:"#a78bfa", platform:"n8n", status:"Deployed",
    role:"Solo build — architected the retrieval pipeline in n8n, set up the Supabase vector store and embedding sync from Google Drive, and tuned the agent's grounding logic to eliminate hallucinations.",
    title:"RAG Knowledge Agent", outcome:"AI assistant answers questions grounded 100% in your own documents — zero hallucinations.",
    roi:"Zero hallucinations", roiColor:"#a78bfa", img:"/projects/rag-agents.png",
    tools:["n8n","Supabase Vector Store","Google Gemini Chat","Google Drive","Vertex Embeddings"],
    summary:"A Retrieval-Augmented Generation pipeline in n8n. When a message arrives, the AI Agent queries a Supabase Vector Store holding embeddings of your Google Drive documents, retrieves the most relevant content, and generates accurate answers grounded in verified sources — not AI guesswork.",
    problem:"Teams waste hours answering the same questions or give wrong answers because they can't locate the right document fast enough. Onboarding new staff takes weeks because knowledge is scattered.",
    workflowSteps:["Chat message received by the n8n AI Agent","Supabase Vector Store queried semantically for relevant content","Most relevant document sections retrieved","Gemini generates a grounded, cited response","New files in Google Drive sync automatically to the knowledge base"],
    beforeAfter:{ before:"Hours spent searching docs. Wrong answers from outdated info. Knowledge siloed in people's heads.", after:"Instant, accurate answers from verified documents. Zero hallucinations. Knowledge base updates itself." },
    metrics:[{ label:"Hallucination rate", val:"0%", color:"#a78bfa" },{ label:"Answer accuracy", val:"100%", color:"#34d399" },{ label:"Response time", val:"<2s", color:"#22d3ee" }],
  },
  {
    id:"ai-jobs-scraper", cat:"ai", Icon:FileText, color:"#fb923c", platform:"n8n", status:"Deployed",
    role:"Built solo — designed the scraping and scoring logic in n8n, integrated OpenAI for candidate-fit scoring, and automated resume generation and delivery end to end.",
    title:"AI Jobs Scraper + Resume Optimizer", outcome:"Daily automated job hunting — scrapes, scores, and sends tailored resumes without manual effort.",
    roi:"–95% time saved", roiColor:"#fb923c", img:"/projects/ai-jobs-scraper.png",
    tools:["n8n","OpenAI","Google Sheets","Gmail","HTTP Request","Loop Over Items","PDF Generation"],
    summary:"A scheduled n8n workflow that scrapes job boards, scores each role against a candidate profile using OpenAI, loops through shortlisted positions, creates personalized resume content per listing, generates a PDF, and sends ready-to-apply packages via Gmail — logged automatically.",
    problem:"Job seekers spend 4+ hours daily on manual searching, copy-pasting experience, and rewriting resumes for each application — producing generic results with low reply rates.",
    workflowSteps:["Daily schedule trigger fires the n8n pipeline","Job boards scraped for fresh listings matching criteria","OpenAI scores each role 1-10 against candidate profile","Top-scoring roles selected automatically","Tailored resume PDF generated and sent via Gmail with tracking log"],
    beforeAfter:{ before:"4+ hours daily of manual searching and resume rewriting. Generic applications with low callback rates.", after:"10 minutes of automated daily processing. Every resume tailored per role. ATS-optimized every time." },
    metrics:[{ label:"Time saved", val:"95%", color:"#fb923c" },{ label:"Resume fit", val:"Tailored", color:"#34d399" },{ label:"ATS pass rate", val:"+60%", color:"#22d3ee" }],
  },
  {
    id:"youtube-shorts", cat:"content", Icon:Zap, color:"#fb923c", platform:"n8n", status:"Deployed",
    role:"Solo automation engineer — built the scripting-to-publishing pipeline in n8n, integrated Gemini AI for script generation, and wired up the YouTube API for fully automated daily uploads.",
    title:"YouTube Shorts Creator", outcome:"Automated video production and publishing without any manual editing.",
    roi:"0 manual effort", roiColor:"#fb923c", img:"/projects/youtube-shorts-creator.png",
    tools:["n8n","Gemini AI","YouTube API","Google Drive"],
    summary:"An n8n pipeline that scripts short-form videos with Gemini AI, assembles assets, applies captions, then publishes to YouTube with AI-optimized metadata on a fully automated daily schedule.",
    problem:"Short-form video requires daily publishing to grow. The creator couldn't sustain the editing and upload workload while also running their business.",
    workflowSteps:["Daily schedule triggers n8n pipeline automatically","Gemini AI writes an optimized, trending video script","Video assets assembled and captioned programmatically","Branding and formatting applied consistently","Published to YouTube with AI-generated title, description, and tags"],
    beforeAfter:{ before:"3 videos per week maximum. 6+ hours of editing effort per video.", after:"Daily automated publishing. 30+ videos per month. Zero editing time after initial setup." },
    metrics:[{ label:"Videos/month", val:"30+", color:"#fb923c" },{ label:"Manual hours", val:"0", color:"#34d399" },{ label:"Consistency", val:"100%", color:"#22d3ee" }],
  },
  {
    id:"asana-crm", cat:"crm", Icon:Users, color:"#60a5fa", platform:"Zapier", status:"Running",
    role:"Built solo — mapped the deal-stage logic, configured the Zapier automation across Asana and Gmail, and set up the email sequencing for every pipeline stage.",
    title:"Asana CRM Lead Engagement", outcome:"Deal-stage changes triggered automated email sequences instantly.",
    roi:"Full CRM flow", roiColor:"#60a5fa", img:"/projects/asana-crm-lead.png",
    tools:["Zapier","Asana","Gmail","Google Drive"],
    summary:"A Zapier automation watching Asana task status changes that fires customized email sequences per deal stage — follow-ups, quotes, approvals, and onboarding. The sales team only focuses on closing.",
    problem:"Sales reps were forgetting to send critical follow-ups at deal stages. Deals were stalling because the right email wasn't sent at the right time.",
    workflowSteps:["Asana task status changes to a new deal stage","Correct email sequence selected based on stage logic","Personalized email drafted using deal and contact context","Email sent at optimal timing with built-in delays","Next trigger set up automatically for the following stage"],
    beforeAfter:{ before:"40% of follow-ups missed. Deals dying in the pipeline from missed touchpoints.", after:"100% follow-up rate. Every deal stage has an automated, personalized touchpoint sequence." },
    metrics:[{ label:"Follow-up rate", val:"100%", color:"#60a5fa" },{ label:"Pipeline velocity", val:"+35%", color:"#34d399" },{ label:"Manual emails", val:"0", color:"#fbbf24" }],
  },
  {
    id:"gmail-sort", cat:"crm", Icon:FileText, color:"#e879f9", platform:"Make", status:"Deployed",
    role:"Sole developer — designed the Make workflow, integrated Gemini AI for smart file naming, and set up the Drive filing and Sheets audit logging end to end.",
    title:"Gmail Auto-Sort to Drive", outcome:"Every email attachment automatically named, filed, and logged.",
    roi:"0 manual filing", roiColor:"#e879f9", img:"/projects/auto-sort-gmail.png",
    tools:["Make","Gmail","Gemini AI","Google Drive","Google Sheets"],
    summary:"A Make workflow that watches Gmail for attachments, uses Gemini AI to generate smart file names from content analysis, uploads to the correct Drive folder, logs to Sheets, and sends a summary email.",
    problem:"The team wasted hours weekly searching for misfiled documents buried in inboxes. Critical files were named 'Untitled-1.pdf' and impossible to find.",
    workflowSteps:["Email with attachment arrives in monitored Gmail inbox","Gemini AI analyzes file content and determines context","Smart descriptive filename generated automatically","File uploaded to the correct Google Drive folder","Row added to Google Sheets audit log + confirmation email sent"],
    beforeAfter:{ before:"15+ minutes weekly searching for misfiled documents. No audit trail. Files named 'untitled'.", after:"Every file auto-named, filed instantly, and logged. Perfect audit trail. Search time eliminated." },
    metrics:[{ label:"Filing time", val:"0 sec", color:"#e879f9" },{ label:"Files lost", val:"0", color:"#34d399" },{ label:"Search time", val:"–90%", color:"#22d3ee" }],
  },
  {
    id:"xero-asana-export", cat:"crm", Icon:Activity, color:"#fb923c", platform:"Make", status:"Deployed",
    role:"Solo build — architected the Make workflow, integrated the Xero API for transaction exports, and configured the iterator/aggregator logic to generate and attach the CSV automatically.",
    title:"Xero → Asana Finance Sync", outcome:"Asana task completions auto-export Xero transactions and attach the CSV instantly.",
    roi:"Fully automated", roiColor:"#fb923c", img:"/projects/xero-asana-export.png",
    tools:["Make","Asana","Xero API","Google Sheets","Iterator","Router"],
    summary:"A Make workflow that monitors Asana for completed finance tasks, calls the Xero API to export account transactions, routes through an iterator, aggregates data into a formatted CSV, uploads it back to Asana as an attachment, and clears the staging sheet.",
    problem:"Finance teams manually exported CSVs from Xero and attached them to Asana tasks. It took 30+ minutes per export, created version confusion, and was frequently missed under deadline pressure.",
    workflowSteps:["Asana task marked complete triggers the Make workflow","Make calls Xero API to pull account transaction data","Iterator processes each transaction row individually","Aggregator formats rows into a clean CSV structure","CSV uploaded to Asana task + staging Google Sheet cleared"],
    beforeAfter:{ before:"30+ minutes per manual export. Files emailed around, version chaos, tasks missed under deadline.", after:"Zero manual exports. CSV auto-attached to the correct Asana task the moment it's needed." },
    metrics:[{ label:"Export time", val:"0 min", color:"#fb923c" },{ label:"Manual steps", val:"0", color:"#34d399" },{ label:"Accuracy", val:"100%", color:"#22d3ee" }],
  },
];

/* ── Projects dashboard ────────────────────────────────────── */
/* ── Project detail modal ──────────────────────────────────── */
function ProjectDetailModal({ project: p, onClose }: { project: ProjItem; onClose: () => void }) {
  const [lbIdx, setLbIdx] = useState<number | null>(null);

  // Build ordered image list: hero first, then any extras
  const allImages = [
    { src: p.img, label: `${p.title} — Workflow Overview` },
    ...(p.extraImages ?? []),
  ];

  useBodyScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lbIdx === null) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [onClose, lbIdx]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="proj-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(3,5,14,0.88)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", cursor: "pointer" }}
      />

      {/* Modal */}
      <motion.div
        key="proj-modal"
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.85 }}
        style={{ position: "fixed", inset: 0, zIndex: 2001, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", pointerEvents: "none" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 760, maxHeight: "92vh",
            overflowY: "auto", borderRadius: 22,
            background: "var(--ld-card)",
            border: "1px solid var(--ld-border)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)",
            scrollbarWidth: "thin",
            pointerEvents: "auto",
          }}
        >
          {/* Hero screenshot — click to open fullscreen lightbox */}
          <motion.div
            whileHover="hover"
            initial="rest"
            onClick={() => setLbIdx(0)}
            style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "22px 22px 0 0", background: `linear-gradient(160deg, #05070B, ${p.color}25)`, cursor: "zoom-in" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={p.img} alt={p.title}
              variants={{ rest: { opacity: 0.72, scale: 1 }, hover: { opacity: 0.88, scale: 1.03 } }}
              transition={{ duration: 0.35 }}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.055) 1px, transparent 0)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: `linear-gradient(to bottom, transparent, var(--ld-card))`, pointerEvents: "none" }} />

            {/* Expand hint overlay */}
            <motion.div
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, pointerEvents: "none" }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,0,0,0.6)", border: `1px solid ${p.color}55`, backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${p.color}30` }}>
                <Maximize2 size={18} strokeWidth={1.5} style={{ color: p.color }} />
              </div>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "3px 10px", borderRadius: 100 }}>
                {allImages.length > 1 ? `View ${allImages.length} screenshots` : "View fullscreen"}
              </span>
            </motion.div>

            {/* Badges — stopPropagation so they don't trigger lightbox */}
            <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 14, left: 16, display: "flex", gap: 7 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "4px 11px", borderRadius: 100, background: "rgba(0,0,0,0.6)", border: `1px solid ${p.color}55`, color: p.color, backdropFilter: "blur(10px)" }}>{p.platform}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "4px 11px", borderRadius: 100, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.14)", color: p.status === "Live" ? "#22c55e" : p.status === "Running" ? "#fbbf24" : "#94a3b8", backdropFilter: "blur(10px)" }}>● {p.status}</span>
            </div>

            {/* Close — stopPropagation so it doesn't open lightbox */}
            <motion.button
              onClick={e => { e.stopPropagation(); onClose(); }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 10, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.9)", fontSize: "1rem", lineHeight: 1 }}>
              ×
            </motion.button>
          </motion.div>

          {/* Content */}
          <div style={{ padding: "6px clamp(16px, 5vw, 32px) 32px" }}>
            {/* Title + ROI */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{p.title}</h2>
              <span style={{ flexShrink: 0, fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-geist-mono)", color: p.roiColor, padding: "7px 16px", borderRadius: 10, background: `${p.roiColor}12`, border: `1px solid ${p.roiColor}30`, marginTop: 3 }}>{p.roi}</span>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ld-text)", lineHeight: 1.55, marginBottom: 26 }}>{p.outcome}</p>

            {/* ROI metrics — the most visually prominent element on the card */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, marginBottom: 30 }}>
              {p.metrics.map(m => (
                <div key={m.label} style={{ padding: "18px 14px", background: "var(--ld-card2)", border: `1px solid ${m.color}30`, borderRadius: 14, textAlign: "center" }}>
                  <p style={{ fontSize: "1.75rem", fontWeight: 900, color: m.color, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 5 }}>{m.val}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--ld-muted)", fontWeight: 600 }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--ld-border)", marginBottom: 26 }} />

            {/* Business problem */}
            <Section label="Business Problem" color={p.color}>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.78, color: "var(--ld-muted)" }}>{p.problem}</p>
            </Section>

            {/* My role — only shown for projects with a role written up */}
            {p.role && (
              <Section label="My Role" color={p.color}>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.78, color: "var(--ld-muted)" }}>{p.role}</p>
              </Section>
            )}

            {/* Automation workflow */}
            <Section label="How the Automation Works" color={p.color}>
              <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {p.workflowSteps.map((step, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25, ease: E }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, background: `${p.color}14`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: p.color, fontFamily: "var(--font-geist-mono)", marginTop: 1 }}>{i + 1}</span>
                    <span style={{ fontSize: "0.9rem", color: "var(--ld-text)", lineHeight: 1.55 }}>{step}</span>
                  </motion.li>
                ))}
              </ol>
            </Section>

            {/* Before / After */}
            <Section label="Before & After" color={p.color}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f87171", marginBottom: 8 }}>Before</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--ld-muted)", lineHeight: 1.62 }}>{p.beforeAfter.before}</p>
                </div>
                <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", marginBottom: 8 }}>After</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--ld-muted)", lineHeight: 1.62 }}>{p.beforeAfter.after}</p>
                </div>
              </div>
            </Section>

            {/* Tools */}
            <Section label="Tools Used" color={p.color}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {p.tools.map(t => (
                  <span key={t} style={{ fontSize: "0.8rem", fontWeight: 500, padding: "6px 14px", borderRadius: 100, background: `${p.color}0e`, border: `1px solid ${p.color}28`, color: "var(--ld-muted)", fontFamily: "var(--font-geist-mono)" }}>{t}</span>
                ))}
              </div>
            </Section>

            {/* CTA */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <motion.a href="#book-a-call" onClick={onClose}
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px var(--ld-glow)" }} whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 24px", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 0 18px var(--ld-glow)" }}>
                Build Similar System <ArrowRight size={15} strokeWidth={2.5} />
              </motion.a>
              <motion.a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 22px", borderRadius: 100, border: "1px solid var(--ld-border)", color: "var(--ld-muted)", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none" }}>
                <Phone size={14} strokeWidth={1.5} /> For Inquiries
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen lightbox for project screenshots */}
      {lbIdx !== null && (
        <Lightbox
          images={allImages}
          initialIndex={lbIdx}
          onClose={() => setLbIdx(null)}
        />
      )}
    </AnimatePresence>
  );
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 4, height: 16, borderRadius: 2, background: color, flexShrink: 0 }} />
        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ld-muted)" }}>{label}</p>
      </div>
      {children}
    </div>
  );
}

/* ── Mobile project card slider ────────────────────────────── */
function MobileProjectSlider({ projects, onOpenModal }: { projects: ProjItem[]; onOpenModal: (p: ProjItem) => void }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(0);

  useEffect(() => { setIdx(0); }, [projects]);

  const cur = projects[Math.min(idx, projects.length - 1)];
  if (!cur) return null;

  const total = projects.length;
  const go = (d: number) => { setDir(d); setIdx(i => (i + d + total) % total); };

  const variants = {
    enter:  (d: number) => ({ x: d * 56, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d * -56, opacity: 0 }),
  };

  return (
    <div className="block md:hidden">
      {/* Counter + arrows */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--ld-muted)", letterSpacing: "0.1em" }}>
          {idx + 1} / {total}
        </span>
        <div style={{ display: "flex", gap: 7 }}>
          <button type="button" onClick={() => go(-1)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--ld-border)", background: "var(--ld-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ld-muted)" }}>
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <button type="button" onClick={() => go(1)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--ld-borderC)", background: "var(--ld-glow)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ld-accent)" }}>
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Swipeable card */}
      <div style={{ overflow: "hidden", borderRadius: 20 }}>
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={cur.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: E }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => { if (info.offset.x < -40) go(1); else if (info.offset.x > 40) go(-1); }}
            style={{ cursor: "grab" }}
          >
            <div style={{ background: "var(--ld-card)", border: "1px solid var(--ld-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--ld-shadowLg)" }}>
              {/* Screenshot */}
              <div style={{ height: 180, position: "relative", overflow: "hidden", background: `linear-gradient(160deg, #0B1020, ${cur.color}30)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cur.img} alt={cur.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: 0.8, display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(to bottom, transparent, var(--ld-card))` }} />
                <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 6 }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: "rgba(0,0,0,0.55)", border: `1px solid ${cur.color}50`, color: cur.color, backdropFilter: "blur(8px)" }}>{cur.platform}</span>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", color: cur.status === "Live" ? "#22c55e" : cur.status === "Running" ? "#fbbf24" : "#94a3b8", backdropFilter: "blur(8px)" }}>● {cur.status}</span>
                </div>
                <div style={{ position: "absolute", top: 12, right: 14 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, fontFamily: "var(--font-geist-mono)", color: cur.roiColor, padding: "4px 10px", borderRadius: 8, background: `${cur.roiColor}18`, border: `1px solid ${cur.roiColor}38`, backdropFilter: "blur(8px)" }}>{cur.roi}</span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "18px 18px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `${cur.color}14`, border: `1px solid ${cur.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    <cur.Icon size={14} strokeWidth={1.5} style={{ color: cur.color }} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", lineHeight: 1.25, letterSpacing: "-0.01em" }}>{cur.title}</h3>
                </div>
                <p style={{ fontSize: "0.84rem", color: "var(--ld-muted)", lineHeight: 1.6, marginBottom: 14 }}>{cur.outcome}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                  {cur.tools.slice(0, 3).map(t => (
                    <span key={t} style={{ fontSize: "0.67rem", fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: `${cur.color}0d`, border: `1px solid ${cur.color}28`, color: "var(--ld-muted)", fontFamily: "var(--font-geist-mono)" }}>{t}</span>
                  ))}
                  {cur.tools.length > 3 && (
                    <span style={{ fontSize: "0.67rem", fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: "var(--ld-card2)", border: "1px solid var(--ld-border)", color: "var(--ld-muted)", fontFamily: "var(--font-geist-mono)" }}>+{cur.tools.length - 3}</span>
                  )}
                </div>
                <motion.button type="button" onClick={() => onOpenModal(cur)} whileTap={{ scale: 0.97 }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 0", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: "pointer", boxShadow: "0 0 16px var(--ld-glow)" }}>
                  View Full Project <ArrowUpRight size={13} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
        {projects.map((_, i) => (
          <button key={i} type="button"
            onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
            style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, background: i === idx ? "var(--ld-accent)" : "var(--ld-border)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectsSection() {
  const [activeCat,    setActiveCat]    = useState("all");
  const [selectedId,   setSelectedId]   = useState("facebook-ai");
  const [modalProject, setModalProject] = useState<ProjItem | null>(null);
  const [mobileView,   setMobileView]   = useState<"list" | "detail">("list");

  const selectProject = (id: string) => { setSelectedId(id); setMobileView("detail"); };

  // Compute counts from data — always accurate, never hardcoded
  const PROJ_CATS = PROJ_CAT_DEFS.map(c => ({
    ...c,
    count: c.id === "all"
      ? PROJ_DATA.length
      : PROJ_DATA.filter(p => p.cat === c.id).length,
  })).filter(c => c.count > 0 || c.id === "all"); // hide empty categories

  const filtered = PROJ_DATA.filter(p => activeCat === "all" || p.cat === activeCat);
  const sel = PROJ_DATA.find(p => p.id === selectedId) ?? PROJ_DATA[0];

  useEffect(() => {
    if (!filtered.find(p => p.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? "facebook-ai");
    }
  }, [activeCat, filtered, selectedId]);

  const catBtn = (id: string, label: string, count: number) => (
    <button key={id} type="button" onClick={() => setActiveCat(id)} style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 14px", borderRadius: 7, border: "none", cursor: "pointer", textAlign: "left",
      background: activeCat === id ? "var(--ld-glow)" : "transparent",
      color: activeCat === id ? "var(--ld-accent)" : "var(--ld-muted)",
      fontWeight: activeCat === id ? 600 : 500, fontSize: "0.8125rem",
      transition: "all 0.15s ease",
      borderLeft: activeCat === id ? "2px solid var(--ld-accent)" : "2px solid transparent",
    }}>
      <span>{label}</span>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "1px 7px", borderRadius: 100, background: activeCat === id ? "var(--ld-borderC)" : "var(--ld-border)", color: activeCat === id ? "var(--ld-accent)" : "var(--ld-muted)" }}>{count}</span>
    </button>
  );

  return (
    <section id="projects" style={{ padding: "clamp(48px, 9vw, 80px) 20px clamp(20px, 4vw, 32px)", background: "var(--ld-bg)", scrollMarginTop: 50 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <motion.div {...up()} className="text-center" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 8 }}>Real Systems I&apos;ve Built</p>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)" }}>
            Automations That Perform
          </h2>
        </motion.div>

        {/* Mobile slider */}
        <motion.div {...up(0.1)} className="block md:hidden" style={{ marginBottom: 0 }}>
          <MobileProjectSlider
            key={activeCat}
            projects={filtered}
            onOpenModal={(p) => setModalProject(p)}
          />
        </motion.div>

        {/* Dashboard shell — desktop only */}
        <motion.div {...up(0.1)} className="hidden md:block" style={{
          border: "1px solid var(--ld-border)", borderRadius: 16,
          overflow: "hidden", background: "var(--ld-card)",
          boxShadow: "var(--ld-shadowLg)",
        }}>
          {/* Chrome bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", background: "var(--ld-card2)", borderBottom: "1px solid var(--ld-border)" }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--ld-muted)", marginLeft: 8, letterSpacing: "0.03em" }}>Automation Systems Portfolio</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 100, background: "var(--ld-glow)", border: "1px solid var(--ld-borderC)", color: "var(--ld-accent)", fontWeight: 600 }}>
                {filtered.length} systems
              </span>
            </div>
          </div>

          {/* Mobile: category pills */}
          <div className="flex md:hidden" style={{ padding: "10px 14px", borderBottom: "1px solid var(--ld-border)", gap: 6, overflowX: "auto" }}>
            {PROJ_CATS.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveCat(id)} style={{
                padding: "5px 12px", borderRadius: 100, border: "none", cursor: "pointer",
                whiteSpace: "nowrap", fontSize: "0.72rem", fontWeight: 600,
                background: activeCat === id ? "var(--ld-accent)" : "var(--ld-card2)",
                color: activeCat === id ? "#fff" : "var(--ld-muted)",
                flexShrink: 0,
              }}>{label}</button>
            ))}
          </div>

          {/* Three-column layout */}
          <div style={{ display: "flex", height: "clamp(420px, 48vh, 500px)", overflow: "hidden" }}>

            {/* LEFT: category sidebar — desktop only */}
            <div className="hidden md:flex" style={{ width: 158, flexShrink: 0, borderRight: "1px solid var(--ld-border)", padding: "12px 8px", flexDirection: "column", gap: 2 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ld-muted)", padding: "0 6px 8px" }}>Category</p>
              {PROJ_CATS.map(({ id, label, count }) => catBtn(id, label, count))}
            </div>

            {/* CENTER: project list */}
            <div
              className={`${mobileView === "detail" ? "hidden md:block" : "block"} md:max-w-[240px]`}
              style={{ width: "100%", flexShrink: 0, borderRight: "1px solid var(--ld-border)", overflowY: "auto", height: "100%" }}
            >
              <div style={{ padding: "10px 10px 4px", borderBottom: "1px solid var(--ld-border)" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ld-muted)", padding: "0 4px" }}>Systems</p>
              </div>
              <AnimatePresence mode="popLayout">
                {filtered.map(p => (
                  <motion.button key={p.id} type="button"
                    layout
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => selectProject(p.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "12px 12px", border: "none", cursor: "pointer", textAlign: "left",
                      background: selectedId === p.id ? "var(--ld-glow)" : "transparent",
                      borderLeft: selectedId === p.id ? `2px solid ${p.color}` : "2px solid transparent",
                      borderBottom: "1px solid var(--ld-border)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${p.color}14`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      <p.Icon size={13} strokeWidth={1.5} style={{ color: p.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: selectedId === p.id ? "var(--ld-text)" : "var(--ld-muted)", marginBottom: 4, lineHeight: 1.3 }}>{p.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-geist-mono)", color: p.roiColor }}>{p.roi}</span>
                        <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--ld-border)", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--ld-muted)", letterSpacing: "0.04em" }}>{p.platform}</span>
                      </div>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.status === "Live" ? "#22c55e" : p.status === "Running" ? "#fbbf24" : "var(--ld-muted)", flexShrink: 0, marginTop: 5 }} />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* RIGHT: detail panel */}
            <div
              className={mobileView === "list" ? "hidden md:block" : "block"}
              style={{ flex: 1, minWidth: 0, overflowY: "auto", width: "100%", height: "100%" }}
            >
              {/* Back button — mobile only */}
              <button
                className="flex md:hidden"
                type="button"
                onClick={() => setMobileView("list")}
                style={{
                  alignItems: "center", gap: 6,
                  width: "100%", padding: "11px 16px",
                  background: "var(--ld-card2)", border: "none",
                  borderBottom: "1px solid var(--ld-border)",
                  cursor: "pointer", textAlign: "left",
                  color: "var(--ld-muted)", fontSize: "0.8rem", fontWeight: 600,
                }}
              >
                ← All projects
              </button>

              <AnimatePresence mode="wait">
                <motion.div key={sel.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: E }}
                >
                  {/* Screenshot strip */}
                  <div style={{ height: 130, position: "relative", overflow: "hidden", background: `linear-gradient(160deg, #0B1020, ${sel.color}30)` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sel.img} alt={sel.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: 0.75, display: "block" }} />
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "22px 22px" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: `linear-gradient(to bottom, transparent, var(--ld-card))` }} />
                    {/* Badges */}
                    <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 6 }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: "rgba(0,0,0,0.55)", border: `1px solid ${sel.color}50`, color: sel.color, backdropFilter: "blur(8px)" }}>{sel.platform}</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", color: sel.status === "Live" ? "#22c55e" : sel.status === "Running" ? "#fbbf24" : "#94a3b8", backdropFilter: "blur(8px)" }}>
                        ● {sel.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "14px 18px 18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", lineHeight: 1.2, letterSpacing: "-0.01em", minWidth: 0 }}>{sel.title}</h3>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, fontFamily: "var(--font-geist-mono)", color: sel.roiColor, padding: "4px 10px", borderRadius: 8, background: `${sel.roiColor}12`, border: `1px solid ${sel.roiColor}28` }}>{sel.roi}</span>
                    </div>

                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ld-text)", lineHeight: 1.45, marginBottom: 8 }}>{sel.outcome}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--ld-muted)", lineHeight: 1.65, marginBottom: 14 }}>{sel.summary}</p>

                    {/* Tools */}
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ld-muted)", marginBottom: 6 }}>Tools Used</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {sel.tools.map(t => (
                          <span key={t} style={{ fontSize: "0.72rem", fontWeight: 500, padding: "4px 11px", borderRadius: 100, background: `${sel.color}0d`, border: `1px solid ${sel.color}28`, color: "var(--ld-muted)", fontFamily: "var(--font-geist-mono)" }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* CTA — opens inline modal */}
                    <motion.button type="button" onClick={() => setModalProject(sel)}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 20px var(--ld-glow)" }} whileTap={{ scale: 0.97 }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: "pointer", boxShadow: "0 0 16px var(--ld-glow)" }}>
                      View Full Project <ArrowUpRight size={14} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Project detail modal */}
      {modalProject && (
        <ProjectDetailModal project={modalProject} onClose={() => setModalProject(null)} />
      )}
    </section>
  );
}

/* ── How I Work ────────────────────────────────────────────── */
const STEPS = [
  {
    Icon: Search, hex: "#3B82F6", c: "var(--ld-accent)",
    t: "Discover",
    d: "Understand your business, workflow, and goals.",
  },
  {
    Icon: Settings2, hex: "#2563EB", c: "var(--ld-blue)",
    t: "Plan",
    d: "Map the best automation solution for your process.",
  },
  {
    Icon: Wrench, hex: "#7C3AED", c: "var(--ld-purple)",
    t: "Build",
    d: "Develop, test, and connect everything together.",
  },
  {
    Icon: Rocket, hex: "#3B82F6", c: "var(--ld-accent)",
    t: "Launch",
    d: "Deploy your system, document it, and make sure it runs smoothly.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } },
};
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

function HowIWorkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeIdx, setActiveIdx] = useState(-1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setActiveIdx(i), 300 + i * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section id="process" style={{ padding: "clamp(28px, 4vw, 48px) 28px", background: "var(--ld-card2)", position: "relative", overflow: "hidden", scrollMarginTop: 50 }}>
      {/* Subtle background glow — spans the full section, not a fixed box */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(59,130,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", position: "relative" }}>
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: "clamp(24px, 6vw, 40px)" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 8 }}>
            Process
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)", marginBottom: 8 }}>
            How We&apos;ll Work Together
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--ld-muted)", maxWidth: "52ch", margin: "0 auto", lineHeight: 1.7 }}>
            A simple process designed to take your idea from manual work to a reliable business system.
          </p>
        </motion.div>

        {/* Cards + connector */}
        <div style={{ position: "relative" }}>
          {/* Connector line — desktop only, runs through card vertical center */}
          <div className="hidden md:block" style={{
            position: "absolute", top: "50%", left: "calc(12.5% + 12px)", right: "calc(12.5% + 12px)",
            height: 1, transform: "translateY(-50%)",
            background: `linear-gradient(90deg, #3B82F628, #2563EB50, #7C3AED50, #3B82F628)`,
            zIndex: 0,
          }} />

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, position: "relative", zIndex: 1 }}
          >
            {STEPS.map(({ Icon, t, d, c, hex }, i) => {
              const isActive = activeIdx >= i;
              const isHovered = hoveredIdx === i;
              return (
                <motion.div
                  key={t}
                  variants={cardVariants}
                  whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    padding: "24px 22px",
                    borderRadius: 22,
                    border: `1px solid ${isHovered ? hex + "aa" : isActive ? hex + "50" : "var(--ld-border)"}`,
                    background: isHovered ? `linear-gradient(160deg, var(--ld-card), ${hex}08)` : "var(--ld-card)",
                    boxShadow: isHovered
                      ? `0 0 60px ${hex}38, 0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)`
                      : isActive
                      ? `0 0 28px ${hex}18, 0 4px 20px rgba(0,0,0,0.2)`
                      : "0 4px 20px rgba(0,0,0,0.12)",
                    transition: "border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease",
                    position: "relative",
                    cursor: "default",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: "clamp(42px, 10vw, 56px)", height: "clamp(42px, 10vw, 56px)", borderRadius: 16,
                    marginBottom: "clamp(16px, 5vw, 28px)",
                    background: `linear-gradient(135deg, ${hex}22, ${hex}0a)`,
                    border: `1px solid ${hex}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isHovered ? `0 0 20px ${hex}30` : "none",
                    transition: "box-shadow 0.3s ease",
                    flexShrink: 0,
                  }}>
                    <Icon size={24} strokeWidth={1.5} style={{ color: c }} />
                  </div>

                  {/* Title — thin weight, tinted with the step's accent color */}
                  <h3 style={{ fontSize: "1.1875rem", fontWeight: 500, color: c, fontFamily: "var(--font-display)", marginBottom: 14, lineHeight: 1.25, letterSpacing: "-0.01em" }}>{t}</h3>

                  {/* Description */}
                  <p style={{ fontSize: "0.875rem", color: "var(--ld-muted)", lineHeight: 1.75, flex: 1 }}>{d}</p>

                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}


/* ── About ─────────────────────────────────────────────────── */
function AboutSection() {
  const [pulse,    setPulse]    = useState(false);

  function handleClick() {
    if (pulse) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 700);
  }

  return (
    <section id="about" style={{ padding: "clamp(36px, 8vw, 60px) 28px", background: "var(--ld-bg)", scrollMarginTop: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(28px, 6vw, 64px)", alignItems: "center" }}>
        <motion.div {...up(0)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Clickable photo with glow interaction */}
          <motion.div
            onClick={handleClick}
            whileHover="hover"
            animate={pulse ? "pulse" : "rest"}
            variants={{
              rest:  { scale: 1 },
              hover: { scale: 1.03 },
              pulse: { scale: [1, 1.05, 1.01, 1], transition: { duration: 0.5, ease: "easeOut" } },
            }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            style={{ position: "relative", width: "clamp(160px, 40vw, 240px)", height: "clamp(160px, 40vw, 240px)", cursor: "pointer", flexShrink: 0 }}
          >
            {/* Ambient glow */}
            <motion.div
              variants={{
                rest:  { opacity: 0, scale: 1 },
                hover: { opacity: 0.6, scale: 1.06 },
                pulse: { opacity: [0.7, 1, 0], scale: [1.06, 1.18, 1], transition: { duration: 0.55, ease: "easeOut" } },
              }}
              animate={pulse ? "pulse" : undefined}
              whileHover="hover"
              initial="rest"
              transition={{ duration: 0.3 }}
              style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, var(--ld-glow) 0%, transparent 70%)", pointerEvents: "none" }}
            />

            {/* Ring — appears on hover and pulse */}
            <motion.div
              variants={{
                rest:  { opacity: 0 },
                hover: { opacity: 1, boxShadow: "0 0 0 2px var(--ld-accent)" },
                pulse: { opacity: [1, 0], boxShadow: ["0 0 0 2px var(--ld-accent)", "0 0 0 8px transparent"], transition: { duration: 0.5 } },
              }}
              animate={pulse ? "pulse" : undefined}
              whileHover="hover"
              initial="rest"
              transition={{ duration: 0.25 }}
              style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1px solid transparent", pointerEvents: "none" }}
            />

            {/* Subtle static ring */}
            <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "1px solid var(--ld-borderC)", opacity: 0.5, pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "1px solid var(--ld-borderC)", opacity: 0.2, pointerEvents: "none" }} />

            {/* Photo */}
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.04 }, pulse: { scale: [1.04, 1.01, 1] } }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--ld-borderC)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/profile.jpg" alt="Jell Urmeneta" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            </motion.div>
          </motion.div>

        </motion.div>

        <motion.div {...up(0.1)}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 16 }}>About</p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.025em", marginBottom: 18, lineHeight: 1.2 }}>
            Hi, I&apos;m Jell.
          </h2>
          <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "var(--ld-muted)", maxWidth: "40ch", marginBottom: 24 }}>
            I build AI-powered business systems that simplify operations through workflow automation, system integrations, and process optimization. My focus is creating reliable systems that remove repetitive work and help businesses operate more efficiently.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── CTA ───────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section id="book-a-call" style={{ padding: "clamp(28px, 4vw, 48px) 28px", background: "var(--ld-card2)", position: "relative", overflow: "hidden", scrollMarginTop: 50 }}>
      <div className="ld-ambient-glow" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 320, background: "radial-gradient(ellipse, var(--ld-glow) 0%, transparent 70%)", opacity: 0.4, pointerEvents: "none" }} />

      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>

        {/* Header — centered */}
        <motion.div {...up()} style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 8 }}>
            Book a Call
          </p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.025em", marginBottom: 12, lineHeight: 1.2 }}>
            Let&apos;s Connect The Pieces
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--ld-muted)", lineHeight: 1.5, maxWidth: "38ch", margin: "0 auto" }}>
            Got something worth automating? Pick a time and let&apos;s build.
          </p>
        </motion.div>

        <motion.div {...up(0.1)} style={{ marginTop: 32 }}>
          <BookingCalendar />
        </motion.div>

      </div>
    </section>
  );
}

/* ── Contact ───────────────────────────────────────────────── */
const CONTACT_OPTIONS = [
  { Icon: Mail,     label: "Email",    value: "jellurmeneta64@gmail.com",     href: "mailto:jellurmeneta64@gmail.com",          external: false },
  { Icon: Phone,    label: "WhatsApp", value: "+63 948 553 0304",             href: "https://wa.me/639485530304",               external: true  },
  { Icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/jellurmeneta", href: "https://www.linkedin.com/in/jellurmeneta", external: true  },
  { Icon: MapPin,   label: "Location", value: "Rizal, Philippines",           href: null,                                        external: false },
] as const;

const contactInputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 12,
  background: "var(--ld-card)", border: "1px solid var(--ld-border)",
  color: "var(--ld-text)", fontSize: "0.9rem", fontFamily: "var(--font-body)",
  outline: "none", boxShadow: "none", transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

function ContactSection() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--ld-accent)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--ld-glow)";
  };
  const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--ld-border)";
    e.currentTarget.style.boxShadow = "none";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      form.reset();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" style={{ padding: "clamp(28px, 4vw, 48px) 28px", background: "var(--ld-card2)", position: "relative", overflow: "hidden", scrollMarginTop: 50 }}>
      <div className="ld-ambient-glow" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 320, background: "radial-gradient(ellipse, var(--ld-glow) 0%, transparent 70%)", opacity: 0.4, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative", width: "100%" }}>

        {/* Header — centered, matches "Book a Call" hierarchy */}
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 8 }}>
            Contact
          </p>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
            Get in Touch
          </h2>
        </motion.div>

        {/* Content — two-column: info + form */}
        <motion.div {...up(0.1)} className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] items-start" style={{ gap: 40 }}>

          {/* Left — description + contact list */}
          <div>
            <p className="md:whitespace-nowrap" style={{ fontSize: "0.9375rem", color: "var(--ld-text)", lineHeight: 1.6, marginBottom: 3 }}>
              Have a workflow that makes you go, &ldquo;There has to be a better way&rdquo;?
            </p>
            <p className="md:whitespace-nowrap" style={{ fontSize: "0.9375rem", color: "var(--ld-muted)", lineHeight: 1.6, marginBottom: 20 }}>
              There probably is. Reach out, and let&apos;s make it happen.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CONTACT_OPTIONS.map(({ Icon, label, value, href, external }) => {
                const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, textDecoration: "none" };
                const inner = (
                  <>
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: "var(--ld-glow)", border: "1px solid var(--ld-borderC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={17} strokeWidth={1.5} style={{ color: "var(--ld-accent)" }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ld-muted)", marginBottom: 1 }}>{label}</p>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, fontFamily: "var(--font-body)", color: "var(--ld-text)", wordBreak: "break-word" }}>{value}</p>
                    </div>
                  </>
                );
                return href ? (
                  <motion.a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    style={rowStyle}
                  >
                    {inner}
                  </motion.a>
                ) : (
                  <div key={label} style={rowStyle}>{inner}</div>
                );
              })}
            </div>
          </div>

          {/* Right — form */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: E }}
                style={{ borderRadius: 16, border: "1px solid var(--ld-border)", background: "var(--ld-card)", padding: "28px 24px", textAlign: "center" }}
              >
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--ld-accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Check size={19} strokeWidth={2.5} color="#fff" />
                </div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--ld-text)", marginBottom: 4 }}>
                  Message sent
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--ld-muted)", lineHeight: 1.5, marginBottom: 14 }}>
                  Thanks for reaching out — I&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ld-accent)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: E }}
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <input id="contact-name" name="name" type="text" required disabled={submitting} aria-label="Name" placeholder="Your Name"
                  style={{ ...contactInputStyle, opacity: submitting ? 0.6 : 1 }} onFocus={focusField} onBlur={blurField} />

                <input id="contact-email" name="email" type="email" required disabled={submitting} aria-label="Email" placeholder="Your Email"
                  style={{ ...contactInputStyle, opacity: submitting ? 0.6 : 1 }} onFocus={focusField} onBlur={blurField} />

                <textarea id="contact-message" name="message" required disabled={submitting} aria-label="Message" rows={3} placeholder="Your Message"
                  style={{ ...contactInputStyle, resize: "vertical", minHeight: 72, fontFamily: "var(--font-body)", opacity: submitting ? 0.6 : 1 }}
                  onFocus={focusField} onBlur={blurField} />

                {error && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.8rem", color: "#EF4444", lineHeight: 1.5 }}>
                    <AlertCircle size={14} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{error}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { y: -1, boxShadow: "0 0 24px var(--ld-glow)" } : undefined}
                  whileTap={!submitting ? { scale: 0.98 } : undefined}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: submitting ? "default" : "pointer", boxShadow: "0 0 16px var(--ld-glow)", marginTop: 2, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <><Loader2 size={15} strokeWidth={2.5} className="animate-spin" /> Sending…</>
                  ) : (
                    <>Send Message <ArrowRight size={15} strokeWidth={2.5} /></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

        </motion.div>

      </div>
    </section>
  );
}

/* ── Interactive portfolio section ──────────────────────── */
function PortfolioSection() {
  const [, setOrbState] = useState<OrbState>("idle");
  const handleOrbState  = useCallback((s: OrbState) => setOrbState(s), []);

  return (
    <section id="portfolio" style={{ background: "#05070B", position: "relative", overflow: "hidden", paddingTop: "clamp(40px, 8vw, 80px)", paddingBottom: "clamp(40px, 8vw, 80px)" }}>
      <MouseGradient />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(59,130,246,0.04) 1px, transparent 0)", backgroundSize: "30px 30px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "0 20px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: E }}
          style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3B82F6", padding: "6px 14px", borderRadius: 100, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)", marginBottom: 10 }}>
            <Sparkles size={11} strokeWidth={2} />
            AI-Powered Business Assistant
          </span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "#F8FAFC", fontFamily: "var(--font-display)", lineHeight: 1.15 }}>
            Not Sure Where to Start?
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "#94A3B8", lineHeight: 1.6, maxWidth: "44ch", margin: "6px auto 0" }}>
            Ask my AI — instant answers about pricing, services, and what I can automate for your business.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.08, ease: E }} style={{ marginBottom: 10 }}>
          <FloatingDock />
        </motion.div>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.16) 30%,rgba(59,130,246,0.16) 70%,transparent)", marginBottom: 0 }} />

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.18, ease: E }}>
          <Chat onOrbStateChange={handleOrbState} />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────── */
function Footer() {
  const links = [
    { Icon: Linkedin, href: "https://www.linkedin.com/in/jellurmeneta", label: "LinkedIn" },
    { Icon: Mail,     href: "mailto:jellurmeneta64@gmail.com",          label: "Email"    },
  ];
  return (
    <footer style={{ borderTop: "1px solid var(--ld-border)", padding: "28px 0", background: "var(--ld-bg)" }}>
      {/* Mobile: stacked centered · Desktop: 3-column grid */}
      <div
        className="flex flex-col items-center gap-8 md:grid md:items-center md:gap-6"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", gridTemplateColumns: "1fr auto 1fr" }}
      >

        {/* Left — brand block */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left" style={{ gap: 6 }}>
          <motion.a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            animate={{ filter: ["drop-shadow(0 0 0px transparent)", "drop-shadow(0 0 8px rgba(139,92,246,0.40))", "drop-shadow(0 0 0px transparent)"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "baseline", gap: 5, cursor: "pointer" }}
          >
            <span style={{ fontSize: "0.875rem", fontWeight: 900, letterSpacing: "0.05em", color: "var(--ld-text)", fontFamily: "var(--font-display)", textTransform: "uppercase", lineHeight: 1 }}>
              Jell
            </span>
            <span className="ld-text-shimmer" style={{ fontSize: "0.875rem", fontWeight: 800, letterSpacing: "0.05em", fontFamily: "var(--font-display)", textTransform: "uppercase", lineHeight: 1 }}>
              Urmeneta
            </span>
          </motion.a>
          <p style={{ fontSize: "0.75rem", color: "var(--ld-muted)", opacity: 0.7, letterSpacing: "0.01em" }}>AI Automation Specialist</p>
          <p style={{ fontSize: "0.68rem", color: "var(--ld-muted)", opacity: 0.42, letterSpacing: "0.01em" }}>Built for businesses that take operations seriously.</p>
        </div>

        {/* Center — micro CTA */}
        <a
          href="#portfolio"
          style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, opacity: 0.6, transition: "opacity 0.2s ease" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "0.6")}
        >
          <span style={{ fontSize: "0.68rem", color: "var(--ld-muted)", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>Not sure where to start?</span>
          <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--ld-accent)", letterSpacing: "0.01em", display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
            Ask my AI <ArrowRight size={11} strokeWidth={2.5} />
          </span>
        </a>

        {/* Right — icons + copyright */}
        <div className="flex flex-col items-center gap-2.5 md:justify-self-end">
          <div style={{ display: "flex", gap: 7 }}>
            {links.map(({ Icon, href, label }) => (
              <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.08, borderColor: "var(--ld-borderC)" }} whileTap={{ scale: 0.95 }} title={label}
                style={{ width: 36, height: 36, borderRadius: 9, background: "var(--ld-card)", border: "1px solid var(--ld-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ld-muted)", textDecoration: "none" }}>
                <Icon size={14} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
          <p style={{ fontSize: "0.65rem", color: "var(--ld-muted)", opacity: 0.35, textAlign: "center", whiteSpace: "nowrap" }}>
            © {new Date().getFullYear()} Jell Urmeneta · Built with intention
          </p>
        </div>

      </div>
    </footer>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes nodePulse { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.35)} }
      `}</style>
      <div style={{ background: "var(--ld-bg)", color: "var(--ld-text)", minHeight: "100dvh", fontFamily: "var(--font-geist-sans),system-ui,sans-serif" }}>
        <Navbar />
        <HeroSection />
        <TrustBar />
        <ServicesSection />
        <HowIWorkSection />
        <ProjectsSection />
        <SocialProofSection />
        <AboutSection />
        <CTASection />
        <ContactSection />
        <PortfolioSection />
        <Footer />
      </div>
    </>
  );
}
