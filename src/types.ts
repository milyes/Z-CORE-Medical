export interface Patient {
  id: string;
  name: string;
  age: number;
  mdsScore: number;
  lastAnalysis: string;
  status: 'stable' | 'warning' | 'critical';
  tremorFrequency: number[];
}

export interface AnalysisResult {
  score: number;
  confidence: number;
  detectedSymptoms: string[];
  recommendation: string;
}
