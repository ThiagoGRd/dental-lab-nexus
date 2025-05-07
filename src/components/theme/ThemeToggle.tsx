
import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Theme } from "./types";

interface ThemeToggleProps {
  variant?: "dropdown" | "switch";
}

export function ThemeToggle({ variant = "dropdown" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Theme switch variant
  if (variant === "switch") {
    return (
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4 text-yellow-500" />
        <Switch 
          checked={theme === "dark"} 
          onCheckedChange={toggleTheme} 
          aria-label="Alternar tema"
        />
        <Moon className="h-4 w-4 text-purple-400" />
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-purple-400" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
