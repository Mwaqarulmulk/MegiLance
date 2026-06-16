# Premium AI UI Kit

MagicUI/Aceternity-style trending components for the public AI tools (guest-facing).
Import from `@/app/components/AI/kit`.

## Components
- `AuroraBackground` — full-bleed animated backdrop (aurora blobs + animated grid + interactive `Particles`). Render once inside a `relative overflow-hidden` container; it sits at `-z-10`. Props: `isDark`, `particles`, `grid`, `particleCount`.
- `Particles` — mouse-reactive canvas particle field (respects reduced motion).
- `Meteors` — meteor shower overlay (needs `relative overflow-hidden` parent).
- `BorderBeam` — traveling animated border (place in a `relative` rounded box).
- `ShimmerButton` — premium CTA `<button>` (use `onClick`/router for navigation, not nested in `<a>`).
- `MagicCard` — cursor-follow spotlight card.
- `Marquee` — infinite logo/social-proof strip.
- `SparklesText` — animated sparkles around text.
- `AnimatedGradientText`, `ShineBadge` — flowing gradient heading text + shimmering pill badge.
- `AnimatedGridPattern`, `DotPattern` — SVG background patterns.
- `NumberTicker` — animated number (wraps `@number-flow/react`). Props: `value`, `prefix`, `suffix`, `decimals`, `currency`.
- `confetti`: `celebrate()`, `sideCannons()`, `burstFrom(el)` — brand-colored, reduced-motion aware. Call on result reveal.

## Dependencies added
- `canvas-confetti` (+ `@types/canvas-confetti`)
- `@number-flow/react`

## Tailwind
Keyframes/animations for these live in `tailwind.config.js` (`animate-border-beam`, `animate-shimmer-slide`,
`animate-spin-around`, `animate-meteor`, `animate-marquee(-vertical)`, `animate-aurora`, `animate-grid`,
`animate-gradient-x`, `animate-shine`, etc.).

## Adoption pattern (per tool)
1. Container: add `relative overflow-hidden`, render `<AuroraBackground isDark={isDark} />`, set content wrapper `relative z-10`.
2. Header: `<ShineBadge>` for the badge, `<AnimatedGradientText>` for the title accent.
3. Result hero: `<NumberTicker>` for headline figures + `<Meteors/>` + `<BorderBeam/>`, and call `celebrate()` (or `sideCannons()` for high scores) in a `useEffect` on the results component mount.
