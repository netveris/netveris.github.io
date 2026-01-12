export interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  code?: string;
  location?: string;
  recommendation: string;
  impact?: string;
  attackScenario?: string;
  remediation?: string;
}

export interface ScanResult {
  timestamp: Date;
  issues: SecurityIssue[];
  score: number;
  passed: number;
  failed: number;
}

export interface JWTHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface JWTAnalysis {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  issues: SecurityIssue[];
  isExpired: boolean;
  expiresIn?: string;
  issuedAt?: string;
}

export interface SecurityAnalysisResult {
  overallScore: number;
  grade: string;
  summary: string;
  categories: {
    name: string;
    description: string;
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'poor';
    passed: number;
    failed: number;
  }[];
  issues: SecurityIssue[];
  recommendations: SecurityIssue[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}
