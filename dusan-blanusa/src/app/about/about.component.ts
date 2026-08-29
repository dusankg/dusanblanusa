import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

type Finger = 'index' | 'middle' | 'ring' | 'little';
type LabelAlignment = 'start' | 'end';

interface FocusPoint {
  readonly value: string;
  readonly description: string;
  readonly finger: Finger;
  readonly hotspotPosition: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly rotation: number;
  };
  readonly labelPosition: {
    readonly x: number;
    readonly y: number;
    readonly alignment: LabelAlignment;
  };
}

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('focusSection', { static: true })
  private readonly focusSectionRef!: ElementRef<HTMLElement>;

  readonly handFrames: readonly string[] = Array.from(
    { length: 10 },
    (_, index) => `assets/images/robot-hand/image (${index + 2}).png`,
  );

  readonly focusPoints: readonly FocusPoint[] = [
    {
      value: '7 years',
      description: 'in AI and Data Science',
      finger: 'index',
      hotspotPosition: { x: 48, y: 11, width: 19, height: 17, rotation: 38 },
      labelPosition: { x: 70, y: 10, alignment: 'start' },
    },
    {
      value: '400+ TB',
      description: 'migrated to cloud infrastructure',
      finger: 'middle',
      hotspotPosition: { x: 34, y: 23, width: 26, height: 15, rotation: 10 },
      labelPosition: { x: 29, y: 22, alignment: 'end' },
    },
    {
      value: '12 teams',
      description: 'coordinated in a major transformation',
      finger: 'ring',
      hotspotPosition: { x: 31, y: 33, width: 24, height: 16, rotation: -13 },
      labelPosition: { x: 25, y: 47, alignment: 'end' },
    },
    {
      value: '0→1',
      description: 'from proof of concept to production',
      finger: 'little',
      hotspotPosition: { x: 36, y: 42, width: 16, height: 25, rotation: -16 },
      labelPosition: { x: 69, y: 58, alignment: 'start' },
    },
  ];

  activeFinger: Finger | null = null;
  activeFrameIndex = 0;
  interactionEnabled = false;
  sequenceReady = false;
  sequenceFailed = false;
  reducedMotion = false;

  private sectionTop = 0;
  private sectionHeight = 0;
  private viewportHeight = 0;
  private animationFrameId: number | null = null;
  private isNearViewport = false;
  private intersectionObserver?: IntersectionObserver;

  private readonly onScroll = (): void => this.requestAnimationFrame();
  private readonly onResize = (): void => {
    this.cacheMeasurements();
    this.requestAnimationFrame();
  };
  constructor(
    private readonly ngZone: NgZone,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cacheMeasurements();

    if (this.reducedMotion) {
      this.interactionEnabled = true;
      this.activeFrameIndex = this.handFrames.length - 1;
    }

    this.preloadFrames();

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });

      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          this.isNearViewport = entries.some((entry) => entry.isIntersecting);

          if (this.isNearViewport) {
            this.cacheMeasurements();
            this.requestAnimationFrame();
          } else {
            this.cancelAnimationFrame();
          }
        },
        { rootMargin: '100% 0px' },
      );

      this.intersectionObserver.observe(this.focusSectionRef.nativeElement);
    });

    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.intersectionObserver?.disconnect();
    this.cancelAnimationFrame();
  }

  onFrameReady(): void {
    this.sequenceReady = true;
    this.changeDetectorRef.markForCheck();
  }

  onFrameError(): void {
    this.sequenceFailed = true;
    this.interactionEnabled = true;
    this.cancelAnimationFrame();
    this.changeDetectorRef.markForCheck();
  }

  activateFocus(focusPoint: FocusPoint): void {
    if (this.interactionEnabled) {
      this.activeFinger = focusPoint.finger;
    }
  }

  clearPointerFocus(): void {
    const focusedElement = document.activeElement;

    if (!(focusedElement instanceof HTMLElement) || !focusedElement.classList.contains('hotspot')) {
      this.activeFinger = null;
    }
  }

  private cacheMeasurements(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const bounds = this.focusSectionRef.nativeElement.getBoundingClientRect();
    this.sectionTop = bounds.top + window.scrollY;
    this.sectionHeight = bounds.height;
    this.viewportHeight = window.innerHeight;
  }

  private requestAnimationFrame(): void {
    if (
      typeof window === 'undefined' ||
      this.reducedMotion ||
      this.sequenceFailed ||
      !this.isNearViewport ||
      this.animationFrameId !== null
    ) {
      return;
    }

    this.animationFrameId = window.requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.updateScrollAnimation();
    });
  }

  private updateScrollAnimation(): void {
    const scrollRange = Math.max(1, this.sectionHeight - this.viewportHeight);
    const sectionProgress = this.clamp((window.scrollY - this.sectionTop) / scrollRange);
    const openingProgress = this.clamp(sectionProgress / 0.48);
    const entryProgress = this.clamp(sectionProgress / 0.12);

    this.focusSectionRef.nativeElement.style.setProperty('--focus-entry', entryProgress.toFixed(3));
    this.setFrameIndex(Math.round(openingProgress * (this.handFrames.length - 1)));
    this.setInteractionEnabled(openingProgress >= 0.92);
  }

  private preloadFrames(): void {
    for (const source of this.handFrames.slice(1)) {
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
    }
  }

  private setFrameIndex(index: number): void {
    if (this.activeFrameIndex === index) {
      return;
    }

    this.ngZone.run(() => {
      this.activeFrameIndex = index;
      this.changeDetectorRef.markForCheck();
    });
  }

  private setInteractionEnabled(enabled: boolean): void {
    if (this.interactionEnabled === enabled) {
      return;
    }

    this.ngZone.run(() => {
      this.interactionEnabled = enabled;

      if (!enabled) {
        this.activeFinger = null;
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  private cancelAnimationFrame(): void {
    if (this.animationFrameId === null || typeof window === 'undefined') {
      return;
    }

    window.cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  private clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
  }
}
