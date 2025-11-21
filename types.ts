export enum IntentType {
  PRODUCT = 'Product Page',
  COLLECTION = 'Collection/Category Page',
  ARTICLE = 'Article/Blog Post',
  UNKNOWN = 'Unknown'
}

export interface KeywordInput {
  term: string;
  volume?: number;
}

export interface AnalysisResult {
  keyword: string;
  volume?: number;
  intent: IntentType;
  reasoning: string;
  confidenceScore: number; // 0-100
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}