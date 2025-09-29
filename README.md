# MegiLance Frontend

Looking for docs? Start at `docs/README.md` for the canonical index.

A premium, investor-grade frontend for the MegiLance platform built with Next.js (App Router), TypeScript, CSS Modules, and a theme-aware design system.

## Vision
- Pixel-perfect, modern UI matching products like Linear, Vercel, GitHub, Toptal, and Figma.
- Three-role system: Admin, Client, Freelancer.
- Strictly frontend-first until explicitly approved to start backend work.

## Tech Stack
- Next.js (App Router), React, TypeScript
- CSS Modules (common/light/dark per component)
- next-themes for theming
- recharts for data viz
- lucide-react & react-icons for icons

## Project Structure
```
frontend/
  app/
    Home/
      Home.tsx
      Home.common.module.css
      Home.light.module.css
      Home.dark.module.css
      components/
        Hero.tsx
        Features.tsx
        AIShowcase.tsx
        BlockchainShowcase.tsx
        HowItWorks.tsx
        GlobalImpact.tsx
        Testimonials.tsx
        CTA.tsx
        ...theme css files per component
    (auth)/
      login/
      signup/
    (portal)/
      client/
      freelancer/
    components/
      Button/
      Input/
      Tabs/
      UserAvatar/
      ...
```

## Design System
- Colors
  - Primary: #4573df (MegiLance Blue)
  - Accent: #ff9800, Success: #27AE60, Error: #e81123, Warning: #F2C94C
- Fonts: Poppins (headings), Inter (body), JetBrains Mono (code)
- Shadows: subtle, layered, motion-aware
- Spacing grid: 4/8px scale, section rhythm unified via `homeSection` + `sectionContainer`
- Components are theme-aware via three CSS modules per component:
  - `*.common.module.css` (structure, layout, motion)
  - `*.light.module.css` (colors for light)
  - `*.dark.module.css` (colors for dark)

## Buttons
- Variants: primary, secondary, success, warning, danger, outline, ghost, social
- Sizes: sm, md, lg, icon (legacy aliases: small, medium, large)
- Social variant supports `provider="google|github"` for subtle brand accenting.
- All variants have micro-interactions, focus rings, and accessible states.

## Theming
- `useTheme()` with `next-themes`
- CSS modules reference CSS variables for light/dark where applicable
- No global CSS except theme variables

## Homepage UX
- Unified section container for consistent layout: `Home.common.module.css -> .sectionContainer`
- Sections wrapped in `Home.tsx` for perfect rhythm and width constraints
- CTA primary button fixed for visibility on hover (forced white text in theme files)

## Conventions
- Add `// @AI-HINT:` comments at top of components to describe intentions
- No overuse of global components that would disrupt existing polished UI
- Prefer composition: small, reusable parts over monoliths
- Ensure ARIA roles/labels for interactive elements

## Scripts
- `pnpm dev` or `npm run dev` – start dev server
- `pnpm build` – build production bundle
- `pnpm start` – run production server
- `pnpm lint` – lint

## Contributing
- Use per-component CSS structure (.common/.light/.dark)
- Keep components theme-aware and responsive
- Maintain consistent spacing and typography
- Avoid breaking variant/size contracts in shared components (e.g., `Button`)

## Status
- Admin, Client, Freelancer portals modernized
- Homepage modernized with unified layout container; sections are premium and theme-aware
- Auth pages upgraded with social buttons (glass/gradient)

## Roadmap (Frontend)
- Continue polishing micro-interactions and motion
- Expand documentation in `/docs` (Design tokens, iconography, accessibility)

