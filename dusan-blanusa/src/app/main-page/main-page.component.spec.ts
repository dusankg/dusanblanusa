import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MainPageComponent } from './main-page.component';

@Component({ selector: 'app-header', template: '', standalone: false })
class HeaderStubComponent {}
@Component({ selector: 'app-hero', template: '', standalone: false })
class HeroStubComponent {}
@Component({ selector: 'app-capability-ticker', template: '', standalone: false })
class TickerStubComponent {}
@Component({ selector: 'app-about', template: '', standalone: false })
class AboutStubComponent {}
@Component({ selector: 'app-expertise', template: '', standalone: false })
class ExpertiseStubComponent {}
@Component({ selector: 'app-selected-work', template: '', standalone: false })
class WorkStubComponent {}
@Component({ selector: 'app-experience', template: '', standalone: false })
class ExperienceStubComponent {}
@Component({ selector: 'app-contact', template: '', standalone: false })
class ContactStubComponent {}
@Component({ selector: 'app-footer', template: '', standalone: false })
class FooterStubComponent {}

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MainPageComponent,
        HeaderStubComponent,
        HeroStubComponent,
        TickerStubComponent,
        AboutStubComponent,
        ExpertiseStubComponent,
        WorkStubComponent,
        ExperienceStubComponent,
        ContactStubComponent,
        FooterStubComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
