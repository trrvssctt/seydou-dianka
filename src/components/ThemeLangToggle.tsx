import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export const ThemeLangToggle = () => {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "fr" : "en")} className="font-mono text-xs uppercase gap-1.5">
        <Languages className="w-4 h-4" />
        {lang}
      </Button>
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  );
};
