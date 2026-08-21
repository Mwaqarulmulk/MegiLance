# 🎨 Visual Craft, Color Science & Surface Elevation

This guide provides deep technical styling rules to produce world-class interfaces in Next.js, Tailwind CSS, and Radix UI.

---

## 🌓 1. Dual-Theme Surface Architecture

Never rely on pure `#000000` or raw gray `#808080`. Use rich obsidian/slate color physics for Dark Mode, and crisp porcelain/zinc for Light Mode.

### Surface Hierarchy Table

| Elevation Level | Dark Mode Value | Light Mode Value | Usage Context |
|---|---|---|---|
| **Level 0 (Canvas)** | `#090d16` (Deep Obsidian Blue) | `#f8fafc` (Porcelain Off-White) | Page viewport base background |
| **Level 1 (Surface)** | `#111827` / `#0f172a` (Rich Slate) | `#ffffff` (Pure Crisp White) | Cards, sidebars, main dashboard containers |
| **Level 2 (Elevated)** | `#1e293b` (Mid Slate) | `#f1f5f9` (Soft Zinc/Slate) | Dropdown menus, floating popovers, inputs |
| **Level 3 (Overlays)** | `#334155` (High Slate) | `#ffffff` (High Shadow + Ring) | Modals, command palettes, sticky sheets |

---

## 🪟 2. Glassmorphism & Specular Highlights

To give UI elements a modern, tactile, glass-like finish:

### Dark Mode Specular Glass Card:
```tsx
<div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] before:absolute before:inset-0 before:rounded-2xl before:border-t before:border-white/20 before:pointer-events-none p-6">
  {/* Content */}
</div>
```

### Light Mode Polished Elevation Card:
```tsx
<div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_2px_6px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 p-6">
  {/* Content */}
</div>
```

---

## 🖋️ 3. Typography & Hierarchy Scale

### Font Family Stack:
- **Headings & Brand**: `Inter`, `Plus Jakarta Sans`, `Geist`, or `Outfit`.
- **Data & Numbers**: `JetBrains Mono`, `Fira Code`, or `Geist Mono` with `tabular-nums`.

### Scale & Tracking:
- **Hero Title**: `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]`
- **Section Heading**: `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100`
- **Card Title**: `text-lg font-semibold tracking-normal text-slate-900 dark:text-slate-100`
- **Body Text**: `text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed`
- **Micro Label / Badge**: `text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400`

---

## 🎯 4. Status Badges & Accents

Always pair status badges with a pulsing or solid status indicator:

```tsx
// Success / Active Escrow
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  In Escrow
</span>

// In Review / Pending
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
  Under Review
</span>
```
