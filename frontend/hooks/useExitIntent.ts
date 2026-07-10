import { useEffect } from 'react';

/**
 * Hook to trigger a callback when the user's cursor moves off the top of the screen,
 * indicating intent to close the tab or navigate away.
 * 
 * @param onExitIntent Callback to fire
 * @param active Whether the listener is active
 */
export function useExitIntent(onExitIntent: () => void, active = true) {
  useEffect(() => {
    if (!active) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // clientY < 15 signals the cursor has left the viewport boundaries towards the top
      if (e.clientY < 15) {
        onExitIntent();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onExitIntent, active]);
}
