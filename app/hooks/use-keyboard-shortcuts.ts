import { useEffect } from "react";
import { useNavigate } from "react-router";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation Shortcuts
  { key: "k", ctrl: true, description: "Focus search", action: "search" },
  { key: "d", ctrl: true, description: "Dashboard", action: "/dashboard" },
  { key: "h", ctrl: true, description: "Home", action: "/" },
  { key: "/", ctrl: true, description: "Keyboard shortcuts", action: "shortcuts" },
  { key: "f", ctrl: true, alt: true, description: "Favorites", action: "/favorites" },
  { key: "e", ctrl: true, alt: true, description: "Recent Tools", action: "/recent" },

  // Security Tools (Alt+1-4)
  { key: "1", alt: true, description: "JWT Debugger", action: "/jwt-debugger" },
  { key: "2", alt: true, description: "Password Strength", action: "/password-checker" },
  { key: "3", alt: true, description: "Hash Generator", action: "/hash-tools" },
  { key: "4", alt: true, description: "Security Audit", action: "/analyze" },

  // Encryption Tools (Alt+5-7)
  { key: "5", alt: true, description: "AES Encryption", action: "/aes-encryption" },
  { key: "6", alt: true, description: "RSA Key Generator", action: "/rsa-generator" },
  { key: "7", alt: true, description: "Base64 Tools", action: "/base64-tools" },

  // Analysis Tools (Alt+8-0)
  { key: "8", alt: true, description: "SSL Inspector", action: "/ssl-inspector" },
  { key: "9", alt: true, description: "JWT Analyzer", action: "/jwt-analyzer" },
  { key: "0", alt: true, description: "CORS Checker", action: "/cors-checker" },

  // Utility Tools (Alt+Letter)
  { key: "a", alt: true, description: "API Security", action: "/api-security" },
  { key: "b", alt: true, description: "Base Converter", action: "/base-converter" },
  { key: "c", alt: true, description: "Certificate Decoder", action: "/certificate-decoder" },
  { key: "g", alt: true, description: "CSP Generator", action: "/csp-generator" },
  { key: "i", alt: true, description: "Hash Identifier", action: "/hash-identifier" },
  { key: "j", alt: true, description: "JSON Formatter", action: "/json-formatter" },
  { key: "l", alt: true, description: "Color Converter", action: "/color-converter" },
  { key: "m", alt: true, description: "HMAC Generator", action: "/hmac-generator" },
  { key: "n", alt: true, description: "DNS Lookup", action: "/dns-lookup" },
  { key: "o", alt: true, description: "TOTP Generator", action: "/totp-generator" },
  { key: "p", alt: true, description: "Password Generator", action: "/password-generator" },
  { key: "q", alt: true, description: "URL Parser", action: "/url-parser" },
  { key: "r", alt: true, description: "Regex Tester", action: "/regex-tester" },
  { key: "s", alt: true, description: "Data Sanitizer", action: "/data-sanitizer" },
  { key: "t", alt: true, description: "Timestamp Converter", action: "/timestamp-converter" },
  { key: "u", alt: true, description: "UUID Generator", action: "/uuid-generator" },
  { key: "v", alt: true, description: "Privacy Analyzer", action: "/privacy-analyzer" },
  { key: "w", alt: true, description: "HTTP Builder", action: "/http-builder" },
  { key: "x", alt: true, description: "XOR Cipher", action: "/xor-cipher" },
  { key: "y", alt: true, description: "Caesar Cipher", action: "/caesar-cipher" },
  { key: "z", alt: true, description: "Text Diff", action: "/text-diff" },
];

export function useKeyboardShortcuts(onShowShortcuts?: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Ctrl+Enter in textareas for submit actions
        if (!(e.ctrlKey && e.key === "Enter")) {
          return;
        }
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // Find matching shortcut
      const shortcut = KEYBOARD_SHORTCUTS.find(
        (s) => s.key === e.key.toLowerCase() && !!s.ctrl === isCtrl && !!s.alt === isAlt && !!s.shift === e.shiftKey,
      );

      if (shortcut) {
        e.preventDefault();

        if (shortcut.action === "search") {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        } else if (shortcut.action === "shortcuts") {
          onShowShortcuts?.();
        } else if (shortcut.action.startsWith("/")) {
          navigate(shortcut.action);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, onShowShortcuts]);

  return KEYBOARD_SHORTCUTS;
}
