import { useState } from "react";
import { Code2 } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Badge } from "~/components/ui/badge/badge";
import { Card } from "~/components/ui/card/card";
import styles from "./regex-tester.module.css";

export function meta() {
  return [
    { title: "Regex Tester - Netveris" },
    { name: "description", content: "Test and debug regular expressions" },
  ];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b");
  const [flags, setFlags] = useState("gi");
  const [testString, setTestString] = useState(
    "Contact us at support@example.com or sales@company.org for assistance.",
  );
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState("");
  const [groups, setGroups] = useState<{ [key: string]: string }[]>([]);

  const testRegex = () => {
    try {
      setError("");
      const regex = new RegExp(pattern, flags);
      const allMatches: RegExpMatchArray[] = [];
      const allGroups: { [key: string]: string }[] = [];

      let match;
      const globalRegex = new RegExp(pattern, flags);

      while ((match = globalRegex.exec(testString)) !== null) {
        allMatches.push(match);
        if (match.groups) {
          allGroups.push(match.groups);
        }
      }

      setMatches(allMatches);
      setGroups(allGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid regex pattern");
      setMatches([]);
      setGroups([]);
    }
  };

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const highlightMatches = () => {
    if (matches.length === 0) return escapeHtml(testString);

    let result = "";
    let lastIndex = 0;

    // Create a sorted copy of ranges to process from start to end
    const sortedRanges: { start: number; end: number; index: number }[] = [];
    matches.forEach((match, index) => {
      if (match.index !== undefined) {
        sortedRanges.push({
          start: match.index,
          end: match.index + match[0].length,
          index,
        });
      }
    });
    sortedRanges.sort((a, b) => a.start - b.start);

    sortedRanges.forEach((range) => {
      // Append text before match
      if (range.start > lastIndex) {
        result += escapeHtml(testString.slice(lastIndex, range.start));
      }

      // Append highlighted match
      result += `<mark class="${styles.highlight}">${escapeHtml(testString.slice(range.start, range.end))}</mark>`;

      lastIndex = range.end;
    });

    // Append remaining text
    if (lastIndex < testString.length) {
      result += escapeHtml(testString.slice(lastIndex));
    }

    return result;
  };

  const commonPatterns = [
    { name: "Email", pattern: "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b", flags: "gi" },
    {
      name: "URL",
      pattern:
        "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
      flags: "gi",
    },
    {
      name: "IPv4",
      pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
      flags: "g",
    },
    { name: "Phone (US)", pattern: "\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})", flags: "g" },
    { name: "Hex Color", pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b", flags: "g" },
    { name: "Date (YYYY-MM-DD)", pattern: "\\b\\d{4}-\\d{2}-\\d{2}\\b", flags: "g" },
  ];

  return (
    <div className={styles.container}>
      <ToolHeader
        icon={<Code2 />}
        title="Regex Tester"
        description="Test and debug regular expressions with live matching and highlighting"
      />

      <div className={styles.content}>
        <Card className={styles.inputCard}>
          <h3>Regular Expression</h3>
          <div className={styles.regexInput}>
            <span className={styles.regexDelimiter}>/</span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern"
              className={styles.patternInput}
            />
            <span className={styles.regexDelimiter}>/</span>
            <Input
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gmi"
              className={styles.flagsInput}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.flagsHelp}>
            <Badge variant="outline">g</Badge> global
            <Badge variant="outline">i</Badge> case-insensitive
            <Badge variant="outline">m</Badge> multiline
            <Badge variant="outline">s</Badge> dotAll
            <Badge variant="outline">u</Badge> unicode
          </div>
        </Card>

        <Card className={styles.commonPatterns}>
          <h3>Common Patterns</h3>
          <div className={styles.patternGrid}>
            {commonPatterns.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPattern(p.pattern);
                  setFlags(p.flags);
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className={styles.testCard}>
          <h3>Test String</h3>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against the regex pattern"
            rows={6}
          />
          <Button onClick={testRegex} className={styles.testButton}>
            Test Regex
          </Button>
        </Card>

        {matches.length > 0 && (
          <>
            <Card className={styles.resultsCard}>
              <h3>Matches ({matches.length})</h3>
              <div className={styles.highlightedText} dangerouslySetInnerHTML={{ __html: highlightMatches() }} />
            </Card>

            <Card className={styles.matchesCard}>
              <h3>Match Details</h3>
              <div className={styles.matchList}>
                {matches.map((match, index) => (
                  <div key={index} className={styles.matchItem}>
                    <div className={styles.matchHeader}>
                      <Badge>Match {index + 1}</Badge>
                      <span className={styles.matchPosition}>
                        Position: {match.index} - {match.index! + match[0].length}
                      </span>
                    </div>
                    <div className={styles.matchValue}>{match[0]}</div>
                    {match.length > 1 && (
                      <div className={styles.captureGroups}>
                        <strong>Capture Groups:</strong>
                        {match.slice(1).map(
                          (group, gIndex) =>
                            group && (
                              <div key={gIndex} className={styles.captureGroup}>
                                <Badge variant="outline">{gIndex + 1}</Badge> {group}
                              </div>
                            ),
                        )}
                      </div>
                    )}
                    {groups[index] && (
                      <div className={styles.namedGroups}>
                        <strong>Named Groups:</strong>
                        {Object.entries(groups[index]).map(([name, value]) => (
                          <div key={name} className={styles.namedGroup}>
                            <Badge variant="outline">{name}</Badge> {value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {matches.length === 0 && !error && testString && (
          <Card className={styles.noMatches}>
            <p>No matches found. Try testing the regex or adjusting your pattern.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
