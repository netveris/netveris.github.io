import { useState } from "react";
import { Shield, Copy, Check, Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Switch } from "~/components/ui/switch/switch";
import { Label } from "~/components/ui/label/label";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { CodeWindow } from "~/components/code-window";
import styles from "./csp-generator.module.css";

export function meta() {
  return [
    { title: "CSP Generator - Netveris" },
    { name: "description", content: "Generate Content Security Policy headers for your web application" },
  ];
}

interface DirectiveConfig {
  enabled: boolean;
  values: string[];
}

const DIRECTIVE_INFO: Record<string, string> = {
  "default-src": "Fallback for other fetch directives",
  "script-src": "Controls valid sources for JavaScript",
  "style-src": "Controls valid sources for stylesheets",
  "img-src": "Controls valid sources for images",
  "font-src": "Controls valid sources for fonts",
  "connect-src": "Controls URLs for fetch, XMLHttpRequest, WebSocket",
  "media-src": "Controls valid sources for audio/video",
  "object-src": "Controls valid sources for plugins",
  "frame-src": "Controls valid sources for frames",
  "frame-ancestors": "Controls who can embed this page",
  "base-uri": "Controls valid URLs for <base> element",
  "form-action": "Controls form submission targets",
  "report-uri": "URL to send CSP violation reports",
};

const COMMON_VALUES = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "https:", "data:", "blob:"];

export default function CspGenerator() {
  const [directives, setDirectives] = useState<Record<string, DirectiveConfig>>({
    "default-src": { enabled: true, values: ["'self'"] },
    "script-src": { enabled: true, values: ["'self'"] },
    "style-src": { enabled: true, values: ["'self'", "'unsafe-inline'"] },
    "img-src": { enabled: true, values: ["'self'", "data:", "https:"] },
    "font-src": { enabled: true, values: ["'self'"] },
    "connect-src": { enabled: true, values: ["'self'"] },
    "media-src": { enabled: false, values: ["'self'"] },
    "object-src": { enabled: true, values: ["'none'"] },
    "frame-src": { enabled: false, values: ["'self'"] },
    "frame-ancestors": { enabled: true, values: ["'self'"] },
    "base-uri": { enabled: true, values: ["'self'"] },
    "form-action": { enabled: true, values: ["'self'"] },
  });

  const [upgradeInsecure, setUpgradeInsecure] = useState(true);
  const [blockMixedContent, setBlockMixedContent] = useState(true);
  const [newValue, setNewValue] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const generateCSP = () => {
    const parts: string[] = [];

    Object.entries(directives).forEach(([directive, config]) => {
      if (config.enabled && config.values.length > 0) {
        parts.push(`${directive} ${config.values.join(" ")}`);
      }
    });

    if (upgradeInsecure) parts.push("upgrade-insecure-requests");
    if (blockMixedContent) parts.push("block-all-mixed-content");

    return parts.join("; ");
  };

  const toggleDirective = (name: string) => {
    setDirectives((prev) => ({
      ...prev,
      [name]: { ...prev[name], enabled: !prev[name].enabled },
    }));
  };

  const addValue = (directive: string, value: string) => {
    if (!value.trim()) return;
    setDirectives((prev) => ({
      ...prev,
      [directive]: {
        ...prev[directive],
        values: [...prev[directive].values, value.trim()],
      },
    }));
    setNewValue((prev) => ({ ...prev, [directive]: "" }));
  };

  const removeValue = (directive: string, index: number) => {
    setDirectives((prev) => ({
      ...prev,
      [directive]: {
        ...prev[directive],
        values: prev[directive].values.filter((_, i) => i !== index),
      },
    }));
  };

  const copyCSP = async () => {
    await navigator.clipboard.writeText(generateCSP());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const csp = generateCSP();
  const hasUnsafe = csp.includes("unsafe-inline") || csp.includes("unsafe-eval");

  return (
    <div className={styles.container}>
      <ToolHeader
        title="CSP Generator"
        description="Generate Content Security Policy headers for enhanced security"
        icon={<Shield size={32} />}
      />

      <div className={styles.content}>
        {hasUnsafe && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your policy includes 'unsafe-inline' or 'unsafe-eval'. Consider using nonces or hashes for better
              security.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Policy</CardTitle>
              <Button variant="outline" size="sm" onClick={copyCSP}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeWindow>{`Content-Security-Policy: ${csp}`}</CodeWindow>
          </CardContent>
        </Card>

        <div className={styles.optionsRow}>
          <div className={styles.optionItem}>
            <Switch checked={upgradeInsecure} onCheckedChange={setUpgradeInsecure} id="upgrade" />
            <Label htmlFor="upgrade">upgrade-insecure-requests</Label>
          </div>
          <div className={styles.optionItem}>
            <Switch checked={blockMixedContent} onCheckedChange={setBlockMixedContent} id="mixed" />
            <Label htmlFor="mixed">block-all-mixed-content</Label>
          </div>
        </div>

        <div className={styles.directivesGrid}>
          {Object.entries(directives).map(([name, config]) => (
            <Card key={name} className={config.enabled ? styles.activeCard : styles.inactiveCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <Switch checked={config.enabled} onCheckedChange={() => toggleDirective(name)} id={name} />
                  <Label htmlFor={name} className={styles.directiveName}>
                    {name}
                  </Label>
                </div>
                <span className={styles.infoIcon} title={DIRECTIVE_INFO[name]}>
                  <Info size={14} />
                </span>
              </div>
              {config.enabled && (
                <div className={styles.cardBody}>
                  <div className={styles.valueList}>
                    {config.values.map((value, idx) => (
                      <div key={idx} className={styles.valueTag}>
                        <span>{value}</span>
                        <button onClick={() => removeValue(name, idx)} className={styles.removeBtn}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addValue}>
                    <Input
                      placeholder="Add source..."
                      value={newValue[name] || ""}
                      onChange={(e) => setNewValue((prev) => ({ ...prev, [name]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addValue(name, newValue[name] || "")}
                    />
                    <Button size="sm" variant="ghost" onClick={() => addValue(name, newValue[name] || "")}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className={styles.quickAdd}>
                    {COMMON_VALUES.map((val) => (
                      <button
                        key={val}
                        onClick={() => !config.values.includes(val) && addValue(name, val)}
                        disabled={config.values.includes(val)}
                        className={styles.quickBtn}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
