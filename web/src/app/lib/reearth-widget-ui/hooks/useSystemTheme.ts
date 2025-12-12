import { useEffect, useState } from "react";

export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return systemTheme;
};

export const resolveTheme = (
  theme: "light" | "dark" | "auto" | undefined,
  systemTheme: "light" | "dark"
): "light" | "dark" => {
  if (theme === "auto" || !theme) {
    return systemTheme;
  }
  return theme;
};
