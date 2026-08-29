import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatbotStore } from '../chatbot/chatbot.store';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly email = 'dusan@dusan.blanusa.com';
  readonly mailto = `mailto:${this.email}`;

  constructor(readonly chatbotStore: ChatbotStore) {}

  openChat(event: MouseEvent): void {
    this.chatbotStore.open(event.currentTarget);
  }

  warmChat(): void {
    this.chatbotStore.warm();
  }
}
