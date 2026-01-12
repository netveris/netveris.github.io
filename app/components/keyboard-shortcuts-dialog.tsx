import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog/dialog";
import { Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "../hooks/use-keyboard-shortcuts";
import styles from "./keyboard-shortcuts-dialog.module.css";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

function formatShortcut(shortcut: (typeof KEYBOARD_SHORTCUTS)[0]): string[] {
  const keys: string[] = [];
  if (shortcut.ctrl) keys.push(isMac ? "⌘" : "Ctrl");
  if (shortcut.alt) keys.push(isMac ? "⌥" : "Alt");
  if (shortcut.shift) keys.push(isMac ? "⇧" : "Shift");
  keys.push(shortcut.key.toUpperCase());
  return keys;
}

const groupedShortcuts = [
  {
    title: "Navigation",
    shortcuts: KEYBOARD_SHORTCUTS.filter((s) => !s.alt && s.action !== "shortcuts"),
  },
  {
    title: "Security Tools",
    shortcuts: KEYBOARD_SHORTCUTS.filter((s) => s.alt && /^[1-4]$/.test(s.key)),
  },
  {
    title: "Encryption Tools",
    shortcuts: KEYBOARD_SHORTCUTS.filter((s) => s.alt && /^[5-7]$/.test(s.key)),
  },
  {
    title: "Analysis Tools",
    shortcuts: KEYBOARD_SHORTCUTS.filter((s) => s.alt && /^[890]$/.test(s.key)),
  },
  {
    title: "Utility Tools",
    shortcuts: KEYBOARD_SHORTCUTS.filter((s) => s.alt && /^[a-z]$/.test(s.key)),
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            <Keyboard size={24} />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className={styles.shortcutsContainer}>
          {groupedShortcuts.map((group, idx) => (
            <div key={idx} className={styles.shortcutGroup}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <div className={styles.shortcutsList}>
                {group.shortcuts.map((shortcut, index) => (
                  <div key={index} className={styles.shortcut}>
                    <div className={styles.keys}>
                      {formatShortcut(shortcut).flatMap((key, i, arr) => [
                        <kbd key={`k-${i}`} className={styles.key}>
                          {key}
                        </kbd>,
                        i < arr.length - 1 ? (
                          <span key={`p-${i}`} className={styles.plus}>
                            +
                          </span>
                        ) : null,
                      ])}
                    </div>
                    <div className={styles.description}>{shortcut.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
