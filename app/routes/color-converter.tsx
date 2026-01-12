import { useState, useCallback, useEffect } from "react";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Input } from "~/components/ui/input/input";
import { Palette, Copy, Check, RefreshCw, Pipette, Plus, Trash2 } from "lucide-react";
import styles from "./color-converter.module.css";

interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface SavedColor {
  id: string;
  hex: string;
  name: string;
}

// Color conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function generateRandomColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

export default function ColorConverter() {
  const [inputValue, setInputValue] = useState("#3b82f6");
  const [color, setColor] = useState<ColorValue | null>(null);
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const parseAndConvert = useCallback((input: string) => {
    let rgb: { r: number; g: number; b: number } | null = null;

    // Try HEX
    const hexMatch = input.match(/^#?([a-f\d]{6}|[a-f\d]{3})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      rgb = hexToRgb(hex);
    }

    // Try RGB
    const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      rgb = {
        r: Math.min(255, parseInt(rgbMatch[1])),
        g: Math.min(255, parseInt(rgbMatch[2])),
        b: Math.min(255, parseInt(rgbMatch[3])),
      };
    }

    // Try HSL
    const hslMatch = input.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
    if (hslMatch) {
      rgb = hslToRgb(
        parseInt(hslMatch[1]) % 360,
        Math.min(100, parseInt(hslMatch[2])),
        Math.min(100, parseInt(hslMatch[3])),
      );
    }

    if (rgb) {
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setColor({
        hex,
        rgb,
        hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
        hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
        cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
      });
    } else {
      setColor(null);
    }
  }, []);

  useEffect(() => {
    parseAndConvert(inputValue);
  }, [inputValue, parseAndConvert]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error("Copy failed");
    }
  };

  const handleRandom = () => {
    setInputValue(generateRandomColor());
  };

  const handleSaveColor = () => {
    if (!color) return;
    const newColor: SavedColor = {
      id: Date.now().toString(),
      hex: color.hex,
      name: color.hex,
    };
    setSavedColors((prev) => [...prev, newColor]);
  };

  const handleRemoveColor = (id: string) => {
    setSavedColors((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectColor = (hex: string) => {
    setInputValue(hex);
  };

  const formatValues = color
    ? [
        { label: "HEX", value: color.hex.toUpperCase(), key: "hex" },
        { label: "RGB", value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, key: "rgb" },
        {
          label: "HSL",
          value: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
          key: "hsl",
        },
        {
          label: "HSV",
          value: `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`,
          key: "hsv",
        },
        {
          label: "CMYK",
          value: `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`,
          key: "cmyk",
        },
      ]
    : [];

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Color Converter"
        description="Convert colors between HEX, RGB, HSL, HSV, and CMYK formats"
        icon={<Palette size={32} />}
      />

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          {/* Input Section */}
          <Card>
            <CardContent className={styles.cardBody}>
              <h3 className={styles.sectionTitle}>Input Color</h3>

              <div className={styles.inputGroup}>
                <div className={styles.colorInputWrapper}>
                  <input
                    type="color"
                    value={color?.hex ?? "#000000"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    className={styles.colorPicker}
                  />
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="#3b82f6 or rgb(59, 130, 246)"
                    className={styles.textInput}
                  />
                </div>
                <Button variant="outline" onClick={handleRandom}>
                  <RefreshCw size={16} />
                  Random
                </Button>
              </div>

              <div className={styles.formatHints}>
                <Badge variant="secondary">HEX: #rrggbb</Badge>
                <Badge variant="secondary">RGB: rgb(r, g, b)</Badge>
                <Badge variant="secondary">HSL: hsl(h, s%, l%)</Badge>
              </div>

              {color && (
                <div
                  className={styles.colorPreview}
                  style={{
                    backgroundColor: color.hex,
                    color: getContrastColor(color.hex),
                  }}
                >
                  <span className={styles.previewText}>{color.hex.toUpperCase()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveColor}
                    className={styles.saveBtn}
                    style={{ color: getContrastColor(color.hex) }}
                  >
                    <Plus size={16} />
                    Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardContent className={styles.cardBody}>
              <h3 className={styles.sectionTitle}>Color Values</h3>

              {color ? (
                <div className={styles.valuesList}>
                  {formatValues.map((item) => (
                    <div key={item.key} className={styles.valueItem}>
                      <span className={styles.valueLabel}>{item.label}</span>
                      <code className={styles.valueCode}>{item.value}</code>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(item.value, item.key)}>
                        {copiedField === item.key ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.placeholder}>Enter a valid color value to see conversions</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Color Components */}
        {color && (
          <Card>
            <CardContent className={styles.cardBody}>
              <h3 className={styles.sectionTitle}>Color Components</h3>
              <div className={styles.componentsGrid}>
                <div className={styles.componentGroup}>
                  <h4 className={styles.componentTitle}>RGB</h4>
                  <div className={styles.componentBars}>
                    <div className={styles.componentRow}>
                      <span className={styles.componentLabel}>R</span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(color.rgb.r / 255) * 100}%`,
                            backgroundColor: "#ef4444",
                          }}
                        />
                      </div>
                      <span className={styles.componentValue}>{color.rgb.r}</span>
                    </div>
                    <div className={styles.componentRow}>
                      <span className={styles.componentLabel}>G</span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(color.rgb.g / 255) * 100}%`,
                            backgroundColor: "#22c55e",
                          }}
                        />
                      </div>
                      <span className={styles.componentValue}>{color.rgb.g}</span>
                    </div>
                    <div className={styles.componentRow}>
                      <span className={styles.componentLabel}>B</span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(color.rgb.b / 255) * 100}%`,
                            backgroundColor: "#3b82f6",
                          }}
                        />
                      </div>
                      <span className={styles.componentValue}>{color.rgb.b}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.componentGroup}>
                  <h4 className={styles.componentTitle}>HSL</h4>
                  <div className={styles.componentBars}>
                    <div className={styles.componentRow}>
                      <span className={styles.componentLabel}>H</span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(color.hsl.h / 360) * 100}%`,
                            background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                          }}
                        />
                      </div>
                      <span className={styles.componentValue}>{color.hsl.h}°</span>
                    </div>
                    <div className={styles.componentRow}>
                      <span className={styles.componentLabel}>S</span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${color.hsl.s}%`,
                            backgroundColor: color.hex,
                          }}
                        />
                      </div>
                      <span className={styles.componentValue}>{color.hsl.s}%</span>
                    </div>
                    <div className={styles.componentRow}>
                      <span className={styles.componentLabel}>L</span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${color.hsl.l}%`,
                            background: `linear-gradient(to right, #000, ${color.hex}, #fff)`,
                          }}
                        />
                      </div>
                      <span className={styles.componentValue}>{color.hsl.l}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Colors */}
        {savedColors.length > 0 && (
          <Card>
            <CardContent className={styles.cardBody}>
              <h3 className={styles.sectionTitle}>Saved Colors</h3>
              <div className={styles.savedGrid}>
                {savedColors.map((saved) => (
                  <div key={saved.id} className={styles.savedItem} onClick={() => handleSelectColor(saved.hex)}>
                    <div className={styles.savedSwatch} style={{ backgroundColor: saved.hex }} />
                    <span className={styles.savedHex}>{saved.hex.toUpperCase()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleRemoveColor(saved.id);
                      }}
                    >
                      <Trash2 size={14} />
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
