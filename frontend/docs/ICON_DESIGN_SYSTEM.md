# MegiLance Icon Design System

## Overview
This document outlines the design principles, specifications, and guidelines for all icons used in the MegiLance platform.

## Design Principles

### 1. Consistency
- All icons follow a unified visual language
- Consistent stroke weights, corner radius, and proportions
- Cohesive style across all platform touchpoints

### 2. Accessibility
- High contrast ratios for visibility
- Proper ARIA labels and descriptions
- Scalable for different screen sizes and resolutions

### 3. Brand Alignment
- Icons reflect MegiLance's AI-powered, modern, and professional nature
- Color palette aligns with brand guidelines
- Style conveys innovation and trustworthiness

## Technical Specifications

### Grid System
- **Base Grid**: 24x24 pixels
- **Safe Area**: 2px margin on all sides (20x20 active area)
- **Icon Sizes**: 16px, 20px, 24px, 32px, 48px, 64px

### Stroke Properties
- **Default Stroke Width**: 2px
- **Thin Stroke**: 1.5px (for detailed icons)
- **Thick Stroke**: 2.5px (for emphasis)
- **Stroke Cap**: Round
- **Stroke Join**: Round

### Corner Radius
- **Default**: 2px
- **Small Elements**: 1px
- **Large Elements**: 4px

### Color Palette
- **Primary**: currentColor (inherits from parent)
- **Light Theme**: #1a1a1a (90% opacity)
- **Dark Theme**: #ffffff (90% opacity)
- **Accent**: #4573df (brand blue)
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444

## Icon Categories

### 1. Navigation & UI
- Menu, Close, Arrow directions, Chevrons
- Home, Back, Forward, Search

### 2. User Actions
- Add, Edit, Delete, Save, Cancel
- Upload, Download, Share, Copy

### 3. Communication
- Message, Chat, Mail, Phone
- Notification, Bell, Alert

### 4. Business & Finance
- Wallet, Payment, Credit Card, Invoice
- Chart, Analytics, Growth, Money

### 5. Technology & AI
- CPU, Brain, Robot, Code
- Database, Cloud, API, Integration

### 6. Brand & Identity
- MegiLance Logo variations
- Social media icons
- Partner/client placeholders

## File Structure
```
/frontend/public/icons/
├── brand/
│   ├── logo-icon.svg
│   ├── logo-wordmark.svg
│   └── logo-full.svg
├── navigation/
│   ├── menu.svg
│   ├── close.svg
│   └── arrows/
├── actions/
│   ├── add.svg
│   ├── edit.svg
│   └── delete.svg
├── communication/
│   ├── message.svg
│   └── notification.svg
├── business/
│   ├── wallet.svg
│   └── analytics.svg
└── technology/
    ├── ai-brain.svg
    └── cpu.svg
```

## Implementation Guidelines

### SVG Structure
```xml
<svg 
  width="24" 
  height="24" 
  viewBox="0 0 24 24" 
  fill="none" 
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="[Descriptive label]"
>
  <title>[Icon name]</title>
  <desc>[Detailed description for screen readers]</desc>
  <!-- Icon paths -->
</svg>
```

### Accessibility Requirements
- Always include `role="img"`
- Provide meaningful `aria-label`
- Include `<title>` and `<desc>` elements
- Use semantic naming conventions

### Optimization Standards
- Remove unnecessary metadata
- Minimize path complexity
- Use relative units where possible
- Compress file size without quality loss

## Brand Icon Specifications

### MegiLance Logo
The main logo combines the "M" lettermark with AI-inspired geometric elements:
- **Primary Mark**: Stylized "M" with neural network connections
- **Color**: Brand blue gradient (#4573df to #6b8ff0)
- **Usage**: Navigation, headers, branding
- **Variations**: Icon-only, wordmark, full logo

### Avatar Placeholder
Circular avatar with:
- **Background**: Brand gradient
- **Initials**: White text, Poppins font
- **Icon**: Subtle user silhouette overlay
- **Sizes**: 32px, 48px, 64px, 128px

## Quality Checklist
- [ ] Consistent stroke width and style
- [ ] Proper grid alignment
- [ ] Accessibility attributes present
- [ ] Theme-aware coloring
- [ ] Optimized file size
- [ ] Cross-browser compatibility
- [ ] Responsive scaling
- [ ] Brand alignment