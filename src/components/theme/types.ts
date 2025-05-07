
import { Dispatch, ReactNode, SetStateAction } from "react";

export type Theme = "light" | "dark" | "system";

export type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const initialThemeState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};
