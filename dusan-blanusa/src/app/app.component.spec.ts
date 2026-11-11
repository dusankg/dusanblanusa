import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { ChatbotStore } from './chatbot/chatbot.store';
import { environment } from '../environments/environment';

@Component({ selector: 'app-chatbot', template: '', standalone: false })
class ChatbotStubComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent,
        ChatbotStubComponent,
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the portfolio owner's name as title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Dušan Blanuša');
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(environment.chatbotWarmupUrl).flush({ status: 'ok' });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('sends one warm-up GET on startup without opening chat or waiting for the response', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const http = TestBed.inject(HttpTestingController);
    const store = TestBed.inject(ChatbotStore);
    fixture.detectChanges();

    const warmup = http.expectOne(environment.chatbotWarmupUrl);
    expect(warmup.request.method).toBe('GET');
    expect(store.isOpen()).toBeFalse();
    expect(store.isLoading()).toBeFalse();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();

    fixture.detectChanges();
    store.warm();
    http.expectNone(environment.chatbotWarmupUrl);

    warmup.flush({ status: 'ok' });
    store.warm();
    http.expectNone(environment.chatbotWarmupUrl);
  });

  it('keeps startup warm-up failures silent and allows a later retry', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const http = TestBed.inject(HttpTestingController);
    const store = TestBed.inject(ChatbotStore);
    fixture.detectChanges();
    http.expectOne(environment.chatbotWarmupUrl).flush('', { status: 503, statusText: 'Unavailable' });

    expect(store.isOpen()).toBeFalse();
    expect(store.lastError()).toBeNull();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
    store.warm();
    http.expectOne(environment.chatbotWarmupUrl).flush({ status: 'ok' });
  });

  it('does not send startup warm-up requests during server rendering', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const warm = spyOn(TestBed.inject(ChatbotStore), 'warm').and.callThrough();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(warm).not.toHaveBeenCalled();
    TestBed.inject(HttpTestingController).expectNone(environment.chatbotWarmupUrl);
  });
});
