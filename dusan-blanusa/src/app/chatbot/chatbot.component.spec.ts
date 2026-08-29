import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of } from 'rxjs';
import { ChatbotApiService } from './chatbot-api.service';
import { ChatbotComponent } from './chatbot.component';
import { ChatResponse } from './chatbot.models';

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds = [0, 0.35, 1];
  static callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    IntersectionObserverMock.callback = callback;
  }

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve(): void {}
}

describe('ChatbotComponent', () => {
  let fixture: ComponentFixture<ChatbotComponent>;
  let component: ChatbotComponent;
  let hero: HTMLElement;

  beforeEach(async () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });
    hero = document.createElement('section');
    hero.id = 'top';
    document.body.appendChild(hero);

    const api = jasmine.createSpyObj<ChatbotApiService>('ChatbotApiService', ['ask', 'warm']);
    api.ask.and.returnValue(new Subject<ChatResponse>());
    api.warm.and.returnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ChatbotComponent],
      providers: [{ provide: ChatbotApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    hero.remove();
  });

  it('closes the panel when Escape is pressed', () => {
    component.store.open();
    component.handleDocumentKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.store.isOpen()).toBeFalse();
  });

  it('restores focus to the exact trigger after closing', fakeAsync(() => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    component.store.open(trigger);
    fixture.detectChanges();
    tick(20);
    component.close();
    fixture.detectChanges();
    tick(20);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  }));

  it('shows the launcher only after the hero is substantially out of view', () => {
    const observer = {} as IntersectionObserver;
    IntersectionObserverMock.callback([
      { intersectionRatio: 0.2 } as IntersectionObserverEntry,
    ], observer);
    expect(component.showLauncher()).toBeTrue();

    IntersectionObserverMock.callback([
      { intersectionRatio: 0.8 } as IntersectionObserverEntry,
    ], observer);
    expect(component.showLauncher()).toBeFalse();
  });
});
