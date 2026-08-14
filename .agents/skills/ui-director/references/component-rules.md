# Component Architecture & Implementation Rules

This reference outlines rules for structuring, writing, and organizing UI components.

---

## 🏗️ 1. Component Architecture & File Organization

### Directory Structure
Components should be organized cleanly under `frontend/app/components/` or feature-specific modules:

```
frontend/app/components/
├── ui/                         # Base primitives (Button, Modal, Input, Badge, Dropdown)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   ├── Button.common.module.css  (or Tailwind utility variants via cva)
│   │   └── index.ts
├── forms/                      # Form controls and composite inputs
├── layout/                     # Header, Sidebar, Footer, Navigation
└── [feature]/                  # Feature-specific components (e.g., proposals, projects)
```

---

## 📜 2. TypeScript & Prop Contracts

- **Always define typed interfaces**:
  ```tsx
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  ```
- **Strict Types**: Never use `any`. Use generics or discriminated unions for dynamic data props.
- **Component Exports**: Use named exports for reusable components (reserve `default export` for Next.js page/layout routes).

---

## 🎨 3. Styling & Class Merging Conventions

1. **Class Utility**:
   - Use the `cn()` utility (`clsx` + `tailwind-merge`) when applying dynamic class names to ensure clean class override hierarchies.
2. **CSS Modules Strategy**:
   - When using modular CSS alongside themes:
     - `ComponentName.common.module.css`: Structural layout, flexbox/grid alignments, dimensions.
     - `ComponentName.light.module.css`: Light theme colors, borders, shadows.
     - `ComponentName.dark.module.css`: Dark theme colors, borders, shadows.
3. **No Inline Styles**: Never use inline `style={{ ... }}` unless calculating truly dynamic coordinates (e.g. cursor follower or dynamic canvas dimensions).

---

## ♿ 4. Accessibility (a11y) & Semantic HTML

1. **Semantic Tags**:
   - Use appropriate HTML5 semantic tags: `<main>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<header>`, `<footer>`.
2. **Form Accessibility**:
   - Every `<input>` must have an associated `<label>` or `aria-label`.
   - Error messages must use `aria-describedby` linked to the input's error message ID.
   - Required fields should indicate `aria-required="true"`.
3. **Keyboard Navigation & Focus**:
   - Custom clickable elements must support `Enter` and `Space` keyboard triggers.
   - Provide visible focus rings (`focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none`).
4. **Primitives**:
   - Use **Radix UI** primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-popover`) for complex accessible behaviors.

---

## 🔄 5. State Handling & Edge Cases

Every component displaying data must account for all lifecycle states:
1. **Loading State**: Skeleton loaders matching the exact card/table layout geometry (avoid jarring spinners where skeletons fit better).
2. **Empty State**: Friendly illustration/icon, clear explanation, and primary action button to create/add content.
3. **Error State**: Actionable error banner with retry capability.
4. **Data Overflow**: Truncate long names with tooltips (`truncate` / `line-clamp-2`), handle long strings without breaking card layout.
