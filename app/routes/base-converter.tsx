import { useState, useMemo } from "react";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Binary, Copy, Check, Trash2, RefreshCw, ArrowDown } from "lucide-react";
import styles from "./base-converter.module.css";

type BaseType = "text" | "hex" | "decimal" | "binary" | "octal" | "base64";

interface ConversionResult {
  text: string;
  hex: string;
  decimal: string;
  binary: string;
  octal: string;
  base64: string;
}

export default function BaseConverter() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<BaseType>("text");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Parse input to bytes based on input type
  const inputBytes = useMemo((): number[] => {
    if (!input.trim()) return [];

    try {
      switch (inputType) {
        case "text":
          return Array.from(input, (c) => c.charCodeAt(0));

        case "hex": {
          const clean = input.replace(/\s+/g, "").replace(/0x/gi, "");
          if (!/^[0-9a-fA-F]*$/.test(clean)) return [];
          const bytes: number[] = [];
          for (let i = 0; i < clean.length; i += 2) {
            bytes.push(parseInt(clean.substr(i, 2), 16));
          }
          return bytes;
        }

        case "decimal": {
          const nums = input.split(/[\s,]+/).filter(Boolean);
          return nums.map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n >= 0 && n <= 255);
        }

        case "binary": {
          const clean = input.replace(/\s+/g, "");
          if (!/^[01]*$/.test(clean)) return [];
          const bytes: number[] = [];
          for (let i = 0; i < clean.length; i += 8) {
            const byte = clean.substr(i, 8).padEnd(8, "0");
            bytes.push(parseInt(byte, 2));
          }
          return bytes;
        }

        case "octal": {
          const nums = input.split(/[\s,]+/).filter(Boolean);
          return nums.map((n) => parseInt(n, 8)).filter((n) => !isNaN(n) && n >= 0 && n <= 255);
        }

        case "base64": {
          try {
            const decoded = atob(input.trim());
            return Array.from(decoded, (c) => c.charCodeAt(0));
          } catch {
            return [];
          }
        }

        default:
          return [];
      }
    } catch {
      return [];
    }
  }, [input, inputType]);

  // Convert bytes to all formats
  const conversions = useMemo((): ConversionResult | null => {
    if (inputBytes.length === 0) return null;

    return {
      text: inputBytes.map((b) => String.fromCharCode(b)).join(""),
      hex: inputBytes.map((b) => b.toString(16).padStart(2, "0")).join(" "),
      decimal: inputBytes.join(" "),
      binary: inputBytes.map((b) => b.toString(2).padStart(8, "0")).join(" "),
      octal: inputBytes.map((b) => b.toString(8).padStart(3, "0")).join(" "),
      base64: btoa(inputBytes.map((b) => String.fromCharCode(b)).join("")),
    };
  }, [inputBytes]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const handleUseAsInput = (value: string, type: BaseType) => {
    setInput(value);
    setInputType(type);
  };

  const formats: { key: BaseType; label: string; description: string }[] = [
    { key: "text", label: "ASCII Text", description: "Plain text characters" },
    { key: "hex", label: "Hexadecimal", description: "Base-16 (0-9, A-F)" },
    { key: "decimal", label: "Decimal", description: "Base-10 byte values" },
    { key: "binary", label: "Binary", description: "Base-2 (0s and 1s)" },
    { key: "octal", label: "Octal", description: "Base-8 (0-7)" },
    { key: "base64", label: "Base64", description: "Base64 encoding" },
  ];

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Base Converter"
        description="Convert between Hex, Binary, Decimal, Octal, ASCII, and Base64. Essential for CTF and reverse engineering."
        icon={<Binary size={32} />}
      />

      <div className={styles.content}>
        {/* Input Section */}
        <Card>
          <CardContent className={styles.cardBody}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Input</h3>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 size={16} />
              </Button>
            </div>

            <div className={styles.formatSelector}>
              {formats.map((fmt) => (
                <button
                  key={fmt.key}
                  className={`${styles.formatBtn} ${inputType === fmt.key ? styles.active : ""}`}
                  onClick={() => setInputType(fmt.key)}
                >
                  <span className={styles.formatLabel}>{fmt.label}</span>
                  <span className={styles.formatDesc}>{fmt.description}</span>
                </button>
              ))}
            </div>

            <textarea
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                inputType === "text"
                  ? "Enter text... e.g., Hello World"
                  : inputType === "hex"
                    ? "Enter hex... e.g., 48 65 6c 6c 6f or 48656c6c6f"
                    : inputType === "decimal"
                      ? "Enter decimal bytes... e.g., 72 101 108 108 111"
                      : inputType === "binary"
                        ? "Enter binary... e.g., 01001000 01100101 01101100"
                        : inputType === "octal"
                          ? "Enter octal... e.g., 110 145 154 154 157"
                          : "Enter base64... e.g., SGVsbG8gV29ybGQ="
              }
              rows={4}
            />

            {inputBytes.length > 0 && (
              <div className={styles.byteCount}>
                <Badge variant="secondary">{inputBytes.length} bytes</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Results */}
        {conversions && (
          <>
            <div className={styles.arrowContainer}>
              <ArrowDown size={24} className={styles.arrowIcon} />
            </div>

            <Card>
              <CardContent className={styles.cardBody}>
                <h3 className={styles.sectionTitle}>Conversions</h3>

                <div className={styles.resultsGrid}>
                  {formats.map((fmt) => (
                    <div key={fmt.key} className={styles.resultItem}>
                      <div className={styles.resultHeader}>
                        <span className={styles.resultLabel}>{fmt.label}</span>
                        <div className={styles.resultActions}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUseAsInput(conversions[fmt.key], fmt.key)}
                            title="Use as input"
                          >
                            <RefreshCw size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(conversions[fmt.key], fmt.key)}>
                            {copiedField === fmt.key ? <Check size={14} /> : <Copy size={14} />}
                          </Button>
                        </div>
                      </div>
                      <code className={styles.resultCode}>{conversions[fmt.key]}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ASCII Table Reference */}
        <Card>
          <CardContent className={styles.cardBody}>
            <h3 className={styles.sectionTitle}>Quick ASCII Reference</h3>
            <div className={styles.asciiGrid}>
              {[
                { char: "A", dec: 65, hex: "41" },
                { char: "Z", dec: 90, hex: "5A" },
                { char: "a", dec: 97, hex: "61" },
                { char: "z", dec: 122, hex: "7A" },
                { char: "0", dec: 48, hex: "30" },
                { char: "9", dec: 57, hex: "39" },
                { char: " ", dec: 32, hex: "20" },
                { char: "\\n", dec: 10, hex: "0A" },
                { char: "{", dec: 123, hex: "7B" },
                { char: "}", dec: 125, hex: "7D" },
                { char: "_", dec: 95, hex: "5F" },
                { char: "=", dec: 61, hex: "3D" },
              ].map((item) => (
                <div key={item.char} className={styles.asciiItem}>
                  <span className={styles.asciiChar}>{item.char}</span>
                  <span className={styles.asciiDec}>{item.dec}</span>
                  <span className={styles.asciiHex}>0x{item.hex}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
