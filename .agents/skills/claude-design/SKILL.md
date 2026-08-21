---
name: claude-design
description: >-
  Anthropic Claude Official Frontend & UI/UX Design System Skill. Enforces Claude's signature design principles: distinctive visual point-of-view, expressive typography, atmospheric depth, asymmetric layouts, rich tactile micro-interactions, and zero generic boilerplate.
---

# 🎭 Claude Frontend & UI/UX Design Skill

This skill embeds the **official Anthropic / Claude design principles and prompt craftsmanship standards** into every frontend component, layout, and user experience.

---

## 🌟 Claude's 6 Core Design Commandments

### 1. Distinctive Aesthetic Point-of-View
- **No Template Feel**: Never generate interfaces that look like default Bootstrap, generic Tailwind starter kits, or AI-generated stock templates.
- **Brand Personality**: Every screen must have a clear mood, voice, and visual character tailored to the product domain (MegiLance: elite AI freelancing, high-trust escrow, real-time collaboration).

### 2. Typography as the Core Voice
- **Intentional Contrast**: Pair an expressive display typeface for headlines with a clean, highly legible typeface for UI elements and body text.
- **Negative Letter Spacing**: Optical tracking adjustments (`tracking-tight` on large titles, `tracking-wider` on uppercase micro-badges).
- **Tabular Alignment**: Monospaced figures for financial numbers, metrics, timestamps, and bid counts.

### 3. Atmospheric Depth & Layered Surfaces
- **Lighting & Physics**: Avoid flat outlines. Use realistic lighting principles:
  - Top-edge specular highlights (`inset 0 1px 0 rgba(255,255,255,0.1)`)
  - Subtle diffuse shadows with ambient occlusion
  - Layered surface elevations (`surface-0`, `surface-1`, `surface-2`, `surface-overlay`)
  - Translucent glass with backdrop-blur (`backdrop-blur-md bg-slate-900/70 border border-white/10`)

### 4. Dynamic Asymmetry & Spatial Rhythms
- **Bento & Split Grids**: Break away from repetitive 3-column cards. Use asymmetric Bento layouts, featured hero spans, master-detail panes, and sticky inspector sidebars.
- **Rhythmic Whitespace**: Generous negative space around focal points balanced with dense, scannable data matrices where power users need it.

### 5. Tactile Micro-Interactions & Motion
- **Spring-Based Physics**: Avoid robotic linear transitions. Use spring dynamics (`stiffness: 350, damping: 25`).
- **Interactive Response**:
  - Depress on click (`active:scale-[0.98]`)
  - Glow/lift on hover (`hover:-translate-y-0.5 hover:shadow-lg`)
  - Staggered entrances for cards, badges, and dashboard widgets (`staggerChildren: 0.05`)

### 6. Domain-Authentic Copy & Rich States
- **No Generic Filler**: Never use "Lorem ipsum", "John Doe", or generic corporate clichés like "Transform your workflow". Use authentic, rich mock data reflecting real client projects, milestones, AI skill verifications, and escrow transactions.
- **Full State Coverage**: Every component must gracefully handle *Default*, *Hover*, *Active*, *Focus-Visible*, *Loading Skeleton*, *Empty with Character*, and *Actionable Error*.

---

## 🚀 How This Skill Is Applied

When working on any frontend page or component:
1. **Analyze Domain Context**: Determine the right visual mood, hierarchy, and information density.
2. **Execute Claude Design Standards**: Apply the typography hierarchy, layered surface elevations, and spring animations.
3. **Verify Anti-Generic Polish**: Confirm the screen feels handcrafted by top design studios (Linear, Stripe, Apple, Claude Artifacts).
