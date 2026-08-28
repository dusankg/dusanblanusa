import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Metric {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly metrics: readonly Metric[] = [
    { value: '7 years', label: 'in AI and Data Science' },
    { value: '400+ TB', label: 'migrated to cloud infrastructure' },
    { value: '12 teams', label: 'coordinated in a major transformation' },
    { value: '0→1', label: 'from proof of concept to production' },
  ];
}
