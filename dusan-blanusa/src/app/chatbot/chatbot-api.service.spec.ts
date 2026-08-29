import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { ChatbotApiService, InvalidChatResponseError } from './chatbot-api.service';
import { ChatRequest } from './chatbot.models';

describe('ChatbotApiService', () => {
  let service: ChatbotApiService;
  let http: HttpTestingController;
  const request: ChatRequest = { question: 'What do you build?', chat_history: [] };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChatbotApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the typed request and reads the answer field', () => {
    let answer = '';
    service.ask(request).subscribe((response) => answer = response.answer);

    const call = http.expectOne(environment.chatbotApiUrl);
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);
    call.flush({ answer: 'I build production AI systems.' });

    expect(answer).toBe('I build production AI systems.');
  });

  it('rejects a response without a non-empty answer', () => {
    let receivedError: unknown;
    service.ask(request).subscribe({ error: (error: unknown) => receivedError = error });
    http.expectOne(environment.chatbotApiUrl).flush({ answer: '   ' });
    expect(receivedError).toEqual(jasmine.any(InvalidChatResponseError));
  });

  it('warms the backend with a GET request to the root endpoint', () => {
    let completed = false;
    service.warm().subscribe({ complete: () => completed = true });
    const call = http.expectOne(environment.chatbotWarmupUrl);
    expect(call.request.method).toBe('GET');
    call.flush({ answer: 'Working' });
    expect(completed).toBeTrue();
  });
});
