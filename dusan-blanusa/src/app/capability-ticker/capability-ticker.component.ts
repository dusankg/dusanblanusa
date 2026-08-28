import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-capability-ticker',
  standalone: false,
  templateUrl: './capability-ticker.component.html',
  styleUrls: ['./capability-ticker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityTickerComponent {
  readonly capabilities: readonly string[] = [
    'Production-Grade AI', 'LLM Systems', 'Multi-Agent Architecture', 'RAG Pipelines',
    'Browser Automation', 'Document Intelligence', 'Distributed Machine Learning',
    'Cloud Data Platforms', 'Python', 'FastAPI', 'LangChain', 'LlamaIndex', 'Playwright',
    'Neo4j', 'Redis', 'OpenSearch', 'Ray', 'Computer Vision', 'AWS', 'Azure',
    'Technical Leadership',
  ];
}
