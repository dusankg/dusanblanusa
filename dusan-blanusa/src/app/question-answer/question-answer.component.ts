import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { FactoryTarget } from '@angular/compiler';

@Component({
  selector: 'app-question-answer',
  templateUrl: './question-answer.component.html',
  styleUrls: ['./question-answer.component.css']
})

@Injectable()
export class QuestionAnswerComponent {
  question: string = '';
  response: string = '';
  button_disabled: boolean = false;

  constructor(private http: HttpClient) {
    this.question = 'Who are you?';
    this.response = '';
    this.button_disabled = false;
    this.wakeUpBackend()

  }

  wakeUpBackend(){
    const url = 'https://askdusan-fzvrxng5.b4a.run';    
    this.http.get(url).subscribe((data: any) => {
      console.log(data.answer)
    });
  }

  getAnswer() {
    this.button_disabled = true;
    this.response = 'Thinking ...'
    const url = 'https://askdusan-fzvrxng5.b4a.run/ask';
    const params = new HttpParams().set('question', this.question);

    this.http.get(url, { params }).subscribe((data: any) => {
      this.response = data.answer;
      this.button_disabled = false;
    });
    
  }
}
