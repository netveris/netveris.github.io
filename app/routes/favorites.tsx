import { Link } from "react-router";
import { Star, ArrowRight, Shield } from "lucide-react";
import { Navigation } from "~/components/navigation";
import { useState, useEffect } from "react";
import { getFavorites, toggleFavorite } from "~/utils/storage";
import styles from "./favorites.module.css";

export function meta() {
  return [
    { title: "Favorites - Netveris" },
    { name: "description", content: "Your favorite security tools for quick access" },
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

export default function Favorites() {
  const [favorites, setFavorites] = useState<Array<{ toolPath: string; toolTitle: string; timestamp: number }>>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleToggleFavorite = (toolPath: string, toolTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(toolPath, toolTitle);
    setFavorites(getFavorites());
  };

  return (
    <div className={styles.container}>
      <Navigation />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Star size={48} />
          </div>
          <h1 className={styles.title}>Favorite Tools</h1>
          <p className={styles.subtitle}>
            Quick access to your most-used security tools
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className={styles.empty}>
            <Star size={64} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No favorites yet</h2>
            <p className={styles.emptyText}>
              Click the star icon on any tool to add it to your favorites for quick access.
            </p>
            <Link to="/" className={styles.emptyLink}>
              Browse All Tools
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((fav) => {
              const tool = TOOL_INFO[fav.toolPath];
              if (!tool) return null;
              
              return (
                <div key={fav.toolPath} className={styles.card}>
                  <button
                    className={styles.favoriteButton}
                    onClick={(e) => handleToggleFavorite(fav.toolPath, fav.toolTitle, e)}
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    <Star size={18} fill="currentColor" />
                  </button>
                  <div className={styles.icon}>{tool.icon}</div>
                  <h3 className={styles.cardTitle}>{tool.title}</h3>
                  <p className={styles.cardDescription}>{tool.description}</p>
                  <Link to={fav.toolPath} className={styles.cardLink}>
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
