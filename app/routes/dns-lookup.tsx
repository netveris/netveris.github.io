import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card/card";
import { Input } from "../components/ui/input/input";
import { Button } from "../components/ui/button/button";
import { Label } from "../components/ui/label/label";
import { Alert, AlertDescription } from "../components/ui/alert/alert";
import { Badge } from "../components/ui/badge/badge";
import { ToolHeader } from "../components/tool-header";
import { Globe, Server, Clock, MapPin, AlertCircle, Info } from "lucide-react";
import type { Route } from "./+types/dns-lookup";
import styles from "./dns-lookup.module.css";

interface DNSRecord {
  type: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DNS Lookup Tool - Netveris" },
    { name: "description", content: "Perform DNS lookups and analyze domain records" },
  ];
}

// Demo DNS records for demonstration purposes
const getDemoRecords = (domain: string): DNSRecord[] => [
  { type: "A", value: "93.184.216.34", ttl: 300 },
  { type: "AAAA", value: "2606:2800:220:1:248:1893:25c8:1946", ttl: 300 },
  { type: "MX", value: "mail." + domain, priority: 10, ttl: 3600 },
  { type: "NS", value: "ns1." + domain, ttl: 86400 },
  { type: "NS", value: "ns2." + domain, ttl: 86400 },
  { type: "TXT", value: "v=spf1 include:_spf." + domain + " ~all", ttl: 3600 },
];

export default function DNSLookup() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const performLookup = () => {
    if (!domain.trim()) {
      setError("Please enter a domain name");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate lookup delay and show demo data
    setTimeout(() => {
      setRecords(getDemoRecords(domain));
      setShowDemo(true);
      setLoading(false);
    }, 800);
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "A":
      case "AAAA":
        return <Server className={styles.icon} />;
      case "MX":
        return <Globe className={styles.icon} />;
      case "NS":
        return <MapPin className={styles.icon} />;
      default:
        return <Clock className={styles.icon} />;
    }
  };

  const groupedRecords = records.reduce(
    (acc, record) => {
      if (!acc[record.type]) {
        acc[record.type] = [];
      }
      acc[record.type].push(record);
      return acc;
    },
    {} as Record<string, DNSRecord[]>,
  );

  return (
    <div className={styles.container}>
      <ToolHeader
        title="DNS Lookup Tool"
        description="Query and analyze DNS records for any domain"
        icon={<Globe size={32} />}
      />

      <div className={styles.content}>
        <Card>
          <CardHeader>
            <CardTitle>Domain Lookup</CardTitle>
            <CardDescription>Enter a domain name to retrieve DNS records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.inputGroup}>
              <div className={styles.field}>
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && performLookup()}
                />
              </div>
              <Button onClick={performLookup} disabled={loading} className={styles.lookupBtn}>
                {loading ? "Looking up..." : "Lookup DNS"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className={styles.alert}>
                <AlertCircle className={styles.alertIcon} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showDemo && (
              <Alert className={styles.alert}>
                <Info className={styles.alertIcon} />
                <AlertDescription>
                  <strong>Demo Mode:</strong> DNS lookups require server-side execution. Below is example data showing
                  what DNS records look like. For real lookups, use tools like <code>nslookup</code> or <code>dig</code>
                  .
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {records.length > 0 && (
          <div className={styles.results}>
            <h3 className={styles.resultsTitle}>DNS Records for {domain}</h3>
            <div className={styles.recordsGrid}>
              {Object.entries(groupedRecords).map(([type, typeRecords]) => (
                <Card key={type} className={styles.recordCard}>
                  <CardHeader className={styles.recordHeader}>
                    <div className={styles.recordTitleRow}>
                      {getRecordIcon(type)}
                      <CardTitle className={styles.recordType}>{type} Records</CardTitle>
                      <Badge variant="secondary">{typeRecords.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.recordList}>
                      {typeRecords.map((record, idx) => (
                        <div key={idx} className={styles.recordItem}>
                          <div className={styles.recordValue}>
                            {record.priority !== undefined && (
                              <span className={styles.priority}>Priority: {record.priority}</span>
                            )}
                            <code className={styles.code}>{record.value}</code>
                          </div>
                          {record.ttl && <span className={styles.ttl}>TTL: {record.ttl}s</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
