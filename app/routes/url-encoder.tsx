import { useState } from "react";
import { Link2, Copy, Check, ArrowDownUp, Trash2, AlertTriangle } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import styles from "./url-encoder.module.css";

export function meta() {
  return [
    { title: "URL Encoder/Decoder - Netveris" },
    { name: "description", content: "Encode and decode URLs and query parameters" },
  ];
}

interface DecodedComponent {
  key: string;
  value: string;
  encoded: boolean;
}

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [components, setComponents] = useState<DecodedComponent[]>([]);

  const processUrl = () => {
    setError("");
    setComponents([]);

    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = encodeURIComponent(input);
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(input);
        setOutput(decoded);

        // Try to parse as URL and extract components
        try {
          const url = new URL(decoded.startsWith("http") ? decoded : `https://${decoded}`);
          const comps: DecodedComponent[] = [];

          if (url.pathname !== "/") {
            comps.push({ key: "Path", value: url.pathname, encoded: false });
          }

          url.searchParams.forEach((value, key) => {
            const wasEncoded = input.includes(encodeURIComponent(key)) || input.includes(encodeURIComponent(value));
            comps.push({ key, value, encoded: wasEncoded });
          });

          if (url.hash) {
            comps.push({ key: "Hash", value: url.hash, encoded: false });
          }

          setComponents(comps);
        } catch {
          // Not a valid URL, that's fine
        }
      }
    } catch (e: any) {
      setError(`Failed to ${mode}: ${e.message}`);
      setOutput("");
    }
  };

  const encodeFullUrl = () => {
    setError("");
    try {
      const url = new URL(input);
      // Encode only the query parameters
      const params = new URLSearchParams();
      url.searchParams.forEach((value, key) => {
        params.set(key, value);
      });
      url.search = params.toString();
      setOutput(url.toString());
    } catch {
      setError("Invalid URL format. Please enter a valid URL.");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapInputOutput = () => {
    setInput(output);
    setOutput("");
    setMode(mode === "encode" ? "decode" : "encode");
    setComponents([]);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
    setComponents([]);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="URL Encoder/Decoder"
        description="Encode and decode URLs, query parameters, and special characters"
        icon={<Link2 size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === "encode" ? styles.active : ""}`}
            onClick={() => setMode("encode")}
          >
            Encode
          </button>
          <button
            className={`${styles.modeBtn} ${mode === "decode" ? styles.active : ""}`}
            onClick={() => setMode("decode")}
          >
            Decode
          </button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle size={16} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={styles.editorGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className={styles.textarea}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? "Enter text to encode...\nExample: Hello World! @#$%"
                    : "Enter URL-encoded text to decode...\nExample: Hello%20World%21%20%40%23%24%25"
                }
                spellCheck={false}
              />
            </CardContent>
          </Card>

          <div className={styles.actions}>
            <Button onClick={processUrl} disabled={!input.trim()}>
              {mode === "encode" ? "Encode" : "Decode"}
            </Button>
            {mode === "encode" && input.includes("?") && (
              <Button variant="outline" onClick={encodeFullUrl}>
                Encode URL Params Only
              </Button>
            )}
            <Button variant="ghost" onClick={swapInputOutput} disabled={!output}>
              <ArrowDownUp size={16} />
            </Button>
            <Button variant="ghost" onClick={clear}>
              <Trash2 size={16} />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className={styles.outputHeader}>
                <CardTitle>Output</CardTitle>
                {output && (
                  <Button variant="ghost" size="sm" onClick={copyOutput}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.outputBox}>
                {output || <span className={styles.placeholder}>Result will appear here</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {components.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>URL Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.componentsGrid}>
                {components.map((comp, idx) => (
                  <div key={idx} className={styles.componentRow}>
                    <span className={styles.componentKey}>{comp.key}</span>
                    <span className={styles.componentValue}>{comp.value}</span>
                    {comp.encoded && <Badge variant="secondary">was encoded</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Common Encodings Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.referenceGrid}>
              {[
                { char: " ", encoded: "%20", desc: "Space" },
                { char: "!", encoded: "%21", desc: "Exclamation" },
                { char: "#", encoded: "%23", desc: "Hash" },
                { char: "$", encoded: "%24", desc: "Dollar" },
                { char: "%", encoded: "%25", desc: "Percent" },
                { char: "&", encoded: "%26", desc: "Ampersand" },
                { char: "'", encoded: "%27", desc: "Apostrophe" },
                { char: "+", encoded: "%2B", desc: "Plus" },
                { char: "/", encoded: "%2F", desc: "Slash" },
                { char: "=", encoded: "%3D", desc: "Equals" },
                { char: "?", encoded: "%3F", desc: "Question" },
                { char: "@", encoded: "%40", desc: "At" },
              ].map((item) => (
                <div key={item.char} className={styles.refItem}>
                  <code className={styles.refChar}>{item.char}</code>
                  <code className={styles.refEncoded}>{item.encoded}</code>
                  <span className={styles.refDesc}>{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
