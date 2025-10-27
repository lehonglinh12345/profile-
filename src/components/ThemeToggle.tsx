import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="fixed top-20 right-4 z-50 h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 hover:bg-card shadow-elegant transition-all duration-300 ease-in-out hover:scale-110"
    >
      <div className="relative h-5 w-5">
        <Moon className={`absolute inset-0 h-5 w-5 text-primary transition-all duration-500 ease-in-out ${
          theme === "light" 
            ? "opacity-100 rotate-0 scale-100" 
            : "opacity-0 rotate-180 scale-95"
        }`} />
        <Sun className={`absolute inset-0 h-5 w-5 text-primary transition-all duration-500 ease-in-out ${
          theme === "light" 
            ? "opacity-0 rotate-180 scale-95" 
            : "opacity-100 rotate-0 scale-100"
        }`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};