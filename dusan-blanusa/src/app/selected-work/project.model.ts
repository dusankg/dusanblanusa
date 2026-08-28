export interface ProjectItem {
  readonly number: string;
  readonly category: string;
  readonly name: string;
  readonly headline: string;
  readonly overview: string;
  readonly role: string;
  readonly technology: readonly string[];
  readonly outcome: string;
  readonly outcomePoints?: readonly string[];
}
