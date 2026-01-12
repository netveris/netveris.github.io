import { useState } from "react";
import { Link } from "react-router";
import { Cpu, Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card } from "~/components/ui/card/card";
import styles from "./api-security.module.css";

export function meta() {
  return [
    { title: "API Security Tester - Netveris" },
    { name: "description", content: "Test API endpoints for security vulnerabilities" },
  ];
}

interface SecurityTest {
  name: string;
  status: "passed" | "failed" | "warning";
  message: string;
}

export default function APISecurityTester() {
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SecurityTest[]>([]);

  const runSecurityTests = async () => {
    if (!endpoint.trim()) {
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const testResults: SecurityTest[] = [];

      // Test 1: HTTPS Enforcement
      testResults.push({
        name: "HTTPS Enforcement",
        status: endpoint.startsWith("https://") ? "passed" : "failed",
        message: endpoint.startsWith("https://")
          ? "Endpoint uses HTTPS encryption"
          : "Endpoint should use HTTPS for secure communication",
      });

      // Test 2: API Versioning
      testResults.push({
        name: "API Versioning",
        status: endpoint.includes("/v1") || endpoint.includes("/v2") || endpoint.includes("/v3") ? "passed" : "warning",
        message: endpoint.includes("/v") && /\/v\d/.test(endpoint)
          ? "API versioning detected in URL"
          : "Consider implementing API versioning (/v1, /v2, etc.)",
      });

      // Try to make actual request to check headers
      try {
        const response = await fetch(endpoint, {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
          },
        });

        // Test 3: CORS Configuration
        const corsOrigin = response.headers.get('access-control-allow-origin');
        if (corsOrigin) {
          testResults.push({
            name: "CORS Configuration",
            status: corsOrigin === '*' ? "warning" : "passed",
            message: corsOrigin === '*'
              ? "CORS allows all origins (*) - consider restricting to specific domains"
              : `CORS properly configured for: ${corsOrigin}`,
          });
        } else {
          testResults.push({
            name: "CORS Configuration",
            status: "warning",
            message: "No CORS headers detected",
          });
        }

        // Test 4: Security Headers
        const csp = response.headers.get('content-security-policy');
        testResults.push({
          name: "Content Security Policy",
          status: csp ? "passed" : "warning",
          message: csp
            ? "Content-Security-Policy header present"
            : "Missing Content-Security-Policy header - consider adding for XSS protection",
        });

        // Test 5: Rate Limiting
        const rateLimit = response.headers.get('x-ratelimit-limit') || response.headers.get('ratelimit-limit');
        testResults.push({
          name: "Rate Limiting",
          status: rateLimit ? "passed" : "warning",
          message: rateLimit
            ? `Rate limiting configured (limit: ${rateLimit})`
            : "No rate limiting headers detected - consider implementing to prevent abuse",
        });

        // Test 6: Authentication indicators
        const wwwAuth = response.headers.get('www-authenticate');
        testResults.push({
          name: "Authentication",
          status: wwwAuth || response.status === 401 ? "passed" : "warning",
          message: wwwAuth || response.status === 401
            ? "Endpoint appears to require authentication"
            : "No authentication indicators detected",
        });

      } catch (fetchError) {
        // If fetch fails, add warnings
        testResults.push({
          name: "Endpoint Accessibility",
          status: "warning",
          message: "Unable to access endpoint - may be blocked by CORS or network restrictions",
        });
      }

      setResults(testResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle size={20} className={styles.iconPassed} />;
      case "failed":
        return <X size={20} className={styles.iconFailed} />;
      case "warning":
        return <AlertTriangle size={20} className={styles.iconWarning} />;
      default:
        return null;
    }
  };

  const passedCount = results.filter(r => r.status === "passed").length;
  const failedCount = results.filter(r => r.status === "failed").length;
  const warningCount = results.filter(r => r.status === "warning").length;

  return (
    <div className={styles.container}>
      <ToolHeader
        title="API Security Tester"
        description="Test API endpoints for common vulnerabilities including rate limiting and authentication flaws"
        icon={<Cpu />}
      />

      <main className={styles.main}>
        <Card className={styles.inputCard}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="https://api.example.com/v1/users"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSecurityTests()}
              className={styles.input}
            />
            <Button onClick={runSecurityTests} disabled={loading} className={styles.button}>
              {loading ? "Testing..." : "Run Tests"}
            </Button>
          </div>
        </Card>

        {results.length > 0 && (
          <div className={styles.results}>
            <Card className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Test Summary</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <CheckCircle size={24} className={styles.iconPassed} />
                  <div className={styles.summaryValue}>{passedCount}</div>
                  <div className={styles.summaryLabel}>Passed</div>
                </div>
                <div className={styles.summaryItem}>
                  <AlertTriangle size={24} className={styles.iconWarning} />
                  <div className={styles.summaryValue}>{warningCount}</div>
                  <div className={styles.summaryLabel}>Warnings</div>
                </div>
                <div className={styles.summaryItem}>
                  <X size={24} className={styles.iconFailed} />
                  <div className={styles.summaryValue}>{failedCount}</div>
                  <div className={styles.summaryLabel}>Failed</div>
                </div>
              </div>
            </Card>

            <Card className={styles.testsCard}>
              <h2 className={styles.testsTitle}>Security Tests</h2>
              <div className={styles.testsList}>
                {results.map((test, index) => (
                  <div key={index} className={styles.testItem} data-status={test.status}>
                    <div className={styles.testHeader}>
                      {getStatusIcon(test.status)}
                      <h3 className={styles.testName}>{test.name}</h3>
                    </div>
                    <p className={styles.testMessage}>{test.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
