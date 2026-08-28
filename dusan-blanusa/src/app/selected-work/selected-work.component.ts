import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { ProjectItem } from './project.model';

@Component({
  selector: 'app-selected-work',
  standalone: false,
  templateUrl: './selected-work.component.html',
  styleUrls: ['./selected-work.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedWorkComponent implements AfterViewInit, OnDestroy {
  @ViewChildren(ProjectCardComponent) private readonly cards!: QueryList<ProjectCardComponent>;

  readonly projects: readonly ProjectItem[] = [
    {
      number: '01', category: 'Agentic AI', name: 'Enterprise Browser Agent',
      headline: 'Automating complex browser workflows with LLMs and vision.',
      overview: 'Designed and developed a browser automation agent for data collection, research, and information retrieval. Combined LLM-based reasoning, deep-agent workflows, Playwright, and vision models to interact with complex web interfaces, including authenticated internal services.',
      role: 'Technology Lead · Team of 2',
      technology: ['Python', 'Playwright', 'LangChain', 'Vision LLMs'],
      outcome: 'Enabled intelligent automation across public, login-protected, and internal browser-based systems while preserving secure access flows.',
    },
    {
      number: '02', category: 'Cloud & Data', name: '400+ TB Data Transformation',
      headline: 'Rebuilding enterprise storage workflows at scale.',
      overview: 'Reorganized enterprise data storage and migrated more than 400 TB from on-premises systems to AWS. Designed migration pipelines, centralized storage, metadata processes, and standardized structures while coordinating planning across the organization.',
      role: 'ML / Data Engineer · Independent contributor',
      technology: ['Python', 'AWS', 'Linux', 'Airflow', 'Superset'],
      outcome: 'Delivered a large-scale migration with minimal disruption while consolidating data and workflows across the enterprise.',
      outcomePoints: ['400+ TB migrated', '12 teams coordinated', '30+ employees supported', '2 acquired companies integrated'],
    },
    {
      number: '03', category: 'Multi-Agent AI', name: 'Text-to-SQL & Router Agent',
      headline: 'Adding memory and intelligent routing to enterprise data access.',
      overview: 'Designed and implemented memory for an existing text-to-SQL agent and an intent router for orchestration across specialized agents. Built FastAPI and Redis infrastructure for sessions, background processing, and scalable integration with enterprise services.',
      role: 'Technology Lead · Team of 4',
      technology: ['Python', 'LlamaIndex', 'Mem0', 'FastAPI', 'Redis', 'OpenSearch', 'Qdrant', 'AWS'],
      outcome: 'Created a foundation for persistent context, intent-aware routing, and coordinated execution across multiple specialized AI agents.',
    },
  ];

  private frameId?: number;
  private scrollHandler?: () => void;
  private resizeHandler?: () => void;
  private reducedMotion = false;

  constructor(
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.zone.runOutsideAngular(() => {
      const schedule = () => {
        if (this.frameId === undefined) {
          this.frameId = requestAnimationFrame(() => {
            this.frameId = undefined;
            this.updateCards();
          });
        }
      };
      this.scrollHandler = schedule;
      this.resizeHandler = schedule;
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      schedule();
    });
  }

  private updateCards(): void {
    if (this.reducedMotion || window.innerWidth <= 900) {
      this.cards.forEach((card) => {
        const element = card.host.nativeElement.firstElementChild as HTMLElement | null;
        element?.style.removeProperty('transform');
        element?.style.removeProperty('filter');
      });
      return;
    }

    const cards = this.cards.toArray();
    const hosts = cards.map((card) => card.host.nativeElement);
    const viewportHeight = window.innerHeight;

    cards.forEach((card, index) => {
      const element = card.host.nativeElement.firstElementChild as HTMLElement | null;
      if (!element) {
        return;
      }

      let stackedProgress = 0;
      for (let laterIndex = index + 1; laterIndex < hosts.length; laterIndex += 1) {
        const laterRect = hosts[laterIndex].getBoundingClientRect();
        const stickyTop = 96 + laterIndex * 18;
        const approachStart = Math.max(stickyTop + 1, viewportHeight * 0.92);
        const progress = Math.max(
          0,
          Math.min(1, (approachStart - laterRect.top) / (approachStart - stickyTop)),
        );
        stackedProgress += progress;
      }

      const scale = Math.max(0.9, 1 - stackedProgress * 0.045);
      const brightness = Math.max(0.9, 1 - stackedProgress * 0.035);
      element.style.transform = `scale(${scale})`;
      element.style.filter = `brightness(${brightness})`;
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
  }
}
