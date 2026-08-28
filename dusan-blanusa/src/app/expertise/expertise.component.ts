import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ExpertiseItem {
  readonly number: string;
  readonly name: string;
  readonly description: string;
}

@Component({
  selector: 'app-expertise',
  standalone: false,
  templateUrl: './expertise.component.html',
  styleUrls: ['./expertise.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertiseComponent {
  readonly items: readonly ExpertiseItem[] = [
    {
      number: '01',
      name: 'AI Agents & LLM Systems',
      description: 'Designing production-ready AI applications with tool use, memory, routing, structured workflows, and enterprise integrations—with dependable behavior and maintainable architecture.',
    },
    {
      number: '02',
      name: 'RAG & Document Intelligence',
      description: 'Building retrieval and document-processing systems for PDFs, XML, and enterprise knowledge with citations, traceability, access control, and vector or graph retrieval.',
    },
    {
      number: '03',
      name: 'Automation & Computer Vision',
      description: 'Creating intelligent browser automation and vision-enabled workflows for complex interfaces, data collection, object detection, classification, localization, and robotics.',
    },
    {
      number: '04',
      name: 'ML & Data Platforms',
      description: 'Designing scalable data and machine-learning infrastructure across AWS and Azure, including distributed training, cloud migration, metadata pipelines, and platform modernization.',
    },
    {
      number: '05',
      name: 'Technical Leadership',
      description: 'Leading discovery, architecture, implementation, and executive presentation while mentoring engineers and aligning delivery with feasible business objectives.',
    },
  ];
}
