import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ExperienceItem {
  readonly period: string;
  readonly role: string;
  readonly company: string;
  readonly description: string;
}

@Component({
  selector: 'app-experience',
  standalone: false,
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  readonly experience: readonly ExperienceItem[] = [
    {
      period: '2021 — Present',
      role: 'Technology Lead / AI Engineer',
      company: 'Synechron',
      description: 'Leading the design and delivery of modern AI systems from proof of concept to production. Responsible for architecture, hands-on implementation, team organization, client communication, mentoring, technical interviews, and executive presentations.',
    },
    {
      period: '2019 — 2020',
      role: 'Programmer / Computer Vision Team Lead',
      company: 'Memristor Robotics',
      description: 'Developed computer-vision and robotics solutions in Python, including dataset creation, model training, object detection, localization, and integration with physical robot systems.',
    },
    {
      period: '2018 — 2019',
      role: 'Teaching Assistant',
      company: 'Faculty of Technical Sciences, University of Novi Sad',
      description: 'Supported teaching in Object-Oriented Programming and Real-Time Software Systems across computer engineering and applied computer science departments.',
    },
  ];

  readonly training: readonly string[] = [
    'Synechron Next Gen Leadership',
    'Microsoft Azure AI-900',
    'NLP Training — Synechron',
  ];
}
