import styles from './risk-badge.module.css';

interface RiskBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export function RiskBadge({ severity }: RiskBadgeProps) {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  return (
    <span className={`${styles.badge} ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}
