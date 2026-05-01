import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stack from "@/components/Stack";
import CaseStudies from "@/components/CaseStudies";
import Workflows from "@/components/Workflows";
import Contact from "@/components/Contact";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const { t } = useLanguage();
  const profile = useProfile();
  const ctaHref = profile?.calendar_url || "#contact";
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Nav />
      <main>
        <Hero />
        <Stack />
        <CaseStudies />
        <Workflows />
        <Contact />
      </main>

      <footer className="border-t border-border py-10">
        <div className="container max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-display font-bold text-base mb-1">{profile?.full_name || "Seydou DIANKA"}</div>
            <div className="text-muted-foreground">{profile?.title_en || t("footer.role")}</div>
            <div className="text-muted-foreground text-xs mt-1">📍 {profile?.location || "Dakar, Senegal · Remote (GMT)"}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Contact</div>
            <div className="text-muted-foreground">{profile?.email || "diankaseydou52@gmail.com"}</div>
            <div className="text-muted-foreground">{profile?.phone || "+221 78 131 13 71"}</div>
          </div>
          <div className="md:text-right text-muted-foreground text-xs self-end">{t("footer.copy")}</div>
        </div>
      </footer>

      <a
        href={ctaHref}
        target={profile?.calendar_url ? "_blank" : undefined}
        rel={profile?.calendar_url ? "noreferrer" : undefined}
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:scale-105 transition-transform"
      >
        <Calendar className="w-4 h-4" />
        {t("cta.float")}
      </a>
    </div>
  );
};

export default Index;
