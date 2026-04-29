"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Wrench, BarChart3, BookOpen, Target, Expand } from "lucide-react";
import type { ProjectData } from "@/lib/projects";
import Lightbox from "./Lightbox";

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  n8n:    "#22d3ee",
  Zapier: "#ff6b35",
  Make:   "#a78bfa",
};

function SLabel({ icon: Icon, text }: { icon: typeof BookOpen; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: "var(--surface-glow)",
        border: "1px solid var(--border-accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={12} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
      </div>
      <span style={{
        fontSize: "0.65rem", fontWeight: 700,
        fontFamily: "var(--font-display)",
        color: "var(--accent)",
        textTransform: "uppercase", letterSpacing: "0.14em",
      }}>
        {text}
      </span>
    </div>
  );
}

const ProjectModal = memo(function ProjectModal({ project, onClose }: ProjectModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
      scrollRef.current?.scrollTo(0, 0);
    }
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0, zIndex: 2000,
              background: "rgba(2, 4, 10, 0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              cursor: "pointer",
            }}
          />

          {/* Modal */}
          <div style={{
            position: "fixed", inset: 0, zIndex: 2001,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
            pointerEvents: "none",
          }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.8 }}
              style={{
                width: "100%", maxWidth: 720,
                maxHeight: "90vh",
                pointerEvents: "auto",
              }}
            >
              <div
                ref={scrollRef}
                style={{
                  width: "100%", maxHeight: "90vh",
                  overflowY: "auto",
                  borderRadius: 22,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)",
                  scrollbarWidth: "thin",
                }}
              >
                {/* ── Screenshot hero ─────────────────────────── */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  borderRadius: "22px 22px 0 0",
                  overflow: "hidden",
                  background: "#0a0e1c",
                  flexShrink: 0,
                }}>
                  {/* Close */}
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      position: "absolute", top: 14, right: 14,
                      zIndex: 10,
                      width: 34, height: 34, borderRadius: 10,
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <X size={15} strokeWidth={2} />
                  </motion.button>

                  {/* Platform + category badge */}
                  <div style={{
                    position: "absolute", top: 14, left: 14, zIndex: 10,
                    display: "flex", gap: 7,
                  }}>
                    <span style={{
                      padding: "5px 12px", borderRadius: 100,
                      background: "rgba(0,0,0,0.6)",
                      border: `1px solid ${PLATFORM_COLORS[project.platform] ?? "var(--border-accent)"}50`,
                      backdropFilter: "blur(12px)",
                      fontSize: "0.7rem", fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: PLATFORM_COLORS[project.platform] ?? "var(--accent)",
                      letterSpacing: "0.05em",
                    }}>
                      {project.platform}
                    </span>
                    <span style={{
                      padding: "5px 12px", borderRadius: 100,
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(12px)",
                      fontSize: "0.7rem", fontWeight: 500,
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "var(--font-display)",
                    }}>
                      {project.category}
                    </span>
                  </div>

                  {/* Real screenshot — click to open lightbox */}
                  <motion.div
                    onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                    style={{ position: "relative", display: "block", cursor: "zoom-in" }}
                    whileHover="hover"
                    initial="rest"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt={`${project.title} workflow screenshot`}
                      style={{
                        width: "100%",
                        display: "block",
                        maxHeight: 340,
                        objectFit: "cover",
                        objectPosition: "top center",
                      }}
                    />
                    {/* Hover overlay */}
                    <motion.div
                      variants={{
                        rest:  { opacity: 0 },
                        hover: { opacity: 1 },
                      }}
                      transition={{ duration: 0.18 }}
                      style={{
                        position: "absolute", inset: 0,
                        background: "rgba(2,4,12,0.55)",
                        backdropFilter: "blur(1px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexDirection: "column", gap: 8,
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: "rgba(34,211,238,0.18)",
                        border: "1px solid rgba(34,211,238,0.45)",
                        backdropFilter: "blur(12px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 24px rgba(34,211,238,0.25)",
                      }}>
                        <Expand size={20} strokeWidth={1.5} style={{ color: "#22d3ee" }} />
                      </div>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        color: "rgba(255,255,255,0.8)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        Click to expand
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Bottom fade */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: 80,
                    background: "linear-gradient(to bottom, transparent, var(--bg-card))",
                    pointerEvents: "none",
                  }} />
                </div>

                {/* ── Content ─────────────────────────────────── */}
                <div style={{ padding: "4px 32px 40px" }}>

                  {/* Title block */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <h2 style={{
                        fontSize: "1.5rem", fontWeight: 800,
                        fontFamily: "var(--font-display)",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em", lineHeight: 1.25,
                        marginBottom: 8,
                      }}>
                        {project.title}
                      </h2>
                      <span style={{
                        flexShrink: 0,
                        padding: "6px 14px", borderRadius: 100,
                        background: `${project.accentColor}15`,
                        border: `1px solid ${project.accentColor}35`,
                        fontSize: "0.8rem", fontWeight: 700,
                        fontFamily: "var(--font-geist-mono)",
                        color: project.metricColor,
                        whiteSpace: "nowrap",
                        marginTop: 3,
                      }}>
                        {project.metric}
                      </span>
                    </div>
                    <p style={{
                      fontSize: "1rem", lineHeight: 1.65,
                      color: "var(--accent)",
                      fontWeight: 500,
                      fontFamily: "var(--font-display)",
                    }}>
                      {project.tagline}
                    </p>
                  </div>

                  {/* Sections */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                    <section>
                      <SLabel icon={BookOpen} text="Overview" />
                      <p style={{ fontSize: "0.9375rem", lineHeight: 1.82, color: "var(--text-secondary)" }}>
                        {project.overview}
                      </p>
                    </section>

                    <div style={{ height: 1, background: "var(--border)" }} />

                    <section>
                      <SLabel icon={Target} text="Business Use Case" />
                      <p style={{ fontSize: "0.9375rem", lineHeight: 1.82, color: "var(--text-secondary)" }}>
                        {project.useCase}
                      </p>
                    </section>

                    <div style={{ height: 1, background: "var(--border)" }} />

                    <section>
                      <SLabel icon={BarChart3} text="Results" />
                      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                        {project.results.map((r, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                          >
                            <CheckCircle2
                              size={17} strokeWidth={2}
                              style={{ color: project.accentColor, flexShrink: 0, marginTop: 2 }}
                            />
                            <span style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "var(--text-primary)" }}>
                              {r}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </section>

                    <div style={{ height: 1, background: "var(--border)" }} />

                    <section>
                      <SLabel icon={Wrench} text="Tools Used" />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {project.tools.map(t => (
                          <span key={t} style={{
                            padding: "7px 15px", borderRadius: 100,
                            fontSize: "0.8125rem", fontWeight: 500,
                            background: `${project.accentColor}10`,
                            border: `1px solid ${project.accentColor}28`,
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* CTA */}
                    <div style={{
                      padding: "20px 22px",
                      borderRadius: 16,
                      background: "var(--surface-glow)",
                      border: "1px solid var(--border-accent)",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 14,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div>
                        <p style={{
                          fontSize: "0.9375rem", fontWeight: 600,
                          fontFamily: "var(--font-display)",
                          color: "var(--text-primary)", marginBottom: 4,
                        }}>
                          Need something similar?
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                          I build custom automation systems tailored to your workflow.
                        </p>
                      </div>
                      <a
                        href="mailto:jellurmeneta64@gmail.com"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "10px 22px", borderRadius: 100,
                          background: "var(--accent)", color: "#fff",
                          fontSize: "0.875rem", fontWeight: 600,
                          fontFamily: "var(--font-display)",
                          textDecoration: "none", whiteSpace: "nowrap",
                          boxShadow: "0 2px 16px var(--accent-glow)",
                          flexShrink: 0,
                        }}
                      >
                        Get in touch
                      </a>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Lightbox — opens over the modal */}
      {project && lightbox && (
        <Lightbox
          images={[{ src: project.image, label: project.title }]}
          onClose={() => setLightbox(false)}
        />
      )}
    </AnimatePresence>
  );
});

export default ProjectModal;
