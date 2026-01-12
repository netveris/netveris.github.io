import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card/card";
import { Input } from "../components/ui/input/input";
import { Button } from "../components/ui/button/button";
import { Label } from "../components/ui/label/label";
import { Alert, AlertDescription } from "../components/ui/alert/alert";
import { Badge } from "../components/ui/badge/badge";
import { ToolHeader } from "../components/tool-header";
import { Globe, Server, Clock, MapPin, AlertCircle } from "lucide-react";
import type { Route } from "./+types/dns-lookup";
import styles from "./dns-lookup.module.css";
import { resolve4, resolve6, resolveMx, resolveTxt, resolveNs, resolveCname } from "node:dns/promises";

interface DNSRecord {
  type: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const domain = formData.get("domain") as string;

  if (!domain?.trim()) {
    return { error: "Please enter a domain name" };
  }

  try {
    const cleanDomain = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");

    // Parallel lookup for all record types
    // We catch individual errors so one failure doesn't stop the whole lookup
    const lookupPromises = [
      resolve4(cleanDomain)
        .then((r) => r.map((v) => ({ type: "A", value: v, ttl: 0 })))
        .catch(() => []),
      resolve6(cleanDomain)
        .then((r) => r.map((v) => ({ type: "AAAA", value: v, ttl: 0 })))
        .catch(() => []),
      resolveMx(cleanDomain)
        .then((r) => r.map((v) => ({ type: "MX", value: v.exchange, priority: v.priority, ttl: 0 })))
        .catch(() => []),
      resolveTxt(cleanDomain)
        .then((r) => r.flat().map((v) => ({ type: "TXT", value: v, ttl: 0 })))
        .catch(() => []),
      resolveNs(cleanDomain)
        .then((r) => r.map((v) => ({ type: "NS", value: v, ttl: 0 })))
        .catch(() => []),
      resolveCname(cleanDomain)
        .then((r) => r.map((v) => ({ type: "CNAME", value: v, ttl: 0 })))
        .catch(() => []),
    ];

    const results = await Promise.all(lookupPromises);
    const records = results.flat();

    if (records.length === 0) {
      return { error: "No DNS records found or domain resolution failed." };
    }

    return { records };
  } catch (err: any) {
    return { error: err.message || "Failed to perform DNS lookup" };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DNS Lookup Tool - Netveris" },
    { name: "description", content: "Perform DNS lookups and analyze domain records" },
  ];
}

export default function DNSLookup() {
  const fetcher = useFetcher<typeof action>();
  const [domain, setDomain] = useState("");

  const loading = fetcher.state !== "idle";
  const records = fetcher.data?.records || [];
  const error = fetcher.data?.error;

  const performLookup = () => {
    if (!domain.trim()) return;
    fetcher.submit({ domain }, { method: "post" });
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
