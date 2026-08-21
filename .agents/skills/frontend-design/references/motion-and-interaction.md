# 🎬 Motion, Micro-interactions & Tactile Polish

This guide details animation patterns, spring physics, and interaction states using Framer Motion and Tailwind CSS.

---

## ⚡ 1. The Physics of Natural Motion

Never use stiff linear transitions (`transition: all 0.3s linear`). Always use spring damping or standard cubic-bezier curves for human-feeling responsiveness.

### Recommended Spring Configurations (Framer Motion)

```typescript
// Snappy, tactile response (Buttons, Toggles, Tooltips)
export const snappySpring = {
  type: "spring",
  stiffness: 400,
  damping: 28,
};

// Smooth, fluid layout transitions (Modals, Drawers, Tabs)
export const fluidSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// Gentle, organic entrances (Cards, Metric Reveals)
export const gentleSpring = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};
```

---

## 🌟 2. Interactive States Formula

Every interactive element must support 5 distinct states:

1. **Rest**: Baseline elevation, clear typography, comfortable touch padding (min 44px).
2. **Hover**:
   - Translate lift: `-translate-y-0.5`
   - Border illumination: `hover:border-indigo-500/40 dark:hover:border-indigo-400/40`
   - Shadow expansion: `hover:shadow-lg hover:shadow-indigo-500/5`
3. **Active (Click / Press)**:
   - Tactile depress: `active:scale-[0.98]`
4. **Focus-Visible**:
   - Accessibility ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900`
5. **Loading / Busy**:
   - Smooth spinner with pulse or progress indicator, with `disabled:opacity-60 disabled:cursor-not-allowed`.

---

## 📋 3. Staggered List Entrance Animation

When rendering lists of cards (e.g. proposals, search results, messages):

```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

export function ProjectList({ items }: { items: Project[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          <ProjectCard project={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```
