// @AI-HINT: Accessibility utilities and hooks for WCAG 2.1 AA compliance
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Hook to trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Find focusable elements
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to manage focus on route changes
 */
export function useFocusOnRouteChange() {
  useEffect(() => {
    // Focus main content on route change
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent instanceof HTMLElement) {
      mainContent.tabIndex = -1;
      mainContent.focus();
      mainContent.removeAttribute('tabindex');
    }
  }, []);
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Hook for keyboard navigation in lists/grids
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  itemCount: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    columns?: number;
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', columns = 1, loop = true, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newIndex = activeIndex;

      switch (e.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'grid') {
            e.preventDefault();
            newIndex = orientation === 'grid' 
              ? activeIndex - columns 
              : activeIndex - 1;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'grid') {
            e.preventDefault();
            newIndex = orientation === 'grid' 
              ? activeIndex + columns 
              : activeIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'grid') {
            e.preventDefault();
            newIndex = activeIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'grid') {
            e.preventDefault();
            newIndex = activeIndex + 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = itemCount - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(activeIndex);
          return;
        default:
          return;
      }

      // Handle bounds
      if (loop) {
        newIndex = ((newIndex % itemCount) + itemCount) % itemCount;
      } else {
        newIndex = Math.max(0, Math.min(itemCount - 1, newIndex));
      }

      setActiveIndex(newIndex);
    },
    [activeIndex, itemCount, orientation, columns, loop, onSelect]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { containerRef, activeIndex, setActiveIndex };
}

// ============================================================================
// Screen Reader Announcements
// ============================================================================

/**
 * Hook for screen reader announcements (live regions)
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or get live region
    let liveRegion = document.getElementById(`sr-announce-${priority}`);
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = `sr-announce-${priority}`;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(liveRegion);
    }

    // Clear and set message
    liveRegion.textContent = '';
    requestAnimationFrame(() => {
      liveRegion!.textContent = message;
    });
  }, []);

  return { announce };
}

// ============================================================================
// Reduced Motion
// ============================================================================

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// ============================================================================
// Color Contrast
// ============================================================================

/**
 * Check if color contrast meets WCAG requirements
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
  AALarge: boolean;
  AAALarge: boolean;
} {
  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/[A-Fa-f0-9]{2}/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map((c) => {
      const value = parseInt(c, 16) / 255;
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
    AALarge: ratio >= 3,
    AAALarge: ratio >= 4.5,
  };
}

// ============================================================================
// Skip Links
// ============================================================================

interface SkipLink {
  id: string;
  label: string;
}

/**
 * Component for skip navigation links
 */
export function SkipLinks({ links }: { links: SkipLink[] }) {
  return (
    <nav
      aria-label="Skip links"
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:bg-white focus-within:p-4 focus-within:shadow-lg"
    >
      <ul className="flex gap-4">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className="focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============================================================================
// ARIA Helpers
// ============================================================================

/**
 * Generate unique IDs for ARIA relationships
 */
export function useId(prefix: string = 'id'): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
}

/**
 * Hook for managing aria-describedby with multiple descriptions
 */
export function useAriaDescribedBy(descriptions: (string | undefined | null)[]) {
  const ids = descriptions.filter(Boolean).map((_, i) => `desc-${i}`);
  
  return {
    describedBy: ids.length > 0 ? ids.join(' ') : undefined,
    descriptions: descriptions.filter(Boolean).map((desc, i) => ({
      id: `desc-${i}`,
      content: desc,
    })),
  };
}

// ============================================================================
// Form Accessibility
// ============================================================================

interface FormFieldA11y {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

/**
 * Hook for accessible form fields
 */
export function useFormFieldA11y(
  name: string,
  options: {
    error?: string;
    hint?: string;
    required?: boolean;
  } = {}
): { fieldProps: FormFieldA11y; errorId?: string; hintId?: string } {
  const baseId = useId(name);
  const errorId = options.error ? `${baseId}-error` : undefined;
  const hintId = options.hint ? `${baseId}-hint` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return {
    fieldProps: {
      id: baseId,
      'aria-describedby': describedBy,
      'aria-invalid': !!options.error,
      'aria-required': options.required,
    },
    errorId,
    hintId,
  };
}

// ============================================================================
// Visual Hidden Text
// ============================================================================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * Component to hide content visually but keep it accessible to screen readers
 */
export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// High Contrast Mode
// ============================================================================

/**
 * Hook to detect high contrast mode
 */
export function useHighContrastMode(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check for Windows high contrast mode
    const mediaQuery = window.matchMedia('(forced-colors: active)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
}

export default {
  useFocusTrap,
  useFocusOnRouteChange,
  useKeyboardNavigation,
  useAnnounce,
  useReducedMotion,
  useHighContrastMode,
  checkColorContrast,
  useId,
  useFormFieldA11y,
  SkipLinks,
  VisuallyHidden,
};
