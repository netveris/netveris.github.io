import styles from "./code-window.module.css";

interface CodeWindowProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeWindow({ children, className }: CodeWindowProps) {
  return (
    <div className={`${styles.window} ${className || ""}`}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <div className={`${styles.dot} ${styles.red}`} />
          <div className={`${styles.dot} ${styles.yellow}`} />
          <div className={`${styles.dot} ${styles.green}`} />
        </div>
      </div>
      <div className={styles.content}>
        <pre className={styles.codeBlock}>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
