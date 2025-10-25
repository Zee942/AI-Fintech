export enum Category {
  AML = 'AML',
  Governance = 'Governance',
  Capital = 'Capital',
  DataResidency = 'Data Residency',
}

export enum Severity {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface Gap {
  gapId: string;
  category: Category;
  rule: string;
  description: string;
  severity: Severity;
  recommendation: string;
  expertId: string;
}

export interface CategoryScores {
  [Category.AML]: number;
  [Category.Governance]: number;
  [Category.Capital]: number;
  [Category.DataResidency]: number;
}

export interface AnalysisResult {
  overallScore: number;
  categoryScores: CategoryScores;
  gaps: Gap[];
}

export interface ExpertResource {
  name: string;
  description: string;
  link: string;
}

export interface ResourceMap {
  [key: string]: ExpertResource;
}
