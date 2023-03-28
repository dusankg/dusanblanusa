import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoffeeMenuComponent } from './coffee-menu/coffee-menu.component';
import { HomeComponent } from './home/home.component';
import { CvComponent } from './cv/cv.component';
import { MainPageComponent } from './main-page/main-page.component';

@NgModule({
  declarations: [
    AppComponent,
    CoffeeMenuComponent,
    HomeComponent,
    CvComponent,
    MainPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
