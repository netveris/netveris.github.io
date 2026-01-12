import { Link, useLocation } from "react-router";
import { Home, BarChart3, Star, Clock, BookOpen, Keyboard } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";
import { useState, useEffect } from "react";
import { getFavorites, getHistory } from "~/utils/storage";
import styles from "./navigation.module.css";

interface NavigationProps {
  onShowShortcuts?: () => void;
}

export function Navigation({ onShowShortcuts }: NavigationProps) {
  const location = useLocation();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);
  
  useEffect(() => {
    setFavoriteCount(getFavorites().length);
    setRecentCount(getHistory().length);
  }, [location]);
  
  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.navLinks}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link 
            to="/dashboard" 
            className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/favorites" 
            className={`${styles.navLink} ${location.pathname === '/favorites' ? styles.active : ''}`}
          >
            <Star size={20} />
            <span>Favorites</span>
            {favoriteCount > 0 && <span className={styles.badge}>{favoriteCount}</span>}
          </Link>
          <Link 
            to="/recent" 
            className={`${styles.navLink} ${location.pathname === '/recent' ? styles.active : ''}`}
          >
            <Clock size={20} />
            <span>Recent</span>
            {recentCount > 0 && <span className={styles.badge}>{recentCount}</span>}
          </Link>
          <Link 
            to="/docs" 
            className={`${styles.navLink} ${location.pathname === '/docs' ? styles.active : ''}`}
          >
            <BookOpen size={20} />
            <span>Docs</span>
          </Link>
        </div>
        
        <div className={styles.navActions}>
          <button 
            onClick={onShowShortcuts}
            className={styles.shortcutButton}
            title="Keyboard Shortcuts"
          >
            <Keyboard size={20} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
