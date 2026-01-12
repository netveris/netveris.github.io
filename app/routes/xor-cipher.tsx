import { useState, useCallback, useMemo } from "react";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Input } from "~/components/ui/input/input";
import { Switch } from "~/components/ui/switch/switch";
import { Unlink, Copy, Check, ArrowRightLeft, Trash2, AlertTriangle, Zap } from "lucide-react";
import styles from "./xor-cipher.module.css";

type InputFormat = "text" | "hex" | "base64";
type KeyFormat = "text" | "hex" | "single-byte";

export default function XorCipher() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [inputFormat, setInputFormat] = useState<InputFormat>("text");
  const [keyFormat, setKeyFormat] = useState<KeyFormat>("text");
  const [outputHex, setOutputHex] = useState(true);
  const [copied, setCopied] = useState(false);

  // Convert hex string to byte array
  const hexToBytes = (hex: string): number[] => {
    const clean = hex.replace(/\s/g, "").replace(/0x/gi, "");
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 2) {
      const byte = parseInt(clean.substr(i, 2), 16);
      if (!isNaN(byte)) bytes.push(byte);
    }
    return bytes;
  };

  // Convert base64 to byte array
  const base64ToBytes = (b64: string): number[] => {
    try {
      const binary = atob(b64.trim());
      return Array.from(binary, (char) => char.charCodeAt(0));
    } catch {
      return [];
    }
  };

  // Convert text to byte array
  const textToBytes = (text: string): number[] => {
    return Array.from(text, (char) => char.charCodeAt(0));
  };

  // Convert byte array to hex string
  const bytesToHex = (bytes: number[]): string => {
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
  };

  // Convert byte array to text
  const bytesToText = (bytes: number[]): string => {
    return bytes.map((b) => String.fromCharCode(b)).join("");
  };

  // Get input bytes based on format
  const getInputBytes = useCallback((): number[] => {
    switch (inputFormat) {
      case "hex":
        return hexToBytes(input);
      case "base64":
        return base64ToBytes(input);
      default:
        return textToBytes(input);
    }
  }, [input, inputFormat]);

  // Get key bytes based on format
  const getKeyBytes = useCallback((): number[] => {
    switch (keyFormat) {
      case "hex":
        return hexToBytes(key);
      case "single-byte":
        const byte = parseInt(key, 16);
        return isNaN(byte) ? [] : [byte];
      default:
        return textToBytes(key);
    }
  }, [key, keyFormat]);

  // XOR operation
  const xorBytes = useCallback((data: number[], keyBytes: number[]): number[] => {
    if (keyBytes.length === 0) return data;
    return data.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
  }, []);

  const output = useMemo(() => {
    const inputBytes = getInputBytes();
    const keyBytes = getKeyBytes();
    if (inputBytes.length === 0 || keyBytes.length === 0) return "";

    const result = xorBytes(inputBytes, keyBytes);
    return outputHex ? bytesToHex(result) : bytesToText(result);
  }, [getInputBytes, getKeyBytes, xorBytes, outputHex]);

  // Brute force single-byte XOR
  const bruteForce = useMemo(() => {
    const inputBytes = getInputBytes();
    if (inputBytes.length === 0 || inputBytes.length > 200) return [];

    return Array.from({ length: 256 }, (_, key) => {
      const result = inputBytes.map((b) => b ^ key);
      const text = bytesToText(result);
      // Score based on printable ASCII characters
      const printable = text.split("").filter((c) => {
        const code = c.charCodeAt(0);
        return code >= 32 && code <= 126;
      }).length;
      const score = printable / text.length;
      return { key, hex: key.toString(16).padStart(2, "0"), text, score };
    })
      .filter((r) => r.score > 0.7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [getInputBytes]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  const handleSwap = () => {
    setInput(output);
    setInputFormat(outputHex ? "hex" : "text");
  };

  const handleClear = () => {
    setInput("");
    setKey("");
  };

  const copyBruteResult = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="XOR Cipher"
        description="Encode and decode data using XOR encryption. Supports brute-force single-byte key analysis for CTF challenges."
        icon={<Unlink size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          {/* Input Section */}
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Input Data</h3>
                <div className={styles.headerActions}>
                  <Button variant="ghost" size="sm" onClick={handleSwap} disabled={!output}>
                    <ArrowRightLeft size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className={styles.formatToggle}>
                {(["text", "hex", "base64"] as InputFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    className={`${styles.formatBtn} ${inputFormat === fmt ? styles.active : ""}`}
                    onClick={() => setInputFormat(fmt)}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>

              <textarea
                className={styles.textarea}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inputFormat === "hex"
                    ? "Enter hex bytes... e.g., 48 65 6c 6c 6f"
                    : inputFormat === "base64"
                      ? "Enter base64 string... e.g., SGVsbG8gV29ybGQ="
                      : "Enter text to XOR... e.g., Hello World"
                }
                rows={5}
              />

              <div className={styles.keySection}>
                <div className={styles.keyHeader}>
                  <span className={styles.keyLabel}>XOR Key</span>
                  <div className={styles.keyFormatToggle}>
                    {(["text", "hex", "single-byte"] as KeyFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        className={`${styles.keyFormatBtn} ${keyFormat === fmt ? styles.active : ""}`}
                        onClick={() => setKeyFormat(fmt)}
                      >
                        {fmt === "single-byte" ? "Byte" : fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={
                    keyFormat === "hex"
                      ? "Key in hex... e.g., 4b 45 59"
                      : keyFormat === "single-byte"
                        ? "Single byte 00-FF... e.g., 0x42"
                        : "Key as text... e.g., secret"
                  }
                  className={styles.keyInput}
                />
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>XOR Result</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>

              <label className={styles.toggleOption}>
                <Switch checked={outputHex} onCheckedChange={setOutputHex} />
                <span>Output as Hex</span>
              </label>

              <div className={styles.outputBox}>
                {output ? (
                  <code className={styles.outputCode}>{output}</code>
                ) : (
                  <span className={styles.placeholder}>XOR result will appear here...</span>
                )}
              </div>

              <div className={styles.infoBox}>
                <Zap size={16} className={styles.infoIcon} />
                <span>XOR is symmetric: A ⊕ B ⊕ B = A. XOR'ing with the same key twice returns the original data.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brute Force Section */}
        {input && getInputBytes().length > 0 && getInputBytes().length <= 200 && (
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <AlertTriangle size={18} />
                  Single-Byte XOR Brute Force
                </h3>
                <Badge variant="secondary">Top {bruteForce.length} results</Badge>
              </div>

              {bruteForce.length > 0 ? (
                <div className={styles.bruteGrid}>
                  {bruteForce.map((result) => (
                    <button key={result.key} className={styles.bruteItem} onClick={() => copyBruteResult(result.text)}>
                      <span className={styles.bruteKey}>0x{result.hex}</span>
                      <span className={styles.bruteScore}>{Math.round(result.score * 100)}%</span>
                      <span className={styles.bruteText}>
                        {result.text.slice(0, 60)}
                        {result.text.length > 60 ? "..." : ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.noResults}>No high-confidence results found. Try different input.</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Common XOR Keys */}
        <Card>
          <CardContent className={styles.cardBody}>
            <h3 className={styles.sectionTitle}>Common XOR Patterns in CTF</h3>
            <div className={styles.referenceGrid}>
              <div className={styles.refItem}>
                <strong>0x00</strong>
                <span>Identity - no change</span>
              </div>
              <div className={styles.refItem}>
                <strong>0xFF</strong>
                <span>Inverts all bits</span>
              </div>
              <div className={styles.refItem}>
                <strong>0x20</strong>
                <span>Toggles case (A↔a)</span>
              </div>
              <div className={styles.refItem}>
                <strong>Repeating Key</strong>
                <span>Try "CTF", "FLAG", "KEY", "SECRET"</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
