export interface ScrollDirectionState {
  /** True once the user has scrolled down meaningfully and not yet scrolled back up. */
  hidden: boolean;
  /** True once the page is scrolled past `scrolledOffset` (used for the navbar's solid backdrop). */
  scrolled: boolean;
}

export interface ScrollDirectionOptions {
  /** Cumulative px of downward scroll before `hidden` becomes true. */
  hideThreshold?: number;
  /** Cumulative px of upward scroll before `hidden` becomes false. */
  showThreshold?: number;
  /** At or above this scrollY the state is always `hidden: false`. */
  topOffset?: number;
  /** Never hide before the page has been scrolled at least this far (so content clears the bar). */
  minHideScrollY?: number;
  /** scrollY beyond which `scrolled` is true. */
  scrolledOffset?: number;
  /** Called only when `hidden` or `scrolled` actually changes. */
  onChange: (state: ScrollDirectionState) => void;
}

export interface ScrollDirectionWatcher {
  /** Show again and re-baseline to the current scroll position (route change, restoration). */
  reset(): void;
  destroy(): void;
}

/**
 * Lightweight scroll-direction tracker: one passive scroll listener, work batched into a single
 * requestAnimationFrame, deltas accumulated per direction so trackpad noise / tiny touch moves
 * never toggle the state. Does not touch Angular — the caller decides what to do in `onChange`.
 */
export function watchScrollDirection(options: ScrollDirectionOptions): ScrollDirectionWatcher {
  const {
    hideThreshold = 12,
    showThreshold = 6,
    topOffset = 8,
    minHideScrollY = 80,
    scrolledOffset = 20,
    onChange,
  } = options;

  let lastY = readY();
  let accumulated = 0; // signed px since the direction last flipped
  let hidden = false;
  let scrolled = lastY > scrolledOffset;
  let rafId: number | null = null;

  function readY(): number {
    // Clamp: iOS rubber-banding reports negative / over-max values that look like fake direction flips.
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(Math.max(window.scrollY, 0), max);
  }

  function emit(nextHidden: boolean, nextScrolled: boolean): void {
    if (nextHidden === hidden && nextScrolled === scrolled) return;
    hidden = nextHidden;
    scrolled = nextScrolled;
    onChange({ hidden, scrolled });
  }

  function update(): void {
    rafId = null;
    const y = readY();
    const delta = y - lastY;
    lastY = y;

    if (delta !== 0) {
      accumulated = Math.sign(delta) === Math.sign(accumulated) ? accumulated + delta : delta;
    }

    let nextHidden = hidden;
    if (y <= topOffset) {
      nextHidden = false;
      accumulated = 0;
    } else if (accumulated >= hideThreshold && y > minHideScrollY) {
      nextHidden = true;
    } else if (accumulated <= -showThreshold) {
      nextHidden = false;
    }
    emit(nextHidden, y > scrolledOffset);
  }

  const onScroll = (): void => {
    if (rafId === null) rafId = requestAnimationFrame(update);
  };

  const onResize = (): void => {
    lastY = readY();
    accumulated = 0;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return {
    reset(): void {
      lastY = readY();
      accumulated = 0;
      emit(false, lastY > scrolledOffset);
    },
    destroy(): void {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };
}
