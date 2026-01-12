import { useState, useEffect } from "react";
import type { Route } from "./+types/base64-tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card/card";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Label } from "~/components/ui/label/label";
import { Button } from "~/components/ui/button/button";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { ToolHeader } from "~/components/tool-header";
import { Binary, ArrowRightLeft, Copy, Check, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs/tabs";
import styles from "./base64-tools.module.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Base64 Encoder/Decoder - Netveris" },
    { name: "description", content: "Encode and decode Base64 strings with support for text and files" },
  ];
};

function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    throw new Error("Failed to encode: Invalid characters in input");
  }
}

function decodeBase64(base64: string): string {
  try {
    return decodeURIComponent(escape(atob(base64.trim())));
  } catch (error) {
    throw new Error("Failed to decode: Invalid Base64 string");
  }
}

export default function Base64Tools() {
  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [encodeError, setEncodeError] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"encode" | "decode" | null>(null);
  const [liveMode, setLiveMode] = useState(true);

  // Live encoding
  useEffect(() => {
    if (!liveMode || !encodeInput) {
      if (!encodeInput) {
        setEncodeOutput("");
        setEncodeError(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setEncodeError(null);
      try {
        const encoded = encodeBase64(encodeInput);
        setEncodeOutput(encoded);
      } catch (err) {
        setEncodeError(err instanceof Error ? err.message : "Encoding failed");
        setEncodeOutput("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [encodeInput, liveMode]);

  // Live decoding
  useEffect(() => {
    if (!liveMode || !decodeInput) {
      if (!decodeInput) {
        setDecodeOutput("");
        setDecodeError(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setDecodeError(null);
      try {
        const decoded = decodeBase64(decodeInput);
        setDecodeOutput(decoded);
      } catch (err) {
        setDecodeError(err instanceof Error ? err.message : "Decoding failed");
        setDecodeOutput("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [decodeInput, liveMode]);

  const handleEncode = () => {
    setEncodeError(null);
    try {
      const encoded = encodeBase64(encodeInput);
      setEncodeOutput(encoded);
    } catch (err) {
      setEncodeError(err instanceof Error ? err.message : "Encoding failed");
      setEncodeOutput("");
    }
  };

  const handleDecode = () => {
    setDecodeError(null);
    try {
      const decoded = decodeBase64(decodeInput);
      setDecodeOutput(decoded);
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : "Decoding failed");
      setDecodeOutput("");
    }
  };

  const copyToClipboard = async (text: string, type: "encode" | "decode") => {
    if (!text || text.trim() === "") {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(type);
          setTimeout(() => setCopied(null), 2000);
        }
      } catch (fallbackErr) {
        // Silent fail
      }
    }
  };

  const clearEncode = () => {
    setEncodeInput("");
    setEncodeOutput("");
    setEncodeError(null);
  };

  const clearDecode = () => {
    setDecodeInput("");
    setDecodeOutput("");
    setDecodeError(null);
  };

  const swapEncodeDecode = () => {
    const temp = encodeInput;
    setEncodeInput(decodeInput);
    setDecodeInput(temp);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Base64 Encoder/Decoder"
        description="Encode text to Base64 or decode Base64 strings with live preview"
        icon={<Binary />}
      />
      <div className={styles.liveModeToggle}>
        <Label htmlFor="live-mode" className={styles.liveModeLabel}>
          <input
            type="checkbox"
            id="live-mode"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
            className={styles.liveModeCheckbox}
          />
          Live Mode
        </Label>
      </div>

      <div className={styles.content}>
        <Tabs defaultValue="encode" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className={styles.tabContent}>
            <div className={styles.toolGrid}>
              <Card className={`${styles.card} ${styles.ioCard}`}>
                <CardHeader>
                  <div className={styles.cardHeaderWithStats}>
                    <div>
                      <CardTitle>Plain Text</CardTitle>
                      <CardDescription>Enter text to encode</CardDescription>
                    </div>
                    {encodeInput && (
                      <div className={styles.stats}>
                        <span className={styles.statItem}>{encodeInput.length} chars</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={styles.ioCardContent}>
                  <Textarea
                    id="encode-input"
                    value={encodeInput}
                    onChange={(e) => setEncodeInput(e.target.value)}
                    placeholder="Type or paste your text here...\n\nExamples:\n• Hello, World!\n• user@example.com\n• Any UTF-8 text"
                    rows={10}
                    className={styles.textarea}
                  />
                  {encodeError && (
                    <Alert className={styles.errorAlert}>
                      <AlertCircle size={18} />
                      <AlertDescription>{encodeError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className={styles.actionColumn}>
                <div className={styles.actionButtons}>
                  {!liveMode && (
                    <Button onClick={handleEncode} className={styles.actionButton} size="lg">
                      <ArrowRightLeft size={20} />
                      Encode
                    </Button>
                  )}
                  <Button onClick={clearEncode} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
              </div>

              <Card className={`${styles.card} ${styles.ioCard}`}>
                <CardHeader>
                  <div className={styles.cardHeaderWithStats}>
                    <div>
                      <CardTitle>Base64 Output</CardTitle>
                      <CardDescription>Encoded result</CardDescription>
                    </div>
                    {encodeOutput && (
                      <div className={styles.stats}>
                        <span className={styles.statItem}>{encodeOutput.length} chars</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(encodeOutput, "encode")}
                          className={styles.copyButton}
                        >
                          {copied === "encode" ? (
                            <>
                              <Check size={16} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={styles.ioCardContent}>
                  <Textarea
                    id="encode-output"
                    value={encodeOutput}
                    readOnly
                    placeholder="Base64 encoded output will appear here..."
                    rows={10}
                    className={`${styles.textarea} ${styles.outputTextarea}`}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decode" className={styles.tabContent}>
            <div className={styles.toolGrid}>
              <Card className={`${styles.card} ${styles.ioCard}`}>
                <CardHeader>
                  <div className={styles.cardHeaderWithStats}>
                    <div>
                      <CardTitle>Base64 String</CardTitle>
                      <CardDescription>Enter Base64 to decode</CardDescription>
                    </div>
                    {decodeInput && (
                      <div className={styles.stats}>
                        <span className={styles.statItem}>{decodeInput.length} chars</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={styles.ioCardContent}>
                  <Textarea
                    id="decode-input"
                    value={decodeInput}
                    onChange={(e) => setDecodeInput(e.target.value)}
                    placeholder="Paste Base64 encoded string here...\n\nExample:\nSGVsbG8sIFdvcmxkIQ=="
                    rows={10}
                    className={styles.textarea}
                  />
                  {decodeError && (
                    <Alert className={styles.errorAlert}>
                      <AlertCircle size={18} />
                      <AlertDescription>{decodeError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className={styles.actionColumn}>
                <div className={styles.actionButtons}>
                  {!liveMode && (
                    <Button onClick={handleDecode} className={styles.actionButton} size="lg">
                      <ArrowRightLeft size={20} />
                      Decode
                    </Button>
                  )}
                  <Button onClick={clearDecode} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
              </div>

              <Card className={`${styles.card} ${styles.ioCard}`}>
                <CardHeader>
                  <div className={styles.cardHeaderWithStats}>
                    <div>
                      <CardTitle>Plain Text Output</CardTitle>
                      <CardDescription>Decoded result</CardDescription>
                    </div>
                    {decodeOutput && (
                      <div className={styles.stats}>
                        <span className={styles.statItem}>{decodeOutput.length} chars</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(decodeOutput, "decode")}
                          className={styles.copyButton}
                        >
                          {copied === "decode" ? (
                            <>
                              <Check size={16} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={styles.ioCardContent}>
                  <Textarea
                    id="decode-output"
                    value={decodeOutput}
                    readOnly
                    placeholder="Decoded plain text will appear here..."
                    rows={10}
                    className={`${styles.textarea} ${styles.outputTextarea}`}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>About Base64 Encoding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.infoSection}>
              <p className={styles.infoParagraph}>
                Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It's
                commonly used for encoding data in URLs, email attachments, and storing complex data in text-based
                formats like JSON or XML.
              </p>

              <div className={styles.infoList}>
                <h4 className={styles.infoTitle}>Common Use Cases:</h4>
                <ul>
                  <li>Embedding images in HTML/CSS (Data URLs)</li>
                  <li>Encoding binary data in JSON or XML</li>
                  <li>Email attachments (MIME)</li>
                  <li>Basic authentication headers in HTTP</li>
                  <li>URL-safe data transmission</li>
                </ul>
              </div>

              <Alert className={styles.infoAlert}>
                <AlertCircle size={18} />
                <AlertDescription>
                  <strong>Important:</strong> Base64 is an encoding method, not encryption. It does not provide any
                  security and should never be used to protect sensitive data. Anyone can easily decode Base64 strings.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
