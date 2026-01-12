import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card/card';
import { Button } from '../components/ui/button/button';
import { Label } from '../components/ui/label/label';
import { Badge } from '../components/ui/badge/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select/select';
import { ToolHeader } from '../components/tool-header';
import { Fingerprint, Copy, Check, RefreshCw, Trash2 } from 'lucide-react';
import type { Route } from './+types/uuid-generator';
import styles from './uuid-generator.module.css';

interface GeneratedUUID {
  id: string;
  value: string;
  version: string;
  timestamp: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'UUID Generator - Netveris' },
    { name: 'description', content: 'Generate universally unique identifiers (UUIDs) in multiple versions' },
  ];
}

export default function UUIDGenerator() {
  const [version, setVersion] = useState('4');
  const [uuids, setUuids] = useState<GeneratedUUID[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkCount, setBulkCount] = useState('5');

  const generateUUID = (ver: string = version): string => {
    if (ver === '4') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    } else if (ver === '1') {
      // Simplified UUID v1 simulation
      const timestamp = Date.now();
      const hex = timestamp.toString(16).padStart(16, '0');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-1${hex.slice(13, 16)}-${((Math.random() * 16) | 0).toString(16)}${((Math.random() * 16) | 0).toString(16)}${((Math.random() * 16) | 0).toString(16)}-${Array.from({ length: 12 }, () => ((Math.random() * 16) | 0).toString(16)).join('')}`;
    }
    return generateUUID('4');
  };

  const addUUID = () => {
    const newUUID: GeneratedUUID = {
      id: Math.random().toString(36).substr(2, 9),
      value: generateUUID(),
      version: version,
      timestamp: Date.now(),
    };
    setUuids([newUUID, ...uuids]);
  };

  const generateBulk = () => {
    const count = Math.min(parseInt(bulkCount) || 5, 100);
    const newUUIDs = Array.from({ length: count }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      value: generateUUID(),
      version: version,
      timestamp: Date.now(),
    }));
    setUuids([...newUUIDs, ...uuids]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearAll = () => {
    setUuids([]);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="UUID Generator"
        description="Generate universally unique identifiers (UUIDs) in multiple versions"
        icon={<Fingerprint size={32} />}
      />

      <div className={styles.content}>
        <Card>
          <CardHeader>
            <CardTitle>Generate UUIDs</CardTitle>
            <CardDescription>Create unique identifiers for your applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.controls}>
              <div className={styles.field}>
                <Label htmlFor="version">UUID Version</Label>
                <Select value={version} onValueChange={setVersion}>
                  <SelectTrigger id="version">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Version 1 (Timestamp-based)</SelectItem>
                    <SelectItem value="4">Version 4 (Random)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.buttonGroup}>
                <Button onClick={addUUID} className={styles.genBtn}>
                  <RefreshCw className={styles.btnIcon} />
                  Generate Single
                </Button>
                
                <div className={styles.bulkGroup}>
                  <Select value={bulkCount} onValueChange={setBulkCount}>
                    <SelectTrigger className={styles.bulkSelect}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 UUIDs</SelectItem>
                      <SelectItem value="10">10 UUIDs</SelectItem>
                      <SelectItem value="25">25 UUIDs</SelectItem>
                      <SelectItem value="50">50 UUIDs</SelectItem>
                      <SelectItem value="100">100 UUIDs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={generateBulk} variant="secondary">
                    Generate Bulk
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {uuids.length > 0 && (
          <Card>
            <CardHeader>
              <div className={styles.resultHeader}>
                <div>
                  <CardTitle>Generated UUIDs</CardTitle>
                  <Badge variant="secondary" className={styles.countBadge}>
                    {uuids.length} total
                  </Badge>
                </div>
                <Button onClick={clearAll} variant="destructive" size="sm">
                  <Trash2 className={styles.btnIcon} />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.uuidList}>
                {uuids.map((uuid) => (
                  <div key={uuid.id} className={styles.uuidCard}>
                    <div className={styles.uuidHeader}>
                      <Badge variant="outline" className={styles.versionBadge}>
                        v{uuid.version}
                      </Badge>
                      <span className={styles.timestamp}>{formatTimestamp(uuid.timestamp)}</span>
                    </div>
                    <div className={styles.uuidValue}>
                      <code className={styles.code}>{uuid.value}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(uuid.value, uuid.id)}
                        className={styles.copyBtn}
                      >
                        {copiedId === uuid.id ? (
                          <Check className={styles.copyIcon} />
                        ) : (
                          <Copy className={styles.copyIcon} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>UUID Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.info}>
              <div className={styles.infoSection}>
                <h4 className={styles.infoTitle}>Version 1 (Timestamp-based)</h4>
                <p className={styles.infoText}>
                  Generated using timestamp and MAC address. Useful when you need time-ordered UUIDs. 
                  Note: May expose the timestamp and location of generation.
                </p>
              </div>
              <div className={styles.infoSection}>
                <h4 className={styles.infoTitle}>Version 4 (Random)</h4>
                <p className={styles.infoText}>
                  Generated using random or pseudo-random numbers. Most commonly used. 
                  Provides 122 bits of randomness with extremely low collision probability.
                </p>
              </div>
              <div className={styles.infoSection}>
                <h4 className={styles.infoTitle}>Format</h4>
                <p className={styles.infoText}>
                  UUIDs are 128-bit values represented as 32 hexadecimal digits displayed in 
                  5 groups separated by hyphens: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
