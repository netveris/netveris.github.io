import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button/button';
import styles from './tool-header.module.css';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ToolHeader({ title, description, icon }: ToolHeaderProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <Link to="/" className={styles.homeLink}>
          <Button variant="ghost" size="sm" className={styles.homeBtn}>
            <Home size={18} />
            Home
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          {icon}
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
    </div>
  );
}
