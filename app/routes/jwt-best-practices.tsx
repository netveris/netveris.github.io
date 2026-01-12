import type { Route } from './+types/jwt-best-practices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Alert, AlertDescription } from '~/components/ui/alert/alert';
import { ToolHeader } from '~/components/tool-header';
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Key, Clock, Database } from 'lucide-react';
import { Button } from '~/components/ui/button/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion/accordion';
import styles from './jwt-best-practices.module.css';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'JWT Best Practices - Netveris' },
    { name: 'description', content: 'Learn JWT security best practices and common vulnerabilities' },
  ];
};

export default function JWTBestPractices() {
  return (
    <div className={styles.container}>
      <ToolHeader
        title="JWT Security Best Practices"
        description="Comprehensive guide to secure JWT implementation and common pitfalls"
        icon={<Shield />}
      />
      
      <div className={styles.header}>
        <Shield className={styles.headerIcon} />
        <h1 className={styles.title}>JWT Security Best Practices</h1>
        <p className={styles.subtitle}>
          Learn how to implement and secure JSON Web Tokens correctly
        </p>
      </div>

      <div className={styles.content}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>What is JWT?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.introParagraph}>
              JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way 
              for securely transmitting information between parties as a JSON object. This information can be 
              verified and trusted because it is digitally signed.
            </p>
            <div className={styles.structure}>
              <h4>JWT Structure</h4>
              <div className={styles.jwtParts}>
                <div className={styles.jwtPart} data-type="header">
                  <span className={styles.partLabel}>Header</span>
                  <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</code>
                </div>
                <div className={styles.jwtPart} data-type="payload">
                  <span className={styles.partLabel}>Payload</span>
                  <code>eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ</code>
                </div>
                <div className={styles.jwtPart} data-type="signature">
                  <span className={styles.partLabel}>Signature</span>
                  <code>SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>
              <CheckCircle className={styles.titleIcon} />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className={styles.accordion}>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className={styles.accordionTitle}>
                    <Key size={18} />
                    Use Strong Secret Keys
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>Use cryptographically secure random keys (minimum 256 bits for HS256)</li>
                      <li>Never hardcode secrets in your source code</li>
                      <li>Store secrets in environment variables or secure key management systems</li>
                      <li>Rotate keys regularly and have a key rotation strategy</li>
                      <li>Use different keys for different environments (dev, staging, production)</li>
                    </ul>
                    <Alert className={styles.exampleAlert}>
                      <AlertDescription>
                        <strong>Good:</strong> <code>process.env.JWT_SECRET</code><br />
                        <strong>Bad:</strong> <code>const secret = 'mysecret123'</code>
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className={styles.accordionTitle}>
                    <Clock size={18} />
                    Set Appropriate Expiration Times
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>Always set an expiration time (exp claim)</li>
                      <li>Keep expiration times short (15 minutes to 1 hour for access tokens)</li>
                      <li>Use refresh tokens for long-lived sessions</li>
                      <li>Implement token refresh mechanism</li>
                      <li>Consider the security vs. user experience trade-off</li>
                    </ul>
                    <Alert className={styles.exampleAlert}>
                      <AlertDescription>
                        <strong>Recommended:</strong><br />
                        Access Token: 15-60 minutes<br />
                        Refresh Token: 7-30 days<br />
                        Remember Me: 30-90 days
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className={styles.accordionTitle}>
                    <Lock size={18} />
                    Use Secure Algorithms
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>Prefer asymmetric algorithms (RS256, ES256) over symmetric (HS256)</li>
                      <li>Never use "none" algorithm in production</li>
                      <li>Explicitly specify allowed algorithms in verification</li>
                      <li>Avoid deprecated algorithms (HS384, RS384)</li>
                      <li>Use ES256 for better performance with similar security</li>
                    </ul>
                    <div className={styles.algorithmComparison}>
                      <div className={styles.algorithmItem} data-type="good">
                        <CheckCircle size={16} />
                        <span>RS256, ES256, PS256</span>
                      </div>
                      <div className={styles.algorithmItem} data-type="ok">
                        <AlertTriangle size={16} />
                        <span>HS256 (with strong secret)</span>
                      </div>
                      <div className={styles.algorithmItem} data-type="bad">
                        <XCircle size={16} />
                        <span>none, HS384, RS384</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  <div className={styles.accordionTitle}>
                    <Database size={18} />
                    Validate All Claims
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>Always validate the signature</li>
                      <li>Check expiration time (exp)</li>
                      <li>Verify issuer (iss) matches expected value</li>
                      <li>Validate audience (aud) for the correct recipient</li>
                      <li>Check not-before time (nbf) if present</li>
                      <li>Validate any custom claims your application requires</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  <div className={styles.accordionTitle}>
                    <Shield size={18} />
                    Don't Store Sensitive Data
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>JWTs are base64 encoded, not encrypted</li>
                      <li>Never include passwords, credit card numbers, or PII</li>
                      <li>Keep payload minimal (only necessary claims)</li>
                      <li>Consider using JWE (JSON Web Encryption) for sensitive data</li>
                      <li>Remember: anyone can decode and read the payload</li>
                    </ul>
                    <Alert className={styles.dangerAlert}>
                      <AlertTriangle size={18} />
                      <AlertDescription>
                        <strong>Warning:</strong> JWT payload is visible to anyone. Only include non-sensitive 
                        information like user ID, roles, and permissions.
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>
              <XCircle className={styles.titleIcon} />
              Common Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.vulnerabilities}>
              <div className={styles.vulnerability}>
                <h4>Algorithm Confusion Attack</h4>
                <p>
                  Attacker changes algorithm from RS256 to HS256, using the public key as the secret. 
                  Always explicitly specify allowed algorithms during verification.
                </p>
              </div>

              <div className={styles.vulnerability}>
                <h4>None Algorithm Attack</h4>
                <p>
                  Attacker sets algorithm to "none" to bypass signature verification. 
                  Never accept unsigned JWTs in production.
                </p>
              </div>

              <div className={styles.vulnerability}>
                <h4>Weak Secret Keys</h4>
                <p>
                  Using predictable or short secrets makes tokens vulnerable to brute force attacks. 
                  Always use cryptographically secure random keys.
                </p>
              </div>

              <div className={styles.vulnerability}>
                <h4>Missing Expiration</h4>
                <p>
                  Tokens without expiration remain valid forever. Always set appropriate exp claims 
                  and implement token refresh mechanisms.
                </p>
              </div>

              <div className={styles.vulnerability}>
                <h4>Storing in Local Storage</h4>
                <p>
                  Local storage is vulnerable to XSS attacks. Consider using httpOnly cookies for 
                  maximum security, or sessionStorage as a compromise.
                </p>
              </div>

              <div className={styles.vulnerability}>
                <h4>No Token Revocation</h4>
                <p>
                  JWTs cannot be revoked once issued. Implement a token blacklist or use short-lived 
                  tokens with refresh token rotation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Implementation Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.checklist}>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Use strong, randomly generated secret keys (256+ bits)</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Set appropriate expiration times (15-60 min for access tokens)</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Use secure algorithms (RS256, ES256)</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Validate all claims (exp, iss, aud, nbf)</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Implement refresh token mechanism</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Store tokens securely (httpOnly cookies preferred)</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Never include sensitive data in payload</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Implement token revocation strategy</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Use HTTPS for all token transmission</span>
              </div>
              <div className={styles.checklistItem}>
                <CheckCircle size={18} />
                <span>Regularly rotate secret keys</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
