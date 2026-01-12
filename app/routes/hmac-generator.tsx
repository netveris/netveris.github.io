import { useState } from "react";
import { Hash, Copy, Check, ArrowRight } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Label } from "~/components/ui/label/label";
import styles from "./hmac-generator.module.css";

export function meta() {
  return [
    { title: "HMAC Generator - Netveris" },
    { name: "description", content: "Generate HMAC signatures using various algorithms" },
  ];
}

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

async function generateHMAC(message: string, secret: string, algorithm: Algorithm): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: algorithm }, false, ["sign"]);

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HmacGenerator() {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!message || !secret) return;
    setLoading(true);
    try {
      const hmac = await generateHMAC(message, secret, algorithm);
      setResult(hmac);
    } catch (e) {
      setResult("Error generating HMAC");
    }
    setLoading(false);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const algorithms: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  return (
    <div className={styles.container}>
      <ToolHeader
        title="HMAC Generator"
        description="Generate Hash-based Message Authentication Codes"
        icon={<Hash size={32} />}
      />

      <div className={styles.content}>
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className={styles.formContent}>
            <div className={styles.inputSection}>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter the message to sign..."
                rows={4}
              />
            </div>

            <div className={styles.inputSection}>
              <Label htmlFor="secret">Secret Key</Label>
              <Input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter your secret key..."
              />
            </div>

            <div className={styles.inputSection}>
              <Label>Algorithm</Label>
              <div className={styles.algorithmGrid}>
                {algorithms.map((algo) => (
                  <button
                    key={algo}
                    onClick={() => setAlgorithm(algo)}
                    className={`${styles.algoBtn} ${algorithm === algo ? styles.active : ""}`}
                  >
                    {algo}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={!message || !secret || loading} className="w-full">
              {loading ? "Generating..." : "Generate HMAC"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  HMAC-{algorithm}
                  <Badge variant="secondary">{result.length * 4} bits</Badge>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={copyResult}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.resultBox}>
                <code className={styles.resultCode}>{result}</code>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About HMAC</CardTitle>
          </CardHeader>
          <CardContent className={styles.infoContent}>
            <p>
              HMAC (Hash-based Message Authentication Code) provides both data integrity and authenticity. It combines a
              cryptographic hash function with a secret key.
            </p>
            <div className={styles.useCases}>
              <h4>Common Use Cases:</h4>
              <ul>
                <li>API request signing (AWS, Stripe)</li>
                <li>Webhook verification</li>
                <li>JWT signature verification</li>
                <li>Password-based key derivation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
