import { useState } from "react";
import type { Route } from "./+types/http-builder";
import { ToolHeader } from "~/components/tool-header";
import { Card } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select/select";
import { Badge } from "~/components/ui/badge/badge";
import { Copy, Send, Plus, X } from "lucide-react";
import styles from "./http-builder.module.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "HTTP Request Builder - Netveris" },
    { name: "description", content: "Build and test HTTP requests with security header analysis" }
  ];
};

interface Header {
  key: string;
  value: string;
}

export default function HttpBuilder() {
  const [method, setMethod] = useState<string>("GET");
  const [url, setUrl] = useState<string>("");
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json" }
  ]);
  const [body, setBody] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [securityIssues, setSecurityIssues] = useState<string[]>([]);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const analyzeSecurityHeaders = (requestHeaders: Header[]) => {
    const issues: string[] = [];
    const headerKeys = requestHeaders.map(h => h.key.toLowerCase());

    if (!headerKeys.includes("authorization") && !headerKeys.includes("x-api-key")) {
      issues.push("No authentication header detected");
    }

    if (method === "POST" || method === "PUT" || method === "PATCH") {
      if (!headerKeys.includes("content-type")) {
        issues.push("Missing Content-Type header for request body");
      }
    }

    const hasOrigin = requestHeaders.some(h => 
      h.key.toLowerCase() === "origin" && h.value.startsWith("http://")
    );
    if (hasOrigin) {
      issues.push("Using HTTP origin - consider HTTPS for security");
    }

    return issues;
  };

  const sendRequest = async () => {
    if (!url) return;

    setLoading(true);
    setSecurityIssues(analyzeSecurityHeaders(headers));

    try {
      const headerObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key) headerObj[h.key] = h.value;
      });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = body;
      }

      const startTime = performance.now();
      const res = await fetch(url, options);
      const endTime = performance.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: Math.round(endTime - startTime),
      });
    } catch (error: any) {
      setResponse({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="HTTP Request Builder"
        description="Build, test, and analyze HTTP requests with security header inspection"
        icon={<Send size={32} />}
      />

      <div className={styles.grid}>
        <Card className={styles.card}>
          <h2>Request Configuration</h2>

          <div className={styles.methodUrl}>
            <div className={styles.method}>
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.urlInput}>
              <Label>URL</Label>
              <Input
                type="url"
                placeholder="https://api.example.com/endpoint"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Label>Headers</Label>
              <Button size="sm" variant="outline" onClick={addHeader}>
                <Plus /> Add Header
              </Button>
            </div>
            <div className={styles.headers}>
              {headers.map((header, index) => (
                <div key={index} className={styles.headerRow}>
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                  />
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, "value", e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeHeader(index)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {(method === "POST" || method === "PUT" || method === "PATCH") && (
            <div className={styles.section}>
              <Label>Request Body</Label>
              <Textarea
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className={styles.body}
              />
            </div>
          )}

          {securityIssues.length > 0 && (
            <div className={styles.securityIssues}>
              <h3>Security Warnings</h3>
              {securityIssues.map((issue, idx) => (
                <Badge key={idx} variant="outline" className={styles.warning}>
                  {issue}
                </Badge>
              ))}
            </div>
          )}

          <Button onClick={sendRequest} disabled={loading || !url} className={styles.sendButton}>
            <Send /> {loading ? "Sending..." : "Send Request"}
          </Button>
        </Card>

        <Card className={styles.card}>
          <div className={styles.responseHeader}>
            <h2>Response</h2>
            {response && !response.error && (
              <Button size="sm" variant="ghost" onClick={copyResponse}>
                <Copy /> Copy
              </Button>
            )}
          </div>

          {response ? (
            response.error ? (
              <div className={styles.error}>
                <h3>Error</h3>
                <p>{response.error}</p>
              </div>
            ) : (
              <div className={styles.response}>
                <div className={styles.statusLine}>
                  <Badge
                    variant={response.status < 300 ? "default" : response.status < 500 ? "secondary" : "destructive"}
                  >
                    {response.status} {response.statusText}
                  </Badge>
                  <span className={styles.time}>{response.time}ms</span>
                </div>

                <div className={styles.section}>
                  <h3>Response Headers</h3>
                  <div className={styles.headersList}>
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className={styles.headerItem}>
                        <span className={styles.headerKey}>{key}:</span>
                        <span className={styles.headerValue}>{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <h3>Response Body</h3>
                  <pre className={styles.responseBody}>
                    {typeof response.body === "object"
                      ? JSON.stringify(response.body, null, 2)
                      : response.body}
                  </pre>
                </div>
              </div>
            )
          ) : (
            <div className={styles.placeholder}>
              <p>Configure and send a request to see the response</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
