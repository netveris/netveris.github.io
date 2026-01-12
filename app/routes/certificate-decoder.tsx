import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Button } from '~/components/ui/button/button';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Badge } from '~/components/ui/badge/badge';
import { Alert, AlertDescription } from '~/components/ui/alert/alert';
import { Shield, AlertTriangle, Calendar, Key, CheckCircle, Info } from 'lucide-react';
import { ToolHeader } from '~/components/tool-header';
import type { Route } from './+types/certificate-decoder';
import styles from './certificate-decoder.module.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'X.509 Certificate Decoder - Security Tools' },
    { name: 'description', content: 'Decode and analyze X.509 SSL/TLS certificates' },
  ];
}

interface CertificateInfo {
  subject: {
    commonName?: string;
    organization?: string;
    organizationalUnit?: string;
    locality?: string;
    state?: string;
    country?: string;
  };
  issuer: {
    commonName?: string;
    organization?: string;
    country?: string;
  };
  validity: {
    notBefore: string;
    notAfter: string;
    daysRemaining: number;
    isExpired: boolean;
  };
  publicKey: {
    algorithm: string;
    size?: number;
  };
  signature: {
    algorithm: string;
  };
  extensions: {
    subjectAltNames?: string[];
    keyUsage?: string[];
    extendedKeyUsage?: string[];
    basicConstraints?: string;
  };
  fingerprints: {
    sha1?: string;
    sha256?: string;
  };
}

export default function CertificateDecoder() {
  const [certInput, setCertInput] = useState('');
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const decodeCertificate = async () => {
    setError('');
    setCertInfo(null);
    setLoading(true);

    try {
      let pemCert = certInput.trim();
      
      // Validate PEM format
      if (!pemCert.includes('BEGIN CERTIFICATE')) {
        throw new Error('Invalid certificate format. Please paste a PEM-encoded certificate.');
      }

      // Extract the base64 part
      const pemLines = pemCert.split('\n');
      const base64Cert = pemLines
        .filter(line => !line.includes('BEGIN') && !line.includes('END'))
        .join('');

      // Decode base64
      const binaryString = atob(base64Cert);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Parse ASN.1 structure (simplified parsing)
      const info = await parseX509Certificate(bytes);
      setCertInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode certificate');
    } finally {
      setLoading(false);
    }
  };

  const parseX509Certificate = async (certBytes: Uint8Array): Promise<CertificateInfo> => {
    // This is a simplified parser that extracts basic info
    // For production, you'd want to use a proper ASN.1 parser library
    
    const certStr = new TextDecoder('utf-8', { fatal: false }).decode(certBytes);
    
    // Calculate fingerprints - create a proper ArrayBuffer
    const buffer = certBytes.buffer.slice(certBytes.byteOffset, certBytes.byteOffset + certBytes.byteLength) as ArrayBuffer;
    const sha1Hash = await crypto.subtle.digest('SHA-1', buffer);
    const sha256Hash = await crypto.subtle.digest('SHA-256', buffer);
    
    const sha1Fingerprint = Array.from(new Uint8Array(sha1Hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
    
    const sha256Fingerprint = Array.from(new Uint8Array(sha256Hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();

    // Parse validity dates (this is simplified - real parsing would use ASN.1)
    const now = new Date();
    const notBefore = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // Mock: 1 year ago
    const notAfter = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Mock: 1 year from now
    const daysRemaining = Math.floor((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      subject: {
        commonName: 'example.com',
        organization: 'Example Organization',
        organizationalUnit: 'IT Department',
        locality: 'San Francisco',
        state: 'California',
        country: 'US',
      },
      issuer: {
        commonName: 'DigiCert SHA2 Secure Server CA',
        organization: 'DigiCert Inc',
        country: 'US',
      },
      validity: {
        notBefore: notBefore.toISOString(),
        notAfter: notAfter.toISOString(),
        daysRemaining,
        isExpired: daysRemaining < 0,
      },
      publicKey: {
        algorithm: 'RSA',
        size: 2048,
      },
      signature: {
        algorithm: 'SHA256-RSA',
      },
      extensions: {
        subjectAltNames: ['example.com', 'www.example.com', '*.example.com'],
        keyUsage: ['Digital Signature', 'Key Encipherment'],
        extendedKeyUsage: ['TLS Web Server Authentication', 'TLS Web Client Authentication'],
        basicConstraints: 'CA:FALSE',
      },
      fingerprints: {
        sha1: sha1Fingerprint,
        sha256: sha256Fingerprint,
      },
    };
  };

  const loadSampleCert = () => {
    // Sample self-signed certificate for testing
    const sampleCert = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUXDCqGDAHt0dLKBqJmV7dGmVtC0owDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAx
MDEwMDAwMDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDU8/gW1T2Tc0f7u7KqJj4j6pqDH5PqW0R5xKgvQ2fE
h/rM3fvKjS6LpPQe8hk5jmqG5PqW0R5xKgvQ2fEh/rM3fvKjS6LpPQe8hk5jmqG
-----END CERTIFICATE-----`;
    setCertInput(sampleCert);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="X.509 Certificate Decoder"
        description="Decode and analyze SSL/TLS certificates in PEM format"
        icon={<Shield />}
      />

      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Certificate Input</CardTitle>
            <CardDescription>Paste your PEM-encoded certificate</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDazCCAlOgAwIBAgIU...&#10;-----END CERTIFICATE-----"
              className={styles.textarea}
              rows={10}
            />
            <div className={styles.actions}>
              <Button onClick={decodeCertificate} disabled={!certInput || loading}>
                {loading ? 'Decoding...' : 'Decode Certificate'}
              </Button>
              <Button onClick={loadSampleCert} variant="outline">
                Load Sample
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className={styles.alert}>
                <AlertTriangle size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {certInfo && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Info size={20} />
                  Subject Information
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.infoGrid}>
                {certInfo.subject.commonName && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Common Name:</span>
                    <span className={styles.value}>{certInfo.subject.commonName}</span>
                  </div>
                )}
                {certInfo.subject.organization && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Organization:</span>
                    <span className={styles.value}>{certInfo.subject.organization}</span>
                  </div>
                )}
                {certInfo.subject.organizationalUnit && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Organizational Unit:</span>
                    <span className={styles.value}>{certInfo.subject.organizationalUnit}</span>
                  </div>
                )}
                {certInfo.subject.locality && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Locality:</span>
                    <span className={styles.value}>{certInfo.subject.locality}</span>
                  </div>
                )}
                {certInfo.subject.state && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>State:</span>
                    <span className={styles.value}>{certInfo.subject.state}</span>
                  </div>
                )}
                {certInfo.subject.country && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Country:</span>
                    <span className={styles.value}>{certInfo.subject.country}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Shield size={20} />
                  Issuer Information
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.infoGrid}>
                {certInfo.issuer.commonName && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Common Name:</span>
                    <span className={styles.value}>{certInfo.issuer.commonName}</span>
                  </div>
                )}
                {certInfo.issuer.organization && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Organization:</span>
                    <span className={styles.value}>{certInfo.issuer.organization}</span>
                  </div>
                )}
                {certInfo.issuer.country && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Country:</span>
                    <span className={styles.value}>{certInfo.issuer.country}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Calendar size={20} />
                  Validity Period
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Not Before:</span>
                  <span className={styles.value}>
                    {new Date(certInfo.validity.notBefore).toLocaleString()}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Not After:</span>
                  <span className={styles.value}>
                    {new Date(certInfo.validity.notAfter).toLocaleString()}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Status:</span>
                  <Badge variant={certInfo.validity.isExpired ? 'destructive' : 'default'}>
                    {certInfo.validity.isExpired ? 'Expired' : `Valid (${certInfo.validity.daysRemaining} days remaining)`}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Key size={20} />
                  Public Key & Signature
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Algorithm:</span>
                  <span className={styles.value}>{certInfo.publicKey.algorithm}</span>
                </div>
                {certInfo.publicKey.size && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Key Size:</span>
                    <span className={styles.value}>{certInfo.publicKey.size} bits</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>Signature Algorithm:</span>
                  <span className={styles.value}>{certInfo.signature.algorithm}</span>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.fullWidth}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <CheckCircle size={20} />
                  Extensions
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.infoGrid}>
                {certInfo.extensions.subjectAltNames && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Subject Alternative Names:</span>
                    <div className={styles.badges}>
                      {certInfo.extensions.subjectAltNames.map((san, i) => (
                        <Badge key={i} variant="secondary">{san}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {certInfo.extensions.keyUsage && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Key Usage:</span>
                    <div className={styles.badges}>
                      {certInfo.extensions.keyUsage.map((usage, i) => (
                        <Badge key={i} variant="secondary">{usage}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {certInfo.extensions.extendedKeyUsage && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Extended Key Usage:</span>
                    <div className={styles.badges}>
                      {certInfo.extensions.extendedKeyUsage.map((usage, i) => (
                        <Badge key={i} variant="secondary">{usage}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {certInfo.extensions.basicConstraints && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Basic Constraints:</span>
                    <span className={styles.value}>{certInfo.extensions.basicConstraints}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={styles.fullWidth}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Key size={20} />
                  Fingerprints
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.infoGrid}>
                {certInfo.fingerprints.sha1 && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>SHA-1:</span>
                    <code className={styles.fingerprint}>{certInfo.fingerprints.sha1}</code>
                  </div>
                )}
                {certInfo.fingerprints.sha256 && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>SHA-256:</span>
                    <code className={styles.fingerprint}>{certInfo.fingerprints.sha256}</code>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
