import { useState, useEffect } from "react";
import { Clock, ArrowRightLeft, Copy, Check, RefreshCw } from "lucide-react";
import { ToolHeader } from "~/components/tool-header";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Label } from "~/components/ui/label/label";
import styles from "./timestamp-converter.module.css";

export function meta() {
  return [
    { title: "Timestamp Converter - Netveris" },
    { name: "description", content: "Convert between Unix timestamps, ISO 8601, and human-readable dates" },
  ];
}

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("");
  const [isoDate, setIsoDate] = useState("");
  const [humanDate, setHumanDate] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      // Detect if seconds or milliseconds
      const ms = value.length <= 10 ? num * 1000 : num;
      const date = new Date(ms);
      if (!isNaN(date.getTime())) {
        setIsoDate(date.toISOString());
        setHumanDate(date.toLocaleString());
      }
    }
  };

  const handleIsoChange = (value: string) => {
    setIsoDate(value);
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setTimestamp(Math.floor(date.getTime() / 1000).toString());
      setHumanDate(date.toLocaleString());
    }
  };

  const setNow = () => {
    const now = Date.now();
    setTimestamp(Math.floor(now / 1000).toString());
    setIsoDate(new Date(now).toISOString());
    setHumanDate(new Date(now).toLocaleString());
  };

  const copyValue = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentDate = new Date(currentTime);

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Timestamp Converter"
        description="Convert between Unix timestamps, ISO 8601, and human-readable formats"
        icon={<Clock size={32} />}
      />

      <div className={styles.content}>
        {/* Live Clock */}
        <Card className={styles.clockCard}>
          <CardContent className={styles.clockContent}>
            <div className={styles.liveTime}>
              <span className={styles.timeLabel}>Current Time</span>
              <div className={styles.timeDisplay}>{currentDate.toLocaleTimeString()}</div>
              <div className={styles.dateDisplay}>
                {currentDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className={styles.liveTimestamp}>
              <Badge variant="outline" className="font-mono text-lg px-4 py-2">
                {Math.floor(currentTime / 1000)}
              </Badge>
              <span className="text-xs text-muted-foreground">Unix Timestamp</span>
            </div>
          </CardContent>
        </Card>

        {/* Converter */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Convert
              </CardTitle>
              <Button variant="outline" size="sm" onClick={setNow}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Set to Now
              </Button>
            </div>
          </CardHeader>
          <CardContent className={styles.converterContent}>
            <div className={styles.inputSection}>
              <Label htmlFor="timestamp">Unix Timestamp (seconds or milliseconds)</Label>
              <div className={styles.inputRow}>
                <Input
                  id="timestamp"
                  placeholder="e.g., 1704067200"
                  value={timestamp}
                  onChange={(e) => handleTimestampChange(e.target.value)}
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyValue(timestamp, "timestamp")}
                  disabled={!timestamp}
                >
                  {copied === "timestamp" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className={styles.inputSection}>
              <Label htmlFor="iso">ISO 8601 Format</Label>
              <div className={styles.inputRow}>
                <Input
                  id="iso"
                  placeholder="e.g., 2024-01-01T00:00:00.000Z"
                  value={isoDate}
                  onChange={(e) => handleIsoChange(e.target.value)}
                  className="font-mono"
                />
                <Button variant="ghost" size="sm" onClick={() => copyValue(isoDate, "iso")} disabled={!isoDate}>
                  {copied === "iso" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className={styles.inputSection}>
              <Label>Human Readable (Local Time)</Label>
              <div className={styles.inputRow}>
                <Input value={humanDate} readOnly className="font-mono bg-muted" />
                <Button variant="ghost" size="sm" onClick={() => copyValue(humanDate, "human")} disabled={!humanDate}>
                  {copied === "human" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.referenceGrid}>
              <div className={styles.refItem}>
                <span className={styles.refLabel}>Start of Today</span>
                <code className={styles.refValue}>{Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)}</code>
              </div>
              <div className={styles.refItem}>
                <span className={styles.refLabel}>End of Today</span>
                <code className={styles.refValue}>{Math.floor(new Date().setHours(23, 59, 59, 999) / 1000)}</code>
              </div>
              <div className={styles.refItem}>
                <span className={styles.refLabel}>1 Hour Ago</span>
                <code className={styles.refValue}>{Math.floor((Date.now() - 3600000) / 1000)}</code>
              </div>
              <div className={styles.refItem}>
                <span className={styles.refLabel}>1 Day Ago</span>
                <code className={styles.refValue}>{Math.floor((Date.now() - 86400000) / 1000)}</code>
              </div>
              <div className={styles.refItem}>
                <span className={styles.refLabel}>1 Week Ago</span>
                <code className={styles.refValue}>{Math.floor((Date.now() - 604800000) / 1000)}</code>
              </div>
              <div className={styles.refItem}>
                <span className={styles.refLabel}>Unix Epoch</span>
                <code className={styles.refValue}>0</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
