import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoffeeMenuComponent } from './coffee-menu/coffee-menu.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PhotographyComponent } from './photography/photography.component';
import { ProjectsComponent } from './projects/projects.component';
import { QuestionAnswerComponent } from './question-answer/question-answer.component';
const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'home-menu', component: CoffeeMenuComponent },
  { path: 'photography', component: PhotographyComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'question-answer', component: QuestionAnswerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
