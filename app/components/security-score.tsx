import { Shield, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './security-score.module.css';

interface SecurityScoreProps {
  score: number;
  grade: string;
  summary: string;
}

export function SecurityScore({ score, grade, summary }: SecurityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'warning';
    return 'poor';
  };

  const scoreColor = getScoreColor(score);
  const isGood = score >= 70;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Shield size={32} />
        <h2>Security Analysis Report</h2>
      </div>

      <div className={styles.scoreSection}>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreCircle} ${styles[scoreColor]}`}>
            <span className={styles.scoreValue}>{score}</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <div className={styles.grade}>
            Grade: <span className={`${styles.gradeValue} ${styles[scoreColor]}`}>{grade}</span>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.trend}>
            {isGood ? (
              <>
                <TrendingUp size={24} className={styles.trendUp} />
                <span className={styles.trendLabel}>Good Security Posture</span>
              </>
            ) : (
              <>
                <TrendingDown size={24} className={styles.trendDown} />
                <span className={styles.trendLabel}>Needs Improvement</span>
              </>
            )}
          </div>
          <p className={styles.summaryText}>{summary}</p>
        </div>
      </div>
    </div>
  );
}
