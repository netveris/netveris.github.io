import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import styles from './code-block.module.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.macDots}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
        </div>
        <span className={styles.language}>{language}</span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.pre}>
        <code className={styles.code}>{code}</code>
      </pre>
    </div>
  );
}
