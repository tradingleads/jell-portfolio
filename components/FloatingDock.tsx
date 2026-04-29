"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LayoutGrid, Cpu, Mail,
  ExternalLink, MessageCircle, Linkedin,
  Bot, Zap, FileSearch, GraduationCap,
  Globe, Database, Code2, BrainCircuit,
} from "lucide-react";
import { ALL_PROJECTS as PROJECTS_DATA, type ProjectData } from "@/lib/projects";
import ProjectModal from "./ProjectModal";

type TabId = "me" | "projects" | "skills" | "contact";

const TABS = [
  { id: "me"       as TabId, label: "Me",       Icon: User       },
  { id: "projects" as TabId, label: "Projects",  Icon: LayoutGrid },
  { id: "skills"   as TabId, label: "Tools",     Icon: Cpu        },
  { id: "contact"  as TabId, label: "Contact",   Icon: Mail       },
];

/* ── Panel content ─────────────────────────────────────────────── */

function MePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Bio */}
      <div>
        <p style={{ fontSize: "1rem", lineHeight: 1.82, color: "var(--text-secondary)" }}>
          I&apos;m <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Jell Urmeneta</strong> — an AI Automation Specialist helping businesses save time, cut costs, and scale operations through intelligent no-code systems built for measurable results.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { value: "10+",  label: "Systems Built"       },
          { value: "PH+",  label: "Global Clients"      },
          { value: "24/7", label: "Automation Ready"    },
        ].map(({ value, label }) => (
          <div key={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: "18px 12px",
            background: "var(--bg-surface)",
            borderRadius: 14,
            border: "1px solid var(--border)",
          }}>
            <span style={{
              fontSize: "1.375rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: "var(--accent)",
              lineHeight: 1,
            }}>
              {value}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, textAlign: "center" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { Icon: GraduationCap, text: "BS Business Administration — Technological Institute of the Philippines" },
          { Icon: Globe,         text: "English (Fluent) · Filipino (Native)" },
          { Icon: BrainCircuit,  text: "Open to freelance, automation retainers, and full-time remote roles" },
        ].map(({ Icon, text }) => (
          <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "var(--surface-glow)",
              border: "1px solid var(--border-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={13} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.68, color: "var(--text-secondary)", paddingTop: 5 }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  n8n: "#22d3ee", Zapier: "#ff6b35", Make: "#a78bfa",
};

function ProjectsPanel({ onOpen }: { onOpen: (p: ProjectData) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {PROJECTS_DATA.map((project) => (
          <motion.div
            key={project.id}
            onClick={() => onOpen(project)}
            style={{
              display: "flex", gap: 14, padding: "14px 14px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
            whileHover={{
              borderColor: project.accentColor + "44",
              background: "var(--bg-card)",
              transition: { duration: 0.18 },
            }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Thumbnail */}
            <div style={{
              width: 60, height: 44,
              borderRadius: 8, flexShrink: 0,
              overflow: "hidden",
              background: "#090d18",
              border: "1px solid var(--border)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={project.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: 0.85 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontSize: "0.875rem", fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)", lineHeight: 1.3,
                }}>
                  {project.title}
                </span>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 700,
                  fontFamily: "var(--font-geist-mono)",
                  color: project.metricColor, whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {project.metric}
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-secondary)", marginBottom: 8 }}>
                {project.tagline}
              </p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  fontSize: "0.62rem", fontWeight: 700,
                  padding: "2px 7px", borderRadius: 100,
                  background: `${PLATFORM_BADGE_COLORS[project.platform] ?? "var(--accent)"}15`,
                  border: `1px solid ${PLATFORM_BADGE_COLORS[project.platform] ?? "var(--accent)"}30`,
                  color: PLATFORM_BADGE_COLORS[project.platform] ?? "var(--accent)",
                  fontFamily: "var(--font-display)",
                }}>
                  {project.platform}
                </span>
                {project.tools.slice(0, 2).map(t => (
                  <span key={t} style={{
                    fontSize: "0.62rem",
                    fontFamily: "var(--font-geist-mono)",
                    padding: "2px 7px", borderRadius: 100,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}>
                    {t}
                  </span>
                ))}
                <span style={{
                  fontSize: "0.65rem", fontFamily: "var(--font-display)",
                  color: "var(--accent)", opacity: 0.75, marginLeft: 2,
                }}>
                  View →
                </span>
              </div>
            </div>
          </motion.div>
      ))}
    </div>
  );
}

function SkillsPanel() {
  const groups = [
    {
      label: "Automation",
      Icon: Zap,
      items: ["n8n", "Zapier", "Make"],
      accent: "#22d3ee",
    },
    {
      label: "AI & LLMs",
      Icon: BrainCircuit,
      items: ["ChatGPT", "Claude", "Gemini", "Grok", "OpenRouter"],
      accent: "#a78bfa",
    },
    {
      label: "Data & Ops",
      Icon: Database,
      items: ["Google Sheets", "Airtable", "Notion", "Slack", "Asana"],
      accent: "#34d399",
    },
    {
      label: "Dev & Scripting",
      Icon: Code2,
      items: ["Apps Script", "JavaScript", "SQL"],
      accent: "#fb923c",
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 10,
    }}>
      {groups.map(({ label, Icon, items, accent }) => (
        <div key={label} style={{
          padding: "14px 16px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: `${accent}18`,
              border: `1px solid ${accent}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon size={11} strokeWidth={1.5} style={{ color: accent }} />
            </div>
            <span style={{
              fontSize: "0.62rem", fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}>
              {label}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", opacity: 0.6 }} />

          {/* Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {items.map(item => (
              <span key={item} style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: 100,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                letterSpacing: "0.01em",
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactPanel() {
  const links = [
    {
      Icon: Mail,
      label: "Email",
      value: "jellurmeneta64@gmail.com",
      href: "mailto:jellurmeneta64@gmail.com",
      color: "#22d3ee",
      bg: "rgba(34,211,238,0.08)",
    },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: "+63 948 553 0304",
      href: "https://wa.me/639485530304",
      color: "#34d399",
      bg: "rgba(52,211,153,0.08)",
    },
    {
      Icon: Linkedin,
      label: "LinkedIn",
      value: "jellurmeneta",
      href: "https://www.linkedin.com/in/jellurmeneta",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* CTA */}
      <p style={{
        fontSize: "1rem",
        lineHeight: 1.78,
        color: "var(--text-secondary)",
        textAlign: "center",
        padding: "0 8px",
      }}>
        Open to <strong style={{ color: "var(--text-primary)" }}>freelance consulting</strong>,
        {" "}<strong style={{ color: "var(--text-primary)" }}>automation retainers</strong>, and
        {" "}<strong style={{ color: "var(--text-primary)" }}>full-time remote</strong> roles.
      </p>

      {/* Links grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 10,
      }}>
        {links.map(({ Icon, label, value, href, color, bg }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px",
              background: bg,
              border: `1px solid ${color}28`,
              borderRadius: 16,
              textDecoration: "none",
              transition: "all 0.18s ease",
            }}
            whileHover={{
              y: -2,
              borderColor: `${color}60`,
              boxShadow: `0 4px 20px ${color}18`,
              transition: { type: "spring", stiffness: 360, damping: 26 },
            }}
            whileTap={{ scale: 0.97 }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: `${color}18`,
              border: `1px solid ${color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={15} strokeWidth={1.5} style={{ color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: "0.75rem", fontWeight: 600,
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                textTransform: "uppercase", letterSpacing: "0.07em",
                marginBottom: 2,
              }}>
                {label}
              </p>
              <p style={{
                fontSize: "0.8125rem", fontWeight: 500,
                color: "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {value}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

/* ── Dock ───────────────────────────────────────────────────────── */
const FloatingDock = memo(function FloatingDock() {
  const [active,      setActive]      = useState<TabId | null>(null);
  const [modalProject, setModalProject] = useState<ProjectData | null>(null);

  function toggle(id: TabId) {
    setActive(prev => (prev === id ? null : id));
  }

  function renderPanel(id: TabId) {
    if (id === "me")      return <MePanel />;
    if (id === "projects") return <ProjectsPanel onOpen={setModalProject} />;
    if (id === "skills")  return <SkillsPanel />;
    if (id === "contact") return <ContactPanel />;
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>

      {/* Dock bar */}
      <div style={{
        display: "inline-flex",
        padding: "6px",
        gap: 4,
        borderRadius: 22,
        background: "var(--bg-glass)",
        backdropFilter: "blur(24px)",
        border: "1px solid var(--border)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.18)",
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "10px 20px",
                borderRadius: 16,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                minWidth: 72,
                zIndex: 1,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* Sliding highlight */}
              {isActive && (
                <motion.div
                  layoutId="dock-highlight"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 16,
                    background: "var(--surface-glow)",
                    border: "1px solid var(--border-accent)",
                    boxShadow: "0 0 16px var(--accent-glow)",
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                style={{
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  transition: "color 0.18s ease",
                  position: "relative",
                  zIndex: 1,
                }}
              />
              <span style={{
                fontSize: "0.7rem",
                fontWeight: isActive ? 700 : 500,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.04em",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                transition: "color 0.18s ease, font-weight 0.18s ease",
                position: "relative",
                zIndex: 1,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Content panel */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
            style={{
              width: "100%",
              padding: "28px",
              borderRadius: 24,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(24px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 48px rgba(0,0,0,0.22)",
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {(() => {
                  const tab = TABS.find(t => t.id === active)!;
                  const Icon = tab.Icon;
                  return (
                    <>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: "var(--surface-glow)",
                        border: "1px solid var(--border-accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={14} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
                      </div>
                      <span style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        color: "var(--text-primary)",
                      }}>
                        {tab.label}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Close button */}
              <motion.button
                type="button"
                onClick={() => setActive(null)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "1rem",
                  lineHeight: 1,
                }}
                whileHover={{ borderColor: "var(--border-accent)", color: "var(--accent)" }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>

            {/* Panel content */}
            {renderPanel(active)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project detail modal */}
      <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
    </div>
  );
});

export default FloatingDock;
