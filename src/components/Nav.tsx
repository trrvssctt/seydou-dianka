import { useEffect, useState } from "react";
import { Menu, X, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeLangToggle } from "./ThemeLangToggle";
import { useProfile } from "@/hooks/useProfile";

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const profile = useProfile();
  const mailto = `mailto:${profile?.email || 'diankaseydou52@gmail.com'}`;

  const links = [
    { href: "#stack", label: t("nav.stack") },
    { href: "#cases", label: t("nav.cases") },
    { href: "#workflows", label: t("nav.workflows") },
    { href: "#contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : ''}`}>
      <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-display text-base md:text-xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
            S
          </span>
          <span className="text-gradient hidden sm:inline">Seydou DIANKA</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeLangToggle />
          <a href={mailto} className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
            <Mail className="w-3.5 h-3.5" /> {t("nav.hire")}
          </a>
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="px-6 py-4 space-y-3">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-primary py-2">
                {l.label}
              </a>
            ))}
            <a href={mailto} className="block text-sm text-primary font-semibold py-2">{t("nav.hire")}</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
