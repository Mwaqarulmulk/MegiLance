// @AI-HINT: Confetti helpers for celebrating AI results. Respects prefers-reduced-motion. Brand-colored.
'use client';

import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#4573df', '#6b93f5', '#9b59b6', '#ff9800', '#27AE60'];

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Celebratory burst from the center — used when an AI result is revealed. */
export function celebrate(): void {
  if (reducedMotion()) return;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: BRAND_COLORS };
  const count = 120;
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

/** Side cannons — bigger celebration for high scores / wins. */
export function sideCannons(durationMs = 1800): void {
  if (reducedMotion()) return;
  const end = Date.now() + durationMs;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: BRAND_COLORS, zIndex: 9999 });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: BRAND_COLORS, zIndex: 9999 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Burst originating from a specific element (e.g. the result card). */
export function burstFrom(el: HTMLElement | null): void {
  if (reducedMotion() || !el) {
    celebrate();
    return;
  }
  const rect = el.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 3) / window.innerHeight;
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { x, y },
    colors: BRAND_COLORS,
    zIndex: 9999,
  });
}
