import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoffeeMenuComponent } from './coffee-menu/coffee-menu.component';
import { HomeComponent } from './home/home.component';
import { MainPageComponent } from './main-page/main-page.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'home-menu', component: CoffeeMenuComponent },
  { path: '', component: MainPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
