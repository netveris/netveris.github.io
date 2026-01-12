import { useState, useCallback } from "react";
import { Key, Copy, RefreshCw, Check, Shield, Zap } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Slider } from "~/components/ui/slider/slider";
import { Switch } from "~/components/ui/switch/switch";
import { Label } from "~/components/ui/label/label";
import styles from "./password-generator.module.css";

export function meta() {
  return [
    { title: "Password Generator - Netveris" },
    { name: "description", content: "Generate cryptographically secure passwords with customizable options" },
  ];
}

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function calculateStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: "Weak", color: "var(--color-error-9)" };
  if (score <= 4) return { score, label: "Fair", color: "var(--color-warning-9)" };
  if (score <= 5) return { score, label: "Good", color: "var(--color-info-9)" };
  return { score, label: "Strong", color: "var(--color-success-9)" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (includeLowercase) chars += CHAR_SETS.lowercase;
    if (includeUppercase) chars += CHAR_SETS.uppercase;
    if (includeNumbers) chars += CHAR_SETS.numbers;
    if (includeSymbols) chars += CHAR_SETS.symbols;

    if (excludeAmbiguous) {
      chars = chars.replace(/[0OIl1|]/g, "");
    }

    if (!chars) {
      setPassword("Select at least one character type");
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += chars[array[i] % chars.length];
    }

    setPassword(newPassword);
    setHistory((prev) => [newPassword, ...prev.slice(0, 9)]);
  }, [length, includeLowercase, includeUppercase, includeNumbers, includeSymbols, excludeAmbiguous]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = password ? calculateStrength(password) : null;

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Password Generator"
        description="Generate cryptographically secure passwords using Web Crypto API"
        icon={<Key size={32} />}
      />

      <div className={styles.content}>
        <Card className={styles.mainCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className={styles.configContent}>
            <div className={styles.lengthSection}>
              <div className="flex justify-between items-center mb-2">
                <Label>Password Length</Label>
                <Badge variant="secondary" className="font-mono text-lg px-3">
                  {length}
                </Badge>
              </div>
              <Slider
                value={[length]}
                onValueChange={(v) => setLength(v[0])}
                min={4}
                max={64}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.optionItem}>
                <Switch checked={includeLowercase} onCheckedChange={setIncludeLowercase} id="lowercase" />
                <Label htmlFor="lowercase">Lowercase (a-z)</Label>
              </div>
              <div className={styles.optionItem}>
                <Switch checked={includeUppercase} onCheckedChange={setIncludeUppercase} id="uppercase" />
                <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
              </div>
              <div className={styles.optionItem}>
                <Switch checked={includeNumbers} onCheckedChange={setIncludeNumbers} id="numbers" />
                <Label htmlFor="numbers">Numbers (0-9)</Label>
              </div>
              <div className={styles.optionItem}>
                <Switch checked={includeSymbols} onCheckedChange={setIncludeSymbols} id="symbols" />
                <Label htmlFor="symbols">Symbols (!@#$%)</Label>
              </div>
              <div className={styles.optionItem}>
                <Switch checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} id="ambiguous" />
                <Label htmlFor="ambiguous">Exclude Ambiguous (0OIl1|)</Label>
              </div>
            </div>

            <Button onClick={generatePassword} className="w-full" size="lg">
              <Zap className="mr-2 h-5 w-5" />
              Generate Password
            </Button>
          </CardContent>
        </Card>

        {password && (
          <Card className={styles.resultCard}>
            <CardHeader>
              <CardTitle>Generated Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.passwordDisplay}>
                <code className={styles.password}>{password}</code>
                <div className={styles.actions}>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={generatePassword}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {strength && (
                <div className={styles.strengthBar}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Strength</span>
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <div className={styles.strengthTrack}>
                    <div
                      className={styles.strengthFill}
                      style={{
                        width: `${(strength.score / 7) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Passwords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.historyList}>
                {history.map((pw, idx) => (
                  <div key={idx} className={styles.historyItem}>
                    <code className="text-sm font-mono truncate flex-1">{pw}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(pw);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
