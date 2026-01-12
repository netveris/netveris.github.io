import { Link } from "react-router";
import { Clock, ArrowRight, Shield } from "lucide-react";
import { Navigation } from "~/components/navigation";
import { useState, useEffect } from "react";
import { getHistory, clearHistory } from "~/utils/storage";
import styles from "./recent.module.css";

export function meta() {
  return [
    { title: "Recent Tools - Netveris" },
    { name: "description", content: "Your recently used security tools" },
  ];
}

const TOOL_INFO: Record<string, { icon: React.ReactElement; title: string; description: string }> = {
  "/analyze": {
    icon: <Shield size={32} />,
    title: "Site Security Analyzer",
    description: "Comprehensive security audit of the entire application"
  },
  "/jwt-debugger": {
    icon: <Shield size={32} />,
    title: "JWT Debugger",
    description: "Debug and validate JWT tokens with real-time feedback"
  },
  "/password-checker": {
    icon: <Shield size={32} />,
    title: "Password Strength",
    description: "Analyze password strength with entropy calculation"
  },
  "/hash-tools": {
    icon: <Shield size={32} />,
    title: "Hash Tools",
    description: "Generate cryptographic hashes"
  },
  "/base64-tools": {
    icon: <Shield size={32} />,
    title: "Base64 Tools",
    description: "Encode and decode Base64 strings"
  },
  "/aes-encryption": {
    icon: <Shield size={32} />,
    title: "AES Encryption",
    description: "Encrypt and decrypt text using AES-256-GCM"
  },
  "/rsa-generator": {
    icon: <Shield size={32} />,
    title: "RSA Key Generator",
    description: "Generate RSA public/private key pairs"
  },
  "/ssl-inspector": {
    icon: <Shield size={32} />,
    title: "SSL/TLS Inspector",
    description: "Analyze SSL/TLS certificates and protocols"
  },
  "/cors-checker": {
    icon: <Shield size={32} />,
    title: "CORS Checker",
    description: "Analyze CORS configuration"
  },
  "/http-builder": {
    icon: <Shield size={32} />,
    title: "HTTP Request Builder",
    description: "Build and test HTTP requests"
  },
  "/data-sanitizer": {
    icon: <Shield size={32} />,
    title: "Data Sanitizer",
    description: "Sanitize and validate user input"
  },
  "/api-security": {
    icon: <Shield size={32} />,
    title: "API Security Tester",
    description: "Test API endpoints for vulnerabilities"
  },
  "/privacy-analyzer": {
    icon: <Shield size={32} />,
    title: "Privacy Analyzer",
    description: "Analyze tracking scripts and privacy compliance"
  },
  "/certificate-decoder": {
    icon: <Shield size={32} />,
    title: "Certificate Decoder",
    description: "Decode and analyze X.509 SSL/TLS certificates"
  },
  "/subnet-calculator": {
    icon: <Shield size={32} />,
    title: "Subnet Calculator",
    description: "Calculate IP subnet information"
  },
  "/regex-tester": {
    icon: <Shield size={32} />,
    title: "Regex Tester",
    description: "Test and validate regular expressions"
  },
  "/dns-lookup": {
    icon: <Shield size={32} />,
    title: "DNS Lookup",
    description: "Query and analyze DNS records"
  },
  "/url-parser": {
    icon: <Shield size={32} />,
    title: "URL Parser",
    description: "Parse and analyze URL components"
  },
  "/uuid-generator": {
    icon: <Shield size={32} />,
    title: "UUID Generator",
    description: "Generate universally unique identifiers"
  },
  "/text-diff": {
    icon: <Shield size={32} />,
    title: "Text Diff Tool",
    description: "Compare two texts side-by-side"
  },
  "/jwt-best-practices": {
    icon: <Shield size={32} />,
    title: "JWT Best Practices",
    description: "Learn JWT security best practices"
  },
};

export default function Recent() {
  const [history, setHistory] = useState<Array<{ toolPath: string; toolTitle: string; timestamp: number }>>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={styles.container}>
      <Navigation />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <div className={styles.headerIcon}>
                <Clock size={48} />
              </div>
              <h1 className={styles.title}>Recently Used</h1>
              <p className={styles.subtitle}>
                Access your recent security tool history
              </p>
            </div>
            {history.length > 0 && (
              <button onClick={handleClearHistory} className={styles.clearButton}>
                Clear History
              </button>
            )}
          </div>
        </header>

        {history.length === 0 ? (
          <div className={styles.empty}>
            <Clock size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No recent tools</h2>
            <p className={styles.emptyText}>
              Tools you use will appear here for quick access.
            </p>
            <Link to="/" className={styles.emptyLink}>
              Browse All Tools
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {history.map((item) => {
              const tool = TOOL_INFO[item.toolPath];
              if (!tool) return null;
              
              return (
                <div key={`${item.toolPath}-${item.timestamp}`} className={styles.card}>
                  <div className={styles.timestamp}>
                    {formatTimestamp(item.timestamp)}
                  </div>
                  <div className={styles.icon}>{tool.icon}</div>
                  <h3 className={styles.cardTitle}>{tool.title}</h3>
                  <p className={styles.cardDescription}>{tool.description}</p>
                  <Link to={item.toolPath} className={styles.cardLink}>
                    Open Tool <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
