import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { IssueCard } from './issue-card';
import type { SecurityIssue } from '../types/security';
import styles from './analysis-panel.module.css';

interface AnalysisPanelProps {
  title: string;
  issues: SecurityIssue[];
  defaultExpanded?: boolean;
}

export function AnalysisPanel({ title, issues, defaultExpanded = false }: AnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Group issues by severity
  const groupedIssues = {
    critical: issues.filter(i => i.severity === 'critical'),
    high: issues.filter(i => i.severity === 'high'),
    medium: issues.filter(i => i.severity === 'medium'),
    low: issues.filter(i => i.severity === 'low'),
  };

  const totalIssues = issues.length;

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.headerContent}>
          <h2>{title}</h2>
          <span className={styles.count}>{totalIssues} {totalIssues === 1 ? 'item' : 'items'}</span>
        </div>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {isExpanded && (
        <div className={styles.content}>
          {groupedIssues.critical.length > 0 && (
            <div className={styles.severityGroup}>
              <h3 className={styles.severityTitle}>
                Critical ({groupedIssues.critical.length})
              </h3>
              {groupedIssues.critical.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {groupedIssues.high.length > 0 && (
            <div className={styles.severityGroup}>
              <h3 className={styles.severityTitle}>
                High ({groupedIssues.high.length})
              </h3>
              {groupedIssues.high.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {groupedIssues.medium.length > 0 && (
            <div className={styles.severityGroup}>
              <h3 className={styles.severityTitle}>
                Medium ({groupedIssues.medium.length})
              </h3>
              {groupedIssues.medium.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {groupedIssues.low.length > 0 && (
            <div className={styles.severityGroup}>
              <h3 className={styles.severityTitle}>
                Low ({groupedIssues.low.length})
              </h3>
              {groupedIssues.low.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {totalIssues === 0 && (
            <p className={styles.empty}>No issues found in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
