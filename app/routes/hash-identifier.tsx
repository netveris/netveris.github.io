import { useState, useMemo } from "react";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Fingerprint, Search, Copy, Check, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import styles from "./hash-identifier.module.css";

interface HashPattern {
  name: string;
  regex: RegExp;
  length: number | null;
  description: string;
  example: string;
  crackTools: string[];
}

const HASH_PATTERNS: HashPattern[] = [
  {
    name: "MD5",
    regex: /^[a-fA-F0-9]{32}$/,
    length: 32,
    description: "128-bit hash, widely used but cryptographically broken",
    example: "d41d8cd98f00b204e9800998ecf8427e",
    crackTools: ["hashcat -m 0", "john --format=raw-md5"],
  },
  {
    name: "SHA-1",
    regex: /^[a-fA-F0-9]{40}$/,
    length: 40,
    description: "160-bit hash, deprecated for security use",
    example: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    crackTools: ["hashcat -m 100", "john --format=raw-sha1"],
  },
  {
    name: "SHA-256",
    regex: /^[a-fA-F0-9]{64}$/,
    length: 64,
    description: "256-bit hash from SHA-2 family",
    example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    crackTools: ["hashcat -m 1400", "john --format=raw-sha256"],
  },
  {
    name: "SHA-384",
    regex: /^[a-fA-F0-9]{96}$/,
    length: 96,
    description: "384-bit hash from SHA-2 family",
    example: "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da...",
    crackTools: ["hashcat -m 10800", "john --format=raw-sha384"],
  },
  {
    name: "SHA-512",
    regex: /^[a-fA-F0-9]{128}$/,
    length: 128,
    description: "512-bit hash from SHA-2 family",
    example: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce...",
    crackTools: ["hashcat -m 1700", "john --format=raw-sha512"],
  },
  {
    name: "NTLM",
    regex: /^[a-fA-F0-9]{32}$/,
    length: 32,
    description: "Windows NTLM hash (same length as MD5)",
    example: "8846f7eaee8fb117ad06bdd830b7586c",
    crackTools: ["hashcat -m 1000", "john --format=nt"],
  },
  {
    name: "MySQL 4.1+",
    regex: /^\*[A-F0-9]{40}$/,
    length: 41,
    description: "MySQL password hash (starts with *)",
    example: "*2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19",
    crackTools: ["hashcat -m 300", "john --format=mysql-sha1"],
  },
  {
    name: "bcrypt",
    regex: /^\$2[ayb]\$\d{2}\$[./A-Za-z0-9]{53}$/,
    length: null,
    description: "Adaptive hash function, very secure",
    example: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqzO...",
    crackTools: ["hashcat -m 3200", "john --format=bcrypt"],
  },
  {
    name: "SHA-512 Crypt",
    regex: /^\$6\$[a-zA-Z0-9./]{8,16}\$[a-zA-Z0-9./]{86}$/,
    length: null,
    description: "Linux SHA-512 crypt format",
    example: "$6$rounds=5000$salt$hash...",
    crackTools: ["hashcat -m 1800", "john --format=sha512crypt"],
  },
  {
    name: "MD5 Crypt",
    regex: /^\$1\$[a-zA-Z0-9./]{8}\$[a-zA-Z0-9./]{22}$/,
    length: null,
    description: "Linux MD5 crypt format",
    example: "$1$salt$hash...",
    crackTools: ["hashcat -m 500", "john --format=md5crypt"],
  },
  {
    name: "SHA-256 Crypt",
    regex: /^\$5\$[a-zA-Z0-9./]{8,16}\$[a-zA-Z0-9./]{43}$/,
    length: null,
    description: "Linux SHA-256 crypt format",
    example: "$5$rounds=5000$salt$hash...",
    crackTools: ["hashcat -m 7400", "john --format=sha256crypt"],
  },
  {
    name: "Argon2",
    regex: /^\$argon2(i|d|id)\$v=\d+\$m=\d+,t=\d+,p=\d+\$/,
    length: null,
    description: "Modern memory-hard password hashing",
    example: "$argon2id$v=19$m=65536,t=3,p=4$...",
    crackTools: ["hashcat -m 13400 (limited)"],
  },
  {
    name: "CRC32",
    regex: /^[a-fA-F0-9]{8}$/,
    length: 8,
    description: "Checksum, not cryptographic",
    example: "cbf43926",
    crackTools: ["Not a cryptographic hash"],
  },
  {
    name: "LM Hash",
    regex: /^[a-fA-F0-9]{32}$/,
    length: 32,
    description: "Legacy Windows LAN Manager hash",
    example: "aad3b435b51404eeaad3b435b51404ee",
    crackTools: ["hashcat -m 3000", "john --format=lm"],
  },
  {
    name: "SHA-3-256",
    regex: /^[a-fA-F0-9]{64}$/,
    length: 64,
    description: "Keccak-based SHA-3, 256-bit",
    example: "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    crackTools: ["hashcat -m 17400"],
  },
];

export default function HashIdentifier() {
  const [input, setInput] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const matches = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return [];

    return HASH_PATTERNS.filter((pattern) => pattern.regex.test(trimmed)).map((pattern) => ({
      ...pattern,
      confidence: pattern.length === trimmed.length ? "high" : "medium",
    }));
  }, [input]);

  const hashInfo = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const isHex = /^[a-fA-F0-9]+$/.test(trimmed);
    const hasSpecialPrefix = /^[\$\*]/.test(trimmed);

    return {
      length: trimmed.length,
      isHex,
      hasSpecialPrefix,
      uppercase: trimmed === trimmed.toUpperCase(),
      lowercase: trimmed === trimmed.toLowerCase(),
    };
  }, [input]);

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

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Hash Identifier"
        description="Identify hash types from their format. Get hashcat/john modes for cracking in CTF challenges."
        icon={<Fingerprint size={32} />}
      />

      <div className={styles.content}>
        {/* Input Section */}
        <Card>
          <CardContent className={styles.cardBody}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Search size={18} />
                Hash Input
              </h3>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 size={16} />
              </Button>
            </div>

            <textarea
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a hash to identify... e.g., 5d41402abc4b2a76b9719d911017c592"
              rows={3}
            />

            {hashInfo && (
              <div className={styles.hashStats}>
                <Badge variant="secondary">{hashInfo.length} chars</Badge>
                {hashInfo.isHex && <Badge variant="secondary">Hexadecimal</Badge>}
                {hashInfo.hasSpecialPrefix && <Badge variant="secondary">Has prefix</Badge>}
                {hashInfo.uppercase && hashInfo.isHex && <Badge variant="secondary">Uppercase</Badge>}
                {hashInfo.lowercase && hashInfo.isHex && <Badge variant="secondary">Lowercase</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {matches.length > 0 ? (
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <CheckCircle size={18} className={styles.successIcon} />
                  Possible Hash Types
                </h3>
                <Badge variant="default">
                  {matches.length} match{matches.length > 1 ? "es" : ""}
                </Badge>
              </div>

              <div className={styles.matchesGrid}>
                {matches.map((match, idx) => (
                  <div key={idx} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <span className={styles.matchName}>{match.name}</span>
                      <Badge variant={match.confidence === "high" ? "default" : "secondary"}>{match.confidence}</Badge>
                    </div>
                    <p className={styles.matchDesc}>{match.description}</p>

                    <div className={styles.crackTools}>
                      <span className={styles.toolsLabel}>Crack commands:</span>
                      {match.crackTools.map((tool, i) => (
                        <button
                          key={i}
                          className={styles.toolBtn}
                          onClick={() => handleCopy(tool, `${match.name}-${i}`)}
                        >
                          <code>{tool}</code>
                          {copiedField === `${match.name}-${i}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {matches.length > 1 && (
                <div className={styles.warningBox}>
                  <AlertCircle size={16} />
                  <span>
                    Multiple matches found. Some hashes share the same format (e.g., MD5 and NTLM are both 32 hex
                    chars). Context from the source may help identify the correct type.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : input.trim() ? (
          <Card>
            <CardContent className={styles.cardBody}>
              <div className={styles.noMatch}>
                <AlertCircle size={24} />
                <span>No known hash format matched. It may be encoded, truncated, or a custom format.</span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Reference Table */}
        <Card>
          <CardContent className={styles.cardBody}>
            <h3 className={styles.sectionTitle}>Common Hash Lengths Reference</h3>
            <div className={styles.referenceTable}>
              <div className={styles.refHeader}>
                <span>Length</span>
                <span>Possible Types</span>
                <span>Hashcat Mode</span>
              </div>
              {[
                { len: 8, types: "CRC32", mode: "-" },
                { len: 32, types: "MD5, NTLM, LM", mode: "0, 1000, 3000" },
                { len: 40, types: "SHA-1, MySQL 5.x", mode: "100, 300" },
                { len: 64, types: "SHA-256, SHA-3-256", mode: "1400, 17400" },
                { len: 96, types: "SHA-384", mode: "10800" },
                { len: 128, types: "SHA-512", mode: "1700" },
              ].map((row) => (
                <div key={row.len} className={styles.refRow}>
                  <span className={styles.refLen}>{row.len}</span>
                  <span className={styles.refTypes}>{row.types}</span>
                  <code className={styles.refMode}>{row.mode}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
