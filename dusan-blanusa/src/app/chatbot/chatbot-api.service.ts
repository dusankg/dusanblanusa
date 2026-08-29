import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatRequest, ChatResponse } from './chatbot.models';

export class InvalidChatResponseError extends Error {
  constructor() {
    super('The chatbot response did not contain a valid answer.');
    this.name = 'InvalidChatResponseError';
  }
}

@Injectable({ providedIn: 'root' })
export class ChatbotApiService {
  private readonly requestTimeoutMs = 25_000;

  constructor(private readonly http: HttpClient) {}

  ask(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<unknown>(environment.chatbotApiUrl, request).pipe(
      timeout(this.requestTimeoutMs),
      map((response) => {
        if (
          typeof response !== 'object'
          || response === null
          || !('answer' in response)
          || typeof response.answer !== 'string'
          || response.answer.trim().length === 0
        ) {
          throw new InvalidChatResponseError();
        }

        return { answer: response.answer.trim() };
      }),
    );
  }

  warm(): Observable<void> {
    return this.http.get<unknown>(environment.chatbotWarmupUrl).pipe(
      timeout(this.requestTimeoutMs),
      map(() => undefined),
    );
  }
}
