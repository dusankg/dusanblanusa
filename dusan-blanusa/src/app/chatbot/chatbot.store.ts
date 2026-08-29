import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Subscription, TimeoutError } from 'rxjs';
import { ChatbotApiService, InvalidChatResponseError } from './chatbot-api.service';
import { ChatHistoryMessage, ChatMessage } from './chatbot.models';

@Injectable({ providedIn: 'root' })
export class ChatbotStore {
  readonly messages = signal<readonly ChatMessage[]>([]);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly lastError = signal<string | null>(null);
  readonly isEmpty = computed(() => this.messages().length === 0);
  readonly canClear = computed(() => this.messages().length > 0 && !this.isLoading());

  private activeRequest?: Subscription;
  private warmupRequest?: Subscription;
  private lastWarmupAt = 0;
  private readonly warmupCooldownMs = 5 * 60 * 1_000;
  private triggerElement: HTMLElement | null = null;

  constructor(private readonly api: ChatbotApiService) {}

  open(trigger?: EventTarget | null): void {
    if (trigger instanceof HTMLElement) {
      this.triggerElement = trigger;
    }
    this.warm();
    this.isOpen.set(true);
  }

  warm(): void {
    const now = Date.now();
    if (this.warmupRequest || now - this.lastWarmupAt < this.warmupCooldownMs) {
      return;
    }

    this.warmupRequest = this.api.warm().subscribe({
      next: () => {
        this.lastWarmupAt = Date.now();
      },
      error: () => {
        this.warmupRequest = undefined;
      },
      complete: () => {
        this.warmupRequest = undefined;
      },
    });
  }

  close(): void {
    this.isOpen.set(false);
  }

  restoreTriggerFocus(): void {
    this.triggerElement?.focus({ preventScroll: true });
  }

  send(rawQuestion: string): boolean {
    const question = rawQuestion.trim();
    if (!question || question.length > 1_000 || this.isLoading()) {
      return false;
    }

    const history = this.toHistory(this.messages());
    const userMessage: ChatMessage = {
      id: this.createId(),
      role: 'user',
      content: question,
      status: 'sending',
      createdAt: Date.now(),
    };

    this.messages.update((messages) => [...messages, userMessage]);
    this.request(userMessage, history);
    return true;
  }

  retry(messageId: string): void {
    if (this.isLoading()) {
      return;
    }

    const messages = this.messages();
    const failedIndex = messages.findIndex(
      (message) => message.id === messageId && message.role === 'user' && message.status === 'failed',
    );
    if (failedIndex < 0) {
      return;
    }

    const failedMessage = messages[failedIndex];
    const history = this.toHistory(messages.slice(0, failedIndex));
    this.messages.update((current) => current.map((message) =>
      message.id === messageId ? { ...message, status: 'sending' } : message,
    ));
    this.request({ ...failedMessage, status: 'sending' }, history);
  }

  clear(): void {
    if (this.isLoading()) {
      return;
    }
    this.messages.set([]);
    this.lastError.set(null);
  }

  private request(userMessage: ChatMessage, history: readonly ChatHistoryMessage[]): void {
    this.activeRequest?.unsubscribe();
    this.lastError.set(null);
    this.isLoading.set(true);

    this.activeRequest = this.api.ask({
      question: userMessage.content,
      chat_history: history,
    }).subscribe({
      next: ({ answer }) => {
        const assistantMessage: ChatMessage = {
          id: this.createId(),
          role: 'assistant',
          content: answer,
          status: 'sent',
          createdAt: Date.now(),
        };
        this.messages.update((messages) => [
          ...messages.map((message) =>
            message.id === userMessage.id ? { ...message, status: 'sent' as const } : message,
          ),
          assistantMessage,
        ]);
        this.isLoading.set(false);
        this.activeRequest = undefined;
      },
      error: (error: unknown) => {
        this.messages.update((messages) => messages.map((message) =>
          message.id === userMessage.id ? { ...message, status: 'failed' as const } : message,
        ));
        this.lastError.set(this.getErrorMessage(error));
        this.isLoading.set(false);
        this.activeRequest = undefined;
      },
    });
  }

  private toHistory(messages: readonly ChatMessage[]): readonly ChatHistoryMessage[] {
    return messages
      .filter((message) => message.status === 'sent')
      .map(({ role, content }) => ({ role, content }));
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'The response took too long. Please try again.';
    }
    if (error instanceof InvalidChatResponseError) {
      return 'The assistant returned an unexpected response. Please try again.';
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'I couldn\u2019t reach the assistant. Check your connection and try again.';
      }
      if (error.status === 429) {
        return 'The assistant is receiving too many requests right now. Please try again shortly.';
      }
    }
    return 'The assistant is temporarily unavailable. Please try again.';
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
