# MegiLance Icon System

This directory contains the comprehensive icon system for MegiLance, featuring professionally designed SVG icons that align with the brand's AI-powered, modern aesthetic.

## Features

- **Consistent Design Language**: All icons follow unified design principles with consistent stroke weights, corner radius, and proportions
- **Accessibility First**: Every icon includes proper ARIA labels, titles, and descriptions for screen readers
- **Theme Awareness**: Icons automatically adapt to light and dark themes
- **Scalable Architecture**: Responsive design that works across all screen sizes and resolutions
- **Optimized Performance**: Clean, minimalist SVG code with optimized file sizes

## Quick Start

### Using the Icon Component

```tsx
import { Icon } from '@/components/Icon';

// Basic usage
<Icon name="menu" />

// With custom size
<Icon name="search" size="lg" />

// With custom styling
<Icon name="add" className="text-blue-500 hover:text-blue-600" />

// With accessibility
<Icon name="delete" aria-label="Delete item" />
```

### Available Icons

#### Navigation
- `menu` - Hamburger menu
- `close` - Close/X button
- `home` - Home/Dashboard
- `search` - Search magnifying glass
- `arrow-right` - Right arrow
- `sun` - Light theme toggle
- `moon` - Dark theme toggle

#### Actions
- `add` - Add/Plus button
- `edit` - Edit pencil
- `delete` - Delete trash can
- `save` - Save floppy disk

#### Communication
- `message` - Chat/Message bubble
- `notification` - Bell notification
- `mail` - Email envelope

#### Business
- `wallet` - Payments/Finance
- `analytics` - Charts/Analytics
- `projects` - Project folder

#### Technology
- `ai-brain` - AI/Machine Learning
- `cpu` - Computing/Processing

#### Utility
- `globe` - Global/World
- `file` - Document/File
- `window` - Browser/Application

### Direct SVG Usage

For more complex implementations or when you need direct access to SVG files:

```tsx
// Using public SVG files
<img src="/icons/brand/logo-icon.svg" alt="MegiLance" width={32} height={32} />

// Or import directly
import Logo from '/public/icons/brand/logo-icon.svg';
```

## File Structure

```
/frontend/public/icons/
├── brand/
│   ├── logo-icon.svg           # Main brand logo
│   └── avatar-placeholder.svg  # User avatar placeholder
├── navigation/
│   ├── menu.svg
│   ├── close.svg
│   ├── home.svg
│   ├── search.svg
│   ├── arrow-right.svg
│   ├── sun.svg
│   └── moon.svg
├── actions/
│   ├── add.svg
│   ├── edit.svg
│   ├── delete.svg
│   └── save.svg
├── communication/
│   ├── message.svg
│   ├── notification.svg
│   └── mail.svg
├── business/
│   ├── wallet.svg
│   ├── analytics.svg
│   └── projects.svg
└── technology/
    ├── ai-brain.svg
    └── cpu.svg
```

## Design Specifications

### Grid System
- **Base Grid**: 24x24 pixels
- **Safe Area**: 2px margin on all sides (20x20 active area)
- **Icon Sizes**: 16px (xs), 20px (sm), 24px (md), 32px (lg), 48px (xl)

### Visual Properties
- **Stroke Width**: 2px default (1.5px for detailed icons, 2.5px for emphasis)
- **Stroke Cap**: Round
- **Stroke Join**: Round
- **Corner Radius**: 2px default (1px small, 4px large elements)

### Color Palette
- **Primary**: `currentColor` (inherits from parent)
- **Light Theme**: `#1a1a1a` (90% opacity)
- **Dark Theme**: `#ffffff` (90% opacity)
- **Accent**: `#4573df` (brand blue)
- **Status Colors**: Success (#10b981), Warning (#f59e0b), Error (#ef4444)

## Brand Guidelines

### MegiLance Logo
The main logo combines a stylized "M" lettermark with AI-inspired neural network connections:
- **Design**: Clean, modern lettermark with subtle tech elements
- **Colors**: Brand blue gradient (#4573df to #6b8ff0)
- **Usage**: Navigation headers, branding, loading states
- **AI Elements**: Neural network connections and accent dots

### Avatar System
Professional circular avatars featuring:
- **Background**: Brand gradient
- **Content**: User initials with optional silhouette overlay
- **Typography**: Poppins font, 600 weight
- **Sizes**: 32px, 48px, 64px, 128px

## Implementation Best Practices

### Accessibility
- Always include `aria-label` for interactive icons
- Use semantic HTML when icons represent actions
- Provide text alternatives for complex icons
- Ensure sufficient color contrast

### Performance
- Use the unified `Icon` component for consistency
- Leverage SVG sprites for frequently used icons
- Optimize icon usage by choosing appropriate sizes
- Consider lazy loading for large icon sets

### Theming
- Icons automatically inherit theme colors via `currentColor`
- Custom colors should align with the design system
- Test icons in both light and dark themes
- Use opacity for subtle variations

## Maintenance

### Adding New Icons
1. Design following the established grid system and visual properties
2. Save as optimized SVG in the appropriate category folder
3. Add the icon name to the `IconName` type in `Icon.tsx`
4. Add the path data to the `iconPaths` record
5. Update this README with the new icon

### Quality Standards
- [ ] Follows 24x24 grid system
- [ ] Uses consistent stroke weight (2px)
- [ ] Includes proper accessibility attributes
- [ ] Optimized file size
- [ ] Works in both themes
- [ ] Tested at multiple sizes

## Support

For questions about the icon system or requests for new icons, please:
1. Check existing icons in this documentation
2. Review the design system guidelines
3. Create an issue with clear requirements
4. Follow the established design principles

---

*Part of the MegiLance Design System - Version 1.0*