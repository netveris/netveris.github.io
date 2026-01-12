import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, MapPin, Lightbulb } from 'lucide-react';
import { RiskBadge } from './risk-badge';
import { CodeBlock } from './code-block';
import type { SecurityIssue } from '../types/security';
import styles from './issue-card.module.css';

interface IssueCardProps {
  issue: SecurityIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getIcon = () => {
    switch (issue.severity) {
      case 'critical':
      case 'high':
        return <AlertCircle size={20} />;
      case 'medium':
        return <AlertTriangle size={20} />;
      case 'low':
        return <Info size={20} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {getIcon()}
          <h4>{issue.title}</h4>
        </div>
        <RiskBadge severity={issue.severity} />
      </div>

      <p className={styles.description}>{issue.description}</p>

      {issue.category && (
        <div className={styles.meta}>
          <span className={styles.category}>{issue.category}</span>
        </div>
      )}

      {issue.location && (
        <div className={styles.location}>
          <MapPin size={14} />
          <span>{issue.location}</span>
        </div>
      )}

      {issue.recommendation && (
        <div className={styles.recommendation}>
          <Lightbulb size={16} />
          <span>{issue.recommendation}</span>
        </div>
      )}

      {issue.code && (
        <div className={styles.codeSection}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Code Example
          </button>
          {showDetails && <CodeBlock code={issue.code} />}
        </div>
      )}
    </div>
  );
}
