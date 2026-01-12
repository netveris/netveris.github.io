import { useState } from "react";
import { Link } from "react-router";
import { Database, Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button/button";
import { Textarea } from "~/components/ui/textarea/textarea";
import { CodeWindow } from "~/components/code-window";
import { Card } from "~/components/ui/card/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs/tabs";
import styles from "./data-sanitizer.module.css";

export function meta() {
  return [
    { title: "Data Sanitizer - Netveris" },
    { name: "description", content: "Sanitize and clean user input data" },
  ];
}

export default function DataSanitizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [threats, setThreats] = useState<string[]>([]);

  const sanitizeHTML = (text: string) => {
    const threats: string[] = [];
    let sanitized = text;

    // Detect XSS patterns
    if (/<script/i.test(text)) {
      threats.push("XSS: <script> tag detected");
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }

    if (/on\w+\s*=/i.test(text)) {
      threats.push("XSS: Event handler detected (onclick, onerror, etc.)");
      sanitized = sanitized.replace(/\son\w+\s*=/gi, "");
    }

    if (/javascript:/i.test(text)) {
      threats.push("XSS: javascript: protocol detected");
      sanitized = sanitized.replace(/javascript:/gi, "");
    }

    // HTML encode special characters
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    return { sanitized, threats };
  };

  const sanitizeSQL = (text: string) => {
    const threats: string[] = [];
    let sanitized = text;

    // Detect SQL injection patterns
    const sqlPatterns = [
      { pattern: /(\bOR\b|\bAND\b)\s+[\w'"\d\s=]+/gi, threat: "SQL Injection: Logical operator detected" },
      { pattern: /;\s*(DROP|DELETE|UPDATE|INSERT)\s+/gi, threat: "SQL Injection: Dangerous SQL command" },
      { pattern: /--/g, threat: "SQL Injection: SQL comment detected" },
      { pattern: /\/\*/g, threat: "SQL Injection: Multi-line comment detected" },
      { pattern: /'.*OR.*'/gi, threat: "SQL Injection: OR condition with quotes" },
    ];

    sqlPatterns.forEach(({ pattern, threat }) => {
      if (pattern.test(text)) {
        threats.push(threat);
      }
    });

    // Escape single quotes
    sanitized = sanitized.replace(/'/g, "''");

    return { sanitized, threats };
  };

  const sanitize = (type: "html" | "sql") => {
    if (!input.trim()) {
      setOutput("");
      setThreats([]);
      return;
    }

    const result = type === "html" ? sanitizeHTML(input) : sanitizeSQL(input);
    setOutput(result.sanitized);
    setThreats(result.threats);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Data Sanitizer"
        description="Sanitize HTML and SQL input to prevent XSS and SQL injection attacks"
        icon={<Database size={32} />}
      />

      <main className={styles.main}>
        <Tabs defaultValue="html" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="html">HTML/XSS</TabsTrigger>
            <TabsTrigger value="sql">SQL Injection</TabsTrigger>
          </TabsList>

          <TabsContent value="html">
            <Card className={styles.card}>
              <div className={styles.inputSection}>
                <h3 className={styles.label}>Input (Potentially Malicious)</h3>
                <Textarea
                  placeholder='Enter HTML/text to sanitize... Try: <script>alert("XSS")</script>'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                  className={styles.textarea}
                />
                <Button onClick={() => sanitize("html")} className={styles.button}>
                  <Shield size={18} />
                  Sanitize HTML
                </Button>
              </div>

              {output && (
                <div className={styles.outputSection}>
                  <h3 className={styles.label}>Sanitized Output</h3>
                  <CodeWindow>{output}</CodeWindow>

                  {threats.length > 0 && (
                    <div className={styles.threats}>
                      <h4 className={styles.threatsTitle}>
                        <AlertTriangle size={18} />
                        Detected Threats ({threats.length})
                      </h4>
                      <ul className={styles.threatsList}>
                        {threats.map((threat, index) => (
                          <li key={index}>{threat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sql">
            <Card className={styles.card}>
              <div className={styles.inputSection}>
                <h3 className={styles.label}>Input (Potentially Malicious)</h3>
                <Textarea
                  placeholder="Enter SQL input to sanitize... Try: admin' OR '1'='1"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                  className={styles.textarea}
                />
                <Button onClick={() => sanitize("sql")} className={styles.button}>
                  <Shield size={18} />
                  Sanitize SQL
                </Button>
              </div>

              {output && (
                <div className={styles.outputSection}>
                  <h3 className={styles.label}>Sanitized Output</h3>
                  <CodeWindow>{output}</CodeWindow>

                  {threats.length > 0 && (
                    <div className={styles.threats}>
                      <h4 className={styles.threatsTitle}>
                        <AlertTriangle size={18} />
                        Detected Threats ({threats.length})
                      </h4>
                      <ul className={styles.threatsList}>
                        {threats.map((threat, index) => (
                          <li key={index}>{threat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
