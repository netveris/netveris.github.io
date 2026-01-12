import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import {
  Shield,
  Lock,
  Cookie,
  Key,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Code,
  Hash,
  Binary,
  Globe,
  BookOpen,
  Fingerprint,
  FileCheck,
  Database,
  Cpu,
  Eye,
  Zap,
  Award,
  TrendingUp,
  Network,
  TestTube,
  Link2,
  Shuffle,
  Search,
  Star,
  Clock,
  Github,
  Twitter,
  KeyRound,
  Timer,
  CalendarClock,
  Braces,
  ShieldCheck,
  FileKey,
  Palette,
  RotateCcw,
  Unlink,
} from "lucide-react";
import { Navigation } from "~/components/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { useKeyboardShortcuts } from "~/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "~/components/keyboard-shortcuts-dialog";
import { getHistory, getFavorites, toggleFavorite } from "~/utils/storage";
import styles from "./home.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Netveris - Security Analysis Tools" },
    {
      name: "description",
      content: "Professional security analysis tools for HTTP headers, cookies, JWT tokens, and more",
    },
  ];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const history = getHistory();
    setRecentTools(history.slice(0, 5).map((h) => h.toolPath));

    const favorites = getFavorites();
    setFavoriteTools(favorites.map((f) => f.toolPath));
  }, []);

  useKeyboardShortcuts(() => setShowShortcuts(true));

  const tools = useMemo(
    () => [
      {
        path: "/analyze",
        icon: <Shield size={32} />,
        title: "Site Security Analyzer",
        description:
          "Comprehensive security audit of the entire application with issue detection, risk scoring, and recommendations.",
        linkText: "Run Full Audit",
        keywords: ["audit", "security", "scan", "analyze", "headers", "cookies"],
      },
      {
        path: "/password-checker",
        icon: <Shield size={32} />,
        title: "Password Strength",
        description:
          "Analyze password strength with entropy calculation, time-to-crack estimation, and security recommendations.",
        linkText: "Check Password",
        keywords: ["password", "strength", "entropy", "secure", "check"],
      },
      {
        path: "/hash-tools",
        icon: <Hash size={32} />,
        title: "Hash Tools",
        description: "Generate cryptographic hashes (SHA-256, SHA-512) and identify hash types from strings.",
        linkText: "Hash Tools",
        keywords: ["hash", "sha", "md5", "crypto", "checksum", "digest"],
      },
      {
        path: "/base64-tools",
        icon: <Binary size={32} />,
        title: "Base64 Tools",
        description: "Encode and decode Base64 strings with support for text data and detailed explanations.",
        linkText: "Base64 Tools",
        keywords: ["base64", "encode", "decode", "encoding"],
      },
      {
        path: "/jwt-debugger",
        icon: <Key size={32} />,
        title: "JWT Debugger",
        description:
          "Debug and validate JWT tokens with real-time feedback, expiration checking, and security analysis.",
        linkText: "Debug JWT",
        keywords: ["jwt", "token", "debug", "validate", "json web token"],
      },
      {
        path: "/jwt-best-practices",
        icon: <BookOpen size={32} />,
        title: "JWT Best Practices",
        description: "Learn JWT security best practices, common vulnerabilities, and implementation guidelines.",
        linkText: "Learn More",
        keywords: ["jwt", "best practices", "security", "guide", "tutorial"],
      },
      {
        path: "/cors-checker",
        icon: <Globe size={32} />,
        title: "CORS Checker",
        description: "Analyze CORS configuration and identify security issues with Cross-Origin Resource Sharing.",
        linkText: "Check CORS",
        keywords: ["cors", "cross-origin", "headers", "api"],
      },
      {
        path: "/aes-encryption",
        icon: <Lock size={32} />,
        title: "AES Encryption",
        description: "Encrypt and decrypt text using AES-256-GCM encryption with password-based key derivation.",
        linkText: "AES Tools",
        keywords: ["aes", "encryption", "decrypt", "crypto", "cipher"],
      },
      {
        path: "/rsa-generator",
        icon: <Key size={32} />,
        title: "RSA Key Generator",
        description: "Generate RSA public/private key pairs for encryption, testing, and SSH authentication.",
        linkText: "Generate Keys",
        keywords: ["rsa", "key", "public", "private", "ssh", "encryption"],
      },
      {
        path: "/ssl-inspector",
        icon: <Fingerprint size={32} />,
        title: "SSL/TLS Inspector",
        description: "Analyze SSL/TLS certificates, cipher suites, and encryption protocols for any domain.",
        linkText: "Inspect SSL",
        keywords: ["ssl", "tls", "certificate", "https", "security"],
      },
      {
        path: "/http-builder",
        icon: <FileCheck size={32} />,
        title: "HTTP Request Builder",
        description: "Build and test HTTP requests with custom headers, methods, and authentication.",
        linkText: "Build Request",
        keywords: ["http", "request", "api", "test", "rest"],
      },
      {
        path: "/data-sanitizer",
        icon: <Database size={32} />,
        title: "Data Sanitizer",
        description: "Sanitize and validate user input to prevent XSS, SQL injection, and other attacks.",
        linkText: "Sanitize Data",
        keywords: ["sanitize", "xss", "sql", "injection", "validate"],
      },
      {
        path: "/api-security",
        icon: <Cpu size={32} />,
        title: "API Security Tester",
        description: "Test API endpoints for common vulnerabilities including rate limiting and authentication flaws.",
        linkText: "Test API",
        keywords: ["api", "security", "test", "endpoint", "rest"],
      },
      {
        path: "/privacy-analyzer",
        icon: <Eye size={32} />,
        title: "Privacy Analyzer",
        description: "Analyze tracking scripts, third-party resources, and privacy compliance on websites.",
        linkText: "Check Privacy",
        keywords: ["privacy", "tracking", "gdpr", "cookies", "compliance"],
      },
      {
        path: "/certificate-decoder",
        icon: <Fingerprint size={32} />,
        title: "Certificate Decoder",
        description:
          "Decode and analyze X.509 SSL/TLS certificates with complete subject, issuer, and extension details.",
        linkText: "Decode Certificate",
        keywords: ["certificate", "x509", "ssl", "decode", "pem"],
      },
      {
        path: "/subnet-calculator",
        icon: <Network size={32} />,
        title: "Subnet Calculator",
        description: "Calculate IP subnet information, network addresses, and host ranges with binary visualization.",
        linkText: "Calculate Subnet",
        keywords: ["subnet", "ip", "network", "cidr", "calculator"],
      },
      {
        path: "/regex-tester",
        icon: <TestTube size={32} />,
        title: "Regex Tester",
        description: "Test and validate regular expressions in real-time with match highlighting and group extraction.",
        linkText: "Test Regex",
        keywords: ["regex", "regular expression", "pattern", "match", "test"],
      },
      {
        path: "/dns-lookup",
        icon: <Globe size={32} />,
        title: "DNS Lookup",
        description: "Query and analyze DNS records (A, AAAA, MX, TXT, NS, CNAME) for any domain with TTL information.",
        linkText: "Lookup DNS",
        keywords: ["dns", "domain", "lookup", "records", "query"],
      },
      {
        path: "/url-parser",
        icon: <Link2 size={32} />,
        title: "URL Parser",
        description: "Parse and analyze URL components, query parameters, and structure with security warnings.",
        linkText: "Parse URL",
        keywords: ["url", "parse", "query", "parameters", "decode"],
      },
      {
        path: "/uuid-generator",
        icon: <Fingerprint size={32} />,
        title: "UUID Generator",
        description:
          "Generate universally unique identifiers (UUIDs) in version 1 and version 4 formats with bulk generation.",
        linkText: "Generate UUID",
        keywords: ["uuid", "guid", "unique", "identifier", "generate"],
      },
      {
        path: "/text-diff",
        icon: <Shuffle size={32} />,
        title: "Text Diff Tool",
        description: "Compare two texts side-by-side and visualize differences with line-by-line diff highlighting.",
        linkText: "Compare Text",
        keywords: ["diff", "compare", "text", "difference", "merge"],
      },
      {
        path: "/password-generator",
        icon: <KeyRound size={32} />,
        title: "Password Generator",
        description:
          "Generate cryptographically secure passwords with customizable length, character sets, and strength analysis.",
        linkText: "Generate Password",
        keywords: ["password", "generator", "secure", "random", "crypto"],
      },
      {
        path: "/totp-generator",
        icon: <Timer size={32} />,
        title: "TOTP Generator",
        description: "Generate time-based one-time passwords (TOTP) for two-factor authentication testing.",
        linkText: "Generate TOTP",
        keywords: ["totp", "2fa", "otp", "authenticator", "mfa", "two-factor"],
      },
      {
        path: "/timestamp-converter",
        icon: <CalendarClock size={32} />,
        title: "Timestamp Converter",
        description: "Convert between Unix timestamps and human-readable dates with timezone support.",
        linkText: "Convert Timestamp",
        keywords: ["timestamp", "unix", "epoch", "date", "time", "converter"],
      },
      {
        path: "/json-formatter",
        icon: <Braces size={32} />,
        title: "JSON Formatter",
        description: "Format, minify, and validate JSON with syntax highlighting and structure analysis.",
        linkText: "Format JSON",
        keywords: ["json", "format", "validate", "minify", "beautify", "parser"],
      },
      {
        path: "/csp-generator",
        icon: <ShieldCheck size={32} />,
        title: "CSP Generator",
        description: "Build Content Security Policy headers with a visual editor and security recommendations.",
        linkText: "Generate CSP",
        keywords: ["csp", "content security policy", "headers", "xss", "security"],
      },
      {
        path: "/hmac-generator",
        icon: <FileKey size={32} />,
        title: "HMAC Generator",
        description: "Generate HMAC signatures using SHA-256, SHA-384, or SHA-512 for message authentication.",
        linkText: "Generate HMAC",
        keywords: ["hmac", "hash", "signature", "authentication", "sha", "mac"],
      },
      {
        path: "/url-encoder",
        icon: <Link2 size={32} />,
        title: "URL Encoder",
        description: "Encode and decode URLs with component parsing and common encodings reference.",
        linkText: "Encode URLs",
        keywords: ["url", "encode", "decode", "uri", "percent", "query"],
      },
      {
        path: "/secret-generator",
        icon: <Key size={32} />,
        title: "Secret Generator",
        description: "Generate secure API keys, tokens, and secrets with customizable formats and lengths.",
        linkText: "Generate Secrets",
        keywords: ["secret", "api key", "token", "random", "hex", "uuid"],
      },
      {
        path: "/html-entities",
        icon: <Code size={32} />,
        title: "HTML Entity Encoder",
        description: "Encode and decode HTML entities to prevent XSS attacks and display special characters.",
        linkText: "Encode HTML",
        keywords: ["html", "entities", "xss", "encode", "decode", "escape"],
      },
      {
        path: "/color-converter",
        icon: <Palette size={32} />,
        title: "Color Converter",
        description: "Convert colors between HEX, RGB, HSL, HSV, and CMYK formats with visual preview.",
        linkText: "Convert Colors",
        keywords: ["color", "hex", "rgb", "hsl", "hsv", "cmyk", "converter"],
      },
      {
        path: "/caesar-cipher",
        icon: <RotateCcw size={32} />,
        title: "Caesar Cipher / ROT13",
        description: "Encode and decode text using Caesar cipher with brute-force analysis. Essential for CTF.",
        linkText: "Encode/Decode",
        keywords: ["caesar", "rot13", "rot", "cipher", "ctf", "crypto", "rotation"],
      },
      {
        path: "/xor-cipher",
        icon: <Unlink size={32} />,
        title: "XOR Cipher",
        description: "XOR encode/decode with single-byte brute-force analysis. Common in CTF and malware analysis.",
        linkText: "XOR Encode",
        keywords: ["xor", "cipher", "ctf", "crypto", "brute force", "encryption"],
      },
      {
        path: "/base-converter",
        icon: <Binary size={32} />,
        title: "Base Converter",
        description: "Convert between Hex, Binary, Decimal, Octal, ASCII, and Base64. Essential for RE and CTF.",
        linkText: "Convert Bases",
        keywords: ["hex", "binary", "decimal", "octal", "ascii", "base64", "converter", "ctf"],
      },
      {
        path: "/hash-identifier",
        icon: <Fingerprint size={32} />,
        title: "Hash Identifier",
        description: "Identify hash types and get hashcat/john modes for cracking. Perfect for CTF challenges.",
        linkText: "Identify Hash",
        keywords: ["hash", "identify", "md5", "sha", "ntlm", "hashcat", "john", "ctf", "crack"],
      },
    ],
    [],
  );

  const filteredTools = useMemo(
    () =>
      tools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [tools, searchQuery],
  );

  const handleToggleFavorite = (toolPath: string, toolTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(toolPath, toolTitle);
    if (newState) {
      setFavoriteTools([...favoriteTools, toolPath]);
    } else {
      setFavoriteTools(favoriteTools.filter((p) => p !== toolPath));
    }
  };

  return (
    <div className={styles.container}>
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />

      <Navigation onShowShortcuts={() => setShowShortcuts(true)} />

      <header className={styles.hero}>
        <div className={styles.logoSection}>
          <Shield size={48} className={styles.logo} />
          <h1 className={styles.title}>Netveris</h1>
        </div>
        <p className={styles.subtitle}>
          Professional security analysis for HTTP headers, cookies, and JWT tokens. Understand vulnerabilities from both
          attacker and defender perspectives.
        </p>
        <div className={styles.ctaGroup}>
          <Link to="/analyze" className={styles.ctaPrimary}>
            <Shield size={20} />
            Full Security Audit
          </Link>
          <Link to="/jwt-analyzer" className={styles.ctaSecondary}>
            <Key size={20} />
            JWT Analyzer
          </Link>
          <Link to="/jwt-generator" className={styles.ctaSecondary}>
            <Code size={20} />
            JWT Generator
          </Link>
        </div>
      </header>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>
          Comprehensive Security Tools
          {searchQuery && (
            <span className={styles.toolCount}>
              {" "}
              - {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"} found
            </span>
          )}
        </h2>

        <div className={styles.searchWrapper}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search for a tool... (e.g., JWT, Password, Hash, SSL) - Press Ctrl+K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearButton} onClick={() => setSearchQuery("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>
        </div>

        <div className={styles.featureGrid}>
          {filteredTools.map((tool) => {
            const isToolFavorite = favoriteTools.includes(tool.path);
            return (
              <div key={tool.path} className={styles.featureCard}>
                <button
                  className={`${styles.favoriteButton} ${isToolFavorite ? styles.favoriteActive : ""}`}
                  onClick={(e) => handleToggleFavorite(tool.path, tool.title, e)}
                  aria-label={isToolFavorite ? "Remove from favorites" : "Add to favorites"}
                  title={isToolFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star size={18} fill={isToolFavorite ? "currentColor" : "none"} />
                </button>
                <div className={styles.featureIcon}>{tool.icon}</div>
                <h3 className={styles.featureTitle}>{tool.title}</h3>
                <p className={styles.featureDescription}>{tool.description}</p>
                <Link to={tool.path} className={styles.featureLink}>
                  {tool.linkText} <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>

        {searchQuery && filteredTools.length === 0 && (
          <div className={styles.noResults}>
            <Shield size={48} className={styles.noResultsIcon} />
            <h3 className={styles.noResultsTitle}>No tools found</h3>
            <p className={styles.noResultsText}>
              Try searching with different keywords like "JWT", "encryption", "password", or "SSL"
            </p>
            <button className={styles.clearSearchButton} onClick={() => setSearchQuery("")}>
              Clear Search
            </button>
          </div>
        )}
      </section>

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Choose Your Tool</h3>
              <p className={styles.stepDescription}>
                Select website analysis, JWT analyzer, or JWT generator based on your needs.
              </p>
            </div>
          </div>
          <ArrowRight className={styles.stepArrow} size={24} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Enter Data</h3>
              <p className={styles.stepDescription}>
                Provide a URL for website analysis, paste a JWT token to decode, or configure your own JWT.
              </p>
            </div>
          </div>
          <ArrowRight className={styles.stepArrow} size={24} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Get Insights</h3>
              <p className={styles.stepDescription}>
                Receive detailed security analysis with risk scores, code examples, and remediation steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.whatWeAnalyze}>
        <h2 className={styles.sectionTitle}>What We Analyze</h2>
        <div className={styles.analyzeGrid}>
          <div className={styles.analyzeCard}>
            <div className={styles.analyzeIcon}>
              <Lock size={28} />
            </div>
            <h3 className={styles.analyzeTitle}>Security Headers</h3>
            <ul className={styles.analyzeList}>
              <li>Content-Security-Policy</li>
              <li>X-Frame-Options</li>
              <li>Strict-Transport-Security</li>
              <li>X-Content-Type-Options</li>
              <li>Referrer-Policy</li>
              <li>Permissions-Policy</li>
            </ul>
          </div>

          <div className={styles.analyzeCard}>
            <div className={styles.analyzeIcon}>
              <Cookie size={28} />
            </div>
            <h3 className={styles.analyzeTitle}>Cookie Security</h3>
            <ul className={styles.analyzeList}>
              <li>HttpOnly flag protection</li>
              <li>Secure flag verification</li>
              <li>SameSite attribute checks</li>
              <li>Domain and Path scope</li>
              <li>Session vs persistent cookies</li>
              <li>Expiration analysis</li>
            </ul>
          </div>

          <div className={styles.analyzeCard}>
            <div className={styles.analyzeIcon}>
              <Key size={28} />
            </div>
            <h3 className={styles.analyzeTitle}>JWT Tokens</h3>
            <ul className={styles.analyzeList}>
              <li>Algorithm security (alg: none detection)</li>
              <li>Token expiration validation</li>
              <li>Claim structure analysis</li>
              <li>Sensitive data exposure</li>
              <li>Storage security assessment</li>
              <li>Signature verification guidance</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Zap size={32} className={styles.statIcon} />
            <div className={styles.statValue}>35</div>
            <div className={styles.statLabel}>Security Tools</div>
          </div>
          <div className={styles.statCard}>
            <Shield size={32} className={styles.statIcon} />
            <div className={styles.statValue}>100%</div>
            <div className={styles.statLabel}>Browser-Based</div>
          </div>
          <div className={styles.statCard}>
            <Award size={32} className={styles.statIcon} />
            <div className={styles.statValue}>Privacy First</div>
            <div className={styles.statLabel}>No Data Stored</div>
          </div>
          <div className={styles.statCard}>
            <TrendingUp size={32} className={styles.statIcon} />
            <div className={styles.statValue}>Real-Time</div>
            <div className={styles.statLabel}>Instant Analysis</div>
          </div>
        </div>
      </section>

      <section className={styles.useCases}>
        <h2 className={styles.sectionTitle}>Who Uses Netveris?</h2>
        <div className={styles.useCaseGrid}>
          <div className={styles.useCaseCard}>
            <AlertTriangle size={24} className={styles.useCaseIcon} />
            <h3 className={styles.useCaseTitle}>Security Researchers</h3>
            <p className={styles.useCaseDescription}>
              Quick vulnerability assessment and attack vector identification for bug bounty programs.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <CheckCircle size={24} className={styles.useCaseIcon} />
            <h3 className={styles.useCaseTitle}>Web Developers</h3>
            <p className={styles.useCaseDescription}>
              Validate security headers and token configurations before deploying to production.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <Shield size={24} className={styles.useCaseIcon} />
            <h3 className={styles.useCaseTitle}>Security Teams</h3>
            <p className={styles.useCaseDescription}>
              Comprehensive security audits with clear remediation steps and risk prioritization.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <Code size={24} className={styles.useCaseIcon} />
            <h3 className={styles.useCaseTitle}>Students & Learners</h3>
            <p className={styles.useCaseDescription}>
              Educational tool to understand web security concepts with real-world examples and code.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.disclaimer}>
        <div className={styles.disclaimerCard}>
          <AlertTriangle size={24} className={styles.disclaimerIcon} />
          <div>
            <h3 className={styles.disclaimerTitle}>Educational & Defensive Use Only</h3>
            <p className={styles.disclaimerText}>
              Netveris is designed for security education, vulnerability assessment, and defensive security testing. All
              analysis is performed locally in your browser. We do not store tokens, perform exploitation, or conduct
              unauthorized testing. Always obtain proper authorization before analyzing any website you do not own.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Shield size={24} className={styles.footerLogo} />
            <span className={styles.footerBrandName}>Netveris</span>
          </div>
          <p className={styles.footerText}>Professional security analysis tools for modern web applications.</p>
          <div className={styles.socialLinks}>
            <a
              href="https://x.com/n4itr0_07"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Follow on X (Twitter)"
            >
              <Twitter size={20} />
              <span>@n4itr0_07</span>
            </a>
            <a
              href="https://github.com/n4itr0-07"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub Profile"
            >
              <Github size={20} />
              <span>n4itr0-07</span>
            </a>
          </div>
          <p className={styles.footerCopyright}>
            © {new Date().getFullYear()} Netveris. Built for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
