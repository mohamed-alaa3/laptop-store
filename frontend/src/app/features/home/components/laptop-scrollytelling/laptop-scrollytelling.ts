import {
  Component,
  inject,
  Injector,
  signal,
  computed,
  effect,
  type OnInit,
  type OnDestroy,
  type AfterViewInit,
  PLATFORM_ID,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  NgZone,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService, type Theme } from '../../../../core/services/theme';
import { LanguageService } from '../../../../core/services/language';

const FRAME_BATCH_SIZE = 16;

/** Viewport category. Matches the Tailwind `md` breakpoint (768px) the navbar already uses. */
export type ViewportCategory = 'desktop' | 'mobile';
const MOBILE_QUERY = '(max-width: 767px)';

interface FrameSequence {
  /** Folder under /public (served from the site root). */
  folder: string;
  count: number;
  ext: string;
  /** Zero-padding width of the frame number (00001.jpg → 5). */
  pad: number;
}

type VariantKey = `${Theme}-${ViewportCategory}`;

/** Real folder names, frame counts and numbering verified against the supplied archives. */
const SEQUENCES: Record<VariantKey, FrameSequence> = {
  'light-desktop': { folder: 'laptop-frames-light', count: 192, ext: 'jpg', pad: 5 },
  'dark-desktop': { folder: 'laptop-frames-dark', count: 192, ext: 'jpg', pad: 5 },
  'light-mobile': { folder: 'laptop-frames-light-phone', count: 192, ext: 'jpg', pad: 5 },
  'dark-mobile': { folder: 'laptop-frames-dark-phone', count: 192, ext: 'jpg', pad: 5 },
};

function framePath(seq: FrameSequence, index: number): string {
  // Relative on purpose: resolves against <base href>, so it also works under a sub-path deploy.
  return `${seq.folder}/${String(index + 1).padStart(seq.pad, '0')}.${seq.ext}`;
}

interface StoryStage {
  startProgress: number;
  endProgress: number;
  titleKey: string;
  subtitleKey: string;
}

const STORY_STAGES: StoryStage[] = [
  {
    startProgress: 0,
    endProgress: 0.15,
    titleKey: 'home.scrollytelling.stage1Title',
    subtitleKey: 'home.scrollytelling.stage1Subtitle',
  },
  {
    startProgress: 0.2,
    endProgress: 0.35,
    titleKey: 'home.scrollytelling.stage2Title',
    subtitleKey: 'home.scrollytelling.stage2Subtitle',
  },
  {
    startProgress: 0.4,
    endProgress: 0.55,
    titleKey: 'home.scrollytelling.stage3Title',
    subtitleKey: 'home.scrollytelling.stage3Subtitle',
  },
  {
    startProgress: 0.6,
    endProgress: 0.75,
    titleKey: 'home.scrollytelling.stage4Title',
    subtitleKey: 'home.scrollytelling.stage4Subtitle',
  },
  {
    startProgress: 0.82,
    endProgress: 0.98,
    titleKey: 'home.scrollytelling.stage5Title',
    subtitleKey: 'home.scrollytelling.stage5Subtitle',
  },
];

@Component({
  selector: 'app-laptop-scrollytelling',
  templateUrl: './laptop-scrollytelling.html',
  styleUrl: './laptop-scrollytelling.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaptopScrollytelling implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);
  readonly theme = inject(ThemeService);
  readonly language = inject(LanguageService);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('scrollCanvas');
  readonly stickyRef = viewChild<ElementRef<HTMLElement>>('stickyContainer');
  readonly scrollRef = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  // ── State ────────────────────────────────────────────────
  readonly currentFrame = signal(0);
  readonly scrollProgress = signal(0);
  readonly isLoading = signal(true);
  readonly loadProgress = signal(0);
  readonly prefersReducedMotion = signal(false);
  readonly canvasReady = signal(false);
  readonly isMobile = signal(false);

  /** Which of the four sequences is active: theme × viewport category. */
  readonly variant = computed<VariantKey>(
    () => `${this.theme.theme()}-${this.isMobile() ? 'mobile' : 'desktop'}` as VariantKey,
  );

  readonly activeStage = computed<StoryStage | null>(() => {
    const progress = this.scrollProgress();
    for (const stage of STORY_STAGES) {
      if (progress >= stage.startProgress && progress <= stage.endProgress) return stage;
    }
    return null;
  });

  readonly stageOpacity = computed(() => {
    const progress = this.scrollProgress();
    const stage = this.activeStage();
    if (!stage) return 0;

    const fadeInEnd = stage.startProgress + 0.03;
    const fadeOutStart = stage.endProgress - 0.03;

    if (progress < fadeInEnd) return Math.max(0, (progress - stage.startProgress) / 0.03);
    if (progress > fadeOutStart) return Math.max(0, (stage.endProgress - progress) / 0.03);
    return 1;
  });

  /** Reduced-motion fallback: first frame of whichever sequence is active. */
  readonly fallbackImageSrc = computed(() => framePath(SEQUENCES[this.variant()], 0));

  // ── Frame caches — one per variant so sequences never overwrite each other ──
  private readonly caches = new Map<VariantKey, (HTMLImageElement | null)[]>();
  private readonly loadingPromises = new Map<string, Promise<HTMLImageElement>>();
  private loadToken = 0;

  // ── Canvas / render state ────────────────────────────────
  private ctx: CanvasRenderingContext2D | null = null;
  private lastRenderedIndex = -1;
  private lastRenderedVariant: VariantKey | null = null;
  private lastDrawn: HTMLImageElement | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;
  private resizeObserver: ResizeObserver | null = null;

  /** Scroll progress 0..1 — the source of truth, independent of any sequence's frame count. */
  private progress = 0;
  private layoutLength = 0;
  private scrollRafId: number | null = null;
  private onScroll: (() => void) | null = null;
  private mediaQuery: MediaQueryList | null = null;
  private onMediaChange: ((e: MediaQueryListEvent) => void) | null = null;
  private destroyed = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.prefersReducedMotion.set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Viewport category — kept in sync so crossing the breakpoint swaps sequences live.
    this.mediaQuery = window.matchMedia(MOBILE_QUERY);
    this.isMobile.set(this.mediaQuery.matches);
    this.onMediaChange = (e) => this.isMobile.set(e.matches);
    this.mediaQuery.addEventListener('change', this.onMediaChange);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return; // reduced-motion branch renders a static <img> instead
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) return;

    this.setupCanvas();
    this.setupResizeObserver();

    // Correct progress from the very first frame (also when created by the router mid-page).
    this.zone.runOutsideAngular(() => this.setupScrollListener());
    this.updateScrollProgress();

    // Theme or viewport change → switch sequence at the same progress.
    effect(
      () => {
        const variant = this.variant();
        untracked(() => this.onVariantChange(variant));
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.loadToken++; // aborts any background batch loop
    if (this.scrollRafId !== null) cancelAnimationFrame(this.scrollRafId);
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    this.resizeObserver?.disconnect();
    if (this.mediaQuery && this.onMediaChange) {
      this.mediaQuery.removeEventListener('change', this.onMediaChange);
    }
    this.loadingPromises.clear();
    this.caches.clear();
    this.lastDrawn = null;
  }

  // ── Canvas setup ─────────────────────────────────────────

  private setupCanvas(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const container = canvas?.parentElement;
    if (!canvas || !container || !this.ctx) return;

    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (width === 0 || height === 0) return;
    if (width === this.cssWidth && height === this.cssHeight && canvas.width === Math.round(width * this.dpr)) {
      return;
    }

    this.cssWidth = width;
    this.cssHeight = height;
    // Assigning width/height clears the bitmap, so redraw synchronously (no blank flash).
    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.canvasReady.set(true);

    if (this.lastDrawn) this.drawImage(this.lastDrawn);
    this.lastRenderedIndex = -1;
    this.renderFrame();
  }

  private setupResizeObserver(): void {
    const container = this.canvasRef()?.nativeElement.parentElement;
    if (!container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.setupCanvas();
      this.keepProgressAcrossResize();
      this.updateScrollProgress();
    });
    this.resizeObserver.observe(container);
    const scrollEl = this.scrollRef()?.nativeElement;
    if (scrollEl) this.resizeObserver.observe(scrollEl);
  }

  /**
   * The section's scroll length changes with the viewport (500vh / 400vh / 350vh, or a resized
   * window). Without this the same scrollY would map to a different point in the story, so
   * re-anchor scrollY to keep the current progress while the user is inside the section.
   */
  private keepProgressAcrossResize(): void {
    const scrollEl = this.scrollRef()?.nativeElement;
    const stickyEl = this.stickyRef()?.nativeElement;
    if (!scrollEl || !stickyEl) return;

    const rect = scrollEl.getBoundingClientRect();
    const length = rect.height - stickyEl.offsetHeight;
    const changed = this.layoutLength > 0 && Math.abs(length - this.layoutLength) > 1;
    if (changed && length > 0 && this.progress > 0 && this.progress < 1) {
      const sectionTop = window.scrollY + rect.top;
      window.scrollTo({ top: sectionTop + this.progress * length, behavior: 'instant' });
    }
    this.layoutLength = length;
  }

  // ── Scroll handling ──────────────────────────────────────

  private setupScrollListener(): void {
    this.onScroll = () => {
      if (this.scrollRafId !== null) return;
      this.scrollRafId = requestAnimationFrame(() => {
        this.scrollRafId = null;
        this.updateScrollProgress();
      });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private updateScrollProgress(): void {
    const scrollEl = this.scrollRef()?.nativeElement;
    const stickyEl = this.stickyRef()?.nativeElement;
    if (!scrollEl || !stickyEl) return;

    const rect = scrollEl.getBoundingClientRect();
    const scrollLength = rect.height - stickyEl.offsetHeight;
    const progress = scrollLength > 0 ? Math.max(0, Math.min(1, -rect.top / scrollLength)) : 0;
    this.progress = progress;

    const index = this.frameIndexFor(progress);
    if (Math.abs(progress - this.scrollProgress()) > 0.001 || index !== this.currentFrame()) {
      this.scrollProgress.set(progress);
      this.currentFrame.set(index);
    }
    this.renderFrame();
  }

  private frameIndexFor(progress: number): number {
    const seq = SEQUENCES[this.variant()];
    return Math.round(progress * (seq.count - 1));
  }

  // ── Rendering ────────────────────────────────────────────

  private renderFrame(): void {
    if (!this.ctx || !this.canvasReady()) return;

    const variant = this.variant();
    const seq = SEQUENCES[variant];
    const index = Math.round(this.progress * (seq.count - 1));

    if (index === this.lastRenderedIndex && variant === this.lastRenderedVariant) return;

    const frames = this.framesFor(variant);
    const image = frames[index];

    if (!image) {
      // Not here yet: fetch it, and meanwhile show the nearest frame we do have in this
      // sequence. If there is none (fresh sequence), the last drawn frame stays on screen.
      this.loadSingleFrame(variant, index)
        .then(() => {
          if (!this.destroyed && this.variant() === variant) this.renderFrame();
        })
        .catch(() => undefined);
      const nearest = this.nearestLoaded(frames, index);
      if (nearest) this.drawImage(nearest);
      return;
    }

    this.drawImage(image);
    this.lastRenderedIndex = index;
    this.lastRenderedVariant = variant;
  }

  private nearestLoaded(frames: (HTMLImageElement | null)[], index: number): HTMLImageElement | null {
    for (let d = 1; d < frames.length; d++) {
      const before = frames[index - d];
      if (before) return before;
      const after = frames[index + d];
      if (after) return after;
    }
    return null;
  }

  /** Cover-fill using this image's own aspect ratio (desktop 16:9 and phone 9:16 differ). */
  private drawImage(image: HTMLImageElement): void {
    if (!this.ctx) return;
    const w = this.cssWidth;
    const h = this.cssHeight;
    if (!w || !h) return;

    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = w / h;
    let dw: number, dh: number;
    if (imgAspect > canvasAspect) {
      dh = h;
      dw = h * imgAspect;
    } else {
      dw = w;
      dh = w / imgAspect;
    }
    this.ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
    this.lastDrawn = image;
  }

  // ── Frame loading ────────────────────────────────────────

  private framesFor(variant: VariantKey): (HTMLImageElement | null)[] {
    let frames = this.caches.get(variant);
    if (!frames) {
      frames = new Array<HTMLImageElement | null>(SEQUENCES[variant].count).fill(null);
      this.caches.set(variant, frames);
    }
    return frames;
  }

  private loadSingleFrame(variant: VariantKey, index: number): Promise<HTMLImageElement> {
    const frames = this.framesFor(variant);
    const cached = frames[index];
    if (cached) return Promise.resolve(cached);

    const key = `${variant}:${index}`;
    const pending = this.loadingPromises.get(key);
    if (pending) return pending;

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        frames[index] = img;
        this.loadingPromises.delete(key);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(key);
        reject(new Error(`Failed to load frame ${index + 1} of ${variant}`));
      };
      img.src = framePath(SEQUENCES[variant], index);
    });
    this.loadingPromises.set(key, promise);
    return promise;
  }

  /** Active sequence only: current frame first, then the rest, nearest-first, in batches. */
  private async loadSequence(variant: VariantKey): Promise<void> {
    const token = ++this.loadToken;
    const seq = SEQUENCES[variant];
    const frames = this.framesFor(variant);
    const loadedCount = () => frames.reduce((n, f) => n + (f ? 1 : 0), 0);
    const stale = () => this.destroyed || token !== this.loadToken;

    if (loadedCount() === seq.count) {
      this.isLoading.set(false);
      this.loadProgress.set(100);
      return;
    }

    this.isLoading.set(true);
    this.loadProgress.set(Math.round((loadedCount() / seq.count) * 100));

    const start = Math.round(this.progress * (seq.count - 1));
    try {
      await this.loadSingleFrame(variant, start);
      if (!stale()) this.renderFrame();
    } catch {
      /* keep going — individual failures are tolerated */
    }

    const order = Array.from({ length: seq.count }, (_, i) => i)
      .filter((i) => !frames[i])
      .sort((a, b) => Math.abs(a - start) - Math.abs(b - start));

    for (let i = 0; i < order.length; i += FRAME_BATCH_SIZE) {
      if (stale()) return;
      await Promise.all(
        order
          .slice(i, i + FRAME_BATCH_SIZE)
          .map((idx) => this.loadSingleFrame(variant, idx).catch(() => undefined)),
      );
      if (stale()) return;
      this.loadProgress.set(Math.round((loadedCount() / seq.count) * 100));
    }

    this.isLoading.set(false);
    this.loadProgress.set(100);
    this.renderFrame();
  }

  // ── Variant (theme / viewport) change ────────────────────

  private onVariantChange(variant: VariantKey): void {
    if (this.destroyed || !this.ctx) return;
    // Progress is untouched, so the new sequence lands on the equivalent frame. The old image
    // stays on the canvas until a frame from the new sequence is ready.
    this.lastRenderedIndex = -1;
    this.currentFrame.set(this.frameIndexFor(this.progress));
    this.renderFrame();
    void this.loadSequence(variant);
  }
}
