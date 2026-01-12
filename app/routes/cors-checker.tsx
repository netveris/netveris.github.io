import { useState } from "react";
import { Globe, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ToolHeader } from "../components/tool-header";
import { Button } from "../components/ui/button/button";
import { Card } from "../components/ui/card/card";
import { Input } from "../components/ui/input/input";
import { Label } from "../components/ui/label/label";
import { Badge } from "../components/ui/badge/badge";
import styles from "./cors-checker.module.css";

export function meta() {
  return [
    { title: "CORS Checker - Netveris" },
    { name: "description", content: "Test and validate CORS configurations" },
  ];
}

interface CORSResult {
  url: string;
  status: "success" | "error" | "warning";
  headers: Record<string, string>;
  issues: string[];
  recommendations: string[];
}

export default function CORSChecker() {
  const [url, setUrl] = useState("");
  const [origin, setOrigin] = useState("https://example.com");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CORSResult | null>(null);

  const checkCORS = async () => {
    if (!url) return;

    setChecking(true);
    try {
      const response = await fetch(url, {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "GET",
        },
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith("access-control")) {
          headers[key] = value;
        }
      });

      const issues: string[] = [];
      const recommendations: string[] = [];

      const allowOrigin = headers["access-control-allow-origin"];
      const allowMethods = headers["access-control-allow-methods"];
      const allowHeaders = headers["access-control-allow-headers"];
      const allowCredentials = headers["access-control-allow-credentials"];

      if (!allowOrigin) {
        issues.push("No Access-Control-Allow-Origin header found");
        recommendations.push("Add Access-Control-Allow-Origin header to allow cross-origin requests");
      } else if (allowOrigin === "*" && allowCredentials === "true") {
        issues.push("Wildcard origin (*) with credentials is not allowed");
        recommendations.push("Specify exact origin instead of wildcard when using credentials");
      } else if (allowOrigin === "*") {
        recommendations.push("Consider restricting origin to specific domains for better security");
      }

      if (!allowMethods) {
        issues.push("No Access-Control-Allow-Methods header found");
        recommendations.push("Specify allowed HTTP methods explicitly");
      }

      if (!allowHeaders) {
        recommendations.push("Consider adding Access-Control-Allow-Headers for custom headers");
      }

      const maxAge = headers["access-control-max-age"];
      if (!maxAge) {
        recommendations.push("Add Access-Control-Max-Age to cache preflight responses");
      }

      setResult({
        url,
        status: issues.length === 0 ? "success" : "warning",
        headers,
        issues,
        recommendations,
      });
    } catch (error) {
      setResult({
        url,
        status: "error",
        headers: {},
        issues: ["Failed to check CORS: " + (error instanceof Error ? error.message : "Unknown error")],
        recommendations: ["Ensure the URL is correct and the server is accessible"],
      });
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case "success":
        return <CheckCircle className={styles.successIcon} size={20} />;
      case "warning":
        return <AlertCircle className={styles.warningIcon} size={20} />;
      case "error":
        return <XCircle className={styles.errorIcon} size={20} />;
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        icon={<Globe size={24} />}
        title="CORS Configuration Checker"
        description="Check and analyze Cross-Origin Resource Sharing (CORS) headers"
      />

      <div className={styles.content}>
        <Card className={styles.card}>
          <div className={styles.controls}>
            <div className={styles.field}>
              <Label>Target URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                onKeyDown={(e) => e.key === "Enter" && checkCORS()}
              />
            </div>

            <div className={styles.field}>
              <Label>Origin (Your Domain)</Label>
              <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="https://example.com" />
            </div>

            <Button onClick={checkCORS} disabled={checking || !url} className={styles.checkButton}>
              <Globe size={18} />
              {checking ? "Checking..." : "Check CORS"}
            </Button>
          </div>
        </Card>

        {result && (
          <>
            <Card className={styles.card}>
              <div className={styles.statusHeader}>
                {getStatusIcon()}
                <h3>CORS Status</h3>
                <Badge
                  variant={
                    result.status === "success" ? "default" : result.status === "warning" ? "outline" : "destructive"
                  }
                >
                  {result.status.toUpperCase()}
                </Badge>
              </div>
            </Card>

            {Object.keys(result.headers).length > 0 && (
              <Card className={styles.card}>
                <h3 className={styles.sectionTitle}>CORS Headers</h3>
                <div className={styles.headers}>
                  {Object.entries(result.headers).map(([key, value]) => (
                    <div key={key} className={styles.header}>
                      <span className={styles.headerKey}>{key}:</span>
                      <span className={styles.headerValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {result.issues.length > 0 && (
              <Card className={styles.card}>
                <h3 className={styles.sectionTitle}>
                  <XCircle size={18} className={styles.errorIcon} />
                  Issues Found
                </h3>
                <ul className={styles.list}>
                  {result.issues.map((issue, i) => (
                    <li key={i} className={styles.issueItem}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {result.recommendations.length > 0 && (
              <Card className={styles.card}>
                <h3 className={styles.sectionTitle}>
                  <AlertCircle size={18} className={styles.warningIcon} />
                  Recommendations
                </h3>
                <ul className={styles.list}>
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className={styles.recommendationItem}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
