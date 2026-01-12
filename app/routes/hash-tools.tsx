import { useState } from 'react';
import type { Route } from './+types/hash-tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Label } from '~/components/ui/label/label';
import { Button } from '~/components/ui/button/button';
import { Alert, AlertDescription } from '~/components/ui/alert/alert';
import { ToolHeader } from '~/components/tool-header';
import { Hash, Copy, Check, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs/tabs';
import styles from './hash-tools.module.css';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Hash Generator - Netveris' },
    { name: 'description', content: 'Generate and identify cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512)' },
  ];
};

async function generateHash(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let hashAlgorithm: AlgorithmIdentifier;
  switch (algorithm) {
    case 'MD5':
      // MD5 not available in Web Crypto API, returning placeholder
      return 'MD5 not available in browser (use server-side)';
    case 'SHA-1':
      hashAlgorithm = 'SHA-1';
      break;
    case 'SHA-256':
      hashAlgorithm = 'SHA-256';
      break;
    case 'SHA-512':
      hashAlgorithm = 'SHA-512';
      break;
    default:
      return '';
  }
  
  const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

function identifyHashType(hash: string): string[] {
  const trimmedHash = hash.trim();
  const length = trimmedHash.length;
  const types: string[] = [];
  
  // Check if it's a valid hex string
  if (!/^[a-fA-F0-9]+$/.test(trimmedHash)) {
    return ['Invalid hash format (not hexadecimal)'];
  }
  
  switch (length) {
    case 32:
      types.push('MD5 (128-bit)');
      break;
    case 40:
      types.push('SHA-1 (160-bit)');
      break;
    case 56:
      types.push('SHA-224 (224-bit)');
      break;
    case 64:
      types.push('SHA-256 (256-bit)');
      break;
    case 96:
      types.push('SHA-384 (384-bit)');
      break;
    case 128:
      types.push('SHA-512 (512-bit)');
      break;
    case 60:
      if (trimmedHash.startsWith('$2') || trimmedHash.startsWith('$2a') || trimmedHash.startsWith('$2b') || trimmedHash.startsWith('$2y')) {
        types.push('bcrypt');
      }
      break;
    default:
      types.push(`Unknown (${length} characters)`);
  }
  
  // Check for bcrypt pattern
  if (/^\$2[aby]?\$\d{2}\$/.test(trimmedHash)) {
    types.push('bcrypt');
  }
  
  // Check for common formats
  if (trimmedHash.includes('$') && !types.includes('bcrypt')) {
    types.push('Possibly salted hash (Argon2, PBKDF2, etc.)');
  }
  
  return types.length > 0 ? types : ['Unknown hash type'];
}

export default function HashTools() {
  const [generateInput, setGenerateInput] = useState('');
  const [identifyInput, setIdentifyInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-512': '',
  });
  const [identifiedTypes, setIdentifiedTypes] = useState<string[]>([]);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!generateInput.trim()) return;
    
    const newHashes: Record<string, string> = {};
    for (const algorithm of ['SHA-1', 'SHA-256', 'SHA-512']) {
      newHashes[algorithm] = await generateHash(generateInput, algorithm);
    }
    setHashes(newHashes);
  };

  const handleIdentify = () => {
    if (!identifyInput.trim()) return;
    const types = identifyHashType(identifyInput);
    setIdentifiedTypes(types);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Hash Generator & Identifier"
        description="Generate cryptographic hashes and identify hash types"
        icon={<Hash />}
      />

      <div className={styles.content}>
        <Tabs defaultValue="generate" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="generate">Generate Hash</TabsTrigger>
            <TabsTrigger value="identify">Identify Hash</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className={styles.tabContent}>
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>Generate Hash</CardTitle>
                <CardDescription>
                  Enter text to generate cryptographic hashes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.inputSection}>
                  <Label htmlFor="generate-input">Input Text</Label>
                  <Textarea
                    id="generate-input"
                    value={generateInput}
                    onChange={(e) => setGenerateInput(e.target.value)}
                    placeholder="Enter text to hash..."
                    rows={4}
                    className={styles.textarea}
                  />
                  <Button onClick={handleGenerate} className={styles.button}>
                    Generate Hashes
                  </Button>
                </div>

                {Object.keys(hashes).some(key => hashes[key]) && (
                  <div className={styles.resultsSection}>
                    <h3 className={styles.resultsTitle}>Generated Hashes</h3>
                    <div className={styles.hashList}>
                      {Object.entries(hashes).map(([algorithm, hash]) => (
                        hash && (
                          <div key={algorithm} className={styles.hashItem}>
                            <div className={styles.hashHeader}>
                              <span className={styles.hashAlgorithm}>{algorithm}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(hash, algorithm)}
                                className={styles.copyButton}
                              >
                                {copiedHash === algorithm ? (
                                  <>
                                    <Check size={16} />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={16} />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                            <code className={styles.hashValue}>{hash}</code>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>About Hash Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.infoSection}>
                  <div className={styles.infoItem}>
                    <h4>SHA-1 (160-bit)</h4>
                    <p>Deprecated for security purposes. Should not be used for new applications.</p>
                  </div>
                  <div className={styles.infoItem}>
                    <h4>SHA-256 (256-bit)</h4>
                    <p>Part of SHA-2 family. Widely used and considered secure for most applications.</p>
                  </div>
                  <div className={styles.infoItem}>
                    <h4>SHA-512 (512-bit)</h4>
                    <p>Part of SHA-2 family. Provides higher security margin, recommended for sensitive data.</p>
                  </div>
                </div>
                <Alert className={styles.alert}>
                  <AlertCircle size={18} />
                  <AlertDescription>
                    <strong>Security Note:</strong> Never use simple hashes like MD5 or SHA-1 for password storage. 
                    Use dedicated password hashing algorithms like bcrypt, Argon2, or PBKDF2.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identify" className={styles.tabContent}>
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>Identify Hash Type</CardTitle>
                <CardDescription>
                  Enter a hash to identify its probable type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.inputSection}>
                  <Label htmlFor="identify-input">Hash Value</Label>
                  <Textarea
                    id="identify-input"
                    value={identifyInput}
                    onChange={(e) => setIdentifyInput(e.target.value)}
                    placeholder="Enter hash to identify..."
                    rows={4}
                    className={styles.textarea}
                  />
                  <Button onClick={handleIdentify} className={styles.button}>
                    Identify Hash
                  </Button>
                </div>

                {identifiedTypes.length > 0 && (
                  <div className={styles.resultsSection}>
                    <h3 className={styles.resultsTitle}>Identification Results</h3>
                    <div className={styles.typeList}>
                      {identifiedTypes.map((type, index) => (
                        <div key={index} className={styles.typeItem}>
                          <Hash size={18} />
                          <span>{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardHeader>
                <CardTitle>Common Hash Lengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.lengthList}>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>32 characters</span>
                    <span className={styles.lengthType}>MD5</span>
                  </div>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>40 characters</span>
                    <span className={styles.lengthType}>SHA-1</span>
                  </div>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>56 characters</span>
                    <span className={styles.lengthType}>SHA-224</span>
                  </div>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>64 characters</span>
                    <span className={styles.lengthType}>SHA-256</span>
                  </div>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>96 characters</span>
                    <span className={styles.lengthType}>SHA-384</span>
                  </div>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>128 characters</span>
                    <span className={styles.lengthType}>SHA-512</span>
                  </div>
                  <div className={styles.lengthItem}>
                    <span className={styles.lengthChars}>60 characters (starts with $2)</span>
                    <span className={styles.lengthType}>bcrypt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
