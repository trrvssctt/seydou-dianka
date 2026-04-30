import { ArrowRight, Calendar, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";

const Counter = ({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
};

const Hero = () => {
  const { t, lang } = useLanguage();
  const profile = useProfile();
  const titleRole = profile ? (lang === "fr" ? profile.title_fr : profile.title_en) : null;
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container max-w-5xl mx-auto px-6 text-center animate-fade-in-up">
        {profile?.avatar_url && (
          <div className="flex justify-center mb-6">
            <Avatar className="w-28 h-28 ring-4 ring-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-2xl">{profile.full_name?.[0] || "S"}</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className="badge-neon mb-8 mx-auto">
          <span className="pulse-dot" />
          {t("hero.badge")}
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
          {t("hero.title1")} <span className="text-gradient">{t("hero.title2")}</span><br />
          {t("hero.title3")}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-mono">
          {t("hero.subtitle")}
        </p>

        <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-12">
          {t("hero.desc")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Button size="lg" variant="hero" asChild>
            <a href="#cases">
              <Workflow className="w-4 h-4" />
              {t("hero.cta1")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline-glow" asChild>
            <a href="#contact">
              <Calendar className="w-4 h-4" />
              {t("hero.cta2")}
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { value: 200, suffix: "+", label: t("hero.stat1") },
            { value: 5, suffix: "+", label: t("hero.stat2") },
            { value: 3, suffix: "", label: t("hero.stat3") },
          ].map((stat, i) => (
            <div key={i} className="card-glow rounded-2xl p-6">
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient mb-2">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
