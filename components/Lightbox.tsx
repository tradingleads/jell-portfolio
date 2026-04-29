"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */
export interface LightboxImage {
  src: string;
  label?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

/* ── Loading spinner ──────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      pointerEvents: "none", zIndex: 2,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        border: "2px solid rgba(34,211,238,0.15)",
        borderTop: "2px solid #22d3ee",
        animation: "lb-spin 0.72s linear infinite",
      }} />
      <span style={{
        fontSize: "0.65rem", fontFamily: "var(--font-display)",
        color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>
        Loading
      </span>
    </div>
  );
}

/* ── Side nav arrow ───────────────────────────────────────────── */
function NavBtn({ side, onClick, disabled }: {
  side: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  if (disabled) return null;
  return (
    <motion.button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileHover={{ scale: 1.1, background: "rgba(34,211,238,0.16)" }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 16,
        transform: "translateY(-50%)",
        zIndex: 10,
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(5,8,16,0.78)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: "rgba(255,255,255,0.9)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
      title={side === "left" ? "Previous (←)" : "Next (→)"}
    >
      {side === "left"
        ? <ChevronLeft  size={22} strokeWidth={2} />
        : <ChevronRight size={22} strokeWidth={2} />
      }
    </motion.button>
  );
}

/* ── Small toolbar button (zoom controls) ────────────────────── */
function ToolBtn({ onClick, title, children, active = false }: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      title={title}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: 34, height: 34, borderRadius: 9,
        background: active ? "rgba(34,211,238,0.18)" : "rgba(255,255,255,0.07)",
        border: active ? "1px solid rgba(34,211,238,0.42)" : "1px solid rgba(255,255,255,0.11)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: active ? "#22d3ee" : "rgba(255,255,255,0.78)",
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      {children}
    </motion.button>
  );
}

/* ── Prominent close button (always visible, top-right) ─────── */
function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 28px rgba(34,211,238,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
        borderColor: "rgba(34,211,238,0.7)",
      }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 3020,                       // above everything in lightbox
        width: 48, height: 48,
        borderRadius: 14,
        background: "rgba(4, 7, 16, 0.92)",
        border: "1px solid rgba(34,211,238,0.48)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: "#fff",
        boxShadow: "0 0 18px rgba(34,211,238,0.22), inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      }}
      title="Close (ESC)"
      aria-label="Close"
    >
      <X size={20} strokeWidth={2.5} />
    </motion.button>
  );
}

/* ── Main Lightbox ────────────────────────────────────────────── */
const Lightbox = memo(function Lightbox({
  images,
  initialIndex = 0,
  onClose,
}: LightboxProps) {
  const [idx,    setIdx]    = useState(initialIndex);
  const [dir,    setDir]    = useState(0);
  const [zoom,   setZoom]   = useState(1);
  const [pan,    setPan]    = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  const dragging   = useRef(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const stageRef   = useRef<HTMLDivElement>(null);

  const image    = images[idx];
  const isZoomed = zoom > 1.02;
  const canPrev  = idx > 0;
  const canNext  = idx < images.length - 1;

  /* Reset on image change */
  useEffect(() => {
    setLoaded(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [idx]);

  /* Scroll lock */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* Preload adjacent */
  useEffect(() => {
    ([-1, 1] as const).forEach((offset) => {
      const ni = idx + offset;
      if (ni >= 0 && ni < images.length) {
        const img = new window.Image();
        img.src = images[ni].src;
      }
    });
  }, [idx, images]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomBy = useCallback((delta: number) => {
    setZoom((z) => {
      const nz = Math.max(1, Math.min(5, z + delta));
      if (nz <= 1) setPan({ x: 0, y: 0 });
      return nz;
    });
  }, []);

  const goTo = useCallback((newIdx: number, direction: number) => {
    setDir(direction);
    setIdx(newIdx);
  }, []);

  /* Keyboard */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")                              { onClose(); return; }
      if (e.key === "ArrowLeft"  && canPrev && !isZoomed)   goTo(idx - 1, -1);
      if (e.key === "ArrowRight" && canNext && !isZoomed)   goTo(idx + 1,  1);
      if (e.key === "+" || e.key === "=")                   zoomBy(0.5);
      if (e.key === "-")                                    zoomBy(-0.5);
      if (e.key === "0")                                    resetZoom();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, idx, isZoomed, canPrev, canNext, goTo, zoomBy, resetZoom]);

  /* Scroll-to-zoom (passive:false to prevent default) */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 0.18 : -0.18);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  /* Mouse pan */
  function onMouseDown(e: React.MouseEvent) {
    if (!isZoomed) return;
    e.preventDefault();
    dragging.current = true;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    setPan({
      x: dragOrigin.current.px + (e.clientX - dragOrigin.current.mx),
      y: dragOrigin.current.py + (e.clientY - dragOrigin.current.my),
    });
  }

  function onMouseUp() { dragging.current = false; }

  /* Touch swipe */
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      t: Date.now(),
    };
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current || isZoomed) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;

    // Swipe down to close (mobile sheet dismiss)
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) && dt < 400) {
      onClose();
      touchStart.current = null;
      return;
    }

    // Horizontal swipe to navigate
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48 && dt < 380) {
      if (dx > 0 && canPrev) goTo(idx - 1, -1);
      if (dx < 0 && canNext) goTo(idx + 1,  1);
    }
    touchStart.current = null;
  }

  /* Double-click zoom toggle */
  function onDblClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isZoomed) resetZoom();
    else setZoom(2.5);
  }

  const imgVariants = {
    enter:  (d: number) => ({ x: d * 60, opacity: 0 }),
    center:              ({ x: 0,        opacity: 1 }),
    exit:   (d: number) => ({ x: d * -40, opacity: 0, transition: { duration: 0.12, ease: "easeIn" as const } }),
  };

  return (
    <AnimatePresence>
      <motion.div
        key="lb-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        /* Clicking the dark backdrop closes */
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 3000,
          background: "rgba(2, 4, 12, 0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex", flexDirection: "column",
          userSelect: "none",
          willChange: "opacity",
        }}
      >

        {/* ── Prominent close button — always visible ────── */}
        <CloseBtn onClick={onClose} />

        {/* ── Top bar (zoom tools + label) ─────────────── */}
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          /* Stop propagation so clicking toolbar doesn't close */
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 72px 12px 20px", /* right padding avoids the fixed close btn */
            background: "rgba(5,8,18,0.72)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0, gap: 12,
          }}
        >
          {/* Label + counter */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {image.label && (
              <span style={{
                fontSize: "0.875rem", fontWeight: 600,
                fontFamily: "var(--font-display)",
                color: "rgba(255,255,255,0.75)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {image.label}
              </span>
            )}
            {images.length > 1 && (
              <span style={{
                flexShrink: 0, fontSize: "0.7rem", fontWeight: 700,
                fontFamily: "var(--font-geist-mono)",
                color: "#22d3ee",
                padding: "3px 10px", borderRadius: 100,
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.28)",
              }}>
                {idx + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Zoom controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {isZoomed && (
              <span style={{
                fontSize: "0.7rem", fontFamily: "var(--font-geist-mono)",
                color: "#22d3ee", padding: "3px 8px", borderRadius: 6,
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.25)",
              }}>
                {Math.round(zoom * 100)}%
              </span>
            )}
            <ToolBtn onClick={() => zoomBy(-0.4)} title="Zoom out (-)">
              <ZoomOut size={14} strokeWidth={1.5} />
            </ToolBtn>
            {isZoomed && (
              <ToolBtn onClick={resetZoom} title="Reset zoom (0)" active>
                <RotateCcw size={13} strokeWidth={1.5} />
              </ToolBtn>
            )}
            <ToolBtn onClick={() => zoomBy(0.4)} title="Zoom in (+)">
              <ZoomIn size={14} strokeWidth={1.5} />
            </ToolBtn>
          </div>
        </motion.div>

        {/* ── Image stage ─────────────────────────────────
            NOTE: no stopPropagation here — clicking the dark
            area around the image bubbles up to close the viewer  */}
        <div
          ref={stageRef}
          style={{
            flex: 1, position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            cursor: isZoomed ? "grab" : "default",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onDoubleClick={onDblClick}
        >
          {/* Loading spinner */}
          <AnimatePresence>
            {!loaded && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
              >
                <Spinner />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav arrows */}
          <AnimatePresence>
            {!isZoomed && <NavBtn key="prev" side="left"  onClick={() => goTo(idx - 1, -1)} disabled={!canPrev} />}
          </AnimatePresence>
          <AnimatePresence>
            {!isZoomed && <NavBtn key="next" side="right" onClick={() => goTo(idx + 1,  1)} disabled={!canNext} />}
          </AnimatePresence>

          {/* Image — stopPropagation so clicking it doesn't close */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`${idx}-img`}
              custom={dir}
              variants={imgVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: "center center",
                transition: dragging.current ? "none" : "transform 0.1s ease",
                willChange: "transform",
                cursor: isZoomed ? "grab" : "zoom-in",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.label ?? "Screenshot"}
                draggable={false}
                onLoad={() => setLoaded(true)}
                style={{
                  display: "block",
                  maxWidth: "min(90vw, 1400px)",
                  maxHeight: "78vh",
                  width: "auto", height: "auto",
                  objectFit: "contain",
                  borderRadius: isZoomed ? 6 : 12,
                  boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)",
                  opacity: loaded ? 1 : 0,
                  transition: "opacity 0.22s ease",
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom bar ────────────────────────────────── */}
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          style={{ flexShrink: 0 }}
        >
          {/* Thumbnail strip — shown when multiple images */}
          {images.length > 1 && (
            <div style={{
              display: "flex", gap: 6, justifyContent: "center", alignItems: "center",
              padding: "10px 20px 4px", overflowX: "auto",
            }}>
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => goTo(i, i > idx ? 1 : -1)}
                  whileHover={{ scale: 1.08, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: 52, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0,
                    border: i === idx
                      ? "2px solid #22d3ee"
                      : "2px solid rgba(255,255,255,0.12)",
                    opacity: i === idx ? 1 : 0.45,
                    cursor: "pointer", padding: 0, background: "rgba(0,0,0,0.4)",
                    transition: "border-color 0.18s ease, opacity 0.18s ease",
                    boxShadow: i === idx ? "0 0 10px rgba(34,211,238,0.45)" : "none",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.label ?? `Screenshot ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* Hint text */}
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 20px 12px" }}>
            <span style={{
              fontSize: "0.58rem", fontFamily: "var(--font-display)",
              color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {isZoomed
                ? "Drag to pan · Double-click to reset · Scroll to zoom"
                : images.length > 1
                  ? "← → navigate · Swipe down to close · ESC · Scroll to zoom"
                  : "Swipe down to close · ESC · Scroll to zoom"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default Lightbox;
