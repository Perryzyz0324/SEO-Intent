
export enum IntentType {
  PRODUCT = '产品页',
  COLLECTION = '集合页',
  ARTICLE = '文章页',
  UNKNOWN = '未知'
}

export enum KeywordRelation {
  PRIMARY = '核心大词',
  SYNONYM = '同义词',
  LONG_TAIL = '长尾词'
}

export interface KeywordInput {
  term: string;
  volume?: number;
}

export interface AnalysisResult {
  keyword: string;
  translation: string; 
  volume?: number;
  intent: IntentType;
  parentTopic: string; // Level 1: Theme (Cluster)
  pillar: string;      // Level 2: Pillar (Sub-category)
  primaryVariant: string; // Level 3: The main keyword for this PAGE (Canonical)
  relation: KeywordRelation; 
  contentStrategy: string; 
  confidenceScore: number; 
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}
