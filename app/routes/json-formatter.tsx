import { useState } from "react";
import { FileJson, Copy, Check, Download, Upload, Trash2, Wand2 } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { CodeWindow } from "~/components/code-window";
import styles from "./json-formatter.module.css";

export function meta() {
  return [
    { title: "JSON Formatter - Netveris" },
    { name: "description", content: "Format, validate, minify, and analyze JSON data" },
  ];
}

interface JsonStats {
  keys: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
}

function analyzeJson(obj: any, depth = 0): JsonStats {
  const stats: JsonStats = { keys: 0, depth, arrays: 0, objects: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };

  if (obj === null) {
    stats.nulls = 1;
    return stats;
  }

  if (Array.isArray(obj)) {
    stats.arrays = 1;
    for (const item of obj) {
      const childStats = analyzeJson(item, depth + 1);
      stats.keys += childStats.keys;
      stats.depth = Math.max(stats.depth, childStats.depth);
      stats.arrays += childStats.arrays;
      stats.objects += childStats.objects;
      stats.strings += childStats.strings;
      stats.numbers += childStats.numbers;
      stats.booleans += childStats.booleans;
      stats.nulls += childStats.nulls;
    }
    return stats;
  }

  if (typeof obj === "object") {
    stats.objects = 1;
    const keys = Object.keys(obj);
    stats.keys = keys.length;
    for (const key of keys) {
      const childStats = analyzeJson(obj[key], depth + 1);
      stats.keys += childStats.keys;
      stats.depth = Math.max(stats.depth, childStats.depth);
      stats.arrays += childStats.arrays;
      stats.objects += childStats.objects;
      stats.strings += childStats.strings;
      stats.numbers += childStats.numbers;
      stats.booleans += childStats.booleans;
      stats.nulls += childStats.nulls;
    }
    return stats;
  }

  if (typeof obj === "string") stats.strings = 1;
  if (typeof obj === "number") stats.numbers = 1;
  if (typeof obj === "boolean") stats.booleans = 1;

  return stats;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<JsonStats | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indentSize));
      setStats(analyzeJson(parsed));
      setError("");
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      setOutput("");
      setStats(null);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setStats(analyzeJson(parsed));
      setError("");
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      setOutput("");
      setStats(null);
    }
  };

  const sortKeys = () => {
    try {
      const parsed = JSON.parse(input);
      const sortObject = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(sortObject);
        if (obj !== null && typeof obj === "object") {
          return Object.keys(obj)
            .sort()
            .reduce((acc: any, key) => {
              acc[key] = sortObject(obj[key]);
              return acc;
            }, {});
        }
        return obj;
      };
      const sorted = sortObject(parsed);
      setOutput(JSON.stringify(sorted, null, indentSize));
      setStats(analyzeJson(sorted));
      setError("");
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="JSON Formatter"
        description="Format, validate, minify, and analyze JSON data"
        icon={<FileJson size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.actions}>
            <Button onClick={formatJson} disabled={!input}>
              <Wand2 className="mr-2 h-4 w-4" />
              Format
            </Button>
            <Button variant="outline" onClick={minifyJson} disabled={!input}>
              Minify
            </Button>
            <Button variant="outline" onClick={sortKeys} disabled={!input}>
              Sort Keys
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInput("");
                setOutput("");
                setError("");
                setStats(null);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className={styles.fileActions}>
            <label className={styles.uploadLabel}>
              <Upload className="h-4 w-4" />
              Upload
              <input type="file" accept=".json" onChange={handleFileUpload} hidden />
            </label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className={styles.indentSelect}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>Tab</option>
            </select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={styles.editorGrid}>
          <Card className={styles.editorCard}>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className={styles.textarea}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Paste your JSON here...&#10;&#10;{"name": "example", "value": 123}'
                spellCheck={false}
              />
            </CardContent>
          </Card>

          <Card className={styles.editorCard}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Output</CardTitle>
                {output && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={copyOutput}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={downloadJson}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {output ? (
                <CodeWindow>{output}</CodeWindow>
              ) : (
                <div className={styles.placeholder}>Formatted JSON will appear here</div>
              )}
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Keys</span>
                  <Badge variant="secondary" className="text-lg">
                    {stats.keys}
                  </Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Max Depth</span>
                  <Badge variant="secondary" className="text-lg">
                    {stats.depth}
                  </Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Objects</span>
                  <Badge variant="outline">{stats.objects}</Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Arrays</span>
                  <Badge variant="outline">{stats.arrays}</Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Strings</span>
                  <Badge variant="outline">{stats.strings}</Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Numbers</span>
                  <Badge variant="outline">{stats.numbers}</Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Booleans</span>
                  <Badge variant="outline">{stats.booleans}</Badge>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Nulls</span>
                  <Badge variant="outline">{stats.nulls}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
