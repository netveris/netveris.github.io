import { useState } from "react";
import { KeyRound, Copy, Check, RefreshCw, Trash2, Download } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Slider } from "~/components/ui/slider/slider";
import { Switch } from "~/components/ui/switch/switch";
import { Label } from "~/components/ui/label/label";
import styles from "./secret-generator.module.css";

export function meta() {
  return [
    { title: "Secret Generator - Netveris" },
    { name: "description", content: "Generate secure API keys, tokens, and secrets" },
  ];
}

type SecretType = "hex" | "base64" | "alphanumeric" | "uuid" | "api-key";

interface GeneratedSecret {
  id: string;
  type: SecretType;
  value: string;
  timestamp: Date;
}

const SECRET_TYPES: { value: SecretType; label: string; description: string }[] = [
  { value: "hex", label: "Hex String", description: "Random hexadecimal characters" },
  { value: "base64", label: "Base64", description: "Base64-encoded random bytes" },
  { value: "alphanumeric", label: "Alphanumeric", description: "Letters and numbers only" },
  { value: "uuid", label: "UUID v4", description: "Random UUID format" },
  { value: "api-key", label: "API Key", description: "Prefixed key format (sk_live_...)" },
];

function generateSecret(type: SecretType, length: number, prefix: string): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  switch (type) {
    case "hex":
      return Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, length);

    case "base64":
      let binary = "";
      array.forEach((byte) => (binary += String.fromCharCode(byte)));
      return btoa(binary).slice(0, length);

    case "alphanumeric": {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from(array)
        .map((b) => chars[b % chars.length])
        .join("")
        .slice(0, length);
    }

    case "uuid": {
      const hex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${["8", "9", "a", "b"][array[8] % 4]}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    }

    case "api-key": {
      const key = Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, length);
      return `${prefix}_${key}`;
    }

    default:
      return "";
  }
}

export default function SecretGenerator() {
  const [secretType, setSecretType] = useState<SecretType>("hex");
  const [length, setLength] = useState(32);
  const [prefix, setPrefix] = useState("sk_live");
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [history, setHistory] = useState<GeneratedSecret[]>([]);
  const [currentSecret, setCurrentSecret] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generate = () => {
    let secret = generateSecret(secretType, length, prefix);
    if (includeTimestamp && secretType !== "uuid") {
      const ts = Date.now().toString(36);
      secret = `${secret}_${ts}`;
    }
    setCurrentSecret(secret);
    setHistory([
      { id: crypto.randomUUID(), type: secretType, value: secret, timestamp: new Date() },
      ...history.slice(0, 9),
    ]);
  };

  const copySecret = async (value: string, id?: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id || "current");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const downloadSecrets = () => {
    const content = history.map((s) => `${s.type}: ${s.value}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "secrets.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Secret Generator"
        description="Generate secure API keys, tokens, and cryptographic secrets"
        icon={<KeyRound size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          <div className={styles.configSection}>
            <Card>
              <CardHeader>
                <CardTitle>Secret Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.typeGrid}>
                  {SECRET_TYPES.map((type) => (
                    <button
                      key={type.value}
                      className={`${styles.typeBtn} ${secretType === type.value ? styles.active : ""}`}
                      onClick={() => setSecretType(type.value)}
                    >
                      <span className={styles.typeLabel}>{type.label}</span>
                      <span className={styles.typeDesc}>{type.description}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.optionsGrid}>
                  {secretType !== "uuid" && (
                    <div className={styles.optionGroup}>
                      <div className={styles.optionHeader}>
                        <Label>Length</Label>
                        <Badge variant="secondary">{length}</Badge>
                      </div>
                      <Slider value={[length]} onValueChange={(v) => setLength(v[0])} min={8} max={128} step={1} />
                      <div className={styles.sliderLabels}>
                        <span>8</span>
                        <span>128</span>
                      </div>
                    </div>
                  )}

                  {secretType === "api-key" && (
                    <div className={styles.optionGroup}>
                      <Label htmlFor="prefix">Key Prefix</Label>
                      <input
                        id="prefix"
                        type="text"
                        className={styles.prefixInput}
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="sk_live"
                      />
                      <div className={styles.prefixSuggestions}>
                        {["sk_live", "sk_test", "pk_live", "api_key", "secret"].map((p) => (
                          <button key={p} className={styles.prefixBtn} onClick={() => setPrefix(p)}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {secretType !== "uuid" && (
                    <div className={styles.toggleOption}>
                      <Switch id="timestamp" checked={includeTimestamp} onCheckedChange={setIncludeTimestamp} />
                      <Label htmlFor="timestamp">Append timestamp suffix</Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={generate} className={styles.generateBtn}>
              <RefreshCw size={18} />
              Generate Secret
            </Button>
          </div>

          <div className={styles.outputSection}>
            <Card>
              <CardHeader>
                <CardTitle>Generated Secret</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.secretDisplay}>
                  {currentSecret ? (
                    <>
                      <code className={styles.secretValue}>{currentSecret}</code>
                      <Button variant="ghost" size="sm" onClick={() => copySecret(currentSecret)}>
                        {copiedId === "current" ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </>
                  ) : (
                    <span className={styles.placeholder}>Click "Generate Secret" to create a new secret</span>
                  )}
                </div>
                {currentSecret && (
                  <div className={styles.secretMeta}>
                    <Badge variant="outline">{secretType}</Badge>
                    <span>{currentSecret.length} characters</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className={styles.historyHeader}>
                  <CardTitle>History</CardTitle>
                  <div className={styles.historyActions}>
                    {history.length > 0 && (
                      <>
                        <Button variant="ghost" size="sm" onClick={downloadSecrets}>
                          <Download size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearHistory}>
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className={styles.historyList}>
                    {history.map((secret) => (
                      <div key={secret.id} className={styles.historyItem}>
                        <div className={styles.historyMain}>
                          <Badge variant="secondary" className={styles.historyType}>
                            {secret.type}
                          </Badge>
                          <code className={styles.historyValue}>{secret.value}</code>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copySecret(secret.value, secret.id)}>
                          {copiedId === secret.id ? <Check size={14} /> : <Copy size={14} />}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyHistory}>Generated secrets will appear here</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
