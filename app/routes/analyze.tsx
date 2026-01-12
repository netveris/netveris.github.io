import { useState } from 'react';
import { ToolHeader } from '../components/tool-header';
import { AnalysisPanel } from '../components/analysis-panel';
import { SecurityScore } from '../components/security-score';
import { Button } from '../components/ui/button/button';
import { Input } from '../components/ui/input/input';
import { Shield, Play, Download, AlertTriangle, Globe } from 'lucide-react';
import { analyzeSiteSecurity, type SecurityAnalysisResult } from '../utils/security-analyzer';
import { exportAsJSON, exportAsText } from '../utils/export';
import { addToHistory } from '../utils/storage';
import styles from './analyze.module.css';

export default function SecurityAnalyzer() {
  const [url, setUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SecurityAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    setError('');
    
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate network analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = analyzeSiteSecurity(url);
    setAnalysisResult(result);
    setIsAnalyzing(false);
    addToHistory('/analyze', 'Full Security Audit', { url, score: result.overallScore });
  };

  const handleExportJSON = () => {
    if (!analysisResult || !url) return;
    exportAsJSON({
      toolName: 'security-audit',
      timestamp: new Date().toISOString(),
      results: {
        url,
        score: analysisResult.overallScore,
        grade: analysisResult.grade,
        summary: analysisResult.summary,
        categories: analysisResult.categories,
        issues: analysisResult.issues,
        recommendations: analysisResult.recommendations
      }
    });
  };

  const handleExportText = () => {
    if (!analysisResult || !url) return;
    exportAsText({
      toolName: 'security-audit',
      timestamp: new Date().toISOString(),
      results: {
        url,
        score: `${analysisResult.overallScore}/100 (${analysisResult.grade})`,
        summary: analysisResult.summary,
        issues: analysisResult.issues.map(i => ({
          severity: i.severity,
          title: i.title,
          description: i.description,
          location: i.location || 'N/A',
          fix: i.recommendation
        })),
        recommendations: analysisResult.recommendations.map(r => ({
          title: r.title,
          description: r.description,
          recommendation: r.recommendation
        }))
      }
    });
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        icon={<Shield size={32} />}
        title="Site Security Analyzer"
        description="Comprehensive security audit of the entire Netveris application"
      />

      <div className={styles.content}>
        <div className={styles.inputSection}>
          <div className={styles.inputWrapper}>
            <Globe className={styles.inputIcon} size={20} />
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={styles.urlInput}
              disabled={isAnalyzing}
            />
          </div>
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || !url}
            className={styles.analyzeButton}
          >
            <Play size={18} />
            {isAnalyzing ? 'Scanning...' : 'Analyze'}
          </Button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {analysisResult && (
          <div className={styles.exportControls}>
            <Button onClick={handleExportJSON} variant="outline" size="sm">
              <Download size={16} />
              Export JSON
            </Button>
            <Button onClick={handleExportText} variant="outline" size="sm">
              <Download size={16} />
              Export TXT
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className={styles.analyzing}>
            <div className={styles.spinner} />
            <p>Scanning application for security vulnerabilities...</p>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <>
            <SecurityScore
              score={analysisResult.overallScore}
              grade={analysisResult.grade}
              summary={analysisResult.summary}
            />

            <div className={styles.categories}>
              <h2>Security Categories</h2>
              <div className={styles.categoryGrid}>
                {analysisResult.categories.map((category) => (
                  <div key={category.name} className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <h3>{category.name}</h3>
                      <span className={`${styles.categoryScore} ${styles[category.status]}`}>
                        {category.score}/100
                      </span>
                    </div>
                    <p className={styles.categoryDescription}>{category.description}</p>
                    <div className={styles.categoryStats}>
                      <span className={styles.passed}>{category.passed} passed</span>
                      <span className={styles.failed}>{category.failed} issues</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnalysisPanel
              title="Security Issues Found"
              issues={analysisResult.issues}
              defaultExpanded={true}
            />

            <AnalysisPanel
              title="Recommendations"
              issues={analysisResult.recommendations}
              defaultExpanded={false}
            />

            {analysisResult.criticalCount > 0 && (
              <div className={styles.criticalAlert}>
                <AlertTriangle size={24} />
                <div>
                  <h3>Critical Issues Detected</h3>
                  <p>
                    {analysisResult.criticalCount} critical security {analysisResult.criticalCount === 1 ? 'issue' : 'issues'} found. 
                    Immediate action recommended.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {!analysisResult && !isAnalyzing && (
          <div className={styles.placeholder}>
            <Shield size={64} className={styles.placeholderIcon} />
            <h3>Comprehensive Security Audit</h3>
            <p>Enter a website URL to perform a complete security analysis covering:</p>
            <ul className={styles.features}>
              <li>SSL/TLS Certificate validation</li>
              <li>Security Headers analysis (CSP, HSTS, X-Frame-Options)</li>
              <li>Cookie security attributes</li>
              <li>Mixed content detection</li>
              <li>HTTP/HTTPS enforcement</li>
              <li>Subdomain security</li>
              <li>Common vulnerability scanning</li>
              <li>Best practices compliance</li>
            </ul>
            <div className={styles.keyboardHint}>
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to analyze
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
