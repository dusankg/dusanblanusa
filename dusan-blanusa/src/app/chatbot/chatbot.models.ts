export type ChatRole = 'user' | 'assistant';

export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly status: ChatMessageStatus;
  readonly createdAt: number;
}

export interface ChatHistoryMessage {
  readonly role: ChatRole;
  readonly content: string;
}

export interface ChatRequest {
  readonly question: string;
  readonly chat_history: readonly ChatHistoryMessage[];
}

export interface ChatResponse {
  readonly answer: string;
}
