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
  { key: "k", ctrl: true, description: "Focus search", action: "search" },
  { key: "d", ctrl: true, description: "Dashboard", action: "/dashboard" },
  { key: "h", ctrl: true, description: "Home", action: "/" },
  { key: "/", ctrl: true, description: "Keyboard shortcuts", action: "shortcuts" },

  // Security Tools
  { key: "1", ctrl: true, alt: true, description: "JWT Debugger", action: "/jwt-debugger" },
  { key: "2", ctrl: true, alt: true, description: "Password Strength Checker", action: "/password-checker" },
  { key: "3", ctrl: true, alt: true, description: "Hash Generator", action: "/hash-tools" },
  { key: "4", ctrl: true, alt: true, description: "Full Security Audit", action: "/analyze" },

  // Encryption Tools
  { key: "5", ctrl: true, alt: true, description: "AES Encryption", action: "/aes-encryption" },
  { key: "6", ctrl: true, alt: true, description: "RSA Key Generator", action: "/rsa-generator" },
  { key: "7", ctrl: true, alt: true, description: "Base64 Encoder/Decoder", action: "/base64-tools" },

  // Analysis Tools
  { key: "8", ctrl: true, alt: true, description: "SSL Certificate Inspector", action: "/ssl-inspector" },
  { key: "9", ctrl: true, alt: true, description: "JWT Analyzer", action: "/jwt-analyzer" },
  { key: "0", ctrl: true, alt: true, description: "CORS Checker", action: "/cors-checker" },

  // General Tools
  { key: "a", ctrl: true, alt: true, description: "API Security", action: "/api-security" },
  { key: "c", ctrl: true, alt: true, description: "Certificate Decoder", action: "/certificate-decoder" },
  { key: "s", ctrl: true, alt: true, description: "Data Sanitizer", action: "/data-sanitizer" },
  { key: "n", ctrl: true, alt: true, description: "DNS Lookup", action: "/dns-lookup" },
  { key: "b", ctrl: true, alt: true, description: "HTTP Builder", action: "/http-builder" },
  { key: "j", ctrl: true, alt: true, description: "JWT Best Practices", action: "/jwt-best-practices" },
  { key: "g", ctrl: true, alt: true, description: "JWT Generator", action: "/jwt-generator" },
  { key: "p", ctrl: true, alt: true, description: "Privacy Analyzer", action: "/privacy-analyzer" },
  { key: "r", ctrl: true, alt: true, description: "Regex Tester", action: "/regex-tester" },
  { key: "f", ctrl: true, alt: true, description: "Favorites", action: "/favorites" },
  { key: "e", ctrl: true, alt: true, description: "Recent Tools", action: "/recent" },
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
