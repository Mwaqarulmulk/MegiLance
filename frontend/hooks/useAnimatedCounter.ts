// @AI-HINT: This custom hook provides a smooth, frame-by-frame animation for numerical counters, triggering only when the component is in the viewport.

import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to animate a number from a start value to a target value,
 * triggering the animation when the element is in view.
 * @param {number} target - The final value to animate to.
 * @param {number} duration - The total duration of the animation in milliseconds.
 * @param {number} decimals - The number of decimal places to display.
 * @param {React.RefObject<HTMLElement>} ref - A ref to the element that triggers the animation.
 * @returns {string} The current animated value as a formatted string.
 */
const useAnimatedCounter = (
  target: number,
  duration: number = 2000,
  decimals: number = 0,
  ref: React.RefObject<HTMLElement | null>
): string => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start: number | null = null;

          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const newCount = progress * target;
            setCount(newCount);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(target); // Ensure it ends exactly on the target
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [target, duration, ref, decimals]);

  return count.toFixed(decimals);
};

export default useAnimatedCounter;
