import {
  BookOpen,
  Shield,
  Key,
  Lock,
  Hash,
  Binary,
  Globe,
  Fingerprint,
  FileCheck,
  Database,
  Cpu,
  Eye,
  Network,
  TestTube,
  Link2,
  Shuffle,
  Cookie,
  Code,
  AlertTriangle,
  KeyRound,
  Timer,
  CalendarClock,
  Braces,
  ShieldCheck,
  FileKey,
  RotateCcw,
  Unlink,
  Palette,
} from "lucide-react";
import { Navigation } from "~/components/navigation";
import { Link } from "react-router";
import { CodeWindow } from "~/components/code-window";
import styles from "./docs.module.css";

export function meta() {
  return [
    { title: "Documentation - Netveris" },
    { name: "description", content: "Complete guide to Netveris security tools" },
  ];
}

export default function Docs() {
  return (
    <div className={styles.container}>
      <Navigation />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <BookOpen size={48} />
          </div>
          <h1 className={styles.title}>Documentation</h1>
          <p className={styles.subtitle}>
            Complete guide to Netveris security tools with real-world use cases and examples
          </p>
        </header>

        <nav className={styles.toc}>
          <h2 className={styles.tocTitle}>Contents</h2>
          <ul className={styles.tocList}>
            <li>
              <a href="#analyzer">Site Security Analyzer</a>
            </li>
            <li>
              <a href="#jwt">JWT Tools</a>
            </li>
            <li>
              <a href="#encryption">Encryption Tools</a>
            </li>
            <li>
              <a href="#generators">Generators & Converters</a>
            </li>
            <li>
              <a href="#ctf">CTF & Crypto Tools</a>
            </li>
            <li>
              <a href="#network">Network Tools</a>
            </li>
            <li>
              <a href="#testing">Testing & Validation</a>
            </li>
          </ul>
        </nav>

        <section id="analyzer" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={32} />
            <h2 className={styles.sectionTitle}>Site Security Analyzer</h2>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Full Security Audit</h3>
            <p className={styles.toolDesc}>
              Analyzes HTTP security headers, cookie configurations, and identifies common vulnerabilities in web
              applications.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Pre-deployment security verification for production applications</li>
              <li>Bug bounty reconnaissance to identify low-hanging security issues</li>
              <li>Compliance auditing for security header requirements</li>
              <li>Educational analysis of security misconfigurations</li>
            </ul>

            <h4 className={styles.subsectionTitle}>What It Checks</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Content-Security-Policy</strong>
                <p>
                  Prevents XSS attacks by controlling resource loading. Missing or weak CSP allows attackers to inject
                  malicious scripts.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>X-Frame-Options</strong>
                <p>
                  Protects against clickjacking by preventing your site from being embedded in iframes on untrusted
                  domains.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Strict-Transport-Security</strong>
                <p>
                  Forces HTTPS connections. Without HSTS, users can be downgraded to HTTP, exposing traffic to
                  interception.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>X-Content-Type-Options</strong>
                <p>
                  Prevents MIME type sniffing attacks where browsers execute files as different types than declared.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Cookie Security Flags</strong>
                <p>
                  HttpOnly prevents JavaScript access (XSS protection), Secure ensures HTTPS-only transmission, SameSite
                  prevents CSRF attacks.
                </p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example Output</h4>
            <CodeWindow>
              {`Missing: Content-Security-Policy
Risk: High
Impact: Allows execution of inline scripts and external resources
Fix: Add CSP header
    Content-Security-Policy: default-src 'self'; 
    script-src 'self' 'nonce-...'; 
    style-src 'self' 'unsafe-inline'`}
            </CodeWindow>

            <Link to="/analyze" className={styles.toolLink}>
              Try Site Security Analyzer →
            </Link>
          </div>
        </section>

        <section id="jwt" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Key size={32} />
            <h2 className={styles.sectionTitle}>JWT Tools</h2>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>JWT Debugger</h3>
            <p className={styles.toolDesc}>
              Decodes and validates JWT tokens, checking for security vulnerabilities and expiration issues.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Debugging authentication issues in API development</li>
              <li>Verifying token claims and expiration in production troubleshooting</li>
              <li>Security testing for algorithm confusion attacks</li>
              <li>Analyzing third-party JWT implementations</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Security Checks</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Algorithm None Attack</strong>
                <p>Detects if algorithm is set to 'none', allowing attackers to forge tokens without a signature.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Expiration Validation</strong>
                <p>Checks exp claim to ensure token hasn't expired. Expired tokens should be rejected by your API.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Sensitive Data Exposure</strong>
                <p>
                  Warns if payload contains emails, passwords, or keys. JWT payloads are base64-encoded, not encrypted.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Storage Security</strong>
                <p>
                  Provides guidance on secure token storage. Never store JWTs in localStorage if they contain sensitive
                  claims.
                </p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example Token Analysis</h4>
            <CodeWindow>
              {`Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user123",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}

Status: Valid
Expires: 2024-01-18 14:30:22
Algorithm: HMAC SHA-256 (Secure)
⚠️ Warning: Token expires in 15 minutes`}
            </CodeWindow>

            <Link to="/jwt-debugger" className={styles.toolLink}>
              Try JWT Debugger →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>JWT Best Practices</h3>
            <p className={styles.toolDesc}>
              Educational guide covering JWT security patterns, common vulnerabilities, and implementation
              recommendations.
            </p>

            <h4 className={styles.subsectionTitle}>Key Topics</h4>
            <ul className={styles.list}>
              <li>Choosing between HMAC (HS256) and RSA (RS256) algorithms</li>
              <li>Proper secret key generation and rotation strategies</li>
              <li>Token expiration and refresh token patterns</li>
              <li>Preventing algorithm confusion and key substitution attacks</li>
              <li>Secure storage in web and mobile applications</li>
            </ul>

            <Link to="/jwt-best-practices" className={styles.toolLink}>
              Read JWT Best Practices →
            </Link>
          </div>
        </section>

        <section id="encryption" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={32} />
            <h2 className={styles.sectionTitle}>Encryption Tools</h2>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Password Strength Checker</h3>
            <p className={styles.toolDesc}>
              Calculates password entropy, estimates time-to-crack, and provides security recommendations.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Implementing password strength meters in registration forms</li>
              <li>Educating users on password security during account creation</li>
              <li>Auditing existing passwords for compliance requirements</li>
              <li>Testing password policies before deployment</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Analysis Metrics</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Entropy Calculation</strong>
                <p>
                  Measures password randomness in bits. Higher entropy means more possible combinations and longer crack
                  time.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Character Set Detection</strong>
                <p>
                  Identifies use of lowercase, uppercase, numbers, and symbols. Larger character sets exponentially
                  increase strength.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Common Password Detection</strong>
                <p>
                  Checks against known breach databases. Common passwords can be cracked instantly regardless of length.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Time-to-Crack Estimation</strong>
                <p>
                  Estimates brute force time based on modern GPU capabilities. Helps users understand real-world risk.
                </p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example Analysis</h4>
            <CodeWindow>
              {`Password: MyP@ssw0rd2024!
Length: 15 characters
Character Sets: Lowercase, Uppercase, Numbers, Symbols
Entropy: 79.5 bits
Strength: Strong

Time to Crack:
  - Online attack (1000/sec): 71 trillion years
  - Offline attack (1B/sec): 71 million years
  - GPU cluster: 7,100 years

Recommendations:
  ✓ Length exceeds 12 characters
  ✓ Uses mixed character sets
  ✓ Not in common password lists
  ⚠️ Consider using a passphrase for better memorability`}
            </CodeWindow>

            <Link to="/password-checker" className={styles.toolLink}>
              Try Password Checker →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>AES Encryption</h3>
            <p className={styles.toolDesc}>
              Encrypts and decrypts text using AES-256-GCM with password-based key derivation (PBKDF2).
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Testing encryption implementations before production deployment</li>
              <li>Encrypting sensitive configuration data for storage</li>
              <li>Learning symmetric encryption concepts and best practices</li>
              <li>Quick encryption of personal notes or credentials</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Security Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>AES-256-GCM Mode</strong>
                <p>
                  Uses Galois/Counter Mode providing both encryption and authentication. Prevents tampering and ensures
                  integrity.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>PBKDF2 Key Derivation</strong>
                <p>
                  Converts passwords into cryptographic keys using 100,000 iterations. Slows down brute force attacks.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Random Initialization Vector</strong>
                <p>Generates unique IV for each encryption. Same plaintext produces different ciphertext each time.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Browser-Based Processing</strong>
                <p>All encryption happens in your browser. Data never leaves your device or travels to servers.</p>
              </div>
            </div>

            <Link to="/aes-encryption" className={styles.toolLink}>
              Try AES Encryption →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>RSA Key Generator</h3>
            <p className={styles.toolDesc}>
              Generates RSA public/private key pairs in PEM format for encryption, signing, and SSH authentication.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Generating SSH keys for server authentication</li>
              <li>Creating test key pairs for development environments</li>
              <li>Learning asymmetric cryptography concepts</li>
              <li>Quick key generation for encrypted communication testing</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Key Sizes</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>2048-bit Keys</strong>
                <p>
                  Minimum recommended size for production. Fast generation, adequate security for most applications
                  until 2030.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>4096-bit Keys</strong>
                <p>
                  Higher security margin for long-term use. Slower generation and operations, recommended for critical
                  systems.
                </p>
              </div>
            </div>

            <Link to="/rsa-generator" className={styles.toolLink}>
              Try RSA Generator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Hash Tools</h3>
            <p className={styles.toolDesc}>
              Generates cryptographic hashes (SHA-256, SHA-512) and identifies hash types for integrity verification.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Verifying file integrity after downloads</li>
              <li>Generating checksums for data validation</li>
              <li>Testing hash implementations in applications</li>
              <li>Identifying unknown hash formats in security research</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Supported Algorithms</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>SHA-256</strong>
                <p>
                  Industry standard for integrity checks. Produces 64 hex character output. Use for general hashing
                  needs.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>SHA-512</strong>
                <p>
                  Stronger variant with 128 hex character output. Recommended for high-security applications and
                  long-term data.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Hash Identification</strong>
                <p>
                  Detects algorithm from hash format. Useful when auditing legacy systems or analyzing unknown hashes.
                </p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example Usage</h4>
            <CodeWindow>
              {`Input: Netveris2024

SHA-256:
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

SHA-512:
cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce
47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e

Use Case: Verify downloaded file integrity
Expected Hash: e3b0c442...
Actual Hash:   e3b0c442...
Status: ✓ Match - File integrity verified`}
            </CodeWindow>

            <Link to="/hash-tools" className={styles.toolLink}>
              Try Hash Tools →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Base64 Tools</h3>
            <p className={styles.toolDesc}>Encodes and decodes Base64 strings for data transmission and storage.</p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Encoding binary data for JSON transmission</li>
              <li>Decoding Base64-encoded API responses</li>
              <li>Converting images to data URLs for embedding</li>
              <li>Understanding JWT token structure (header and payload are Base64)</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Important Note</h4>
            <div className={styles.alert}>
              <AlertTriangle size={20} />
              <p>
                Base64 is encoding, not encryption. Encoded data can be easily decoded. Never use Base64 alone for
                security.
              </p>
            </div>

            <Link to="/base64-tools" className={styles.toolLink}>
              Try Base64 Tools →
            </Link>
          </div>
        </section>

        <section id="generators" className={styles.section}>
          <div className={styles.sectionHeader}>
            <KeyRound size={32} />
            <h2 className={styles.sectionTitle}>Generators & Converters</h2>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Password Generator</h3>
            <p className={styles.toolDesc}>
              Generates cryptographically secure passwords using the Web Crypto API with customizable options.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Creating strong passwords for new accounts</li>
              <li>Generating API keys and secret tokens</li>
              <li>Testing password validation systems</li>
              <li>Bulk password generation for user provisioning</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Cryptographic Randomness</strong>
                <p>Uses Web Crypto API for true randomness. No predictable patterns or weak seeds.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Character Set Control</strong>
                <p>Toggle uppercase, lowercase, numbers, and symbols. Exclude ambiguous characters if needed.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Strength Analysis</strong>
                <p>Real-time entropy calculation and strength indicator. See time-to-crack estimates.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Password History</strong>
                <p>Track recently generated passwords for easy reference. Clear history when done.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example Output</h4>
            <CodeWindow>
              {`Generated Password: Kx9#mP2$vL5@nQ8!
Length: 16 characters
Character Sets: Uppercase, Lowercase, Numbers, Symbols
Entropy: 105 bits
Strength: Very Strong

Time to Crack (GPU): 3.4 trillion years`}
            </CodeWindow>

            <Link to="/password-generator" className={styles.toolLink}>
              Try Password Generator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>TOTP Generator</h3>
            <p className={styles.toolDesc}>
              Generates time-based one-time passwords (TOTP) compatible with Google Authenticator and other 2FA apps.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Testing 2FA implementation in applications</li>
              <li>Debugging authenticator app issues</li>
              <li>Understanding TOTP algorithm mechanics</li>
              <li>Generating codes for development environments</li>
            </ul>

            <h4 className={styles.subsectionTitle}>How TOTP Works</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Time-Based Codes</strong>
                <p>Codes change every 30 seconds based on current Unix time. Both parties must be time-synced.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>HMAC-SHA1 Algorithm</strong>
                <p>Uses shared secret and time counter to generate HMAC, then extracts 6-digit code.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Base32 Secrets</strong>
                <p>Secrets are Base32-encoded for compatibility with authenticator apps and QR codes.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Secret: JBSWY3DPEHPK3PXP
Current Code: 482915
Valid For: 23 seconds
Algorithm: HMAC-SHA1
Period: 30 seconds
Digits: 6`}
            </CodeWindow>

            <Link to="/totp-generator" className={styles.toolLink}>
              Try TOTP Generator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Timestamp Converter</h3>
            <p className={styles.toolDesc}>
              Converts between Unix timestamps and human-readable dates with timezone support.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Debugging JWT expiration times (exp, iat, nbf claims)</li>
              <li>Converting API response timestamps</li>
              <li>Analyzing log file timestamps</li>
              <li>Working with database timestamp fields</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Supported Formats</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Unix Seconds</strong>
                <p>Standard Unix timestamp in seconds since January 1, 1970 UTC.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Unix Milliseconds</strong>
                <p>JavaScript-style timestamps with millisecond precision (13 digits).</p>
              </div>
              <div className={styles.checkItem}>
                <strong>ISO 8601</strong>
                <p>Standard date format: YYYY-MM-DDTHH:mm:ss.sssZ</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Relative Time</strong>
                <p>Human-friendly format like "2 hours ago" or "in 3 days".</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Unix Timestamp: 1736640000

Local Time: January 12, 2026 12:00:00 AM
UTC Time: 2026-01-12T00:00:00.000Z
ISO 8601: 2026-01-12T00:00:00+00:00
Relative: Today at midnight`}
            </CodeWindow>

            <Link to="/timestamp-converter" className={styles.toolLink}>
              Try Timestamp Converter →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>JSON Formatter</h3>
            <p className={styles.toolDesc}>
              Format, minify, and validate JSON with syntax highlighting and structure analysis.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Formatting API responses for readability</li>
              <li>Validating JSON configuration files</li>
              <li>Minifying JSON for production use</li>
              <li>Debugging malformed JSON data</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Format & Beautify</strong>
                <p>Adds proper indentation with customizable spacing (2 or 4 spaces).</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Minify</strong>
                <p>Removes all whitespace to reduce file size for transmission.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Validation</strong>
                <p>Detects syntax errors with line and column numbers for easy debugging.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Structure Analysis</strong>
                <p>Shows object/array counts, nesting depth, and total key count.</p>
              </div>
            </div>

            <Link to="/json-formatter" className={styles.toolLink}>
              Try JSON Formatter →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>CSP Generator</h3>
            <p className={styles.toolDesc}>
              Build Content Security Policy headers with a visual editor and security recommendations.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Creating CSP headers for new web applications</li>
              <li>Testing CSP configurations before deployment</li>
              <li>Learning CSP directive syntax and behavior</li>
              <li>Generating report-only policies for monitoring</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Key Directives</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>default-src</strong>
                <p>Fallback for all fetch directives. Start with 'self' and add specific overrides.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>script-src</strong>
                <p>Controls JavaScript sources. Avoid 'unsafe-inline' and 'unsafe-eval' when possible.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>style-src</strong>
                <p>Controls CSS sources. 'unsafe-inline' often needed for inline styles.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>img-src / font-src</strong>
                <p>Controls image and font loading. Whitelist CDNs and trusted sources.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example Policy</h4>
            <CodeWindow>
              {`Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'`}
            </CodeWindow>

            <Link to="/csp-generator" className={styles.toolLink}>
              Try CSP Generator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>HMAC Generator</h3>
            <p className={styles.toolDesc}>
              Generate HMAC signatures for message authentication using SHA-256, SHA-384, or SHA-512.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Signing API requests for authentication</li>
              <li>Verifying webhook payloads from services</li>
              <li>Testing HMAC implementations in applications</li>
              <li>Learning message authentication concepts</li>
            </ul>

            <h4 className={styles.subsectionTitle}>How HMAC Works</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Keyed Hashing</strong>
                <p>
                  Combines a secret key with the message before hashing. Without the key, signature cannot be forged.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Integrity Verification</strong>
                <p>Any change to the message produces a different signature. Detects tampering in transit.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Algorithm Variants</strong>
                <p>SHA-256 for most uses, SHA-512 for higher security requirements.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Message: {"user":"admin","action":"delete"}
Secret Key: my-secret-key-2024
Algorithm: HMAC-SHA256

Signature (Hex):
a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890

Signature (Base64):
obLD1OX2eJCrzv7SNFZwkKvN7xI0VniQq87/EjRWeJA=`}
            </CodeWindow>

            <Link to="/hmac-generator" className={styles.toolLink}>
              Try HMAC Generator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>URL Encoder / Decoder</h3>
            <p className={styles.toolDesc}>
              Encodes and decodes URLs with component parsing and special character handling.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Encoding query parameters with special characters</li>
              <li>Decoding URLs for debugging API requests</li>
              <li>Testing URL encoding edge cases</li>
              <li>Fixing broken URLs with encoding issues</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Full URL Encoding</strong>
                <p>Encodes all special characters including spaces, slashes, and unicode.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Component Encoding</strong>
                <p>Uses encodeURIComponent for safe query parameter values.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Real-time Conversion</strong>
                <p>See encoded/decoded output as you type.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Original: https://example.com/search?q=hello world&name=O'Brien

Encoded:
https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26name%3DO%27Brien

URL Components:
  Protocol: https
  Host: example.com
  Path: /search
  Query: q=hello world, name=O'Brien`}
            </CodeWindow>

            <Link to="/url-encoder" className={styles.toolLink}>
              Try URL Encoder →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Secret Generator</h3>
            <p className={styles.toolDesc}>
              Generates cryptographically secure API keys, tokens, and secrets in various formats.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Generating API keys for application authentication</li>
              <li>Creating secure tokens for sessions and CSRF protection</li>
              <li>Generating encryption keys in hex or base64 format</li>
              <li>Creating random UUIDs for unique identifiers</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Output Formats</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Hexadecimal</strong>
                <p>Compact representation using 0-9 and a-f. Common for encryption keys.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Base64</strong>
                <p>URL-safe encoding. Ideal for tokens and API keys.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Alphanumeric</strong>
                <p>Letters and numbers only. Safe for all contexts.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>UUID v4</strong>
                <p>Standardized unique identifier format.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Format: Hexadecimal (32 bytes)
8f4a2b1c9d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a

Format: Base64 (32 bytes)
j0orHJ0-X2p7jJ0OHyorTF1uf4qbDBLePKW2x9jp8Ao=

Format: UUID v4
a1b2c3d4-e5f6-7890-abcd-ef1234567890`}
            </CodeWindow>

            <Link to="/secret-generator" className={styles.toolLink}>
              Try Secret Generator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>HTML Entity Encoder</h3>
            <p className={styles.toolDesc}>
              Encodes and decodes HTML entities to prevent XSS and display special characters safely.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Preventing XSS attacks by encoding user input</li>
              <li>Displaying code samples with special characters in HTML</li>
              <li>Converting special characters for email templates</li>
              <li>Debugging HTML encoding issues</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Named Entities</strong>
                <p>Converts to readable entities like &amp;amp; and &amp;lt;.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Numeric Entities</strong>
                <p>Option to use numeric codes like &amp;#60; for broader compatibility.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Bidirectional</strong>
                <p>Encode to entities or decode back to original characters.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Original: <script>alert("XSS")</script>

Encoded (Named):
&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

Encoded (Numeric):
&#60;script&#62;alert(&#34;XSS&#34;)&#60;/script&#62;

Safe to display in HTML without executing JavaScript.`}
            </CodeWindow>

            <Link to="/html-entities" className={styles.toolLink}>
              Try HTML Entity Encoder →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Color Converter</h3>
            <p className={styles.toolDesc}>
              Converts colors between HEX, RGB, HSL, HSV, and CMYK formats with live preview.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Converting design colors between CSS formats</li>
              <li>Adjusting saturation and lightness in HSL</li>
              <li>Preparing colors for print with CMYK values</li>
              <li>Debugging color values in stylesheets</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Supported Formats</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>HEX</strong>
                <p>#RRGGBB format commonly used in CSS and HTML.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>RGB</strong>
                <p>Red, Green, Blue values (0-255). Standard for digital displays.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>HSL</strong>
                <p>Hue, Saturation, Lightness. Intuitive for color adjustments.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>HSV/HSB</strong>
                <p>Hue, Saturation, Value/Brightness. Common in color pickers.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>CMYK</strong>
                <p>Cyan, Magenta, Yellow, Key (Black). Used for print design.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Input: #3B82F6 (Blue)

RGB:  rgb(59, 130, 246)
HSL:  hsl(217, 91%, 60%)
HSV:  hsv(217, 76%, 96%)
CMYK: cmyk(76%, 47%, 0%, 4%)`}
            </CodeWindow>

            <Link to="/color-converter" className={styles.toolLink}>
              Try Color Converter →
            </Link>
          </div>
        </section>

        <section id="ctf" className={styles.section}>
          <div className={styles.sectionHeader}>
            <RotateCcw size={32} />
            <h2 className={styles.sectionTitle}>CTF & Crypto Tools</h2>
          </div>

          <p className={styles.sectionIntro}>
            Tools designed for capture-the-flag competitions, cryptanalysis, and security research. Includes classical
            ciphers, encoding converters, and hash identification for solving challenges.
          </p>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Caesar Cipher / ROT13</h3>
            <p className={styles.toolDesc}>
              Encrypts and decrypts text using the Caesar cipher with configurable shift values and brute force mode.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Solving CTF challenges with rotational ciphers</li>
              <li>Decoding ROT13 encoded text (shift=13)</li>
              <li>Brute forcing unknown shift values</li>
              <li>Learning classical cryptography concepts</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Configurable Shift</strong>
                <p>Set any shift value from 1-25 or use ROT13 preset.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Brute Force Mode</strong>
                <p>View all 26 possible rotations to find the correct plaintext.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Preserves Non-Letters</strong>
                <p>Numbers, punctuation, and spaces remain unchanged.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Input: Uryyb Jbeyq!
Shift: 13 (ROT13)

Output: Hello World!

Brute Force Preview:
  ROT1:  Vszzc Kcfzr!
  ROT2:  Wtaad Ldgas!
  ...
  ROT13: Hello World! ← Readable!
  ...`}
            </CodeWindow>

            <Link to="/caesar-cipher" className={styles.toolLink}>
              Try Caesar Cipher →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>XOR Cipher</h3>
            <p className={styles.toolDesc}>
              Performs XOR encryption/decryption with support for hex, text, and base64 input formats.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Decrypting XOR-encoded CTF flags</li>
              <li>Brute forcing single-byte XOR keys</li>
              <li>Analyzing XOR-based malware obfuscation</li>
              <li>Understanding XOR encryption properties</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Features</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Multiple Input Formats</strong>
                <p>Accept hex bytes, plain text, or base64 encoded data.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Single-Byte Brute Force</strong>
                <p>Try all 256 possible single-byte keys automatically.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Key Flexibility</strong>
                <p>Use single character, hex bytes, or repeating key patterns.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Input (Hex): 48 65 6c 6c 6f
Key: 0x20

Output: hello

XOR Property: A ⊕ B ⊕ B = A
(XORing with the same key twice returns original)`}
            </CodeWindow>

            <Link to="/xor-cipher" className={styles.toolLink}>
              Try XOR Cipher →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Base Converter</h3>
            <p className={styles.toolDesc}>
              Converts between hexadecimal, binary, decimal, octal, ASCII, and Base64 encodings.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Converting hex dumps to readable ASCII</li>
              <li>Analyzing binary data in CTF challenges</li>
              <li>Debugging network packet contents</li>
              <li>Converting between number systems</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Supported Bases</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Hexadecimal (Base 16)</strong>
                <p>0-9 and A-F. Common for memory addresses and byte data.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Binary (Base 2)</strong>
                <p>0s and 1s. Fundamental for understanding bit manipulation.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Decimal (Base 10)</strong>
                <p>Standard numeric format for calculations.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Octal (Base 8)</strong>
                <p>0-7. Used in Unix file permissions.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>ASCII / Text</strong>
                <p>Convert numeric values to readable characters.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Base64</strong>
                <p>Encode binary data as printable ASCII characters.</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Input: 48656c6c6f (Hex)

Binary:  01001000 01100101 01101100 01101100 01101111
Decimal: 72 101 108 108 111
Octal:   110 145 154 154 157
ASCII:   Hello
Base64:  SGVsbG8=`}
            </CodeWindow>

            <Link to="/base-converter" className={styles.toolLink}>
              Try Base Converter →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Hash Identifier</h3>
            <p className={styles.toolDesc}>
              Identifies hash types by pattern matching and provides hashcat and John the Ripper mode numbers.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Identifying unknown hashes in CTF challenges</li>
              <li>Determining correct hashcat mode for cracking</li>
              <li>Recognizing password hash formats</li>
              <li>Differentiating between similar hash lengths</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Supported Hash Types</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>MD5</strong>
                <p>32 hex characters. Hashcat: 0, John: raw-md5</p>
              </div>
              <div className={styles.checkItem}>
                <strong>SHA-1</strong>
                <p>40 hex characters. Hashcat: 100, John: raw-sha1</p>
              </div>
              <div className={styles.checkItem}>
                <strong>SHA-256</strong>
                <p>64 hex characters. Hashcat: 1400, John: raw-sha256</p>
              </div>
              <div className={styles.checkItem}>
                <strong>SHA-512</strong>
                <p>128 hex characters. Hashcat: 1700, John: raw-sha512</p>
              </div>
              <div className={styles.checkItem}>
                <strong>bcrypt</strong>
                <p>Starts with $2a$, $2b$, or $2y$. Hashcat: 3200</p>
              </div>
              <div className={styles.checkItem}>
                <strong>NTLM</strong>
                <p>32 hex characters (Windows). Hashcat: 1000</p>
              </div>
            </div>

            <h4 className={styles.subsectionTitle}>Example</h4>
            <CodeWindow>
              {`Input: 5d41402abc4b2a76b9719d911017c592

Possible Types:
  ✓ MD5 (Most Likely)
    - Length: 32 characters
    - Hashcat mode: 0
    - John format: raw-md5
  
  ? NTLM (Possible)
    - Same length as MD5
    - Hashcat mode: 1000
    - John format: nt`}
            </CodeWindow>

            <Link to="/hash-identifier" className={styles.toolLink}>
              Try Hash Identifier →
            </Link>
          </div>
        </section>

        <section id="network" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Network size={32} />
            <h2 className={styles.sectionTitle}>Network Tools</h2>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>SSL/TLS Inspector</h3>
            <p className={styles.toolDesc}>
              Analyzes SSL/TLS certificates, cipher suites, and protocol versions for any domain.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Verifying SSL certificate validity before deployment</li>
              <li>Checking certificate expiration dates to prevent outages</li>
              <li>Auditing cipher suite strength for compliance</li>
              <li>Identifying deprecated TLS versions in legacy systems</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Analysis Points</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Certificate Validity</strong>
                <p>
                  Checks issuer, subject, and expiration. Invalid certificates trigger browser warnings and break trust.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>Cipher Suite Strength</strong>
                <p>Identifies weak ciphers like RC4 or DES. Modern sites should use AES-GCM or ChaCha20.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>TLS Version</strong>
                <p>Ensures TLS 1.2+ is used. TLS 1.0 and 1.1 are deprecated and vulnerable to attacks.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Certificate Chain</strong>
                <p>Validates complete chain to root CA. Broken chains cause "untrusted" errors in browsers.</p>
              </div>
            </div>

            <Link to="/ssl-inspector" className={styles.toolLink}>
              Try SSL Inspector →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Certificate Decoder</h3>
            <p className={styles.toolDesc}>
              Decodes X.509 certificates in PEM or DER format, displaying all fields and extensions.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Examining certificate details before installation</li>
              <li>Debugging certificate mismatch errors</li>
              <li>Verifying SAN (Subject Alternative Names) for multi-domain certificates</li>
              <li>Learning X.509 certificate structure and extensions</li>
            </ul>

            <Link to="/certificate-decoder" className={styles.toolLink}>
              Try Certificate Decoder →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>DNS Lookup</h3>
            <p className={styles.toolDesc}>Queries DNS records (A, AAAA, MX, TXT, NS, CNAME) with TTL information.</p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Verifying domain configuration after DNS changes</li>
              <li>Troubleshooting email delivery by checking MX records</li>
              <li>Analyzing DNS propagation across nameservers</li>
              <li>Security research on domain infrastructure</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Record Types</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>A / AAAA Records</strong>
                <p>
                  Maps domain to IPv4 (A) or IPv6 (AAAA) addresses. Essential for routing traffic to correct servers.
                </p>
              </div>
              <div className={styles.checkItem}>
                <strong>MX Records</strong>
                <p>Specifies mail servers for domain. Priority values determine failover order.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>TXT Records</strong>
                <p>Stores arbitrary text. Used for SPF, DKIM, domain verification, and security policies.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>CNAME Records</strong>
                <p>Creates domain aliases. Often used for www subdomain or CDN configurations.</p>
              </div>
            </div>

            <Link to="/dns-lookup" className={styles.toolLink}>
              Try DNS Lookup →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>CORS Checker</h3>
            <p className={styles.toolDesc}>
              Analyzes Cross-Origin Resource Sharing headers and identifies configuration issues.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Debugging API access errors in browser applications</li>
              <li>Verifying CORS configuration before production release</li>
              <li>Security auditing of cross-origin policies</li>
              <li>Testing preflight request handling</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Common Issues</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Wildcard with Credentials</strong>
                <p>Access-Control-Allow-Origin: * cannot be used with credentials. Specify exact origins instead.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Missing Preflight Headers</strong>
                <p>OPTIONS requests must return Access-Control-Allow-Methods and Access-Control-Allow-Headers.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Overly Permissive Origins</strong>
                <p>Allowing all origins exposes APIs to unauthorized access. Whitelist specific trusted domains.</p>
              </div>
            </div>

            <Link to="/cors-checker" className={styles.toolLink}>
              Try CORS Checker →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Subnet Calculator</h3>
            <p className={styles.toolDesc}>
              Calculates network address, broadcast address, and usable host range from IP and CIDR notation.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Planning IP address allocation for networks</li>
              <li>Configuring firewall rules and VPC settings</li>
              <li>Troubleshooting network connectivity issues</li>
              <li>Learning IPv4 subnetting concepts</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Example Calculation</h4>
            <CodeWindow>
              {`Input: 192.168.1.0/24

Network Address: 192.168.1.0
First Usable Host: 192.168.1.1
Last Usable Host: 192.168.1.254
Broadcast Address: 192.168.1.255

Total Hosts: 256
Usable Hosts: 254
Subnet Mask: 255.255.255.0
Wildcard Mask: 0.0.0.255`}
            </CodeWindow>

            <Link to="/subnet-calculator" className={styles.toolLink}>
              Try Subnet Calculator →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>URL Parser</h3>
            <p className={styles.toolDesc}>
              Parses URLs into components (protocol, hostname, path, query parameters) with security warnings.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Debugging URL routing issues in applications</li>
              <li>Analyzing query parameter structure in APIs</li>
              <li>Security testing for open redirect vulnerabilities</li>
              <li>Learning URL structure and encoding</li>
            </ul>

            <Link to="/url-parser" className={styles.toolLink}>
              Try URL Parser →
            </Link>
          </div>
        </section>

        <section id="testing" className={styles.section}>
          <div className={styles.sectionHeader}>
            <TestTube size={32} />
            <h2 className={styles.sectionTitle}>Testing & Validation Tools</h2>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>HTTP Request Builder</h3>
            <p className={styles.toolDesc}>
              Constructs and sends HTTP requests with custom headers, methods, and body content.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Testing REST API endpoints during development</li>
              <li>Debugging authentication flows and token headers</li>
              <li>Verifying CORS and security header responses</li>
              <li>Testing rate limiting and error handling</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Supported Methods</h4>
            <div className={styles.methodGrid}>
              <div className={styles.method}>GET</div>
              <div className={styles.method}>POST</div>
              <div className={styles.method}>PUT</div>
              <div className={styles.method}>DELETE</div>
              <div className={styles.method}>PATCH</div>
              <div className={styles.method}>OPTIONS</div>
            </div>

            <Link to="/http-builder" className={styles.toolLink}>
              Try HTTP Builder →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Regex Tester</h3>
            <p className={styles.toolDesc}>
              Tests regular expressions with real-time match highlighting and capture group extraction.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Developing input validation patterns for forms</li>
              <li>Testing log parsing expressions before production</li>
              <li>Debugging complex regex patterns in security rules</li>
              <li>Learning regex syntax and special characters</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Example Pattern</h4>
            <CodeWindow>
              {`Pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
Test: user@example.com
Match: ✓ Valid email format

Explanation:
  ^                   Start of string
  [a-zA-Z0-9._%+-]+  Local part (before @)
  @                   Literal @ symbol
  [a-zA-Z0-9.-]+     Domain name
  \\.                  Literal dot
  [a-zA-Z]{2,}       TLD (2+ letters)
  $                   End of string`}
            </CodeWindow>

            <Link to="/regex-tester" className={styles.toolLink}>
              Try Regex Tester →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Data Sanitizer</h3>
            <p className={styles.toolDesc}>
              Sanitizes user input to prevent XSS, SQL injection, and other injection attacks.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Testing input sanitization logic before deployment</li>
              <li>Demonstrating attack vectors in security training</li>
              <li>Validating third-party library sanitization effectiveness</li>
              <li>Quick sanitization of untrusted content</li>
            </ul>

            <h4 className={styles.subsectionTitle}>Sanitization Types</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>HTML Sanitization</strong>
                <p>Removes script tags, event handlers, and dangerous attributes. Allows safe HTML formatting.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>SQL Escaping</strong>
                <p>Escapes quotes and special characters. Prevents SQL injection in dynamic queries.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>JavaScript Escaping</strong>
                <p>Escapes quotes and control characters for safe embedding in JavaScript strings.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>URL Encoding</strong>
                <p>Encodes special characters for safe use in URLs and query parameters.</p>
              </div>
            </div>

            <Link to="/data-sanitizer" className={styles.toolLink}>
              Try Data Sanitizer →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>API Security Tester</h3>
            <p className={styles.toolDesc}>
              Tests API endpoints for authentication bypass, rate limiting, and common vulnerabilities.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Pre-deployment security validation of new APIs</li>
              <li>Bug bounty testing for authorization flaws</li>
              <li>Verifying rate limiting implementation</li>
              <li>Testing authentication and session handling</li>
            </ul>

            <Link to="/api-security" className={styles.toolLink}>
              Try API Security Tester →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Privacy Analyzer</h3>
            <p className={styles.toolDesc}>
              Analyzes websites for tracking scripts, third-party resources, and privacy compliance.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>GDPR compliance auditing before launch</li>
              <li>Identifying hidden tracking and analytics scripts</li>
              <li>Verifying third-party resource loading</li>
              <li>Privacy impact assessment documentation</li>
            </ul>

            <Link to="/privacy-analyzer" className={styles.toolLink}>
              Try Privacy Analyzer →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>Text Diff Tool</h3>
            <p className={styles.toolDesc}>
              Compares two texts and highlights differences with line-by-line visualization.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Comparing configuration file changes before deployment</li>
              <li>Reviewing API response differences between versions</li>
              <li>Validating data transformation accuracy</li>
              <li>Code review and change detection</li>
            </ul>

            <Link to="/text-diff" className={styles.toolLink}>
              Try Text Diff →
            </Link>
          </div>

          <div className={styles.tool}>
            <h3 className={styles.toolTitle}>UUID Generator</h3>
            <p className={styles.toolDesc}>
              Generates UUIDs in v1 (timestamp-based) and v4 (random) formats with bulk generation support.
            </p>

            <h4 className={styles.subsectionTitle}>Use Cases</h4>
            <ul className={styles.list}>
              <li>Generating unique identifiers for database records</li>
              <li>Creating session IDs and API keys</li>
              <li>Testing systems that require UUID input</li>
              <li>Bulk UUID generation for data seeding</li>
            </ul>

            <h4 className={styles.subsectionTitle}>UUID Versions</h4>
            <div className={styles.checkList}>
              <div className={styles.checkItem}>
                <strong>Version 1 (Timestamp)</strong>
                <p>Includes timestamp and MAC address. Sortable by creation time but may leak host information.</p>
              </div>
              <div className={styles.checkItem}>
                <strong>Version 4 (Random)</strong>
                <p>
                  Purely random generation. Preferred for most use cases due to better privacy and unpredictability.
                </p>
              </div>
            </div>

            <Link to="/uuid-generator" className={styles.toolLink}>
              Try UUID Generator →
            </Link>
          </div>
        </section>

        <section className={styles.disclaimer}>
          <div className={styles.disclaimerHeader}>
            <AlertTriangle size={24} />
            <h2 className={styles.disclaimerTitle}>Important Notes</h2>
          </div>
          <div className={styles.disclaimerContent}>
            <h3>Privacy & Security</h3>
            <p>
              All tools run entirely in your browser. No data is sent to external servers or stored remotely. Your
              sensitive information never leaves your device.
            </p>

            <h3>Educational Purpose</h3>
            <p>
              These tools are designed for security education, testing your own applications, and defensive security.
              Always obtain proper authorization before testing websites or systems you do not own.
            </p>

            <h3>No Warranty</h3>
            <p>
              Tools are provided as-is for educational purposes. While we strive for accuracy, always verify results
              with production-grade security tools before making critical decisions.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
