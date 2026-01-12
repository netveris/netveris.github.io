import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card/card';
import { Input } from '../components/ui/input/input';
import { Label } from '../components/ui/label/label';
import { Alert, AlertDescription } from '../components/ui/alert/alert';
import { Badge } from '../components/ui/badge/badge';
import { ToolHeader } from '../components/tool-header';
import { Link2, AlertCircle, Copy, Check, AlertTriangle, Info, Shield, Globe } from 'lucide-react';
import { Button } from '../components/ui/button/button';
import type { Route } from './+types/url-parser';
import styles from './url-parser.module.css';

interface ParsedURL {
  // Basic components
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
  origin: string;
  href: string;
  
  // Advanced parsing
  subdomain: string;
  domain: string;
  tld: string;
  pathSegments: string[];
  queryParams: Record<string, string>;
  queryParamsArray: Array<{ key: string; value: string; encoded: boolean }>;
  hashFragment: string;
  
  // URL analysis
  isSecure: boolean;
  isLocalhost: boolean;
  isIPAddress: boolean;
  hasAuth: boolean;
  hasQuery: boolean;
  hasFragment: boolean;
  
  // Security insights
  securityIssues: string[];
  recommendations: string[];
  
  // Encoded vs Decoded
  encodedURL: string;
  decodedURL: string;
  
  // URL parts count
  totalLength: number;
  queryParamCount: number;
  pathDepth: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'URL Parser & Analyzer - Netveris' },
    { name: 'description', content: 'Comprehensive URL parsing and analysis with security insights' },
  ];
}

export default function URLParser() {
  const [url, setUrl] = useState('https://user:pass@shop.example.com:8080/products/electronics/phones?category=smartphones&brand=apple&sort=price&order=asc#reviews');
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      parseURL();
    }
  }, []);

  const parseURL = () => {
    try {
      const urlObj = new URL(url);
      
      // Extract query parameters
      const queryParams: Record<string, string> = {};
      const queryParamsArray: Array<{ key: string; value: string; encoded: boolean }> = [];
      
      urlObj.searchParams.forEach((value, key) => {
        queryParams[key] = value;
        const encoded = value !== decodeURIComponent(value) || key !== decodeURIComponent(key);
        queryParamsArray.push({ key, value, encoded });
      });

      // Parse hostname into parts
      const hostnameParts = urlObj.hostname.split('.');
      let subdomain = '';
      let domain = '';
      let tld = '';
      
      if (hostnameParts.length > 2) {
        subdomain = hostnameParts.slice(0, -2).join('.');
        domain = hostnameParts[hostnameParts.length - 2];
        tld = hostnameParts[hostnameParts.length - 1];
      } else if (hostnameParts.length === 2) {
        domain = hostnameParts[0];
        tld = hostnameParts[1];
      } else {
        domain = urlObj.hostname;
      }

      // Parse path segments
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);

      // Extract hash fragment (without #)
      const hashFragment = urlObj.hash.substring(1);

      // Check if URL contains encoded characters
      const encodedURL = url;
      const decodedURL = decodeURIComponent(url);

      // Determine if hostname is an IP address
      const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname) || 
                         /^\[?[0-9a-fA-F:]+\]?$/.test(urlObj.hostname);

      // Security analysis
      const securityIssues: string[] = [];
      const recommendations: string[] = [];

      if (urlObj.protocol !== 'https:') {
        securityIssues.push('URL uses insecure HTTP protocol');
        recommendations.push('Use HTTPS to encrypt data in transit');
      }

      if (urlObj.username || urlObj.password) {
        securityIssues.push('Credentials embedded in URL');
        recommendations.push('Never include credentials in URLs - use secure authentication headers instead');
      }

      if (!urlObj.port && urlObj.protocol === 'http:') {
        recommendations.push('Default HTTP port (80) is being used');
      } else if (!urlObj.port && urlObj.protocol === 'https:') {
        recommendations.push('Default HTTPS port (443) is being used');
      }

      if (url.length > 2000) {
        securityIssues.push('URL exceeds recommended length limit');
        recommendations.push('Some servers and browsers may truncate URLs longer than 2000 characters');
      }

      if (Object.keys(queryParams).some(key => key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret'))) {
        securityIssues.push('Potentially sensitive data in query parameters');
        recommendations.push('Avoid passing tokens, keys, or secrets in URL parameters - use request headers instead');
      }

      if (encodedURL !== decodedURL) {
        recommendations.push('URL contains encoded characters - ensure proper encoding/decoding');
      }

      setParsed({
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        username: urlObj.username,
        password: urlObj.password,
        origin: urlObj.origin,
        href: urlObj.href,
        subdomain,
        domain,
        tld,
        pathSegments,
        queryParams,
        queryParamsArray,
        hashFragment,
        isSecure: urlObj.protocol === 'https:',
        isLocalhost: urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname === '::1',
        isIPAddress,
        hasAuth: !!(urlObj.username || urlObj.password),
        hasQuery: urlObj.search.length > 0,
        hasFragment: urlObj.hash.length > 0,
        securityIssues,
        recommendations,
        encodedURL,
        decodedURL,
        totalLength: url.length,
        queryParamCount: Object.keys(queryParams).length,
        pathDepth: pathSegments.length,
      });
      setError('');
    } catch (err) {
      setError('Invalid URL format. Please enter a valid URL including protocol (e.g., https://example.com)');
      setParsed(null);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderField = (label: string, value: string, fieldKey: string, description?: string) => {
    if (!value) return null;

    return (
      <div className={styles.field}>
        <div className={styles.fieldHeader}>
          <div className={styles.fieldLabelGroup}>
            <Label className={styles.fieldLabel}>{label}</Label>
            {description && <span className={styles.fieldDescription}>{description}</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, fieldKey)}
            className={styles.copyBtn}
          >
            {copiedField === fieldKey ? (
              <Check className={styles.copyIcon} />
            ) : (
              <Copy className={styles.copyIcon} />
            )}
          </Button>
        </div>
        <code className={styles.code}>{value}</code>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="URL Parser & Analyzer"
        description="Comprehensive URL parsing and security analysis with detailed component breakdown"
        icon={<Link2 size={32} />}
      />

      <div className={styles.content}>
        <Card>
          <CardHeader>
            <CardTitle>URL Input</CardTitle>
            <CardDescription>Enter any URL to parse and analyze all its components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="https://example.com/path?query=value#hash"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && parseURL()}
                />
              </div>
              <Button onClick={parseURL} className={styles.parseBtn}>
                Parse URL
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className={styles.alert}>
                <AlertCircle className={styles.alertIcon} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {parsed && (
          <div className={styles.results}>
            {/* Overview Stats */}
            <Card>
              <CardHeader>
                <CardTitle className={styles.sectionTitle}>
                  <Globe className={styles.sectionIcon} />
                  URL Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.statsGrid}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Protocol</span>
                    <Badge variant={parsed.isSecure ? 'default' : 'destructive'}>
                      {parsed.isSecure ? 'HTTPS (Secure)' : 'HTTP (Insecure)'}
                    </Badge>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Length</span>
                    <Badge variant="secondary">{parsed.totalLength} characters</Badge>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Query Parameters</span>
                    <Badge variant="secondary">{parsed.queryParamCount}</Badge>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Path Depth</span>
                    <Badge variant="secondary">{parsed.pathDepth} levels</Badge>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Environment</span>
                    <Badge variant={parsed.isLocalhost ? 'secondary' : 'default'}>
                      {parsed.isLocalhost ? 'Localhost' : 'Remote'}
                    </Badge>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Address Type</span>
                    <Badge variant="secondary">
                      {parsed.isIPAddress ? 'IP Address' : 'Domain Name'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Analysis */}
            {(parsed.securityIssues.length > 0 || parsed.recommendations.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className={styles.sectionTitle}>
                    <Shield className={styles.sectionIcon} />
                    Security Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parsed.securityIssues.length > 0 && (
                    <div className={styles.securitySection}>
                      <div className={styles.securityHeader}>
                        <AlertTriangle className={styles.warningIcon} />
                        <h4>Security Issues ({parsed.securityIssues.length})</h4>
                      </div>
                      <ul className={styles.issueList}>
                        {parsed.securityIssues.map((issue, idx) => (
                          <li key={idx} className={styles.issue}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {parsed.recommendations.length > 0 && (
                    <div className={styles.securitySection}>
                      <div className={styles.securityHeader}>
                        <Info className={styles.infoIcon} />
                        <h4>Recommendations ({parsed.recommendations.length})</h4>
                      </div>
                      <ul className={styles.recommendationList}>
                        {parsed.recommendations.map((rec, idx) => (
                          <li key={idx} className={styles.recommendation}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Protocol & Scheme */}
            <Card>
              <CardHeader>
                <CardTitle>Protocol & Origin</CardTitle>
                <CardDescription>URL scheme and origin information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.fieldsGrid}>
                  {renderField('Protocol', parsed.protocol, 'protocol', 'The protocol scheme (http:, https:, ftp:, etc.)')}
                  {renderField('Origin', parsed.origin, 'origin', 'Protocol + hostname + port')}
                  {renderField('Port', parsed.port, 'port', parsed.port === '443' || parsed.port === '80' ? 'Default port' : 'Custom port')}
                </div>
              </CardContent>
            </Card>

            {/* Hostname Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Hostname Breakdown</CardTitle>
                <CardDescription>Domain structure and components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.fieldsGrid}>
                  {renderField('Full Hostname', parsed.hostname, 'hostname', 'Complete hostname')}
                  {parsed.subdomain && renderField('Subdomain', parsed.subdomain, 'subdomain', 'Subdomain prefix')}
                  {renderField('Domain', parsed.domain, 'domain', 'Second-level domain')}
                  {parsed.tld && renderField('TLD', parsed.tld, 'tld', 'Top-level domain')}
                </div>
              </CardContent>
            </Card>

            {/* Authentication */}
            {parsed.hasAuth && (
              <Card>
                <CardHeader>
                  <div className={styles.warningHeader}>
                    <CardTitle>Authentication Credentials</CardTitle>
                    <Badge variant="destructive">
                      <AlertTriangle className={styles.badgeIcon} />
                      Security Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive" className={styles.securityAlert}>
                    <AlertCircle className={styles.alertIcon} />
                    <AlertDescription>
                      <strong>Critical Security Warning:</strong> Credentials in URLs are visible in browser history, 
                      server logs, and referrer headers. Never use this method for authentication in production.
                    </AlertDescription>
                  </Alert>
                  <div className={styles.fieldsGrid}>
                    {renderField('Username', parsed.username, 'username', 'Basic auth username')}
                    {renderField('Password', parsed.password ? '••••••••' : '', 'password', 'Basic auth password (masked)')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Path Components */}
            {parsed.pathSegments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Path Components</CardTitle>
                  <CardDescription>URL path structure and segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={styles.fieldsGrid}>
                    {renderField('Full Path', parsed.pathname, 'pathname', 'Complete path string')}
                  </div>
                  <div className={styles.pathSegments}>
                    <h4 className={styles.subsectionTitle}>Path Segments ({parsed.pathSegments.length})</h4>
                    <div className={styles.segmentsList}>
                      {parsed.pathSegments.map((segment, idx) => (
                        <div key={idx} className={styles.segment}>
                          <div className={styles.segmentHeader}>
                            <Badge variant="outline">Level {idx + 1}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(segment, `segment-${idx}`)}
                              className={styles.copyBtn}
                            >
                              {copiedField === `segment-${idx}` ? (
                                <Check className={styles.copyIcon} />
                              ) : (
                                <Copy className={styles.copyIcon} />
                              )}
                            </Button>
                          </div>
                          <code className={styles.segmentValue}>{segment}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Query Parameters */}
            {parsed.hasQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>Query Parameters</CardTitle>
                  <CardDescription>
                    {parsed.queryParamCount} parameter{parsed.queryParamCount !== 1 ? 's' : ''} found in query string
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={styles.fieldsGrid}>
                    {renderField('Query String', parsed.search, 'search', 'Full query string including ?')}
                  </div>
                  <div className={styles.pathSegments}>
                    <h4 className={styles.subsectionTitle}>Parameters Breakdown</h4>
                    <div className={styles.paramsGrid}>
                      {parsed.queryParamsArray.map(({ key, value, encoded }, idx) => (
                        <div key={idx} className={styles.param}>
                          <div className={styles.paramHeader}>
                            <span className={styles.paramKey}>{key}</span>
                            <div className={styles.paramActions}>
                              {encoded && (
                                <Badge variant="secondary" className={styles.encodedBadge}>
                                  <Info className={styles.badgeIcon} />
                                  Encoded
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(value, `param-${key}`)}
                                className={styles.copyBtn}
                              >
                                {copiedField === `param-${key}` ? (
                                  <Check className={styles.copyIcon} />
                                ) : (
                                  <Copy className={styles.copyIcon} />
                                )}
                              </Button>
                            </div>
                          </div>
                          <code className={styles.paramValue}>{value}</code>
                          {encoded && value !== decodeURIComponent(value) && (
                            <div className={styles.decodedValue}>
                              <span className={styles.decodedLabel}>Decoded:</span>
                              <code>{decodeURIComponent(value)}</code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hash Fragment */}
            {parsed.hasFragment && (
              <Card>
                <CardHeader>
                  <CardTitle>Hash Fragment</CardTitle>
                  <CardDescription>URL fragment identifier (client-side only)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={styles.fieldsGrid}>
                    {renderField('Hash (with #)', parsed.hash, 'hash', 'Full hash including #')}
                    {renderField('Fragment', parsed.hashFragment, 'fragment', 'Fragment without # symbol')}
                  </div>
                  <Alert className={styles.infoAlert}>
                    <Info className={styles.alertIcon} />
                    <AlertDescription>
                      Hash fragments are not sent to the server and are used for client-side navigation (e.g., scrolling to sections or SPA routing).
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Encoding */}
            {parsed.encodedURL !== parsed.decodedURL && (
              <Card>
                <CardHeader>
                  <CardTitle>URL Encoding</CardTitle>
                  <CardDescription>Encoded vs decoded representations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={styles.fieldsGrid}>
                    {renderField('Encoded URL', parsed.encodedURL, 'encoded', 'URL-encoded representation')}
                    {renderField('Decoded URL', parsed.decodedURL, 'decoded', 'Human-readable representation')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Complete URL */}
            <Card>
              <CardHeader>
                <CardTitle>Complete URL</CardTitle>
                <CardDescription>Full normalized URL string</CardDescription>
              </CardHeader>
              <CardContent>
                {renderField('Full URL (href)', parsed.href, 'href', 'Complete normalized URL')}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
