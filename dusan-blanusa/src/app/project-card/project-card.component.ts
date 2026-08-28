import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';
import { ProjectItem } from '../selected-work/project.model';

@Component({
  selector: 'app-project-card',
  standalone: false,
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: ProjectItem;
  @Input({ required: true }) index = 0;
  expanded = false;

  constructor(readonly host: ElementRef<HTMLElement>) {}

  get panelId(): string {
    return `project-details-${this.project.number}`;
  }

  toggleDetails(): void {
    this.expanded = !this.expanded;
  }
}
