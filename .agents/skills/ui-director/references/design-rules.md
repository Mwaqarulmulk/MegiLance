# Design Rules & Visual Guidelines

This reference defines visual design standards, token conventions, and UX principles for building high-quality frontend interfaces.

---

## 🎨 1. Color System & Theme Tokens

### Principles
- **No Generic Colors**: Avoid plain raw CSS colors (`red`, `blue`, `#000`, `#fff`). Always use curated HSL/RGB design system variables or Tailwind semantic classes.
- **Dual-Theme Parity**: Every component must look intentional and polished in both **Dark** and **Light** themes.

### Palette Hierarchy
| Token Category | Purpose | Dark Theme Default | Light Theme Default |
|---|---|---|---|
| `bg-primary` / Surface 0 | Base application background | Deep slate/charcoal (`#0b0f19` / `#0f172a`) | Crisp neutral off-white (`#f8fafc` / `#ffffff`) |
| `bg-secondary` / Surface 1 | Cards, panels, sidebars | Elevated slate (`#1e293b`) | Soft slate/gray (`#f1f5f9`) |
| `bg-tertiary` / Surface 2 | Inputs, dropdown menus, modals | Higher elevation (`#334155`) | Pure white / subtle border (`#ffffff`) |
| `accent-primary` | Main interactive CTA, brand highlight | Vibrant Indigo/Violet/Cyan (`#6366f1` / `#38bdf8`) | Deep Indigo/Blue (`#4f46e5` / `#0284c7`) |
| `text-primary` | High contrast headings & main body | Slate-50 (`#f8fafc`) | Slate-900 (`#0f172a`) |
| `text-secondary` | Subtitles, labels, metadata | Slate-400 (`#94a3b8`) | Slate-600 (`#475569`) |
| `border-subtle` | Dividers and card borders | Slate-800 (`#1e293b` / `rgba(255,255,255,0.08)`) | Slate-200 (`#e2e8f0` / `rgba(0,0,0,0.08)`) |

---

## ✍️ 2. Typography & Hierarchy

### Typography Rules
1. **Font Families**: Use modern geometric or grotesque sans-serif fonts (e.g., *Inter*, *Outfit*, *Plus Jakarta Sans*, *Geist*).
2. **Heading Scale**:
   - **H1 (Hero/Page Title)**: `text-3xl` to `text-5xl`, `font-extrabold` / `font-bold`, tracking tight (`tracking-tight`). Only one `<h1>` per page.
   - **H2 (Section Header)**: `text-2xl` to `text-3xl`, `font-bold`.
   - **H3 (Card / Modal Header)**: `text-lg` to `text-xl`, `font-semibold`.
   - **Body**: `text-sm` to `text-base`, `leading-relaxed`, `text-secondary` or `text-primary`.
   - **Caption / Meta**: `text-xs`, `font-medium`, `text-muted`.

3. **Line Height & Letter Spacing**:
   - Headings use negative letter spacing (`tracking-tight` or `-0.02em`).
   - Body copy requires comfortable reading height (`leading-relaxed` or `1.6`).

---

## 📐 3. Spacing, Layout & Grid Scale

- **Consistent Grid Scale**: Use a 4px/8px base spacing scale (`gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px).
- **Component Padding**:
  - Cards / Containers: Minimum `p-4` (mobile) to `p-6` / `p-8` (desktop).
  - Buttons / Inputs: `px-4 py-2.5` or `px-5 py-3` with generous click targets (min 44x44px touch area).
- **Border Radius**:
  - Standard cards & modals: `rounded-xl` (12px) or `rounded-2xl` (16px).
  - Buttons & Inputs: `rounded-lg` (8px) or `rounded-full` for pills/chips.
  - Avatars & Badges: `rounded-full`.

---

## ✨ 4. Elevations, Glassmorphism & Depth

- **Shadows**:
  - Subtle cards: `shadow-sm` or `shadow-md` with low opacity (`rgba(0,0,0,0.04)` light / `rgba(0,0,0,0.4)` dark).
  - Floating overlays / Dropdowns: `shadow-xl` with backdrop blur (`backdrop-blur-md bg-opacity-80`).
- **Gradients**:
  - Use subtle radial or linear gradients for hero sections, card highlights, or active borders (e.g. `bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10`).

---

## 🎬 5. Micro-Animations & Interaction

1. **Transitions**:
   - Hover states: `transition-all duration-200 ease-out`.
   - Modals / Drawers: `transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Interactive Elements**:
   - Buttons must have distinct **hover** (subtle brightness change / scale `1.02`), **active** (`scale-95` or `scale-98`), and **focus-visible** (2px ring offset) states.
3. **Motion Library**:
   - Use **Framer Motion** for animated layout transitions, staggering list items, and modal mounts/unmounts (`AnimatePresence`).
