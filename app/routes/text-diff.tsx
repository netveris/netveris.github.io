import { useState } from "react";
import type { Route } from "./+types/text-diff";
import { ToolHeader } from "~/components/tool-header";
import { Card } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Label } from "~/components/ui/label/label";
import { Badge } from "~/components/ui/badge/badge";
import { FileText, Plus, Minus } from "lucide-react";
import styles from "./text-diff.module.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Text Diff Checker - Netveris" },
    { name: "description", content: "Compare text and find differences" }
  ];
};

interface DiffLine {
  type: 'add' | 'remove' | 'same';
  content: string;
  lineNumber: number;
}

export default function TextDiff() {
  const [originalText, setOriginalText] = useState<string>("");
  const [modifiedText, setModifiedText] = useState<string>("");
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [stats, setStats] = useState({ additions: 0, deletions: 0, unchanged: 0 });

  const calculateDiff = () => {
    const original = originalText.split('\n');
    const modified = modifiedText.split('\n');
    
    const result: DiffLine[] = [];
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    const maxLen = Math.max(original.length, modified.length);
    
    // Simple line-by-line comparison
    for (let i = 0; i < maxLen; i++) {
      const origLine = original[i];
      const modLine = modified[i];

      if (origLine === modLine) {
        if (origLine !== undefined) {
          result.push({ type: 'same', content: origLine, lineNumber: i + 1 });
          unchanged++;
        }
      } else {
        if (origLine !== undefined && modLine === undefined) {
          result.push({ type: 'remove', content: origLine, lineNumber: i + 1 });
          deletions++;
        } else if (origLine === undefined && modLine !== undefined) {
          result.push({ type: 'add', content: modLine, lineNumber: i + 1 });
          additions++;
        } else if (origLine !== modLine) {
          result.push({ type: 'remove', content: origLine, lineNumber: i + 1 });
          result.push({ type: 'add', content: modLine, lineNumber: i + 1 });
          deletions++;
          additions++;
        }
      }
    }

    setDiff(result);
    setStats({ additions, deletions, unchanged });
  };

  const loadExample = () => {
    setOriginalText(`const API_KEY = "hardcoded-key-123";
const DB_PASSWORD = "admin123";

function authenticateUser(username, password) {
  if (password === "admin") {
    return true;
  }
  return false;
}

app.get('/users', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(query);
});`);

    setModifiedText(`const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

function authenticateUser(username, password) {
  return bcrypt.compare(password, user.passwordHash);
}

app.get('/users', (req, res) => {
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [req.params.id]);
});`);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Text Diff Checker"
        description="Compare two text blocks and visualize differences line-by-line"
        icon={<FileText size={32} />}
      />

      <div className={styles.actions}>
        <Button onClick={calculateDiff} disabled={!originalText && !modifiedText}>
          <FileText /> Compare Text
        </Button>
        <Button variant="outline" onClick={loadExample}>
          Load Security Example
        </Button>
      </div>

      {diff && (
        <Card className={styles.statsCard}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <Badge variant="default" className={styles.addBadge}>
                <Plus /> {stats.additions} additions
              </Badge>
            </div>
            <div className={styles.stat}>
              <Badge variant="destructive" className={styles.removeBadge}>
                <Minus /> {stats.deletions} deletions
              </Badge>
            </div>
            <div className={styles.stat}>
              <Badge variant="outline">
                {stats.unchanged} unchanged
              </Badge>
            </div>
          </div>
        </Card>
      )}

      <div className={styles.grid}>
        <Card className={styles.card}>
          <Label>Original Text</Label>
          <Textarea
            placeholder="Paste original text here..."
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={20}
            className={styles.textarea}
          />
        </Card>

        <Card className={styles.card}>
          <Label>Modified Text</Label>
          <Textarea
            placeholder="Paste modified text here..."
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            rows={20}
            className={styles.textarea}
          />
        </Card>
      </div>

      {diff && (
        <Card className={styles.diffCard}>
          <h2>Differences</h2>
          <div className={styles.diffViewer}>
            {diff.map((line, index) => (
              <div
                key={index}
                className={`${styles.diffLine} ${styles[line.type]}`}
              >
                <span className={styles.lineNumber}>{line.lineNumber}</span>
                <span className={styles.lineType}>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                </span>
                <span className={styles.lineContent}>{line.content || ' '}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
