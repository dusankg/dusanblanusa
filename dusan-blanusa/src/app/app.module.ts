import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PhotographyComponent } from './photography/photography.component';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { CapabilityTickerComponent } from './capability-ticker/capability-ticker.component';
import { AboutComponent } from './about/about.component';
import { ExpertiseComponent } from './expertise/expertise.component';
import { SelectedWorkComponent } from './selected-work/selected-work.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { ExperienceComponent } from './experience/experience.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { RevealOnScrollDirective } from './shared/reveal-on-scroll.directive';
import { provideHttpClient } from '@angular/common/http';
import { ChatbotComponent } from './chatbot/chatbot.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    PhotographyComponent,
    HeaderComponent,
    HeroComponent,
    CapabilityTickerComponent,
    AboutComponent,
    ExpertiseComponent,
    SelectedWorkComponent,
    ProjectCardComponent,
    ExperienceComponent,
    ContactComponent,
    FooterComponent,
    RevealOnScrollDirective,
    ChatbotComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
