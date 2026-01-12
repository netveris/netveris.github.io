import { useState, useEffect, useCallback } from "react";
import { Smartphone, Copy, Check, RefreshCw, Key, Clock, QrCode } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Label } from "~/components/ui/label/label";
import styles from "./totp-generator.module.css";

export function meta() {
  return [
    { title: "TOTP Generator - Netveris" },
    { name: "description", content: "Generate and verify Time-based One-Time Passwords (2FA codes)" },
  ];
}

// Base32 encoding/decoding
function base32Decode(encoded: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanedInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");

  let bits = "";
  for (const char of cleanedInput) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

function base32Encode(buffer: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    result += alphabet[parseInt(chunk, 2)];
  }
  return result;
}

async function generateTOTP(secret: string, timeStep = 30, digits = 6): Promise<string> {
  try {
    const key = base32Decode(secret);
    const time = Math.floor(Date.now() / 1000 / timeStep);

    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setBigUint64(0, BigInt(time), false);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(key).buffer as ArrayBuffer,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, timeBuffer);
    const signatureArray = new Uint8Array(signature);

    const offset = signatureArray[signatureArray.length - 1] & 0x0f;
    const binary =
      ((signatureArray[offset] & 0x7f) << 24) |
      ((signatureArray[offset + 1] & 0xff) << 16) |
      ((signatureArray[offset + 2] & 0xff) << 8) |
      (signatureArray[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, digits);
    return otp.toString().padStart(digits, "0");
  } catch {
    return "Invalid Secret";
  }
}

function generateSecret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

export default function TOTPGenerator() {
  const [secret, setSecret] = useState("");
  const [totp, setTotp] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);
  const [issuer, setIssuer] = useState("Netveris");
  const [account, setAccount] = useState("user@example.com");

  const refreshTOTP = useCallback(async () => {
    if (secret) {
      const code = await generateTOTP(secret);
      setTotp(code);
    }
  }, [secret]);

  useEffect(() => {
    refreshTOTP();
  }, [secret, refreshTOTP]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeLeft(remaining);

      if (remaining === 30) {
        refreshTOTP();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshTOTP]);

  const handleGenerateSecret = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOtpAuthUri = () => {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="TOTP Generator"
        description="Generate and verify Time-based One-Time Passwords for 2FA"
        icon={<Smartphone size={32} />}
      />

      <div className={styles.content}>
        <Card className={styles.mainCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Secret Key
            </CardTitle>
          </CardHeader>
          <CardContent className={styles.secretSection}>
            <div className={styles.inputGroup}>
              <Input
                placeholder="Enter Base32 secret (e.g., JBSWY3DPEHPK3PXP)"
                value={secret}
                onChange={(e) => setSecret(e.target.value.toUpperCase().replace(/[^A-Z2-7]/g, ""))}
                className="font-mono"
              />
              <Button onClick={handleGenerateSecret} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>

            {secret && (
              <div className={styles.secretDisplay}>
                <code className={styles.secretCode}>{secret}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(secret)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {secret && totp && totp !== "Invalid Secret" && (
          <Card className={styles.totpCard}>
            <CardContent className={styles.totpContent}>
              <div className={styles.totpDisplay}>
                <div className={styles.totpCode}>
                  {totp.slice(0, 3)}
                  <span className={styles.separator}>-</span>
                  {totp.slice(3)}
                </div>
                <Button variant="ghost" size="lg" onClick={() => copyToClipboard(totp)}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>

              <div className={styles.timerSection}>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className={styles.timerBar}>
                  <div
                    className={styles.timerFill}
                    style={{
                      width: `${(timeLeft / 30) * 100}%`,
                      backgroundColor: timeLeft <= 5 ? "var(--color-error-9)" : "var(--color-success-9)",
                    }}
                  />
                </div>
                <Badge variant={timeLeft <= 5 ? "destructive" : "secondary"}>{timeLeft}s</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {secret && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Authenticator Setup
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.setupSection}>
              <div className={styles.formGrid}>
                <div>
                  <Label htmlFor="issuer">Issuer/Service Name</Label>
                  <Input
                    id="issuer"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="Your App Name"
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account/Email</Label>
                  <Input
                    id="account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className={styles.uriSection}>
                <Label>OTPAuth URI (for QR code generation)</Label>
                <div className={styles.uriDisplay}>
                  <code className={styles.uri}>{getOtpAuthUri()}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(getOtpAuthUri())}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
