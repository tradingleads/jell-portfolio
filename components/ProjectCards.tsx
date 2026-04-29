"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronUp, Expand } from "lucide-react";
import { FEATURED_PROJECTS, MORE_PROJECTS, type ProjectData } from "@/lib/projects";
import ProjectModal from "./ProjectModal";
import Lightbox from "./Lightbox";

const PLATFORM_COLORS: Record<string, string> = {
  n8n:    "#22d3ee",
  Zapier: "#ff6b35",
  Make:   "#a78bfa",
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
};

/* ── Featured card ─────────────────────────────────────────────── */
function FeaturedCard({
  project, onOpen, onLightbox,
}: { project: ProjectData; onOpen: () => void; onLightbox: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      onClick={onOpen}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.16)",
        transition: "border-color 0.22s ease, box-shadow 0.22s ease",
        display: "flex",
        flexDirection: "column",
      }}
      whileHover={{
        y: -4,
        borderColor: project.accentColor + "55",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 12px 40px rgba(0,0,0,0.28), 0 0 0 1px ${project.accentColor}30`,
        transition: { type: "spring", stiffness: 320, damping: 26 },
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Screenshot */}
      <motion.div
        style={{
          position: "relative",
          width: "100%",
          height: 160,
          background: "#090d18",
          overflow: "hidden",
          flexShrink: 0,
          cursor: "zoom-in",
        }}
        whileHover="hover"
        initial="rest"
        onClick={(e) => { e.stopPropagation(); onLightbox(); }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={project.image}
          alt={project.title}
          variants={{ rest: { scale: 1, opacity: 0.88 }, hover: { scale: 1.03, opacity: 1 } }}
          transition={{ duration: 0.35 }}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
        {/* Lightbox hover hint */}
        <motion.div
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.18 }}
          style={{
            position: "absolute", inset: 0,
            background: "rgba(2,4,12,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 6,
            pointerEvents: "none",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(34,211,238,0.2)",
            border: "1px solid rgba(34,211,238,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 18px rgba(34,211,238,0.3)",
          }}>
            <Expand size={16} strokeWidth={1.5} style={{ color: "#22d3ee" }} />
          </div>
          <span style={{
            fontSize: "0.6rem", fontWeight: 600,
            fontFamily: "var(--font-display)",
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Expand
          </span>
        </motion.div>
        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 56,
          background: "linear-gradient(to bottom, transparent, var(--bg-card))",
          pointerEvents: "none",
        }} />
        {/* Platform badge */}
        <span style={{
          position: "absolute", top: 10, left: 10,
          padding: "4px 10px", borderRadius: 100,
          background: "rgba(0,0,0,0.65)",
          border: `1px solid ${PLATFORM_COLORS[project.platform] ?? "var(--border)"}50`,
          backdropFilter: "blur(10px)",
          fontSize: "0.65rem", fontWeight: 700,
          fontFamily: "var(--font-display)",
          color: PLATFORM_COLORS[project.platform] ?? "var(--accent)",
          letterSpacing: "0.06em",
        }}>
          {project.platform}
        </span>
        {/* Arrow */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ArrowUpRight size={13} strokeWidth={2} style={{ color: "rgba(255,255,255,0.75)" }} />
        </div>
      </motion.div>

      {/* Info */}
      <div style={{ padding: "12px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{
            fontSize: "0.9375rem", fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)", lineHeight: 1.3,
          }}>
            {project.title}
          </h3>
          <span style={{
            flexShrink: 0,
            fontSize: "0.75rem", fontWeight: 700,
            fontFamily: "var(--font-geist-mono)",
            color: project.metricColor,
            whiteSpace: "nowrap",
            marginTop: 2,
          }}>
            {project.metric}
          </span>
        </div>
        <p style={{
          fontSize: "0.8125rem", lineHeight: 1.58,
          color: "var(--text-secondary)", flex: 1,
        }}>
          {project.tagline}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
          {project.tools.slice(0, 3).map(t => (
            <span key={t} style={{
              fontSize: "0.67rem",
              fontFamily: "var(--font-geist-mono)",
              padding: "3px 8px", borderRadius: 100,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}>
              {t}
            </span>
          ))}
          {project.tools.length > 3 && (
            <span style={{
              fontSize: "0.67rem", color: "var(--text-muted)",
              padding: "3px 4px", alignSelf: "center",
            }}>
              +{project.tools.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── More-projects compact row ────────────────────────────────── */
function CompactCard({ project, onOpen }: { project: ProjectData; onOpen: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      onClick={onOpen}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 14px",
        borderRadius: 14,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
      }}
      whileHover={{
        borderColor: project.accentColor + "44",
        background: "var(--bg-surface)",
        transition: { duration: 0.18 },
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 64, height: 46,
        borderRadius: 9,
        overflow: "hidden",
        background: "#090d18",
        flexShrink: 0,
        border: "1px solid var(--border)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: 0.85 }}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
          <span style={{
            fontSize: "0.5625rem", fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: PLATFORM_COLORS[project.platform] ?? "var(--accent)",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {project.platform}
          </span>
          <span style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontSize: "0.5625rem", color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            {project.category}
          </span>
        </div>
        <p style={{
          fontSize: "0.875rem", fontWeight: 600,
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
          lineHeight: 1.3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {project.title}
        </p>
        <p style={{
          fontSize: "0.75rem", lineHeight: 1.45,
          color: "var(--text-muted)", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {project.tagline}
        </p>
      </div>

      {/* Metric + arrow */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span style={{
          fontSize: "0.75rem", fontWeight: 700,
          fontFamily: "var(--font-geist-mono)",
          color: project.metricColor,
          whiteSpace: "nowrap",
        }}>
          {project.metric}
        </span>
        <ArrowUpRight size={13} strokeWidth={1.5} style={{ color: "var(--text-muted)", opacity: 0.6 }} />
      </div>
    </motion.div>
  );
}

/* ── Main export ───────────────────────────────────────────────── */
const ProjectCards = memo(function ProjectCards() {
  const [open,      setOpen]     = useState<ProjectData | null>(null);
  const [lightboxP, setLightboxP] = useState<ProjectData | null>(null);
  const [showMore,  setShowMore] = useState(false);

  const containerVariants = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.08 } },
  };

  return (
    <>
      <div style={{ width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Featured heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: "0.6875rem", fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--accent)",
            textTransform: "uppercase", letterSpacing: "0.14em",
          }}>
            Featured Projects
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{
            fontSize: "0.6875rem", color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
          }}>
            {FEATURED_PROJECTS.length} projects
          </span>
        </div>

        {/* 2-col featured grid */}
        <motion.div
          variants={containerVariants} initial="hidden" animate="show"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}
        >
          {FEATURED_PROJECTS.map(p => (
            <FeaturedCard key={p.id} project={p} onOpen={() => setOpen(p)} onLightbox={() => setLightboxP(p)} />
          ))}
        </motion.div>

        {/* More projects toggle */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{
              fontSize: "0.6875rem", fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.14em",
            }}>
              More Projects
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <motion.button
              type="button"
              onClick={() => setShowMore(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 100,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontSize: "0.75rem", fontWeight: 500,
                fontFamily: "var(--font-display)",
                cursor: "pointer",
              }}
              whileHover={{ borderColor: "var(--border-accent)", color: "var(--accent)" }}
              whileTap={{ scale: 0.97 }}
            >
              {showMore ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
              {showMore ? "Hide" : `Show ${MORE_PROJECTS.length}`}
            </motion.button>
          </div>

          {/* Compact list */}
          {showMore && (
            <motion.div
              variants={containerVariants} initial="hidden" animate="show"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {MORE_PROJECTS.map(p => (
                <CompactCard key={p.id} project={p} onOpen={() => setOpen(p)} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <ProjectModal project={open} onClose={() => setOpen(null)} />

      {lightboxP && (
        <Lightbox
          images={[{ src: lightboxP.image, label: lightboxP.title }]}
          onClose={() => setLightboxP(null)}
        />
      )}
    </>
  );
});

export default ProjectCards;
