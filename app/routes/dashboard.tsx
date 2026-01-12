import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { 
  BarChart3, 
  Clock, 
  Star, 
  TrendingUp,
  History,
  Trash2,
  Heart,
  Activity
} from 'lucide-react';
import { Navigation } from '~/components/navigation';
import { KeyboardShortcutsDialog } from '~/components/keyboard-shortcuts-dialog';
import { getHistory, getFavorites, clearHistory, clearFavorites, type ToolHistory, type Favorite } from '~/utils/storage';
import { Button } from '~/components/ui/button/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import styles from './dashboard.module.css';

export function meta() {
  return [
    { title: "Dashboard - Netveris" },
    { name: "description", content: "Your security tools dashboard with usage stats and quick access" },
  ];
}

export default function Dashboard() {
  const [history, setHistory] = useState<ToolHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setFavorites(getFavorites());
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleClearFavorites = () => {
    if (confirm('Are you sure you want to clear all favorites?')) {
      clearFavorites();
      setFavorites([]);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={styles.container}>
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <Navigation onShowShortcuts={() => setShowShortcuts(true)} />
      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <BarChart3 size={32} className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>Security Dashboard</h1>
              <p className={styles.subtitle}>Overview of your security analysis activity</p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <Card>
            <CardHeader>
              <div className={styles.statHeader}>
                <Activity className={styles.statIcon} />
                <CardTitle>Total Tools Used</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.statValue}>{history.length}</div>
              <CardDescription>Unique security analyses performed</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className={styles.statHeader}>
                <Heart className={styles.statIcon} />
                <CardTitle>Favorite Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.statValue}>{favorites.length}</div>
              <CardDescription>Tools marked as favorites</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className={styles.statHeader}>
                <TrendingUp className={styles.statIcon} />
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.statValue}>
                {history.length > 0 ? formatTime(history[0].timestamp) : 'No activity'}
              </div>
              <CardDescription>Last tool used</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Favorites Section */}
        <Card className={styles.section}>
          <CardHeader>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Star size={24} className={styles.sectionIcon} />
                <CardTitle>Favorite Tools</CardTitle>
              </div>
              {favorites.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFavorites}
                  className={styles.clearButton}
                >
                  <Trash2 size={16} />
                  Clear All
                </Button>
              )}
            </div>
            <CardDescription>Quick access to your most-used security tools</CardDescription>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <div className={styles.emptyState}>
                <Star size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No favorite tools yet</p>
                <p className={styles.emptySubtext}>
                  Star your favorite tools for quick access
                </p>
              </div>
            ) : (
              <div className={styles.itemGrid}>
                {favorites.map((fav) => (
                  <Link key={fav.toolPath} to={fav.toolPath} className={styles.item}>
                    <div className={styles.itemContent}>
                      <Star size={20} className={styles.itemIcon} />
                      <div className={styles.itemText}>
                        <div className={styles.itemTitle}>{fav.toolTitle}</div>
                        <div className={styles.itemTime}>{formatTime(fav.timestamp)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Section */}
        <Card className={styles.section}>
          <CardHeader>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <History size={24} className={styles.sectionIcon} />
                <CardTitle>Recent History</CardTitle>
              </div>
              {history.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearHistory}
                  className={styles.clearButton}
                >
                  <Trash2 size={16} />
                  Clear All
                </Button>
              )}
            </div>
            <CardDescription>Your last 20 security analyses</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No history yet</p>
                <p className={styles.emptySubtext}>
                  Start using security tools to see your activity here
                </p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {history.map((item, index) => (
                  <Link key={index} to={item.toolPath} className={styles.historyItem}>
                    <div className={styles.historyContent}>
                      <Clock size={16} className={styles.historyIcon} />
                      <div className={styles.historyText}>
                        <div className={styles.historyTitle}>{item.toolTitle}</div>
                        <div className={styles.historyTime}>{formatTime(item.timestamp)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
