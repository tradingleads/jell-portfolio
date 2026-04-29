# Interactive Portfolio — Project Guidelines

## Stack & Architecture

- **Framework:** React or Next.js. Default to Server Components (RSC).
- **Styling:** Tailwind CSS. Check `package.json` for v3 vs v4 before writing config.
- **Icons:** `@phosphor-icons/react` or `@radix-ui/react-icons` — check which is installed. Use `strokeWidth={1.5}` globally.
- **Motion:** Framer Motion for UI interactions. GSAP/ThreeJS only for isolated full-page canvas/scroll effects — never mix with Framer Motion in the same component tree.
- **State:** `useState`/`useReducer` for local UI. Global state only to avoid deep prop-drilling.
- Before importing any 3rd-party library, verify it exists in `package.json`. Output the install command if missing.

## Design Dials (Defaults)

| Dial | Value | Range |
|------|-------|-------|
| DESIGN_VARIANCE | 8 | 1 = symmetric, 10 = asymmetric chaos |
| MOTION_INTENSITY | 6 | 1 = static, 10 = cinematic physics |
| VISUAL_DENSITY | 4 | 1 = airy gallery, 10 = data cockpit |

Adapt these values when the user explicitly requests a different feel.

## Typography

- **Display:** `text-4xl md:text-6xl tracking-tighter leading-none`
- **Body:** `text-base text-gray-600 leading-relaxed max-w-[65ch]`
- **Allowed fonts:** `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi` — pick one distinctive display font paired with a refined body font.
- **Banned fonts:** Inter, Roboto, Arial, system-ui, Space Grotesk.
- Serif fonts only for editorial/creative contexts. Never on dashboards.

## Color

- Max 1 accent color. Saturation < 80%.
- Base: absolute neutrals — Zinc or Slate scale.
- Accent examples: Emerald, Electric Blue, Deep Rose.
- **Banned:** purple/blue AI gradients, neon glows, pure `#000000`. Use Zinc-950 or Charcoal instead.
- No warm/cool gray mixing within a single view.

## Layout

- **No centered heroes** when DESIGN_VARIANCE > 4. Use Split Screen, Left-Aligned, or Asymmetric Whitespace.
- **No 3-equal-column card rows.** Use 2-col zig-zag, asymmetric grid, or horizontal scroll.
- Full-height sections: always `min-h-[100dvh]`, never `h-screen`.
- Page max-width: `max-w-[1400px] mx-auto` or `max-w-7xl`.
- Grids over flex-math. Use `grid grid-cols-1 md:grid-cols-3 gap-6` not `w-[calc(33%-1rem)]`.
- All asymmetric layouts (`md:` and up) must collapse to strict single-column (`w-full px-4`) on mobile.

## Motion Rules

- Animate only `transform` and `opacity` — never `top`, `left`, `width`, `height`.
- Spring physics: `type: "spring", stiffness: 100, damping: 20` for all interactive elements.
- Magnetic hover / continuous animations: use `useMotionValue` + `useTransform`, never `useState`.
- Stagger list/grid reveals: `staggerChildren` or `animation-delay: calc(var(--index) * 100ms)`.
- Perpetual micro-animations must be isolated in their own `React.memo` Client Components.
- Grain/noise overlays: fixed, `pointer-events-none` pseudo-elements only — never on scrolling containers.
- Every `useEffect` animation needs a cleanup function.

## Components & Cards

- Use cards only when elevation communicates hierarchy. Prefer `border-t`, `divide-y`, or negative space.
- Glassmorphism: go beyond `backdrop-blur` — add `border-white/10` inner border and `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`.
- Shadows: tint to the background hue, never generic black drops.
- Rounded containers: `rounded-[2.5rem]` for major surfaces.

## Interaction States (Mandatory)

Every interactive component must include:
- **Loading:** skeletal loaders matching layout dimensions (no generic spinners).
- **Empty:** a composed empty state showing how to populate data.
- **Error:** inline, clear error text below the relevant input.
- **Active/Press:** `-translate-y-[1px]` or `scale-[0.98]` on `:active`.

## Strictly Forbidden

- Emojis anywhere in code, markup, or alt text.
- `z-50` / z-index spam — use z-index only for systemic layers (navbar, modal, overlay).
- `h-screen` for hero sections.
- Outer glow `box-shadow`. Use inner borders or tinted shadows.
- Unsplash URLs. Use `https://picsum.photos/seed/{string}/800/600` or SVG placeholders.
- Generic placeholder content: "John Doe", "Acme Corp", `99.99%`, "Seamless", "Unleash", "Next-Gen".
- shadcn/ui in its default state — always customize radii, colors, and shadows.

## Aesthetic Direction

Commit to a bold, specific direction before writing a single line. The portfolio should feel:
- **Intentional** — every spacing, color, and font choice serves a purpose.
- **Memorable** — one unforgettable detail per major section.
- **Alive** — perpetual micro-interactions make the UI feel active, not static.

Reference the creative arsenal in `taste-skill.md §8` for advanced patterns (Bento Grid, Parallax Tilt, Text Scramble, Mesh Gradient, etc.) when a section calls for elevated treatment.
