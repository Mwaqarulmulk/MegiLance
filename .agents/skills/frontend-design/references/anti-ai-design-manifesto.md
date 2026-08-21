# 🛡️ Anti-AI Generic Design Manifesto

This guide defines the specific rules and techniques to eliminate generic "AI-generated" tropes and craft premium, human-centric web applications.

---

## 🚫 1. The 10 AI Design Sins & How to Fix Them

| # | The AI Sin (Banned) | Why It Looks Cheap | The Handcrafted Solution |
|---|---|---|---|
| 1 | **Unexplained Neon Gradient Blobs** | Floated in background corners without context or lighting logic. | Use purposeful subtle ambient radial spotlights that correspond to active cards or interactive focal points. |
| 2 | **Uniform 3-Column Card Grids** | Predictable, static, looks like every cookie-cutter template. | Use asymmetric Bento-style grids, staggered heights, featured hero items, or master-detail split panes. |
| 3 | **Generic Circle-Enclosed Lucide Icons** | Default 48px circle with centered pastel icon on every card. | Use custom badges, mini live data visualizations, contextual tag chips, or inline typography accents. |
| 4 | **Corporate Lorem & Buzzword Bingo** | "Supercharge your growth with cutting-edge next-gen solutions." | Use crisp, direct, human copy: "Match with top 3% verified AI engineers in under 15 minutes." |
| 5 | **Flat, One-Dimensional Borders** | Harsh 1px `#334155` or `#e2e8f0` everywhere. | Layered surfaces with subtle top-highlight borders (`border-t-white/15 border-x-white/5 border-b-black/20`) creating realistic tactile elevation. |
| 6 | **Center-Everything Syndrome** | Every heading, subtitle, button, and card body is text-center. | Left-aligned hierarchy for readability, structured metadata columns, and purposeful right-aligned actions. |
| 7 | **Bland Stock Placeholders** | "Task 1", "John Doe", "$100", empty avatar circles with initials. | Authentic real-world mock data with detailed freelancer bios, real project scopes, escrow breakdowns, and skill badges. |
| 8 | **Static Hover States** | Only changing opacity (`hover:opacity-80`) or doing nothing on hover. | Rich micro-feedback: smooth scale (`active:scale-[0.98]`), border tint shift, subtle depth elevation, tooltip cues. |
| 9 | **Jarring Blank Spinners** | A generic spinning circle in the middle of a blank white/black screen. | Geometric shimmer skeletons that replicate the exact layout dimensions of incoming content. |
| 10 | **Ignoring Empty & Error States** | Leaving empty lists as blank whitespace or showing raw error JSON. | Characterful empty states with helpful illustrations, friendly copy, and actionable primary shortcuts. |

---

## 🎨 2. The Anatomy of a High-Craft Component

When building any component (e.g. a Freelancer Card, Proposal Inspector, Job Listing, Metric Tile):

### The Formula:
1. **Header with Clear Context**:
   - Status pill with pulsing dot (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`).
   - Categorized tag with high-contrast typography.
   - Quick action button (Bookmark, Share, More options).

2. **Core Content with High Scannability**:
   - High-contrast primary title with negative letter-spacing (`tracking-tight font-semibold`).
   - Monospaced / tabular data for prices and metrics (`tabular-nums font-mono text-emerald-400 font-bold`).
   - Compact skill tags with subtle background contrast.

3. **Layered Depth & Tactile Polish**:
   - Surface background with subtle backdrop blur or gradient wash.
   - Top-edge specular highlight (`inset 0 1px 0 0 rgba(255,255,255,0.08)`).
   - Smooth hover transition with spring damping.

---

## 📐 3. Bento Grid & Asymmetric Layout Principles

Instead of monotonous symmetrical grids, structure dashboards and landing pages with dynamic Bento architecture:
- **Hero Tile (Span 2x2 or 2x1)**: High-priority data with live chart or prominent interactive control.
- **Metric Tiles (Span 1x1)**: Compact KPIs with trend indicators (+14.2% badge), sparkline charts, and clear labels.
- **Activity / Feed Tile (Span 1x2 or 2x2)**: Scrollable real-time timeline with micro-avatars and timestamp chips.
- **Quick Action Bar**: Floating or docked pill navigation for rapid tasks.
