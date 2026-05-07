"use client";

import { useEffect, useState, memo, useRef, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";
import Lightbox from "@/components/Lightbox";
import type { OrbState } from "@/components/AIOrb";

const Chat          = dynamic(() => import("@/components/Chat"),          { ssr: false });
const FloatingDock  = dynamic(() => import("@/components/FloatingDock"),  { ssr: false });
const MouseGradient = dynamic(() => import("@/components/MouseGradient"), { ssr: false });

import {
  ArrowRight, Zap, Bot, Database, Film, Users, FileText,
  MessageSquare, Mail, BarChart3, TrendingUp, CheckCircle,
  ArrowUpRight, Clock, Sparkles, Activity, Phone, Linkedin,
  Star, Search, Wrench, Rocket, Maximize2, Menu, X,
  ChevronLeft, ChevronRight,
} from "lucide-react";

/* ── Constants ─────────────────────────────────────────── */
const CALENDLY = "https://calendly.com/jellurmeneta64/30min";
const WHATSAPP  = "https://wa.me/639485530304";

/* ── Animation helpers ─────────────────────────────────── */
const E = [0.16, 1, 0.3, 1] as const;
const up = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: E },
});

/* ── Animated counter ──────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inV = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inV) return;
    let f: number;
    const t0 = performance.now();
    const dur = 2000;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) f = requestAnimationFrame(tick);
    };
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [inV, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: E }}
      style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}
    >
      {/* Browser chrome */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--ld-border)",
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

        {/* Messages */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10, minHeight: 260 }}>
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
  { label: "Projects", href: "#projects" },
  { label: "Process",  href: "#process"  },
  { label: "About",    href: "#about"    },
];
const NAV_CTA = { label: "Let's Talk", href: "#contact" };

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
      <div className="hidden sm:flex" style={{
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

          {/* Let's Talk — highest-intent nav item */}
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
        </nav>

        <div style={{ marginLeft: 24 }}>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="flex sm:hidden" style={{ padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
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

        {/* Hamburger */}
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
          className="sm:hidden"
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
            {[...NAV_ITEMS, { label: "Let's Talk", href: NAV_CTA.href }].map(({ label, href }, i) => (
              <motion.a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.22, ease: E }}
                style={{
                  fontSize: "1.125rem", fontWeight: 600,
                  color: label === "Let's Talk" ? "var(--ld-accent)" : "var(--ld-text)",
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

            {/* Theme row — same size and padding as nav items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (NAV_ITEMS.length + 1) * 0.06, duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0", borderBottom: "1px solid var(--ld-border)",
              }}
            >
              <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--ld-text)" }}>Theme</span>
              <ThemeToggle />
            </motion.div>

            {/* Book CTA */}
            <motion.a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (NAV_ITEMS.length + 2) * 0.06, duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 20, padding: "13px 0", borderRadius: 100,
                background: "var(--ld-accent)", color: "#fff",
                fontWeight: 700, fontSize: "1rem", textDecoration: "none",
              }}
            >
              Book Your Consultation <ArrowRight size={15} strokeWidth={2.5} />
            </motion.a>

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
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 68 }}>
      {/* Hero dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, var(--ld-borderC) 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.25, pointerEvents: "none" }} />
      {/* Spotlight — blue top center */}
      <div className="ld-ambient-glow" style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* Violet accent — right */}
      <div className="ld-ambient-glow" style={{ position: "absolute", top: "15%", right: "0%", width: 480, height: 480, background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* Blue accent — bottom left */}
      <div className="ld-ambient-glow" style={{ position: "absolute", bottom: "10%", left: "0%", width: 320, height: 320, background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
      <Particles />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(28px, 6vw, 60px) clamp(24px, 5vw, 28px)", width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>

        {/* Left */}
        <div className="text-center sm:text-left">

          <motion.h1 {...up(0.06)} style={{ fontSize: "clamp(1.8rem, 5vw, 3.4rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--ld-text)", fontFamily: "var(--font-display)", marginBottom: 16 }}>
            <span className="ld-gradient">Save Time. Capture More Leads.</span>{" "}
            Automate Manual Work.
          </motion.h1>

          <motion.p {...up(0.12)} className="mx-auto sm:mx-0" style={{ fontSize: "1rem", lineHeight: 1.65, color: "var(--ld-text)", opacity: 0.78, maxWidth: "42ch", marginBottom: "clamp(20px, 4vw, 32px)" }}>
            I build AI systems for service businesses — automating lead handling, bookings, support, and repetitive workflows.
          </motion.p>

          <motion.div {...up(0.18)} className="flex-col sm:flex-row justify-center sm:justify-start" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
            <motion.a href="#contact"
              whileHover={{ scale: 1.03, boxShadow: "0 0 32px var(--ld-glow)" }} whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto justify-center"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 28px", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none", boxShadow: "0 0 20px var(--ld-glow)" }}>
              Book a Free Discovery Call <ArrowRight size={16} strokeWidth={2.5} />
            </motion.a>
            <motion.a href="#projects"
              whileHover={{ borderColor: "var(--ld-accent)", color: "var(--ld-accent)" }}
              className="w-full sm:w-auto justify-center"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 26px", borderRadius: 100, border: "1px solid var(--ld-borderC)", color: "var(--ld-muted)", fontWeight: 600, fontSize: "0.9375rem", textDecoration: "none", transition: "all 0.2s ease" }}>
              See Proven Systems <ArrowUpRight size={15} strokeWidth={2} />
            </motion.a>
          </motion.div>

        </div>

        {/* Right — animated chat preview */}
        <ChatPreview />
      </div>
    </section>
  );
}

/* ── Trust bar ─────────────────────────────────────────────── */
/* ── Brand logo SVGs ────────────────────────────────────────── */
const BrandIcon = ({ name, color }: { name: string; color: string }) => {
  const icons: Record<string, React.ReactNode> = {
    OpenAI: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M22.28 9.82a6 6 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.5a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68V11.3l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.4zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.58zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97V11.6a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L3.97 14c-1.6-.93-2.13-2.96-1.63-4.61zm16.6 3.85-5.81-3.35 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1V12.6a.79.79 0 0 0-.43-.85zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07A4.5 4.5 0 0 1 13.63 2.6l-.14.08-4.78 2.76a.8.8 0 0 0-.4.68v6.74zm1.1-2.37 2.6-1.5 2.61 1.5v3l-2.6 1.5-2.6-1.5V10.5z"/>
      </svg>
    ),
    Claude: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M4.88 0A4.88 4.88 0 0 0 0 4.88v14.24A4.88 4.88 0 0 0 4.88 24h14.24A4.88 4.88 0 0 0 24 19.12V4.88A4.88 4.88 0 0 0 19.12 0H4.88zm9.954 4.458 4.586 13.084h-2.613l-.924-2.808H11.38l-.924 2.808H7.843L12.43 4.458h2.404zm-1.19 2.923-1.804 5.39h3.608l-1.804-5.39z"/>
      </svg>
    ),
    Gemini: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 24A14.3 14.3 0 0 0 0 12 14.3 14.3 0 0 0 12 0a14.3 14.3 0 0 0 12 12 14.3 14.3 0 0 0-12 12z"/>
      </svg>
    ),
    n8n: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6a8.4 8.4 0 1 1 0 16.8A8.4 8.4 0 0 1 12 3.6zm-3.6 5.4v6h1.8V10.8l3 4.2 3-4.2V15h1.8V9H16.2l-2.4 3.36L11.4 9H8.4z"/>
      </svg>
    ),
    Make: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 7.05A7 7 0 0 1 19 12h-2a5 5 0 0 0-1.464-3.536L16.95 7.05zM5 12a7 7 0 0 1 7-7V3a9 9 0 0 0 0 18v-2a7 7 0 0 1-7-7zm7 7a7 7 0 0 1-4.95-2.05l-1.414 1.414A9 9 0 0 0 21 12h-2a7 7 0 0 1-7 7z"/>
      </svg>
    ),
    Zapier: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M24 10.98h-7.13L21.9 5.94l-2.03-2.85-5.46 4.2V0h-4.82v7.28L4.13 3.09 2.1 5.94l5.03 5.04H0v3.5h7.13L2.1 19.52 4.13 22 9.6 17.8V24h4.82v-6.2l5.46 4.2 2.03-2.85-5.03-4.68H24v-3.5z"/>
      </svg>
    ),
    Supabase: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.199 12.78.748 13.822 1.667 13.822h7.517l.045 9.122c.015.986 1.26 1.41 1.874.637l9.262-11.651c.565-.73.016-1.772-.903-1.772h-7.517L11.9 1.036z"/>
      </svg>
    ),
    Airtable: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 0L1.892 4.358v6.75L12 15.48l10.108-4.372V4.358L12 0zM1.892 13.392V19.5L12 24v-6.108L1.892 13.392zm20.216 0L12 17.892V24l10.108-4.5v-6.108z"/>
      </svg>
    ),
    Google: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 12h8.52c.06.42.08.86.08 1.32C20.6 17.9 17.1 21 12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9c2.43 0 4.46.89 6.04 2.35L15.87 7.5A5.97 5.97 0 0 0 12 6a6 6 0 1 0 0 12c2.97 0 5.46-1.82 5.78-4.5H12V12z"/>
      </svg>
    ),
    Meta: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973.14.604.35 1.153.63 1.61.28.457.63.84 1.05 1.107.42.267.91.4 1.46.4.51 0 .97-.086 1.39-.259.42-.173.81-.43 1.19-.77.78-.68 1.51-1.819 2.21-3.42l.56-1.33.51-1.244.35-.87c.19.37.39.77.58 1.19.19.42.39.856.59 1.308.2.453.4.908.6 1.364.2.456.41.897.62 1.32.45.912.88 1.518 1.3 1.817.41.3.95.45 1.59.45.57 0 1.05-.156 1.44-.467.39-.31.68-.77.85-1.376.19-.604.27-1.322.27-2.155 0-1.06-.11-2.095-.34-3.103-.22-1.008-.55-1.93-.99-2.763-.44-.834-.99-1.505-1.66-2.014-.67-.51-1.46-.764-2.37-.764zm0 2.37c.48 0 .9.153 1.27.46.37.306.7.735.99 1.287.3.553.55 1.198.77 1.937.22.738.4 1.528.54 2.37H5.37c-.17-.842-.37-1.63-.6-2.368-.22-.738-.48-1.38-.79-1.926-.3-.545-.65-.97-1.02-1.276-.37-.306-.78-.46-1.22-.46-.73 0-1.4.4-1.99 1.2-.6.8-1.06 1.842-1.38 3.126-.3 1.284-.49 2.7-.56 4.25.03.75.13 1.39.28 1.92.16.53.37.93.63 1.2.26.27.57.41.91.41.46 0 .93-.3 1.41-.89.48-.59 1.01-1.57 1.59-2.94l.42-1 .43-1.07.5-1.27.43 1.04c.2.5.4 1.01.6 1.52.2.51.4 1.01.6 1.48.2.47.41.9.62 1.3.45.86.87 1.43 1.27 1.7.4.27.87.41 1.43.41.5 0 .92-.14 1.26-.42.34-.28.59-.71.73-1.28.14-.57.22-1.27.22-2.1 0-.97-.1-1.9-.3-2.8-.2-.9-.49-1.7-.89-2.4-.4-.7-.89-1.26-1.47-1.68-.58-.42-1.25-.63-2.01-.63z"/>
      </svg>
    ),
    Slack: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
    OpenRouter: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M3 3h4v4H3V3zm14 0h4v4h-4V3zm-7 7h4v4h-4v-4zm-7 7h4v4H3v-4zm14 0h4v4h-4v-4zM3 10.5h4v1H3v-1zm14 0h4v1h-4v-1zM10 3v4h1V3h-1zm0 14v4h1v-4h-1zM6.5 10.5v1h1v4h1v-4h1v-1h-3zm9 0v1h1v4h1v-4h1v-1h-3z"/>
      </svg>
    ),
    GitHub: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    Notion: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
      </svg>
    ),
    Xero: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.243 15.324L8.59 13.15l-2.166 2.174a.902.902 0 0 1-1.275-1.275l2.174-2.166-2.174-2.166a.902.902 0 0 1 1.275-1.275L8.59 10.61l2.167-2.168a.902.902 0 0 1 1.275 1.275l-2.174 2.166 2.174 2.166a.902.902 0 0 1-1.275 1.275zm7.003.57a3.27 3.27 0 0 1-2.378-1.003l-1.094 1.572a.45.45 0 0 1-.748-.499l1.09-1.568a3.27 3.27 0 1 1 3.13 1.498zm0-5.594a2.32 2.32 0 1 0 0 4.64 2.32 2.32 0 0 0 0-4.64z"/>
      </svg>
    ),
    Vapi: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
    ElevenLabs: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
        <path d="M9 3h2v18H9zm4 0h2v18h-2z"/>
      </svg>
    ),
  };

  return icons[name] ?? (
    <svg viewBox="0 0 24 24" width="14" height="14" fill={color}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none"/>
      <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill={color}>{name[0]}</text>
    </svg>
  );
};

const TECHS = [
  { name: "OpenAI",     c: "#10a37f" },
  { name: "Claude",     c: "#cc785c" },
  { name: "Gemini",     c: "#4285F4" },
  { name: "n8n",        c: "#ea4b71" },
  { name: "Make",       c: "#9b59b6" },
  { name: "Zapier",     c: "#ff4a00" },
  { name: "GitHub",     c: "#f0f6fc" },
  { name: "Notion",     c: "#ffffff"  },
  { name: "Xero",       c: "#13B5EA" },
  { name: "Vapi",       c: "#7C3AED" },
  { name: "ElevenLabs", c: "#f97316" },
  { name: "Airtable",   c: "#fcb400" },
  { name: "Google",     c: "#4285F4" },
  { name: "Slack",      c: "#4A154B" },
  { name: "OpenRouter", c: "#6467f2" },
];

function TrustBar() {
  const doubled = [...TECHS, ...TECHS];
  return (
    <section style={{ padding: "20px 0 40px", borderTop: "1px solid var(--ld-border)", background: "var(--ld-card2)", overflow: "hidden" }}>
      <p style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-muted)", marginBottom: 20 }}>Powered By Industry-Leading Tools</p>
      <div style={{ position: "relative" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", width: "max-content", gap: 10 }}
        >
          {doubled.map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2, borderColor: `${b.c}60`, boxShadow: `0 4px 20px ${b.c}22` }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "10px 20px 10px 12px",
                background: "var(--ld-card)",
                border: "1px solid var(--ld-border)",
                borderRadius: 100,
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                cursor: "default",
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              }}
            >
              {/* Icon tile */}
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: `${b.c}16`,
                border: `1px solid ${b.c}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BrandIcon name={b.name} color={b.c} />
              </div>
              {/* Name */}
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ld-text)", letterSpacing: "0.01em" }}>
                {b.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 80, background: "linear-gradient(to right, var(--ld-card2), transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 80, background: "linear-gradient(to left, var(--ld-card2), transparent)", pointerEvents: "none" }} />
      </div>
    </section>
  );
}

/* ── Results ───────────────────────────────────────────────── */
const STATS = [
  { val: null,  target: 70, suffix: "%+", label: "Average reduction in manual work",    Icon: BarChart3,  c: "var(--ld-accent)"  },
  { val: "24/7",target: null, suffix: "",  label: "Active — no human required",          Icon: Clock,      c: "var(--ld-blue)"    },
  { val: null,  target: 3,  suffix: "×",  label: "Faster lead response time",           Icon: TrendingUp, c: "var(--ld-purple)"  },
  { val: "<60s",target: null, suffix: "",  label: "To qualify an inbound lead",          Icon: Activity,   c: "var(--ld-accent)"  },
];

function ResultsSection() {
  return (
    <section id="results" style={{ padding: "80px 28px", background: "var(--ld-bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 14 }}>Measured Impact</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)" }}>
            Save Time. Recover Revenue. Scale Smarter.
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {STATS.map(({ val, target, suffix, label, Icon, c }, i) => (
            <motion.div key={label} {...up(i * 0.08)}
              whileHover={{ y: -4, boxShadow: `0 0 0 1px ${c}22, 0 20px 60px rgba(0,0,0,0.55), 0 0 40px ${c}0a` }}
              style={{ padding: "clamp(20px, 4vw, 36px) clamp(18px, 3vw, 28px)", background: "var(--ld-card)", border: "1px solid var(--ld-border)", borderRadius: 22, boxShadow: "var(--ld-shadow)", transition: "all 0.28s ease" }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 20, background: `${c}12`, border: `1px solid ${c}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} strokeWidth={1.5} style={{ color: c }} />
              </div>
              <p style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 900, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1 }}>
                {val ?? (target !== null ? <Counter target={target} suffix={suffix} /> : "—")}
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--ld-muted)", lineHeight: 1.55 }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Services ──────────────────────────────────────────────── */
const SERVICES = [
  { Icon: Zap,           c: "var(--ld-accent)",  t: "Instant Lead Qualification",          d: "Automatically capture, qualify, and route inbound leads so your team only talks to ready-to-buy prospects." },
  { Icon: Bot,           c: "var(--ld-purple)",  t: "Automated Booking & Follow-Ups",      d: "Reduce no-shows and back-and-forth scheduling with automated confirmations, reminders, and follow-ups." },
  { Icon: MessageSquare, c: "var(--ld-blue)",    t: "24/7 AI Customer Support",            d: "Answer common questions instantly, qualify inquiries, and escalate important conversations automatically." },
  { Icon: Film,          c: "var(--ld-accent)",  t: "Content Distribution Workflows",      d: "Turn one piece of content into platform-ready posts and distribute them automatically across channels." },
  { Icon: Database,      c: "var(--ld-purple)",  t: "Automated CRM & Pipeline Updates",   d: "Keep your CRM updated automatically with lead tracking, tagging, follow-ups, and contact management." },
  { Icon: Users,         c: "var(--ld-blue)",    t: "Manual Tasks Removed",               d: "Eliminate repetitive admin work with automated processes, notifications, data entry, and internal workflows." },
];

function ServicesSection() {
  return (
    <section id="services" style={{ padding: "80px 28px", background: "var(--ld-card2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...up()} style={{ marginBottom: 60 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 14 }}>What Gets Fixed</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)", maxWidth: "22ch" }}>
            Where Automation Creates Leverage
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {SERVICES.map(({ Icon, c, t, d }, i) => (
            <motion.div key={t} {...up(i * 0.07)}
              whileHover={{ y: -4, borderColor: c, boxShadow: `0 0 0 1px ${c}25, 0 16px 48px rgba(0,0,0,0.55), 0 0 32px ${c}08` }}
              style={{ padding: "30px 26px", background: "var(--ld-card)", border: "1px solid var(--ld-border)", borderRadius: 20, transition: "all 0.28s ease", boxShadow: "var(--ld-shadow)" }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 13, marginBottom: 20, background: `${c}12`, border: `1px solid ${c}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
}

const PROJ_DATA: ProjItem[] = [
  {
    id:"facebook-ai", cat:"support", Icon:MessageSquare, color:"#22d3ee", platform:"n8n", status:"Live",
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lbIdx === null) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
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
              <span style={{ flexShrink: 0, fontSize: "0.9rem", fontWeight: 800, fontFamily: "var(--font-geist-mono)", color: p.roiColor, padding: "6px 14px", borderRadius: 10, background: `${p.roiColor}12`, border: `1px solid ${p.roiColor}30`, marginTop: 3 }}>{p.roi}</span>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ld-text)", lineHeight: 1.55, marginBottom: 26 }}>{p.outcome}</p>

            {/* ROI metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, marginBottom: 30 }}>
              {p.metrics.map(m => (
                <div key={m.label} style={{ padding: "16px 14px", background: "var(--ld-card2)", border: "1px solid var(--ld-border)", borderRadius: 14, textAlign: "center" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 900, color: m.color, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 5 }}>{m.val}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--ld-muted)", fontWeight: 500 }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--ld-border)", marginBottom: 26 }} />

            {/* Business problem */}
            <Section label="Business Problem" color={p.color}>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.78, color: "var(--ld-muted)" }}>{p.problem}</p>
            </Section>

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
              <motion.a href={CALENDLY} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px var(--ld-glow)" }} whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 24px", borderRadius: 100, background: "var(--ld-accent)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 0 18px var(--ld-glow)" }}>
                Build Similar System <ArrowRight size={15} strokeWidth={2.5} />
              </motion.a>
              <motion.a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 22px", borderRadius: 100, border: "1px solid var(--ld-border)", color: "var(--ld-muted)", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none" }}>
                <Phone size={14} strokeWidth={1.5} /> Ask a question
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
    <section id="projects" style={{ padding: "36px 20px 72px", background: "var(--ld-bg)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <motion.div {...up()} style={{ marginBottom: 16 }}>
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
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: selectedId === p.id ? "var(--ld-text)" : "var(--ld-muted)", marginBottom: 3, lineHeight: 1.3 }}>{p.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, fontFamily: "var(--font-geist-mono)", color: p.roiColor }}>{p.roi}</span>
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
    n: "01", Icon: Search, hex: "#3B82F6", c: "var(--ld-accent)",
    t: "Find What's Costing You Money",
    d: "I audit your workflow to pinpoint where leads are slipping, tasks are stalling, and revenue is being left on the table — then identify the highest-ROI fix first.",
    tag: "Discovery & Audit",
  },
  {
    n: "02", Icon: Wrench, hex: "#2563EB", c: "var(--ld-blue)",
    t: "Build the System That Saves Time",
    d: "I build a custom automation tailored to your tools and goals — never a generic template. Every step is designed to cut errors, remove manual work, and reclaim your team's time.",
    tag: "Design & Build",
  },
  {
    n: "03", Icon: Rocket, hex: "#7C3AED", c: "var(--ld-purple)",
    t: "Launch, Optimize, Scale",
    d: "I handle setup, testing, and post-launch refinement so results compound over time — closing more leads, saving more hours, and scaling without adding headcount.",
    tag: "Deploy & Scale",
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
    <section id="process" style={{ padding: "72px 28px", background: "var(--ld-card2)", position: "relative", overflow: "hidden" }}>
      {/* Subtle background glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 14 }}>How It Works</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)", marginBottom: 8 }}>
            From Missed Leads to Automated Growth
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--ld-muted)", maxWidth: "52ch", margin: "0 auto", lineHeight: 1.7 }}>
            A focused done-for-you process designed to eliminate wasted time, missed leads, slow follow-ups, and manual busywork.
          </p>
        </motion.div>

        {/* Cards + connector */}
        <div style={{ position: "relative" }}>
          {/* Connector line — desktop only, runs through card vertical center */}
          <div className="hidden md:block" style={{
            position: "absolute", top: "50%", left: "calc(16.5% + 12px)", right: "calc(16.5% + 12px)",
            height: 1, transform: "translateY(-50%)",
            background: `linear-gradient(90deg, #3B82F628, #2563EB50, #7C3AED28)`,
            zIndex: 0,
          }} />

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, position: "relative", zIndex: 1 }}
          >
            {STEPS.map(({ n, Icon, t, d, c, hex, tag }, i) => {
              const isActive = activeIdx >= i;
              const isHovered = hoveredIdx === i;
              return (
                <motion.div
                  key={n}
                  variants={cardVariants}
                  whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    padding: "28px 26px",
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
                  {/* Step tag */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    {/* Icon */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: `linear-gradient(135deg, ${hex}22, ${hex}0a)`,
                      border: `1px solid ${hex}35`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: isHovered ? `0 0 20px ${hex}30` : "none",
                      transition: "box-shadow 0.3s ease",
                    }}>
                      <Icon size={24} strokeWidth={1.5} style={{ color: c }} />
                    </div>
                    {/* Step number */}
                    <span style={{
                      fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em",
                      fontFamily: "var(--font-geist-mono)", color: hex,
                      padding: "4px 10px", borderRadius: 100,
                      background: hex + "12", border: `1px solid ${hex}28`,
                    }}>{n}</span>
                  </div>

                  {/* Tag */}
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: c, marginBottom: 10, opacity: 0.75 }}>{tag}</p>

                  {/* Title */}
                  <h3 style={{ fontSize: "1.1875rem", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", marginBottom: 14, lineHeight: 1.25, letterSpacing: "-0.01em" }}>{t}</h3>

                  {/* Description */}
                  <p style={{ fontSize: "0.875rem", color: "var(--ld-muted)", lineHeight: 1.75, flex: 1 }}>{d}</p>

                </motion.div>
              );
            })}
          </motion.div>
        </div>
        {/* CTA below cards */}
        <motion.div {...up(0.3)} style={{ textAlign: "center", marginTop: 40 }}>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px var(--ld-glow)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 100,
              background: "var(--ld-accent)", color: "#fff",
              fontWeight: 700, fontSize: "1rem", textDecoration: "none",
              boxShadow: "0 0 24px var(--ld-glow)",
              fontFamily: "var(--font-display)",
            }}
          >
            Book Your Free Discovery Call <ArrowRight size={16} strokeWidth={2.5} />
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
}

/* ── Cert Modal ─────────────────────────────────────────────── */
function CertModal({ cert, onClose }: { cert: { label: string; img: string; color: string }; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <>
      <motion.div
        key="cert-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(3,5,14,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer" }}
      />
      <motion.div
        key="cert-panel"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.85 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.28 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); }}
        style={{ position: "fixed", inset: 0, zIndex: 3001, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", pointerEvents: "none" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: "auto", width: "100%", maxWidth: 900,
            background: "var(--ld-card)", border: "1px solid var(--ld-border)",
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--ld-border)", background: "var(--ld-card2)" }}>
            <div>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: cert.color, marginBottom: 3, opacity: 0.85 }}>Verified Certification</p>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--ld-text)", fontFamily: "var(--font-display)" }}>{cert.label}</p>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              style={{ width: 34, height: 34, borderRadius: 9, background: "var(--ld-bg)", border: "1px solid var(--ld-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ld-muted)", fontSize: "1.1rem", lineHeight: 1 }}
            >×</motion.button>
          </div>

          {/* Certificate image */}
          <div style={{ background: "#080c18", touchAction: "pinch-zoom", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cert.img} alt={cert.label}
              style={{ width: "100%", height: "auto", display: "block", maxHeight: "65vh", objectFit: "contain" }}
            />
          </div>

          {/* Footer */}
          <div className="flex sm:hidden" style={{ alignItems: "center", padding: "10px 20px", borderTop: "1px solid var(--ld-border)", background: "var(--ld-card2)" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--ld-muted)", opacity: 0.5 }}>Tap outside or swipe down to close</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── About ─────────────────────────────────────────────────── */
function AboutSection() {
  const [pulse,    setPulse]    = useState(false);
  const [openCert, setOpenCert] = useState<{ label: string; img: string; color: string } | null>(null);

  function handleClick() {
    if (pulse) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 700);
  }

  return (
    <section id="about" style={{ padding: "80px 28px", background: "var(--ld-bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 64, alignItems: "center" }}>
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
            style={{ position: "relative", width: 240, height: 240, cursor: "pointer", flexShrink: 0 }}
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

          {/* Role text below photo */}
          <motion.div
            animate={{ filter: ["drop-shadow(0 0 4px rgba(59,130,246,0.0))", "drop-shadow(0 0 10px rgba(139,92,246,0.45))", "drop-shadow(0 0 4px rgba(59,130,246,0.0))"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          >
            <p className="ld-text-shimmer" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center" }}>
              AI Automation Specialist
            </p>
          </motion.div>
        </motion.div>

        <motion.div {...up(0.1)}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 16 }}>About</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.25rem)", fontWeight: 800, color: "var(--ld-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.025em", marginBottom: 20, lineHeight: 1.2 }}>
            Meet The Automation Specialist Behind The Results
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.78, color: "var(--ld-muted)", maxWidth: "46ch", marginBottom: 28 }}>
            I&apos;m <strong style={{ color: "var(--ld-text)" }}>Jell Urmeneta</strong>, an automation specialist who builds systems that replace manual work, streamline operations, and help businesses scale without hiring more people.
            <br /><br />
            From lead capture to backend processes, I design systems that eliminate bottlenecks, reduce manual effort, and improve response speed.
            <br /><br />
            Built for efficiency, scalability, and measurable ROI.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              {
                label: "n8n Certified", color: "#EA4B71", img: "/certs/n8n-cert.png",
                logo: <svg viewBox="0 0 24 24" width="13" height="13" fill="#EA4B71" style={{ flexShrink: 0 }}><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6a8.4 8.4 0 1 1 0 16.8A8.4 8.4 0 0 1 12 3.6zm-3.6 5.4v6h1.8V10.8l3 4.2 3-4.2V15h1.8V9H16.2l-2.4 3.36L11.4 9H8.4z"/></svg>,
              },
              {
                label: "Zapier Certified", color: "#FF4A00", img: "/certs/zapier-cert.png",
                logo: <svg viewBox="0 0 24 24" width="13" height="13" fill="#FF4A00" style={{ flexShrink: 0 }}><path d="M24 10.98h-7.13L21.9 5.94l-2.03-2.85-5.46 4.2V0h-4.82v7.28L4.13 3.09 2.1 5.94l5.03 5.04H0v3.5h7.13L2.1 19.52 4.13 22 9.6 17.8V24h4.82v-6.2l5.46 4.2 2.03-2.85-5.03-4.68H24v-3.5z"/></svg>,
              },
              {
                label: "Make Certified", color: "#9333EA", img: "/certs/make-cert.png",
                logo: <svg viewBox="0 0 24 24" width="13" height="13" fill="#9333EA" style={{ flexShrink: 0 }}><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 7.05A7 7 0 0 1 19 12h-2a5 5 0 0 0-1.464-3.536L16.95 7.05zM5 12a7 7 0 0 1 7-7V3a9 9 0 0 0 0 18v-2a7 7 0 0 1-7-7zm7 7a7 7 0 0 1-4.95-2.05l-1.414 1.414A9 9 0 0 0 21 12h-2a7 7 0 0 1-7 7z"/></svg>,
              },
              {
                label: "Certified Prompt Engineer", color: "#3B82F6", img: "/certs/prompt-cert.png",
                logo: <Sparkles size={13} strokeWidth={2} style={{ color: "#3B82F6", flexShrink: 0 }} />,
              },
            ].map(({ label, color, img, logo }) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => setOpenCert({ label, img, color })}
                whileHover={{ y: -2, boxShadow: `0 0 18px ${color}28`, borderColor: `${color}55` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: "0.775rem", fontWeight: 600,
                  padding: "7px 14px", borderRadius: 100,
                  background: `${color}0e`,
                  border: `1px solid ${color}28`,
                  color: "var(--ld-text)",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {logo}
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {openCert && (
          <CertModal key={openCert.label} cert={openCert} onClose={() => setOpenCert(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Testimonials placeholder ──────────────────────────────── */
// Replace TESTIMONIALS with real client feedback when available
const TESTIMONIALS = [
  { name: "Daniel R.",  role: "Real Estate Agency Owner",  quote: "We were missing leads because follow-ups were too slow. After the system went live, replies started going out instantly and our booked calls increased within the first week. It made a noticeable difference right away.", stars: 5 },
  { name: "Hannah L.",  role: "Online Coach",               quote: "I used to spend hours every week turning one piece of content into posts for different platforms. Now the workflow handles most of it automatically, which gave me back time to focus on clients and growth.", stars: 5 },
  { name: "Michael T.", role: "Dental Clinic Manager",      quote: "Our team was constantly dealing with missed calls, scheduling issues, and no-shows. Once the booking system was set up, appointments became smoother and the front desk had far less manual work.", stars: 5 },
];

function TestimonialsSection() {
  return (
    <section style={{ padding: "80px 28px 64px", background: "var(--ld-card2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ld-accent)", marginBottom: 14 }}>What Changed</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--ld-text)", letterSpacing: "-0.025em", fontFamily: "var(--font-display)", marginBottom: 16 }}>
            After Working Together
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--ld-muted)", lineHeight: 1.65, maxWidth: "52ch", margin: "0 auto" }}>
            Faster replies. More conversations turning into bookings. Less time spent on repetitive work.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map(({ name, role, quote, stars }, i) => (
            <motion.div key={name} {...up(i * 0.09)}
              whileHover={{ y: -4, boxShadow: "0 0 0 1px rgba(59,130,246,0.16), 0 20px 56px rgba(0,0,0,0.55)" }}
              style={{ padding: "32px 28px", background: "var(--ld-card)", border: "1px solid var(--ld-border)", borderRadius: 20, boxShadow: "var(--ld-shadow)", transition: "all 0.28s ease" }}
            >
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {Array.from({ length: stars }).map((_, si) => (
                  <Star key={si} size={14} strokeWidth={0} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                ))}
              </div>
              <p style={{ fontSize: "0.9375rem", color: "var(--ld-text)", lineHeight: 1.72, marginBottom: 24, fontStyle: "italic" }}>
                &ldquo;{quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, var(--ld-accent), var(--ld-blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
                  {name[0]}
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--ld-text)", marginBottom: 2 }}>{name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--ld-muted)" }}>{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ── Mini Scheduler ────────────────────────────────────────── */
function MiniScheduler() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragScroll = useRef(0);

  const weekdays = useMemo(() => {
    const days: Date[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (days.length < 21) {
      if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, []);

  const [selDate, setSelDate] = useState<Date>(weekdays[0]);
  const [selTime, setSelTime] = useState<string | null>(null);
  const DAY   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const TIMES = ["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM"];

  const nudge = (dir: "l" | "r") =>
    scrollRef.current?.scrollBy({ left: dir === "r" ? 160 : -160, behavior: "smooth" });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.pageX;
    dragScroll.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const walk = dragStartX.current - e.pageX;
    if (Math.abs(walk) > 4) hasDragged.current = true;
    scrollRef.current.scrollLeft = dragScroll.current + walk * 1.1;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  const book = (time: string) => {
    const y   = selDate.getFullYear();
    const mon = String(selDate.getMonth() + 1).padStart(2, "0");
    const day = String(selDate.getDate()).padStart(2, "0");
    window.open(`${CALENDLY}?date=${y}-${mon}-${day}`, "_blank");
  };

  const arrowBtn: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 24, height: 24, borderRadius: 7, zIndex: 2,
    border: "1px solid var(--ld-border)", background: "var(--ld-card)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--ld-muted)", padding: 0, flexShrink: 0,
  };

  return (
    <div>
      <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ld-muted)", marginBottom: 10 }}>
        Available Dates
      </p>

      {/* Scrollable date strip */}
      <div style={{ position: "relative", marginBottom: 22 }}>
        <button type="button" onClick={() => nudge("l")} style={{ ...arrowBtn, left: 0 }}>
          <ChevronLeft size={12} strokeWidth={2.5} />
        </button>

        <div
          ref={scrollRef}
          className="hide-scrollbar"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            display: "flex", gap: 6, overflowX: "auto",
            paddingLeft: 32, paddingRight: 32, paddingBottom: 2,
            cursor: "grab", userSelect: "none",
          }}
        >
          {weekdays.map((date, i) => {
            const active = date.toDateString() === selDate.toDateString();
            return (
              <button
                key={i} type="button"
                onClick={() => { if (!hasDragged.current) setSelDate(date); }}
                style={{
                  flexShrink: 0, padding: "8px 11px", borderRadius: 10,
                  cursor: "pointer", textAlign: "center",
                  border: `1px solid ${active ? "var(--ld-accent)" : "var(--ld-border)"}`,
                  background: active ? "var(--ld-accent)" : "transparent",
                  color: active ? "#fff" : "var(--ld-muted)",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ display: "block", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", opacity: 0.8 }}>
                  {DAY[date.getDay()]}
                </span>
                <span style={{ display: "block", fontSize: "0.92rem", fontWeight: 800, lineHeight: 1.2 }}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => nudge("r")} style={{ ...arrowBtn, right: 0 }}>
          <ChevronRight size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Time slots */}
      <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ld-muted)", marginBottom: 10 }}>
        Available Times
      </p>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
        {TIMES.map(t => {
          const active = selTime === t;
          return (
            <motion.button key={t} type="button"
              onClick={() => { setSelTime(t); book(t); }}
              whileHover={{ y: -2, boxShadow: "0 0 14px rgba(59,130,246,0.25)", borderColor: "var(--ld-accent)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: "8px 14px", borderRadius: 9, cursor: "pointer",
                fontSize: "0.8rem", fontWeight: 600,
                border: `1px solid ${active ? "var(--ld-accent)" : "var(--ld-border)"}`,
                background: active ? "var(--ld-accent)" : "transparent",
                color: active ? "#fff" : "var(--ld-text)",
                transition: "all 0.15s ease",
              }}
            >
              {t}
            </motion.button>
          );
        })}
      </div>

      {selTime && (
        <p style={{ fontSize: "0.68rem", color: "var(--ld-accent)", opacity: 0.75, marginBottom: 16 }}>
          {selTime} selected — opening booking confirmation
        </p>
      )}

      <p style={{ fontSize: "0.68rem", color: "var(--ld-muted)", opacity: 0.4, textAlign: "center" }}>
        Secure booking powered by Calendly
      </p>
    </div>
  );
}

/* ── CTA ───────────────────────────────────────────────────── */
function CTASection() {

  const CONTACTS = [
    { Icon: Phone,    label: "WhatsApp",  sub: "Quick message support",  href: WHATSAPP,                                  color: "#22c55e" },
    { Icon: Mail,     label: "Email",     sub: "For detailed inquiries",  href: "mailto:jellurmeneta64@gmail.com",           color: "var(--ld-accent)" },
    { Icon: Linkedin, label: "LinkedIn",  sub: "Professional profile",    href: "https://www.linkedin.com/in/jellurmeneta", color: "#0ea5e9" },
  ];

  return (
    <section id="contact" style={{ padding: "80px 28px 0", background: "var(--ld-card2)", position: "relative", overflow: "hidden" }}>
      {/* Ambient glows */}
      <div className="ld-ambient-glow" style={{ position: "absolute", top: 0, left: "25%", width: 600, height: 400, background: "radial-gradient(ellipse, var(--ld-glow) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />
      <div className="ld-ambient-glow" style={{ position: "absolute", bottom: 0, right: "10%", width: 400, height: 400, background: "radial-gradient(circle, var(--ld-glow) 0%, transparent 65%)", opacity: 0.3, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>

        {/* Trust badge */}
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--ld-accent)",
            padding: "6px 16px", borderRadius: 100,
            background: "var(--ld-glow)", border: "1px solid var(--ld-borderC)",
          }}>
            <Sparkles size={10} strokeWidth={2.5} />
            Work With Me
          </span>
        </motion.div>

        {/* 2-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "end",
          paddingBottom: 96,
        }}>

          {/* ── LEFT: contact info ── */}
          <motion.div {...up(0.05)}>
            <h2 style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 900,
              color: "var(--ld-text)", fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16,
            }}>
              Growth Gets Easier<br />When Your Business Runs Without You Doing Everything.
            </h2>

            <p style={{ fontSize: "0.9375rem", fontWeight: 300, color: "var(--ld-muted)", lineHeight: 1.5, letterSpacing: "0.04em", marginTop: 12, marginBottom: 36 }}>
              Choose your preferred way to connect.
            </p>

            {/* Contact cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CONTACTS.map(({ Icon, label, sub, href, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  whileHover={{ x: 4, boxShadow: `0 0 28px ${color}22, 0 0 0 1px ${color}40` }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px",
                    background: "var(--ld-card)",
                    border: "1px solid var(--ld-border)",
                    borderRadius: 14,
                    textDecoration: "none",
                    boxShadow: "var(--ld-shadow)",
                    transition: "border-color 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = `${color}50`)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ld-border)")}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    background: `${color}12`,
                    border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} strokeWidth={1.5} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ld-text)", fontFamily: "var(--font-display)", marginBottom: 2 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--ld-muted)", opacity: 0.65 }}>
                      {sub}
                    </p>
                  </div>
                  <ArrowRight
                    size={15} strokeWidth={2}
                    style={{ color: "var(--ld-muted)", flexShrink: 0, opacity: 0.4 }}
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Premium booking card ── */}
          <motion.div {...up(0.12)}>
            <div style={{
              borderRadius: 22,
              border: "1px solid var(--ld-border)",
              background: "var(--ld-card)",
              boxShadow: "var(--ld-shadowLg)",
              overflow: "hidden",
            }}>
              {/* Card content */}
              <div style={{ padding: "28px 26px 26px" }}>
                <h3 style={{
                  fontSize: "1.125rem", fontWeight: 800,
                  color: "var(--ld-text)", fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em", marginBottom: 6,
                }}>
                  Book a Consultation
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--ld-muted)", lineHeight: 1.55, marginBottom: 22, letterSpacing: "0.01em" }}>
                  30 mins &nbsp;·&nbsp; No pressure &nbsp;·&nbsp; Clear next steps
                </p>
                <MiniScheduler />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Interactive portfolio section (centerpiece) ─────────── */
function PortfolioSection() {
  const [, setOrbState] = useState<OrbState>("idle");
  const handleOrbState  = useCallback((s: OrbState) => setOrbState(s), []);

  return (
    <section id="portfolio" style={{ background: "#05070B", position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 80 }}>
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
            Ask the AI — instant answers about pricing, services, and what I can automate for your business.
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
            Ask the AI <ArrowRight size={11} strokeWidth={2.5} />
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
      <div style={{ background: "var(--ld-bg)", color: "var(--ld-text)", minHeight: "100vh", fontFamily: "var(--font-geist-sans),system-ui,sans-serif" }}>
        <Navbar />
        <HeroSection />
        <TrustBar />
        <ResultsSection />
        <ServicesSection />
        <ProjectsSection />
        <HowIWorkSection />
        <AboutSection />
        <TestimonialsSection />
        <CTASection />
        <PortfolioSection />
        <Footer />
      </div>
    </>
  );
}
