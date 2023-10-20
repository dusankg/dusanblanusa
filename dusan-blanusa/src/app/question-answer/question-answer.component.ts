import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';

@Component({
  selector: 'app-question-answer',
  templateUrl: './question-answer.component.html',
  styleUrls: ['./question-answer.component.css']
})

@Injectable()
export class QuestionAnswerComponent {
  question: string = '';
  response: string = '';

  constructor(private http: HttpClient) {
    this.question = 'Who are you?';
    this.response = '';
  }

  getAnswer() {
    const url = 'https://askdusan-fzvrxng5.b4a.run/ask'; // Replace with your API endpoint
    const params = new HttpParams().set('question', this.question);

    this.http.post(url, { params }).subscribe((data: any) => {
      this.response = data.answer;
    });
  }
}
