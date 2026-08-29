import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { ChatbotApiService } from './chatbot-api.service';
import { ChatResponse } from './chatbot.models';
import { ChatbotStore } from './chatbot.store';

describe('ChatbotStore', () => {
  let store: ChatbotStore;
  let api: jasmine.SpyObj<ChatbotApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ChatbotApiService>('ChatbotApiService', ['ask', 'warm']);
    api.warm.and.returnValue(of(undefined));
    TestBed.configureTestingModule({ providers: [{ provide: ChatbotApiService, useValue: api }] });
    store = TestBed.inject(ChatbotStore);
  });

  it('starts with no persisted messages', () => {
    expect(store.messages()).toEqual([]);
  });

  it('keeps messages when the panel closes and reopens', () => {
    const response = new Subject<ChatResponse>();
    api.ask.and.returnValue(response);
    store.open();
    store.send('Hello');
    response.next({ answer: 'Hello.' });
    response.complete();

    store.close();
    store.open();
    expect(store.messages().map((message) => message.content)).toEqual(['Hello', 'Hello.']);
  });

  it('clears messages only when explicitly requested', () => {
    const response = new Subject<ChatResponse>();
    api.ask.and.returnValue(response);
    store.send('Hello');
    response.next({ answer: 'Hello.' });
    store.clear();
    expect(store.messages()).toEqual([]);
  });

  it('sends the current question separately from empty history', () => {
    api.ask.and.returnValue(new Subject<ChatResponse>());
    store.send('Current question');
    expect(api.ask).toHaveBeenCalledWith({ question: 'Current question', chat_history: [] });
  });

  it('sends all prior successful messages in their original order', () => {
    const first = new Subject<ChatResponse>();
    const second = new Subject<ChatResponse>();
    api.ask.and.returnValues(first, second);
    store.send('First question');
    first.next({ answer: 'First answer' });
    first.complete();

    store.send('Second question');
    expect(api.ask.calls.mostRecent().args[0]).toEqual({
      question: 'Second question',
      chat_history: [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
      ],
    });
  });

  it('excludes failed messages from subsequent history', () => {
    const failed = new Subject<ChatResponse>();
    api.ask.and.returnValues(failed, new Subject<ChatResponse>());
    store.send('Failed question');
    failed.error(new HttpErrorResponse({ status: 500 }));
    store.send('New question');
    expect(api.ask.calls.mostRecent().args[0].chat_history).toEqual([]);
  });

  it('does not include static welcome content or suggestions in history', () => {
    api.ask.and.returnValue(new Subject<ChatResponse>());
    store.send('A real question');
    expect(api.ask.calls.mostRecent().args[0].chat_history).toEqual([]);
  });

  it('marks a successful question sent and appends the backend answer', () => {
    const response = new Subject<ChatResponse>();
    api.ask.and.returnValue(response);
    store.send('Question');
    response.next({ answer: 'Answer' });
    expect(store.messages().map(({ content, status }) => ({ content, status }))).toEqual([
      { content: 'Question', status: 'sent' },
      { content: 'Answer', status: 'sent' },
    ]);
  });

  it('keeps a failed question visible and provides a useful error', () => {
    const response = new Subject<ChatResponse>();
    api.ask.and.returnValue(response);
    store.send('Question');
    response.error(new HttpErrorResponse({ status: 0 }));
    expect(store.messages()[0].status).toBe('failed');
    expect(store.lastError()).toContain('Check your connection');
  });

  it('retries without adding a duplicate user message', () => {
    const failed = new Subject<ChatResponse>();
    const retry = new Subject<ChatResponse>();
    api.ask.and.returnValues(failed, retry);
    store.send('Question');
    failed.error(new HttpErrorResponse({ status: 500 }));
    const messageId = store.messages()[0].id;

    store.retry(messageId);
    expect(store.messages().length).toBe(1);
    expect(store.messages()[0].status).toBe('sending');
    expect(api.ask.calls.mostRecent().args[0]).toEqual({ question: 'Question', chat_history: [] });
  });

  it('rejects empty input', () => {
    expect(store.send('   ')).toBeFalse();
    expect(api.ask).not.toHaveBeenCalled();
  });

  it('rejects input over 1000 characters', () => {
    expect(store.send('a'.repeat(1001))).toBeFalse();
    expect(api.ask).not.toHaveBeenCalled();
  });

  it('prevents simultaneous submissions', () => {
    api.ask.and.returnValue(new Subject<ChatResponse>());
    expect(store.send('First')).toBeTrue();
    expect(store.send('Second')).toBeFalse();
    expect(api.ask).toHaveBeenCalledTimes(1);
  });

  it('deduplicates warm-up requests and applies a cooldown after success', () => {
    const warmup = new Subject<void>();
    api.warm.and.returnValue(warmup);
    store.warm();
    store.warm();
    expect(api.warm).toHaveBeenCalledTimes(1);

    warmup.next();
    warmup.complete();
    store.warm();
    expect(api.warm).toHaveBeenCalledTimes(1);
  });
});
