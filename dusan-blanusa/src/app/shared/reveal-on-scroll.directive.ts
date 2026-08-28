import {
  AfterViewInit,
  Directive,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: false,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;
    element.classList.add('reveal-on-scroll');

    if (!isPlatformBrowser(this.platformId) || !('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) {
            return;
          }
          element.classList.add('is-visible');
          this.observer?.disconnect();
        },
        { threshold: 0.14 },
      );
      this.observer.observe(element);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
