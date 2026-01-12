import { useState } from "react";
import { Link } from "react-router";
import { Shield, ArrowLeft, AlertCircle, Lock, FileText, Key, Info } from "lucide-react";
import { CodeBlock } from "../components/code-block";
import { ToolHeader } from "~/components/tool-header";
import { decodeJWT } from "../utils/jwt-decoder";
import { ThemeToggle } from "~/components/theme-toggle";
import styles from "./jwt-analyzer.module.css";

export default function JwtAnalyzer() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<ReturnType<typeof decodeJWT> | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    setError("");
    setDecoded(null);

    if (!token.trim()) {
      setError("Please enter a JWT token");
      return;
    }

    try {
      const result = decodeJWT(token.trim());
      setDecoded(result);
    } catch (err) {
      setError("Invalid JWT token format. Please check your token and try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>
            <Shield size={36} />
            JWT Token Analyzer
          </h1>
          <p className={styles.subtitle}>
            Decode and analyze JWT tokens. View header, payload, and signature components with detailed explanations.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FileText size={24} />
            Paste JWT Token
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>JWT Token</label>
            <textarea
              className={styles.textarea}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              style={{ minHeight: "150px" }}
            />
          </div>

          <button className={styles.analyzeButton} onClick={handleAnalyze}>
            <Shield size={20} />
            Analyze JWT Token
          </button>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {decoded && (
          <>
            <div className={styles.partsGrid}>
              <div className={`${styles.partCard} ${styles.partHeader}`}>
                <h3 className={styles.partTitle}>
                  <Lock size={20} />
                  Header
                </h3>
                <p className={styles.partDescription}>
                  Contains metadata about the token, including the signing algorithm and token type.
                </p>
                <CodeBlock
                  code={JSON.stringify(decoded.header, null, 2)}
                  language="json"
                />
              </div>

              <div className={`${styles.partCard} ${styles.partPayload}`}>
                <h3 className={styles.partTitle}>
                  <FileText size={20} />
                  Payload
                </h3>
                <p className={styles.partDescription}>
                  Contains claims (statements about the user and additional data). This data is readable by anyone.
                </p>
                <CodeBlock
                  code={JSON.stringify(decoded.payload, null, 2)}
                  language="json"
                />
              </div>

              <div className={`${styles.partCard} ${styles.partSignature}`}>
                <h3 className={styles.partTitle}>
                  <Key size={20} />
                  Signature
                </h3>
                <p className={styles.partDescription}>
                  Ensures the token hasn't been tampered with. Created by encoding the header and payload with a secret key.
                </p>
                <CodeBlock
                  code={decoded.signature}
                  language="text"
                />
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.explainerSection}>
                <h3 className={styles.explainerTitle}>
                  <Info size={20} />
                  How JWT Works
                </h3>
                <p className={styles.explainerText}>
                  <strong>1. Header:</strong> The header typically consists of two parts: the type of token (JWT) and the signing algorithm (e.g., HMAC SHA256 or RSA).
                </p>
                <CodeBlock
                  code={`{
  "alg": "HS256",  // Algorithm: HMAC with SHA-256
  "typ": "JWT"     // Token type: JSON Web Token
}`}
                />

                <p className={styles.explainerText}>
                  <strong>2. Payload:</strong> The payload contains the claims. Claims are statements about an entity (typically, the user) and additional metadata. There are three types of claims: registered, public, and private claims.
                </p>
                <CodeBlock
                  code={`{
  "sub": "1234567890",        // Subject: user identifier
  "name": "John Doe",         // Custom claim: user's name
  "iat": 1516239022,          // Issued At: when token was created
  "exp": 1516242622,          // Expiration: when token expires
  "role": "admin"             // Custom claim: user role
}`}
                />

                <p className={styles.explainerText}>
                  <strong>3. Signature:</strong> The signature is created by taking the encoded header, encoded payload, a secret key, and the algorithm specified in the header. This ensures the token hasn't been altered.
                </p>
                <CodeBlock
                  code={`// Signature creation algorithm
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)

// Example in Node.js
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', 'your-secret-key')
  .update(encodedHeader + '.' + encodedPayload)
  .digest('base64url');`}
                />

                <p className={styles.explainerText}>
                  <strong>Security Note:</strong> The header and payload are only base64-encoded, not encrypted. Anyone can decode and read them. The signature ensures integrity but not confidentiality. Never store sensitive data like passwords in the payload.
                </p>

                <CodeBlock
                  code={`const jwt = require('jsonwebtoken');

app.get('/protected', (req, res) => {
  // Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    // Verify token signature and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Token is valid, proceed with request
    res.json({
      message: 'Access granted',
      user: decoded
    });
  } catch (error) {
    // Invalid token
    res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
});`}
                />

                <CodeBlock
                  code={`{
  // Registered Claims (standardized)
  "iss": "https://auth.example.com",  // Issuer
  "sub": "user-123",                  // Subject (user ID)
  "aud": "https://api.example.com",   // Audience
  "exp": 1735689600,                  // Expiration Time
  "nbf": 1735686000,                  // Not Before
  "iat": 1735686000,                  // Issued At
  "jti": "abc123",                    // JWT ID
  
  // Private Claims (custom)
  "username": "john_doe",
  "email": "john@example.com",
  "role": "admin",
  "permissions": ["read", "write", "delete"]
}`}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
