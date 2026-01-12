import { useState } from "react";
import { KeyRound, Download, Copy, Check } from "lucide-react";
import { ToolHeader } from "../components/tool-header";
import { Button } from "../components/ui/button/button";
import { Card } from "../components/ui/card/card";
import { Textarea } from "../components/ui/textarea/textarea";
import { Label } from "../components/ui/label/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select/select";
import styles from "./rsa-generator.module.css";

export function meta() {
  return [{ title: "RSA Key Generator - Netveris" }, { name: "description", content: "Generate RSA key pairs" }];
}

export default function RSAGenerator() {
  const [keySize, setKeySize] = useState("2048");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);

  const generateKeyPair = async () => {
    setGenerating(true);
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: parseInt(keySize),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
      );

      const publicKeyData = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKeyData = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const publicPem = formatPEM(publicKeyData, "PUBLIC KEY");
      const privatePem = formatPEM(privateKeyData, "PRIVATE KEY");

      setPublicKey(publicPem);
      setPrivateKey(privatePem);
    } catch (error) {
      console.error("Key generation failed:", error);
      setPublicKey("Error generating keys");
      setPrivateKey("Error generating keys");
    } finally {
      setGenerating(false);
    }
  };

  const formatPEM = (keyData: ArrayBuffer, type: string): string => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(keyData)));
    const formatted = base64.match(/.{1,64}/g)?.join("\n") || base64;
    return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`;
  };

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    setCopiedPrivate(true);
    setTimeout(() => setCopiedPrivate(false), 2000);
  };

  const downloadKeys = () => {
    const blob = new Blob([`${publicKey}\n\n${privateKey}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsa_${keySize}_keypair.pem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        icon={<KeyRound size={24} />}
        title="RSA Key Pair Generator"
        description="Generate secure RSA public/private key pairs for encryption and signing"
      />

      <div className={styles.content}>
        <Card className={styles.card}>
          <div className={styles.controls}>
            <div className={styles.field}>
              <Label>Key Size (bits)</Label>
              <Select value={keySize} onValueChange={setKeySize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024-bit (Fast, Less Secure)</SelectItem>
                  <SelectItem value="2048">2048-bit (Recommended)</SelectItem>
                  <SelectItem value="3072">3072-bit (High Security)</SelectItem>
                  <SelectItem value="4096">4096-bit (Maximum Security)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateKeyPair} disabled={generating} className={styles.generateButton}>
              <KeyRound size={18} />
              {generating ? "Generating Keys..." : "Generate Key Pair"}
            </Button>

            {publicKey && privateKey && (
              <div className={styles.actions}>
                <Button onClick={downloadKeys} variant="outline">
                  <Download size={16} />
                  Download Both Keys
                </Button>
              </div>
            )}
          </div>
        </Card>

        {publicKey && (
          <Card className={styles.card}>
            <div className={styles.keyHeader}>
              <div className={styles.keyTitle}>
                <Label>Public Key</Label>
                <span className={styles.keyInfo}>Share this key publicly</span>
              </div>
              <Button onClick={copyPublicKey} variant="ghost" size="sm">
                {copiedPublic ? <Check size={16} /> : <Copy size={16} />}
                {copiedPublic ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Textarea value={publicKey} readOnly rows={10} className={styles.keyOutput} />
          </Card>
        )}

        {privateKey && (
          <Card className={styles.card}>
            <div className={styles.keyHeader}>
              <div className={styles.keyTitle}>
                <Label>Private Key</Label>
                <span className={styles.keyWarning}>⚠️ Keep this secret and secure!</span>
              </div>
              <Button onClick={copyPrivateKey} variant="ghost" size="sm">
                {copiedPrivate ? <Check size={16} /> : <Copy size={16} />}
                {copiedPrivate ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Textarea value={privateKey} readOnly rows={16} className={styles.keyOutput} />
          </Card>
        )}
      </div>
    </div>
  );
}
