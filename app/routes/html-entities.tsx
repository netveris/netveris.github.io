import { useState, useCallback } from "react";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Switch } from "~/components/ui/switch/switch";
import { Code, ArrowRightLeft, Copy, Check, Trash2, Info, ShieldCheck } from "lucide-react";
import styles from "./html-entities.module.css";

type Mode = "encode" | "decode";

interface EntityRef {
  char: string;
  entity: string;
  name: string;
  code: number;
}

const COMMON_ENTITIES: EntityRef[] = [
  { char: "<", entity: "&lt;", name: "Less than", code: 60 },
  { char: ">", entity: "&gt;", name: "Greater than", code: 62 },
  { char: "&", entity: "&amp;", name: "Ampersand", code: 38 },
  { char: '"', entity: "&quot;", name: "Double quote", code: 34 },
  { char: "'", entity: "&#39;", name: "Single quote", code: 39 },
  { char: " ", entity: "&nbsp;", name: "Non-breaking space", code: 160 },
  { char: "©", entity: "&copy;", name: "Copyright", code: 169 },
  { char: "®", entity: "&reg;", name: "Registered", code: 174 },
  { char: "™", entity: "&trade;", name: "Trademark", code: 8482 },
  { char: "€", entity: "&euro;", name: "Euro", code: 8364 },
  { char: "£", entity: "&pound;", name: "Pound", code: 163 },
  { char: "¥", entity: "&yen;", name: "Yen", code: 165 },
  { char: "•", entity: "&bull;", name: "Bullet", code: 8226 },
  { char: "—", entity: "&mdash;", name: "Em dash", code: 8212 },
  { char: "–", entity: "&ndash;", name: "En dash", code: 8211 },
  { char: "…", entity: "&hellip;", name: "Ellipsis", code: 8230 },
];

// Characters that are dangerous in HTML context
const HTML_DANGEROUS = /[<>&"']/g;

// All non-ASCII and special characters
const ENCODE_ALL = /[^\w\s]/g;

export default function HtmlEntities() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [encodeAll, setEncodeAll] = useState(false);
  const [useNumeric, setUseNumeric] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ chars: 0, encoded: 0 });

  const entityMap: Record<string, string> = {
    "<": useNumeric ? "&#60;" : "&lt;",
    ">": useNumeric ? "&#62;" : "&gt;",
    "&": useNumeric ? "&#38;" : "&amp;",
    '"': useNumeric ? "&#34;" : "&quot;",
    "'": useNumeric ? "&#39;" : "&#39;", // No named entity for single quote
  };

  const encodeHtml = useCallback(
    (text: string): string => {
      if (!text) return "";

      let encodedCount = 0;
      const pattern = encodeAll ? ENCODE_ALL : HTML_DANGEROUS;

      const result = text.replace(pattern, (char) => {
        encodedCount++;
        if (!encodeAll && entityMap[char]) {
          return entityMap[char];
        }
        // Use numeric entity for extended characters
        return `&#${char.charCodeAt(0)};`;
      });

      setStats({ chars: text.length, encoded: encodedCount });
      return result;
    },
    [encodeAll, useNumeric],
  );

  const decodeHtml = useCallback((text: string): string => {
    if (!text) return "";

    // Create a temporary element to decode HTML entities
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    const decoded = textarea.value;

    // Count entities that were decoded
    const entityPattern = /&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g;
    const matches = text.match(entityPattern);
    setStats({ chars: decoded.length, encoded: matches?.length ?? 0 });

    return decoded;
  }, []);

  const handleProcess = useCallback(() => {
    if (mode === "encode") {
      setOutput(encodeHtml(input));
    } else {
      setOutput(decodeHtml(input));
    }
  }, [mode, input, encodeHtml, decodeHtml]);

  const handleSwap = () => {
    setInput(output);
    setOutput("");
    setStats({ chars: 0, encoded: 0 });
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStats({ chars: 0, encoded: 0 });
  };

  const insertEntity = (entity: string) => {
    setInput((prev) => prev + entity);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="HTML Entity Encoder"
        description="Encode and decode HTML entities to prevent XSS attacks and display special characters"
        icon={<Code size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          {/* Input Section */}
          <div className={styles.inputSection}>
            <Card>
              <CardContent className={styles.cardBody}>
                <div className={styles.sectionHeader}>
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
                  <div className={styles.headerActions}>
                    <Button variant="ghost" size="sm" onClick={handleSwap} disabled={!output}>
                      <ArrowRightLeft size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <textarea
                  className={styles.textarea}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "encode"
                      ? 'Enter text to encode... e.g., <script>alert("XSS")</script>'
                      : "Enter HTML entities to decode... e.g., &lt;div&gt;Hello&lt;/div&gt;"
                  }
                  rows={8}
                />

                {mode === "encode" && (
                  <div className={styles.options}>
                    <label className={styles.toggleOption}>
                      <Switch checked={encodeAll} onCheckedChange={setEncodeAll} />
                      <span>Encode all non-alphanumeric</span>
                    </label>
                    <label className={styles.toggleOption}>
                      <Switch checked={useNumeric} onCheckedChange={setUseNumeric} />
                      <span>Use numeric entities</span>
                    </label>
                  </div>
                )}

                <Button className={styles.processBtn} onClick={handleProcess} disabled={!input}>
                  {mode === "encode" ? "Encode HTML" : "Decode HTML"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className={styles.outputSection}>
            <Card>
              <CardContent className={styles.cardBody}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{mode === "encode" ? "Encoded Output" : "Decoded Output"}</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>

                <div className={styles.outputBox}>
                  {output ? (
                    <code className={styles.outputCode}>{output}</code>
                  ) : (
                    <span className={styles.placeholder}>
                      {mode === "encode" ? "Encoded result will appear here..." : "Decoded result will appear here..."}
                    </span>
                  )}
                </div>

                {output && (
                  <div className={styles.statsBadges}>
                    <Badge variant="secondary">{stats.chars} characters</Badge>
                    <Badge variant="secondary">
                      {stats.encoded} {mode === "encode" ? "encoded" : "entities decoded"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className={styles.cardBody}>
                <div className={styles.infoHeader}>
                  <ShieldCheck size={18} className={styles.infoIcon} />
                  <h3 className={styles.sectionTitle}>XSS Prevention</h3>
                </div>
                <p className={styles.infoText}>
                  Always encode user input before inserting into HTML to prevent Cross-Site Scripting (XSS) attacks. The
                  most dangerous characters are: <code>&lt;</code> <code>&gt;</code> <code>&amp;</code>{" "}
                  <code>&quot;</code> <code>&#39;</code>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Entity Reference */}
        <Card className={styles.referenceCard}>
          <CardContent className={styles.cardBody}>
            <div className={styles.referenceHeader}>
              <Info size={18} />
              <h3 className={styles.sectionTitle}>Common HTML Entities</h3>
              <span className={styles.referenceHint}>Click to insert</span>
            </div>
            <div className={styles.entityGrid}>
              {COMMON_ENTITIES.map((entity) => (
                <button
                  key={entity.code}
                  className={styles.entityItem}
                  onClick={() => insertEntity(entity.char)}
                  title={entity.name}
                >
                  <span className={styles.entityChar}>{entity.char}</span>
                  <span className={styles.entityCode}>{entity.entity}</span>
                  <span className={styles.entityNum}>&#&#{entity.code};</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
