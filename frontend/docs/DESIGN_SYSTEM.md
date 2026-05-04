# MegiLance Design System

This document outlines the comprehensive design system for the MegiLance platform, following 2025 design trends and best practices.

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Z-Index Layers](#z-index-layers)
7. [Component Guidelines](#component-guidelines)
8. [Accessibility](#accessibility)
9. [Responsive Design](#responsive-design)
10. [2025 Design Trends](#2025-design-trends)

## Color Palette

### Brand Colors
- Primary: `#4573df` (MegiLance Blue)
- Secondary: `#ff9800` (Orange)
- Accent: `#9c27b0` (Purple)

### Semantic Colors
- Success: `#27AE60` (Green)
- Warning: `#F2C94C` (Yellow)
- Error: `#e81123` (Red)

### Light Theme
- Background: `#ffffff`
- Surface: `#f5f7fa`
- Surface Alt: `#F4F6F8`
- Container Dark: `#2c323a`
- Border: `#e0e0e0`
- Text Primary: `#23272f`
- Text Secondary: `#333333`

### Dark Theme
- Background: `#1d2127`
- Surface: `#272b32`
- Surface Alt: `#2c323a`
- Container Dark: `#2c323a`
- Border: `#3a414a`
- Text Primary: `#f5f7fa`
- Text Secondary: `#a9b1bd`

## Typography

### Font Stack
- Headings: `Poppins`, ui-sans-serif, system-ui
- Body: `Inter`, ui-sans-serif, system-ui
- Monospace: `JetBrains Mono`, ui-monospace, monospace

### Font Sizes
- XS: 0.75rem (12px)
- SM: 0.875rem (14px)
- Base: 1rem (16px)
- MD: 1.125rem (18px)
- LG: 1.25rem (20px)
- XL: 1.5rem (24px)
- 2XL: 1.875rem (30px)
- 3XL: 2.25rem (36px)
- 4XL: 3rem (48px)

### Font Weights
- Thin: 100
- Extra Light: 200
- Light: 300
- Regular: 400
- Medium: 500
- Semi Bold: 600
- Bold: 700
- Extra Bold: 800
- Black: 900

## Spacing System

### Scale (in rem)
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)

## Border Radius

- SM: 0.375rem (6px)
- MD: 0.5rem (8px)
- LG: 0.75rem (12px)
- XL: 1rem (16px)
- 2XL: 1.5rem (24px)
- 3XL: 2rem (32px)
- Full: 9999px

## Shadows

### Light Theme
- SM: 0 1px 2px rgba(0,0,0,0.06)
- MD: 0 4px 12px rgba(0,0,0,0.10)
- LG: 0 10px 24px rgba(0,0,0,0.15)

### Dark Theme
- SM: 0 1px 2px rgba(0,0,0,0.2)
- MD: 0 4px 12px rgba(0,0,0,0.3)
- LG: 0 10px 24px rgba(0,0,0,0.4)

## Z-Index Layers

- Base: 0
- Header: 20
- Sidebar: 100
- Dropdown: 400
- Sticky: 500
- Modal: 900
- Overlay: 950
- Toast: 9999

## Component Guidelines

### General Principles
1. All components must be theme-aware
2. Use per-component CSS modules (.common.module.css, .light.module.css, .dark.module.css)
3. Maintain consistent spacing and typography
4. Ensure proper accessibility attributes
5. Implement responsive design patterns

### Button Component
- Variants: primary, secondary, danger, ghost, link, success, warning, social, outline
- Sizes: sm, md, lg, icon
- States: default, hover, active, focus, disabled, loading
- Use gradient backgrounds for enhanced visual appeal
- Implement micro-interactions and ripple effects

### Input Component
- Support floating labels
- Implement proper error handling
- Include character counting
- Use appropriate input types
- Ensure proper focus states

### Card Component
- Variants: default, elevated, outline, filled
- Sizes: sm, md, lg
- Include loading states
- Implement hover effects
- Use consistent padding and spacing

## Accessibility

### WCAG Compliance
- Target WCAG 2.2 Level AA compliance
- Maintain proper color contrast ratios
- Use semantic HTML structure
- Implement keyboard navigation support

### ARIA Attributes
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for error messages
- Use `aria-invalid` for form validation
- Use `aria-expanded` for collapsible elements
- Use `aria-hidden` for decorative elements

### Focus Management
- Provide visible focus indicators
- Maintain logical tab order
- Trap focus in modals and dialogs
- Return focus after closing overlays
- Use `:focus-visible` for enhanced focus styles

## Responsive Design

### Breakpoints
- Small: 480px
- Medium: 768px
- Large: 992px
- XL: 1200px
- 2XL: 1400px

### Mobile-First Approach
1. Design for mobile first
2. Enhance for larger screens
3. Use flexible grids and layouts
4. Optimize touch targets (minimum 44px)
5. Consider orientation changes

## 2025 Design Trends

### Glassmorphism
- Use `backdrop-filter: blur()` for frosted glass effects
- Implement semi-transparent surfaces
- Maintain proper contrast with background elements
- Use subtle borders for depth

### Gradient Accents
- Use gradient backgrounds for visual interest
- Implement gradient borders and text effects
- Ensure gradients enhance rather than distract
- Maintain brand consistency with gradients

### Micro-Interactions
- Add subtle animations for user feedback
- Implement hover and focus states
- Enhance button and card interactions
- Add loading and transition animations

### Modern Typography
- Use variable fonts for better performance
- Implement fluid typography with `clamp()`
- Maintain proper line heights and letter spacing
- Ensure readability across devices

### Depth and Layering
- Use subtle shadows for depth
- Implement layered design elements
- Add parallax effects where appropriate
- Maintain visual hierarchy

### Soft Rounded Corners
- Use larger border radii for modern aesthetics
- Implement consistent corner rounding
- Use appropriate radii for different component types
- Maintain visual harmony with rounded elements

### Minimalist Design
- Use ample white space
- Implement clean, uncluttered layouts
- Focus on essential elements
- Use subtle animations and transitions