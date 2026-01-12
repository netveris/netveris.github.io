import { Sun, Moon } from "lucide-react";
import { useColorScheme } from "@dazl/color-scheme/react";
import styles from "./theme-toggle.module.css";

export function ThemeToggle() {
  const { resolvedScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    setColorScheme(resolvedScheme === "dark" ? "light" : "dark");
  };

  return (
    <button onClick={toggleTheme} className={styles.toggle} aria-label="Toggle theme">
      {resolvedScheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
