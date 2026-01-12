import { useState } from "react";
import { Link } from "react-router";
import { Eye, Shield, AlertTriangle, CheckCircle, X, ArrowLeft } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card } from "~/components/ui/card/card";
import styles from "./privacy-analyzer.module.css";

export function meta() {
  return [
    { title: "Privacy Analyzer - Netveris" },
    { name: "description", content: "Analyze website privacy and tracking concerns" },
  ];
}

interface PrivacyIssue {
  category: string;
  severity: "low" | "medium" | "high";
  items: string[];
}

export default function PrivacyAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PrivacyIssue[]>([]);
  const [score, setScore] = useState(0);

  const analyzePrivacy = async () => {
    if (!url.trim()) {
      return;
    }

    setLoading(true);
    setResults([]);
    setScore(0);

    try {
      const analysisResults: PrivacyIssue[] = [];
      let privacyScore = 100;

      // Try to fetch the page
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
        });

        // Analyze cookies
        const cookieIssues: string[] = [];
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          const cookieCount = setCookie.split(',').length;
          cookieIssues.push(`${cookieCount} cookies set by server`);
          
          if (!setCookie.toLowerCase().includes('secure')) {
            cookieIssues.push('Some cookies missing Secure flag');
            privacyScore -= 10;
          }
          if (!setCookie.toLowerCase().includes('samesite')) {
            cookieIssues.push('Some cookies missing SameSite attribute');
            privacyScore -= 10;
          }
          if (!setCookie.toLowerCase().includes('httponly')) {
            cookieIssues.push('Some cookies missing HttpOnly flag');
            privacyScore -= 10;
          }
        }

        if (cookieIssues.length > 0) {
          analysisResults.push({
            category: "Cookies",
            severity: cookieIssues.length > 2 ? "high" : "medium",
            items: cookieIssues,
          });
        }

        // Check privacy headers
        const privacyHeaders: string[] = [];
        const referrerPolicy = response.headers.get('referrer-policy');
        if (referrerPolicy) {
          privacyHeaders.push(`Referrer-Policy: ${referrerPolicy}`);
        } else {
          privacyHeaders.push('Missing Referrer-Policy header');
          privacyScore -= 5;
        }

        const permissionsPolicy = response.headers.get('permissions-policy');
        if (permissionsPolicy) {
          privacyHeaders.push(`Permissions-Policy configured`);
        } else {
          privacyHeaders.push('Missing Permissions-Policy header');
          privacyScore -= 5;
        }

        if (privacyHeaders.length > 0) {
          analysisResults.push({
            category: "Privacy Headers",
            severity: "medium",
            items: privacyHeaders,
          });
        }

        // Check third-party resources
        const html = await response.text();
        const thirdPartyItems: string[] = [];
        
        // Check for common trackers
        const trackers = [
          { name: 'Google Analytics', pattern: /google-analytics\.com|googletagmanager\.com/i },
          { name: 'Facebook Pixel', pattern: /connect\.facebook\.net/i },
          { name: 'Twitter', pattern: /platform\.twitter\.com/i },
          { name: 'LinkedIn', pattern: /platform\.linkedin\.com/i },
        ];

        trackers.forEach(tracker => {
          if (tracker.pattern.test(html)) {
            thirdPartyItems.push(`${tracker.name} detected`);
            privacyScore -= 15;
          }
        });

        if (thirdPartyItems.length > 0) {
          analysisResults.push({
            category: "Tracking Scripts",
            severity: "high",
            items: thirdPartyItems,
          });
        }

        // Check for privacy policy
        const complianceItems: string[] = [];
        if (/privacy[\s-]?policy/i.test(html)) {
          complianceItems.push('Privacy policy link found');
        } else {
          complianceItems.push('No privacy policy link detected');
          privacyScore -= 10;
        }

        if (/cookie[\s-]?consent|gdpr/i.test(html)) {
          complianceItems.push('Cookie consent/GDPR indicators present');
        } else {
          complianceItems.push('No cookie consent banner detected');
          privacyScore -= 10;
        }

        analysisResults.push({
          category: "Privacy Compliance",
          severity: "low",
          items: complianceItems,
        });

      } catch (fetchError) {
        // CORS or network error - provide limited analysis
        analysisResults.push({
          category: "Analysis Limitation",
          severity: "medium",
          items: [
            'Unable to fetch full page content (CORS restriction)',
            'Limited privacy analysis available',
            'For full analysis, use browser developer tools',
          ],
        });
        privacyScore = 50;
      }

      setResults(analysisResults);
      setScore(Math.max(0, Math.min(100, privacyScore)));
    } catch (err) {
      console.error(err);
      setResults([{
        category: "Error",
        severity: "high",
        items: ['Failed to analyze URL. Please check the URL and try again.'],
      }]);
      setScore(0);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <CheckCircle size={20} className={styles.iconLow} />;
      case "medium":
        return <AlertTriangle size={20} className={styles.iconMedium} />;
      case "high":
        return <X size={20} className={styles.iconHigh} />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Website Privacy Analyzer"
        description="Analyze cookies, tracking scripts, and privacy compliance of any website"
        icon={<Eye />}
      />

      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <div className={styles.titleSection}>
          <Eye size={40} className={styles.icon} />
          <h1 className={styles.title}>Privacy Analyzer</h1>
        </div>
        <p className={styles.subtitle}>
          Analyze tracking scripts, third-party resources, and privacy compliance on websites
        </p>
      </header>

      <main className={styles.main}>
        <Card className={styles.inputCard}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzePrivacy()}
              className={styles.input}
            />
            <Button onClick={analyzePrivacy} disabled={loading} className={styles.button}>
              {loading ? "Analyzing..." : "Analyze Privacy"}
            </Button>
          </div>
        </Card>

        {results.length > 0 && (
          <div className={styles.results}>
            <Card className={styles.scoreCard}>
              <div className={styles.scoreContent}>
                <Shield size={48} className={styles.scoreIcon} />
                <div>
                  <h2 className={styles.scoreTitle}>Privacy Score</h2>
                  <div className={styles.scoreValue} data-score={getScoreColor(score)}>
                    {score}/100
                  </div>
                  <p className={styles.scoreDescription}>
                    {score >= 80 && "Excellent privacy protection"}
                    {score >= 50 && score < 80 && "Good privacy with some concerns"}
                    {score < 50 && "Privacy improvements recommended"}
                  </p>
                </div>
              </div>
            </Card>

            <div className={styles.issuesList}>
              {results.map((result, index) => (
                <Card key={index} className={styles.issueCard} data-severity={result.severity}>
                  <div className={styles.issueHeader}>
                    {getSeverityIcon(result.severity)}
                    <h3 className={styles.issueCategory}>{result.category}</h3>
                    <span className={styles.severityBadge}>{result.severity}</span>
                  </div>
                  <ul className={styles.issueItems}>
                    {result.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
