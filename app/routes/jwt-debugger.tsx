import { useState } from 'react';
import type { Route } from './+types/jwt-debugger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Label } from '~/components/ui/label/label';
import { Input } from '~/components/ui/input/input';
import { Button } from '~/components/ui/button/button';
import { Alert, AlertDescription } from '~/components/ui/alert/alert';
import { ToolHeader } from '~/components/tool-header';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { CodeBlock } from '~/components/code-block';
import { decodeJWT } from '~/utils/jwt-decoder';
import styles from './jwt-debugger.module.css';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'JWT Debugger - Netveris' },
    { name: 'description', content: 'Debug and validate JWT tokens with signature verification and expiry checking' },
  ];
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

function validateJWT(token: string, secret?: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  try {
    const decoded = decodeJWT(token);
    
    if (!decoded) {
      result.errors.push('Failed to decode JWT');
      result.isValid = false;
      return result;
    }
    
    // Check expiration
    if (decoded.payload.exp) {
      const expirationDate = new Date(decoded.payload.exp * 1000);
      const now = new Date();
      
      if (expirationDate < now) {
        result.errors.push(`Token expired on ${expirationDate.toLocaleString()}`);
        result.isValid = false;
      } else {
        const timeLeft = expirationDate.getTime() - now.getTime();
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const daysLeft = Math.floor(hoursLeft / 24);
        
        if (daysLeft > 0) {
          result.info.push(`Token valid for ${daysLeft} days`);
        } else if (hoursLeft > 0) {
          result.info.push(`Token valid for ${hoursLeft} hours`);
        } else {
          const minutesLeft = Math.floor(timeLeft / (1000 * 60));
          result.warnings.push(`Token expires in ${minutesLeft} minutes`);
        }
      }
    } else {
      result.warnings.push('No expiration time (exp) claim found');
    }

    // Check not before
    if (decoded.payload.nbf) {
      const notBeforeDate = new Date(decoded.payload.nbf * 1000);
      const now = new Date();
      
      if (notBeforeDate > now) {
        result.errors.push(`Token not valid until ${notBeforeDate.toLocaleString()}`);
        result.isValid = false;
      }
    }

    // Check issued at
    if (decoded.payload.iat) {
      const issuedDate = new Date(decoded.payload.iat * 1000);
      result.info.push(`Token issued on ${issuedDate.toLocaleString()}`);
    } else {
      result.warnings.push('No issued at (iat) claim found');
    }

    // Check algorithm
    if (decoded.header.alg === 'none') {
      result.errors.push('Algorithm is "none" - this is insecure!');
      result.isValid = false;
    } else if (decoded.header.alg.startsWith('HS')) {
      result.info.push(`Using HMAC algorithm: ${decoded.header.alg}`);
      if (!secret) {
        result.warnings.push('Secret key required to verify HMAC signature');
      }
    } else if (decoded.header.alg.startsWith('RS') || decoded.header.alg.startsWith('ES')) {
      result.info.push(`Using asymmetric algorithm: ${decoded.header.alg}`);
    }

    // Check for standard claims
    if (!decoded.payload.sub && !decoded.payload.user_id) {
      result.warnings.push('No subject (sub) or user_id claim found');
    }
    
    if (!decoded.payload.iss) {
      result.warnings.push('No issuer (iss) claim found');
    }
    
    if (!decoded.payload.aud) {
      result.warnings.push('No audience (aud) claim found');
    }

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Invalid JWT format');
    result.isValid = false;
  }

  return result;
}

export default function JWTDebugger() {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [decodedHeader, setDecodedHeader] = useState<string>('');
  const [decodedPayload, setDecodedPayload] = useState<string>('');

  const handleDebug = () => {
    try {
      const decoded = decodeJWT(token);
      if (!decoded) {
        throw new Error('Failed to decode JWT');
      }
      setDecodedHeader(JSON.stringify(decoded.header, null, 2));
      setDecodedPayload(JSON.stringify(decoded.payload, null, 2));
      setValidation(validateJWT(token, secret));
    } catch (error) {
      setDecodedHeader('');
      setDecodedPayload('');
      setValidation({
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Failed to decode JWT'],
        warnings: [],
        info: [],
      });
    }
  };

  const handleClear = () => {
    setToken('');
    setSecret('');
    setValidation(null);
    setDecodedHeader('');
    setDecodedPayload('');
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="JWT Debugger"
        description="Debug and validate JWT tokens with real-time feedback"
        icon={<Shield />}
      />

      <div className={styles.content}>
        <div className={styles.grid}>
          <Card className={styles.card}>
            <CardHeader>
              <CardTitle>JWT Input</CardTitle>
              <CardDescription>
                Paste your JWT token to debug and validate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.inputSection}>
                <Label htmlFor="token">JWT Token</Label>
                <Textarea
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={6}
                  className={styles.textarea}
                />

                <Label htmlFor="secret">Secret Key (Optional)</Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret for HMAC verification..."
                  className={styles.input}
                />

                <div className={styles.buttonGroup}>
                  <Button onClick={handleDebug} className={styles.button}>
                    Debug Token
                  </Button>
                  <Button onClick={handleClear} variant="outline">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {validation && (
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.validationSection}>
                  <div className={styles.statusBadge} data-valid={validation.isValid}>
                    {validation.isValid ? (
                      <>
                        <CheckCircle size={20} />
                        Token Valid
                      </>
                    ) : (
                      <>
                        <XCircle size={20} />
                        Token Invalid
                      </>
                    )}
                  </div>

                  {validation.errors.length > 0 && (
                    <div className={styles.messageGroup}>
                      <h4 className={styles.messageTitle}>
                        <XCircle size={16} className={styles.errorIcon} />
                        Errors
                      </h4>
                      <ul className={styles.messageList}>
                        {validation.errors.map((error, index) => (
                          <li key={index} className={styles.errorItem}>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div className={styles.messageGroup}>
                      <h4 className={styles.messageTitle}>
                        <AlertTriangle size={16} className={styles.warningIcon} />
                        Warnings
                      </h4>
                      <ul className={styles.messageList}>
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className={styles.warningItem}>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.info.length > 0 && (
                    <div className={styles.messageGroup}>
                      <h4 className={styles.messageTitle}>
                        <Clock size={16} className={styles.infoIcon} />
                        Information
                      </h4>
                      <ul className={styles.messageList}>
                        {validation.info.map((info, index) => (
                          <li key={index} className={styles.infoItem}>
                            {info}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {decodedHeader && decodedPayload && (
          <div className={styles.decodedSection}>
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>Decoded Header</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={decodedHeader} language="json" />
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>Decoded Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={decodedPayload} language="json" />
              </CardContent>
            </Card>
          </div>
        )}

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>JWT Claims Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.claimsReference}>
              <div className={styles.claimItem}>
                <code>iss</code>
                <span>Issuer - identifies the principal that issued the JWT</span>
              </div>
              <div className={styles.claimItem}>
                <code>sub</code>
                <span>Subject - identifies the principal that is the subject of the JWT</span>
              </div>
              <div className={styles.claimItem}>
                <code>aud</code>
                <span>Audience - identifies the recipients that the JWT is intended for</span>
              </div>
              <div className={styles.claimItem}>
                <code>exp</code>
                <span>Expiration Time - identifies the expiration time after which the JWT must not be accepted</span>
              </div>
              <div className={styles.claimItem}>
                <code>nbf</code>
                <span>Not Before - identifies the time before which the JWT must not be accepted</span>
              </div>
              <div className={styles.claimItem}>
                <code>iat</code>
                <span>Issued At - identifies the time at which the JWT was issued</span>
              </div>
              <div className={styles.claimItem}>
                <code>jti</code>
                <span>JWT ID - provides a unique identifier for the JWT</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
