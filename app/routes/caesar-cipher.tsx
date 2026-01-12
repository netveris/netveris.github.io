import { useState, useCallback, useMemo } from "react";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Slider } from "~/components/ui/slider/slider";
import { RotateCcw, Copy, Check, ArrowRightLeft, Trash2, Zap } from "lucide-react";
import styles from "./caesar-cipher.module.css";

export function meta() {
  return [
    { title: "Caesar Cipher - Netveris" },
    { name: "description", content: "Encrypt and decrypt with Caesar cipher" },
  ];
}

export default function CaesarCipher() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(13); // Default ROT13
  const [copied, setCopied] = useState(false);

  const shiftChar = useCallback((char: string, shiftAmount: number): string => {
    const code = char.charCodeAt(0);

    // Uppercase letters
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((((code - 65 + shiftAmount) % 26) + 26) % 26) + 65);
    }
    // Lowercase letters
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((((code - 97 + shiftAmount) % 26) + 26) % 26) + 97);
    }
    // Non-alphabetic characters remain unchanged
    return char;
  }, []);

  const encode = useCallback(
    (text: string, shiftAmount: number): string => {
      return text
        .split("")
        .map((char) => shiftChar(char, shiftAmount))
        .join("");
    },
    [shiftChar],
  );

  const output = useMemo(() => encode(input, shift), [input, shift, encode]);

  // Brute force all 26 rotations
  const allRotations = useMemo(() => {
    if (!input) return [];
    return Array.from({ length: 26 }, (_, i) => ({
      shift: i,
      text: encode(input, i),
    }));
  }, [input, encode]);

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
  };

  const handleClear = () => {
    setInput("");
  };

  const handleQuickShift = (value: number) => {
    setShift(value);
  };

  const copyRotation = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Caesar Cipher / ROT13"
        description="Encode and decode text using Caesar cipher with customizable rotation. Essential for CTF challenges."
        icon={<RotateCcw size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          {/* Input Section */}
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Input Text</h3>
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
                placeholder="Enter text to encode/decode... e.g., Flag{s3cr3t_m3ss4g3}"
                rows={6}
              />

              <div className={styles.shiftControl}>
                <div className={styles.shiftHeader}>
                  <span className={styles.shiftLabel}>Rotation Shift</span>
                  <Badge variant="secondary" className={styles.shiftBadge}>
                    ROT{shift}
                  </Badge>
                </div>
                <Slider
                  value={[shift]}
                  onValueChange={(v) => setShift(v[0])}
                  min={0}
                  max={25}
                  step={1}
                  className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                  <span>0</span>
                  <span>25</span>
                </div>
              </div>

              <div className={styles.quickShifts}>
                <span className={styles.quickLabel}>Quick:</span>
                {[1, 3, 7, 13, 19, 23].map((val) => (
                  <button
                    key={val}
                    className={`${styles.quickBtn} ${shift === val ? styles.active : ""}`}
                    onClick={() => handleQuickShift(val)}
                  >
                    ROT{val}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  Output <Badge variant="outline">ROT{shift}</Badge>
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>

              <div className={styles.outputBox}>
                {output ? (
                  <code className={styles.outputCode}>{output}</code>
                ) : (
                  <span className={styles.placeholder}>Encoded/decoded text will appear here...</span>
                )}
              </div>

              <div className={styles.infoBox}>
                <Zap size={16} className={styles.infoIcon} />
                <span>
                  ROT13 is its own inverse: encoding twice returns the original text. Common in CTF challenges and
                  obfuscation.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brute Force Section */}
        {input && (
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <Zap size={18} />
                  Brute Force - All Rotations
                </h3>
                <Badge variant="secondary">Click to copy</Badge>
              </div>

              <div className={styles.rotationsGrid}>
                {allRotations.map((rot) => (
                  <button
                    key={rot.shift}
                    className={`${styles.rotationItem} ${rot.shift === shift ? styles.active : ""}`}
                    onClick={() => copyRotation(rot.text)}
                  >
                    <span className={styles.rotLabel}>ROT{rot.shift}</span>
                    <span className={styles.rotText}>
                      {rot.text.slice(0, 50)}
                      {rot.text.length > 50 ? "..." : ""}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reference */}
        <Card>
          <CardContent className={styles.cardBody}>
            <h3 className={styles.sectionTitle}>Caesar Cipher Reference</h3>
            <div className={styles.referenceGrid}>
              <div className={styles.refItem}>
                <strong>ROT1</strong>
                <span>A→B, B→C, ... Z→A</span>
              </div>
              <div className={styles.refItem}>
                <strong>ROT13</strong>
                <span>A→N, B→O, ... M→Z, N→A (Self-inverse)</span>
              </div>
              <div className={styles.refItem}>
                <strong>ROT47</strong>
                <span>Rotates ASCII 33-126 (use for special chars)</span>
              </div>
              <div className={styles.refItem}>
                <strong>CTF Tip</strong>
                <span>Try all rotations if you see garbled text that looks like English</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
