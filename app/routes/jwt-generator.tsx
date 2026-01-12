import { useState } from "react";
import { Link } from "react-router";
import { KeyRound, Settings, FileJson, ArrowLeft, Info, Key } from "lucide-react";
import { CodeBlock } from "../components/code-block";
import { ToolHeader } from "~/components/tool-header";
import { ThemeToggle } from "~/components/theme-toggle";
import styles from "./jwt-generator.module.css";

export default function JwtGenerator() {
  const [algorithm, setAlgorithm] = useState("HS256");
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [header, setHeader] = useState(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
  const [payload, setPayload] = useState(
    JSON.stringify(
      {
        sub: "1234567890",
        name: "John Doe",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      null,
      2
    )
  );
  const [generatedToken, setGeneratedToken] = useState("");

  const handleGenerate = async () => {
    try {
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);

      // Base64url encoding
      const base64url = (buffer: ArrayBuffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      };

      const textEncoder = new TextEncoder();
      const encodedHeader = base64url(textEncoder.encode(JSON.stringify(headerObj)).buffer);
      const encodedPayload = base64url(textEncoder.encode(JSON.stringify(payloadObj)).buffer);

      const data = `${encodedHeader}.${encodedPayload}`;

      let signature = '';
      
      // Generate real signature based on algorithm
      if (algorithm.startsWith('HS')) {
        // HMAC signing
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          textEncoder.encode(secret),
          { name: 'HMAC', hash: algorithm === 'HS256' ? 'SHA-256' : algorithm === 'HS384' ? 'SHA-384' : 'SHA-512' },
          false,
          ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign(
          'HMAC',
          keyMaterial,
          textEncoder.encode(data)
        );

        signature = base64url(signatureBuffer);
      } else if (algorithm === 'none') {
        // No signature
        signature = '';
      } else {
        // For RS256 and other asymmetric algorithms, show a note
        alert(`${algorithm} requires RSA key pair. For this demo, generating an unsigned token. Use a proper JWT library for production.`);
        signature = '';
      }

      const token = signature ? `${data}.${signature}` : `${data}.`;
      setGeneratedToken(token);
    } catch (error) {
      alert(`Error generating token: ${error instanceof Error ? error.message : 'Invalid JSON in header or payload'}`);
    }
  };

  const handleAlgorithmChange = (newAlg: string) => {
    setAlgorithm(newAlg);
    try {
      const headerObj = JSON.parse(header);
      headerObj.alg = newAlg;
      setHeader(JSON.stringify(headerObj, null, 2));
    } catch (error) {
      // Invalid JSON, ignore
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="JWT Token Generator"
        description="Create custom JWT tokens for testing and development with configurable header, payload, and signing algorithm"
        icon={<KeyRound />}
      />

      <div className={styles.content}>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Settings size={24} />
              Configuration
            </h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Algorithm</label>
              <select className={styles.select} value={algorithm} onChange={(e) => handleAlgorithmChange(e.target.value)}>
                <option value="HS256">HS256 (HMAC + SHA256)</option>
                <option value="HS384">HS384 (HMAC + SHA384)</option>
                <option value="HS512">HS512 (HMAC + SHA512)</option>
                <option value="RS256">RS256 (RSA + SHA256)</option>
                <option value="none">none (No signature)</option>
              </select>
              <p className={styles.hint}>Choose the signing algorithm for your JWT</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Secret Key</label>
              <input
                type="text"
                className={styles.input}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key"
              />
              <p className={styles.hint}>Secret used to sign the token (for HMAC algorithms)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Header (JSON)</label>
              <textarea
                className={styles.textarea}
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                placeholder='{"alg": "HS256", "typ": "JWT"}'
              />
              <p className={styles.hint}>JWT header defines the token type and signing algorithm</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Payload (JSON)</label>
              <textarea
                className={styles.textarea}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"sub": "1234567890", "name": "John Doe"}'
                style={{ minHeight: "180px" }}
              />
              <p className={styles.hint}>JWT payload contains claims (user data, permissions, etc.)</p>
            </div>

            <button className={styles.generateButton} onClick={handleGenerate}>
              <KeyRound size={20} />
              Generate JWT Token
            </button>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <FileJson size={24} />
              Generated Token
            </h2>

            {generatedToken ? (
              <>
                <div className={styles.outputSection}>
                  <div className={styles.outputHeader}>
                    <span className={styles.outputLabel}>JWT Token</span>
                  </div>
                  <div className={styles.tokenBox}>{generatedToken}</div>
                </div>

                <CodeBlock
                  code={`// HTTP Request with JWT
fetch('https://api.example.com/user', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ${generatedToken.substring(0, 50)}...',
    'Content-Type': 'application/json'
  }
});`}
                />

                <CodeBlock
                  code={`const jwt = require('jsonwebtoken');

// Verify and decode JWT
try {
  const decoded = jwt.verify(
    token,
    '${secret}',
    { algorithms: ['${algorithm}'] }
  );
  console.log('Valid token:', decoded);
} catch (error) {
  console.error('Invalid token:', error.message);
}`}
                />
              </>
            ) : (
              <div className={styles.info}>
                <div className={styles.infoTitle}>
                  <Info size={16} />
                  How to use
                </div>
                <p className={styles.infoText}>
                  1. Configure the algorithm and secret key
                  <br />
                  2. Customize the header and payload JSON
                  <br />
                  3. Click "Generate JWT Token" to create your token
                  <br />
                  4. Use the generated token for testing APIs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
