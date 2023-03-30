import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoffeeMenuComponent } from './coffee-menu/coffee-menu.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PhotographyComponent } from './photography/photography.component';

@NgModule({
  declarations: [
    AppComponent,
    CoffeeMenuComponent,
    MainPageComponent,
    PhotographyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
