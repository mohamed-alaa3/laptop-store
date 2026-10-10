export interface RevealOrigin {
  x: number;
  y: number;
}

let activeTransitionId = 0;

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const supportsViewTransitions = (): boolean =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

/**
 * Runs `update` inside a View Transition and reveals the new state with a circle
 * expanding from `origin` (viewport coordinates) until it covers the whole viewport.
 *
 * Returns `false` (without calling `update`) when the API is unavailable or the user
 * prefers reduced motion, so the caller can run its regular non-animated path.
 */
export function revealWithViewTransition(update: () => void, origin: RevealOrigin): boolean {
  if (!supportsViewTransitions() || prefersReducedMotion()) return false;

  const root = document.documentElement;
  const id = ++activeTransitionId;
  root.classList.add('theme-vt');

  const transition = document.startViewTransition(update);

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: 520,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      // Transition skipped (e.g. superseded by another toggle): the update still ran.
    });

  const cleanup = (): void => {
    // Only the most recent transition may remove the class.
    if (id === activeTransitionId) root.classList.remove('theme-vt');
  };
  transition.finished.then(cleanup, cleanup);

  return true;
}
