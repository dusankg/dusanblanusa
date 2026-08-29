import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ChatbotStore } from './chatbot.store';

interface BodyStyles {
  readonly position: string;
  readonly top: string;
  readonly width: string;
  readonly overflow: string;
  readonly paddingRight: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: false,
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialog') private readonly dialogRef?: ElementRef<HTMLElement>;
  @ViewChild('conversation') private readonly conversationRef?: ElementRef<HTMLElement>;
  @ViewChild('questionInput') private readonly questionInputRef?: ElementRef<HTMLTextAreaElement>;

  readonly suggestions: readonly string[] = [
    'What kind of AI systems have you built?',
    'Tell me about your experience with AI agents and RAG.',
    'What was your role in the 400+ TB data transformation?',
    'Which technologies do you use most?',
  ];
  readonly heroVisible = signal(true);
  readonly showLauncher = computed(() => !this.heroVisible() && !this.store.isOpen());

  draft = '';
  clearConfirmationVisible = false;
  private isComposing = false;
  private heroObserver?: IntersectionObserver;
  private readonly routerSubscription: Subscription;
  private bodyStyles?: BodyStyles;
  private lockedScrollY = 0;
  private uiFrame?: number;
  private scrollFrame?: number;

  constructor(
    readonly store: ChatbotStore,
    router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    this.routerSubscription = router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        requestAnimationFrame(() => this.observeHero());
      }
    });

    effect(() => {
      const open = this.store.isOpen();
      const messageCount = this.store.messages().length;
      const loading = this.store.isLoading();
      const error = this.store.lastError();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (this.uiFrame !== undefined) {
        cancelAnimationFrame(this.uiFrame);
      }
      this.uiFrame = requestAnimationFrame(() => {
        if (open) {
          this.lockBodyScroll();
          this.focusInput();
          this.scrollConversationToBottom();
        } else {
          this.clearConfirmationVisible = false;
          this.unlockBodyScroll();
          this.store.restoreTriggerFocus();
        }
        void messageCount;
        void loading;
        void error;
      });
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.observeHero();
    }
  }

  openFromLauncher(event: MouseEvent): void {
    this.store.open(event.currentTarget);
  }

  warmChat(): void {
    this.store.warm();
  }

  close(): void {
    this.store.close();
  }

  submit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.store.send(this.draft)) {
      this.draft = '';
      this.resetTextarea();
    }
  }

  submitSuggestion(question: string): void {
    if (this.store.send(question)) {
      this.draft = '';
      this.resetTextarea();
    }
  }

  retry(messageId: string): void {
    this.store.retry(messageId);
  }

  showClearConfirmation(): void {
    this.clearConfirmationVisible = true;
  }

  cancelClear(): void {
    this.clearConfirmationVisible = false;
    this.focusInput();
  }

  clearConversation(): void {
    this.store.clear();
    this.clearConfirmationVisible = false;
    requestAnimationFrame(() => this.focusInput());
  }

  updateDraft(event: Event): void {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.draft = textarea.value;
    this.resizeTextarea(textarea);
  }

  handleTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !this.isComposing) {
      event.preventDefault();
      event.currentTarget instanceof HTMLTextAreaElement
        && event.currentTarget.form?.requestSubmit();
    }
  }

  setCompositionState(isComposing: boolean): void {
    this.isComposing = isComposing;
  }

  @HostListener('document:keydown', ['$event'])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (!this.store.isOpen()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab' || !this.dialogRef) {
      return;
    }

    const focusable = Array.from(this.dialogRef.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.hasAttribute('hidden'));
    if (focusable.length === 0) {
      event.preventDefault();
      this.dialogRef.nativeElement.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  ngOnDestroy(): void {
    this.heroObserver?.disconnect();
    this.routerSubscription.unsubscribe();
    if (this.uiFrame !== undefined) {
      cancelAnimationFrame(this.uiFrame);
    }
    if (this.scrollFrame !== undefined) {
      cancelAnimationFrame(this.scrollFrame);
    }
    this.unlockBodyScroll();
  }

  private observeHero(): void {
    this.heroObserver?.disconnect();
    const hero = document.getElementById('top');
    if (!hero) {
      this.heroVisible.set(false);
      return;
    }

    this.heroObserver = new IntersectionObserver(
      ([entry]) => this.heroVisible.set(entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 1] },
    );
    this.heroObserver.observe(hero);
  }

  private focusInput(): void {
    this.questionInputRef?.nativeElement.focus({ preventScroll: true });
  }

  private scrollConversationToBottom(): void {
    if (this.scrollFrame !== undefined) {
      cancelAnimationFrame(this.scrollFrame);
    }
    this.scrollFrame = requestAnimationFrame(() => {
      const conversation = this.conversationRef?.nativeElement;
      if (conversation) {
        conversation.scrollTop = conversation.scrollHeight;
      }
    });
  }

  private resizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  }

  private resetTextarea(): void {
    const textarea = this.questionInputRef?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.focus({ preventScroll: true });
    }
  }

  private lockBodyScroll(): void {
    if (this.bodyStyles) {
      return;
    }
    const body = document.body;
    this.lockedScrollY = window.scrollY;
    this.bodyStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.position = 'fixed';
    body.style.top = `-${this.lockedScrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  private unlockBodyScroll(): void {
    if (!this.bodyStyles) {
      return;
    }
    const body = document.body;
    body.style.position = this.bodyStyles.position;
    body.style.top = this.bodyStyles.top;
    body.style.width = this.bodyStyles.width;
    body.style.overflow = this.bodyStyles.overflow;
    body.style.paddingRight = this.bodyStyles.paddingRight;
    this.bodyStyles = undefined;
    window.scrollTo({ top: this.lockedScrollY, behavior: 'instant' });
  }
}
