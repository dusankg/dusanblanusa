import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ChatbotStore } from '../chatbot/chatbot.store';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hero', { static: true }) private readonly heroRef!: ElementRef<HTMLElement>;
  @ViewChild('portrait', { static: true }) private readonly portraitRef!: ElementRef<HTMLElement>;
  @ViewChild('grid', { static: true }) private readonly gridRef!: ElementRef<HTMLElement>;

  readonly aiPortrait = 'assets/images/dusan-ai.png';
  readonly realPortrait = 'assets/images/dusan-real.png';
  private frameId?: number;
  private resizeObserver?: ResizeObserver;
  private mediaQuery?: MediaQueryList;
  private interactionMediaQuery?: MediaQueryList;
  private portraitRect?: DOMRect;
  private heroRect?: DOMRect;
  private targetX = 0;
  private targetY = 0;
  private smoothX = 0;
  private smoothY = 0;
  private targetRadius = 0;
  private smoothRadius = 0;
  private gridTargetX = 0;
  private gridTargetY = 0;
  private gridX = 0;
  private gridY = 0;
  private portraitTargetX = 0;
  private portraitTargetY = 0;
  private portraitX = 0;
  private portraitY = 0;
  private loadedPortraits = 0;
  private hasInteracted = false;
  private reducedMotion = false;
  private touchInteraction = false;
  private pointerInside = false;
  private readonly cleanup: Array<() => void> = [];

  constructor(
    readonly chatbotStore: ChatbotStore,
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  openChat(event: MouseEvent): void {
    this.chatbotStore.open(event.currentTarget);
  }

  warmChat(): void {
    this.chatbotStore.warm();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.zone.runOutsideAngular(() => this.initializeInteraction());
  }

  onPortraitLoad(): void {
    this.loadedPortraits += 1;
    if (this.loadedPortraits >= 2) {
      this.heroRef.nativeElement.classList.add('is-ready');
    }
  }

  private initializeInteraction(): void {
    const hero = this.heroRef.nativeElement;
    const portrait = this.portraitRef.nativeElement;
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.interactionMediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    this.reducedMotion = this.mediaQuery.matches;
    this.touchInteraction = this.interactionMediaQuery.matches;

    const enter = (event: PointerEvent) => this.handlePortraitEnter(event);
    const move = (event: PointerEvent) => this.handlePortraitPointer(event);
    const leave = () => this.handlePortraitLeave();
    const heroMove = (event: PointerEvent) => this.handleHeroPointer(event);
    const resize = () => this.cacheDimensions();
    const motionChange = (event: MediaQueryListEvent) => {
      this.reducedMotion = event.matches;
      this.applyInteractionState(true);
    };
    const interactionChange = (event: MediaQueryListEvent) => {
      this.touchInteraction = event.matches;
      this.applyInteractionState(true);
    };

    portrait.addEventListener('pointerenter', enter);
    portrait.addEventListener('pointermove', move);
    portrait.addEventListener('pointerleave', leave);
    hero.addEventListener('pointermove', heroMove);
    window.addEventListener('resize', resize, { passive: true });
    this.mediaQuery.addEventListener('change', motionChange);
    this.interactionMediaQuery.addEventListener('change', interactionChange);
    this.cleanup.push(
      () => portrait.removeEventListener('pointerenter', enter),
      () => portrait.removeEventListener('pointermove', move),
      () => portrait.removeEventListener('pointerleave', leave),
      () => hero.removeEventListener('pointermove', heroMove),
      () => window.removeEventListener('resize', resize),
      () => this.mediaQuery?.removeEventListener('change', motionChange),
      () => this.interactionMediaQuery?.removeEventListener('change', interactionChange),
    );

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.cacheDimensions());
      this.resizeObserver.observe(hero);
      this.resizeObserver.observe(portrait);
    }

    this.cacheDimensions();
    this.animate();
  }

  private cacheDimensions(): void {
    this.portraitRect = this.portraitRef.nativeElement.getBoundingClientRect();
    this.heroRect = this.heroRef.nativeElement.getBoundingClientRect();
    this.applyInteractionState(true);
  }

  private setRestingPosition(immediate = false): void {
    if (!this.portraitRect) {
      return;
    }
    this.targetX = this.portraitRect.width * 0.52;
    this.targetY = this.portraitRect.height * 0.34;
    this.targetRadius = this.touchInteraction ? this.getRevealRadius() : 0;
    if (immediate || this.reducedMotion) {
      this.smoothX = this.targetX;
      this.smoothY = this.targetY;
      this.smoothRadius = this.targetRadius;
      this.updateRevealVariables();
    }
  }

  private handlePortraitEnter(event: PointerEvent): void {
    if (event.pointerType === 'touch' || this.touchInteraction) {
      return;
    }
    this.pointerInside = true;
    this.portraitRect = this.portraitRef.nativeElement.getBoundingClientRect();
    this.targetRadius = this.getRevealRadius();
    this.handlePortraitPointer(event);
  }

  private handlePortraitLeave(): void {
    if (this.touchInteraction) {
      return;
    }
    this.pointerInside = false;
    this.setRestingPosition(this.reducedMotion);
  }

  private handlePortraitPointer(event: PointerEvent): void {
    if (event.pointerType === 'touch' || this.touchInteraction) {
      return;
    }
    this.portraitRect = this.portraitRef.nativeElement.getBoundingClientRect();
    const rect = this.portraitRect;
    this.targetX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    this.targetY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    this.targetRadius = this.getRevealRadius();
    if (this.reducedMotion) {
      this.smoothX = this.targetX;
      this.smoothY = this.targetY;
      this.smoothRadius = this.targetRadius;
      this.updateRevealVariables();
    }
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      this.portraitRef.nativeElement.classList.add('has-interacted');
    }
  }

  private handleHeroPointer(event: PointerEvent): void {
    if (this.reducedMotion || event.pointerType === 'touch' || !this.heroRect) {
      return;
    }
    const normalizedX = ((event.clientX - this.heroRect.left) / this.heroRect.width - 0.5) * 2;
    const normalizedY = ((event.clientY - this.heroRect.top) / this.heroRect.height - 0.5) * 2;
    this.gridTargetX = normalizedX * 24;
    this.gridTargetY = normalizedY * 24;
    this.portraitTargetX = normalizedX * 4;
    this.portraitTargetY = normalizedY * 3;
  }

  private animate = (): void => {
    if (!this.reducedMotion) {
      this.smoothX += (this.targetX - this.smoothX) * 0.13;
      this.smoothY += (this.targetY - this.smoothY) * 0.13;
      this.smoothRadius += (this.targetRadius - this.smoothRadius) * 0.16;
      this.gridX += (this.gridTargetX - this.gridX) * 0.08;
      this.gridY += (this.gridTargetY - this.gridY) * 0.08;
      this.portraitX += (this.portraitTargetX - this.portraitX) * 0.06;
      this.portraitY += (this.portraitTargetY - this.portraitY) * 0.06;
      this.updateRevealVariables();
      this.gridRef.nativeElement.style.transform = `translate3d(${this.gridX}px, ${this.gridY}px, 0)`;
      this.portraitRef.nativeElement.style.setProperty('--depth-x', `${this.portraitX}px`);
      this.portraitRef.nativeElement.style.setProperty('--depth-y', `${this.portraitY}px`);
    }
    this.frameId = requestAnimationFrame(this.animate);
  };

  private updateRevealVariables(): void {
    const portrait = this.portraitRef.nativeElement;
    portrait.style.setProperty('--reveal-x', `${this.smoothX}px`);
    portrait.style.setProperty('--reveal-y', `${this.smoothY}px`);
    portrait.style.setProperty('--reveal-radius', `${Math.max(0, this.smoothRadius)}px`);
  }

  private applyInteractionState(immediate: boolean): void {
    if (this.pointerInside && !this.touchInteraction) {
      this.targetRadius = this.getRevealRadius();
      if (immediate || this.reducedMotion) {
        this.smoothRadius = this.targetRadius;
        this.updateRevealVariables();
      }
      return;
    }
    this.setRestingPosition(immediate);
  }

  private getRevealRadius(): number {
    if (window.innerWidth <= 560) {
      return Math.max(135, Math.min(165, window.innerWidth * 0.4));
    }
    if (window.innerWidth <= 900) {
      return 170;
    }
    return Math.max(190, Math.min(240, window.innerWidth * 0.15));
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((remove) => remove());
    this.resizeObserver?.disconnect();
    if (this.frameId !== undefined && isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.frameId);
    }
  }
}
