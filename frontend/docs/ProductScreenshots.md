# Product Screenshots Carousel Component

This document provides documentation for the Product Screenshots carousel component added to the MegiLance homepage.

## Overview

The Product Screenshots carousel is a responsive, touch-friendly component that showcases key features of the MegiLance platform through animated screenshots. It includes navigation controls, auto-play functionality, and theme-aware styling.

## Features

1. **Responsive Design**: Adapts to different screen sizes with appropriate layouts
2. **Auto-play Functionality**: Automatically cycles through screenshots with pause on hover
3. **Manual Navigation**: Previous/next buttons and indicator dots for manual control
4. **Theme-aware Styling**: Supports both light and dark themes
5. **Accessibility**: Proper ARIA attributes for screen readers
6. **Performance**: Optimized with lazy loading for images

## Component Structure

### Main Component: ProductScreenshots.tsx

The main component orchestrates the carousel functionality and renders all sub-components.

#### Props
- None (self-contained component)

#### State
- `currentIndex`: Tracks the currently displayed screenshot
- `isAutoPlaying`: Controls auto-play functionality

#### Key Functions
- `goToPrevious()`: Navigate to the previous screenshot
- `goToNext()`: Navigate to the next screenshot
- `goToSlide(index)`: Navigate to a specific screenshot
- `toggleAutoPlay()`: Toggle auto-play functionality

### Sub-components

#### Carousel Container
Wraps the entire carousel with appropriate styling and layout.

#### Navigation Buttons
Previous and next buttons for manual navigation.

#### Slides
Individual screenshot slides with associated information.

#### Indicators
Dot navigation for quick access to specific slides.

#### Auto-play Control
Button to toggle auto-play functionality.

## Styling

The component uses CSS modules for styling with a three-file pattern:

1. **ProductScreenshots.common.module.css**: Base styles and layout
2. **ProductScreenshots.light.module.css**: Light theme overrides
3. **ProductScreenshots.dark.module.css**: Dark theme overrides

### Key Styling Features

- **Glassmorphism Effects**: Frosted glass effect on navigation elements
- **Smooth Transitions**: CSS transitions for all interactive elements
- **Responsive Breakpoints**: Adapts layout for mobile, tablet, and desktop
- **Gradient Text**: Modern gradient text effects for headings
- **Box Shadows**: Depth-enhancing shadows for visual hierarchy

## Usage

To use the Product Screenshots carousel, simply import and include it in your page:

```tsx
import ProductScreenshots from '@/app/Home/components/ProductScreenshots';

// In your component
<ProductScreenshots />
```

## Customization

To customize the screenshots displayed in the carousel, modify the `screenshots` array in the component:

```tsx
const screenshots: Screenshot[] = [
  {
    id: 1,
    title: 'Feature Name',
    description: 'Feature description',
    imageUrl: '/path/to/image.png',
  },
  // ... more screenshots
];
```

## Accessibility

The component follows accessibility best practices:

- Proper ARIA roles and attributes
- Keyboard navigable controls
- Sufficient color contrast
- Semantic HTML structure
- Focus management

## Performance Considerations

- Images use lazy loading
- CSS transitions are optimized
- Minimal re-renders through efficient state management
- Responsive images for different screen sizes

## Future Enhancements

1. **Video Integration**: Add video previews alongside screenshots
2. **Interactive Previews**: Click to expand screenshots to full size
3. **Custom Transitions**: Additional animation options for slide transitions
4. **Keyboard Shortcuts**: Arrow key navigation support
5. **Touch Gestures**: Swipe support for mobile devices