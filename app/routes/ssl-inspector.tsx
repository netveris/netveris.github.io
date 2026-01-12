import { useState } from "react";
import { Link } from "react-router";
import { Fingerprint, Shield, Lock, AlertTriangle, CheckCircle, X, ArrowLeft, Info } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card } from "~/components/ui/card/card";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import styles from "./ssl-inspector.module.css";
import type { Route } from "./+types/ssl-inspector";

interface SSLInfo {
  domain: string;
  valid: boolean;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  cipherSuite: string;
  warnings: string[];
}

// Generate demo SSL info for demonstration
const getDemoSSLInfo = (domain: string): SSLInfo => {
  const today = new Date();
  const validFrom = new Date(today);
  validFrom.setFullYear(today.getFullYear() - 1);
  const validTo = new Date(today);
  validTo.setFullYear(today.getFullYear() + 1);
  const daysRemaining = Math.floor((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    domain,
    valid: true,
    issuer: "Let's Encrypt Authority X3",
    validFrom: validFrom.toLocaleDateString(),
    validTo: validTo.toLocaleDateString(),
    daysRemaining,
    protocol: "TLSv1.3",
    cipherSuite: "TLS_AES_256_GCM_SHA384",
    warnings: [],
  };
};

export default function SSLInspector() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSLInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const analyzeDomain = () => {
    if (!domain.trim()) {
      setError("Please enter a domain name");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate analysis delay and show demo data
    setTimeout(() => {
      const cleanDomain = domain
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
      setResult(getDemoSSLInfo(cleanDomain));
      setShowDemo(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="SSL/TLS Certificate Inspector"
        description="Inspect SSL/TLS certificates and analyze HTTPS security configuration"
        icon={<Fingerprint />}
      />

      <div className={styles.content}>
        <Card className={styles.inputCard}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeDomain()}
              className={styles.input}
            />
            <Button onClick={analyzeDomain} disabled={loading} className={styles.button}>
              {loading ? "Analyzing..." : "Inspect SSL"}
            </Button>
          </div>
          {error && (
            <div className={styles.error}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
          {showDemo && (
            <Alert style={{ marginTop: "1rem" }}>
              <Info size={16} />
              <AlertDescription>
                <strong>Demo Mode:</strong> SSL inspection requires server-side TLS connections. Below is example data
                showing typical certificate information. For real inspection, use tools like{" "}
                <code>openssl s_client</code> or online SSL checkers.
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {result && (
          <div className={styles.results}>
            <Card className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <div className={styles.statusBadge} data-valid={result.valid}>
                  {result.valid ? <CheckCircle size={20} /> : <X size={20} />}
                  {result.valid ? "Valid Certificate" : "Invalid Certificate"}
                </div>
                <h2 className={styles.domainName}>{result.domain}</h2>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Lock size={18} />
                  <div>
                    <div className={styles.infoLabel}>Issuer</div>
                    <div className={styles.infoValue}>{result.issuer}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Shield size={18} />
                  <div>
                    <div className={styles.infoLabel}>Protocol</div>
                    <div className={styles.infoValue}>{result.protocol}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Fingerprint size={18} />
                  <div>
                    <div className={styles.infoLabel}>Cipher Suite</div>
                    <div className={styles.infoValue}>{result.cipherSuite}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <CheckCircle size={18} />
                  <div>
                    <div className={styles.infoLabel}>Valid From</div>
                    <div className={styles.infoValue}>{result.validFrom}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <CheckCircle size={18} />
                  <div>
                    <div className={styles.infoLabel}>Valid To</div>
                    <div className={styles.infoValue}>{result.validTo}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <AlertTriangle size={18} />
                  <div>
                    <div className={styles.infoLabel}>Days Remaining</div>
                    <div className={styles.infoValue}>{result.daysRemaining} days</div>
                  </div>
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className={styles.warnings}>
                  <h3 className={styles.warningsTitle}>
                    <AlertTriangle size={18} />
                    Warnings
                  </h3>
                  <ul className={styles.warningsList}>
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
