import { TrendingUp, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import caseStudiesService, { CaseStudy } from "@/services/caseStudies";
import { useLanguage } from "@/contexts/LanguageContext";

const ICONS: Record<string, any> = { TrendingUp, Clock, Zap };

const FALLBACK: CaseStudy[] = [
  {
    id: "1", number: "01", badge: "🔥 Most requested",
    title_en: "Lead Scoring Automation", title_fr: "Automatisation Scoring Leads",
    subtitle: "n8n + OpenClaw",
    problem_en: "Manual qualification of 300 leads/month took 20h/week. 3% response rate.",
    problem_fr: "Qualification manuelle de 300 leads/mois (20h/sem). Taux de réponse 3%.",
    solution_en: "n8n workflow intercepts forms → enriches via Apollo → scores via OpenClaw agent → syncs HubSpot → Slack alert for hot leads.",
    solution_fr: "Workflow n8n : formulaires → enrichissement Apollo → scoring OpenClaw → sync HubSpot → notif Slack.",
    tech: ["n8n", "Python", "OpenAI API", "Apollo.io", "HubSpot", "Slack"],
    metrics: [
      { icon: "Clock", value: "40h/mo", label: "saved" },
      { icon: "TrendingUp", value: "+25%", label: "conversion" },
    ],
    order_index: 0, published: true, created_at: "", updated_at: "",
  },
  {
    id: "2", number: "02", badge: "🤖 AI Native",
    title_en: "Content Agent", title_fr: "Agent Contenu IA",
    subtitle: "OpenClaw + Node.js",
    problem_en: "Tech content team produced 3 articles/week. Goal: 15.",
    problem_fr: "Production de 3 articles/semaine. Objectif : 15.",
    solution_en: "Autonomous OpenClaw agent scrapes Reddit/HN → identifies trends → drafts via Claude → publishes Notion → Discord notif.",
    solution_fr: "Agent OpenClaw : scrape Reddit/HN → tendances → rédaction Claude → publication Notion → notif Discord.",
    tech: ["OpenClaw", "Node.js", "Puppeteer", "Anthropic API", "Notion API"],
    metrics: [
      { icon: "Zap", value: "15/wk", label: "articles (vs 3)" },
      { icon: "TrendingUp", value: "+120%", label: "SEO traffic" },
    ],
    order_index: 1, published: true, created_at: "", updated_at: "",
  },
  {
    id: "3", number: "03", badge: "📊 Full-Stack",
    title_en: "Marketing Dashboard", title_fr: "Dashboard Marketing",
    subtitle: "React + Node + n8n",
    problem_en: "Data silos across 5 tools. Extracting KPIs took 2h/day.",
    problem_fr: "Silos de données entre 5 outils. Extraire les KPIs prenait 2h/jour.",
    solution_en: "React/Node app with n8n webhooks centralizing all APIs → Postgres → real-time dashboard with filters and CSV export.",
    solution_fr: "App React/Node avec webhooks n8n → Postgres → dashboard temps réel avec filtres et export CSV.",
    tech: ["React", "Node.js", "Postgres", "n8n", "Chart.js"],
    metrics: [
      { icon: "Clock", value: "10min", label: "vs 2h daily" },
      { icon: "TrendingUp", value: "+22%", label: "ROAS" },
    ],
    order_index: 2, published: true, created_at: "", updated_at: "",
  },
];

const CaseStudies = () => {
  const { t, lang } = useLanguage();
  const [cases, setCases] = useState<CaseStudy[]>(FALLBACK);

  useEffect(() => {
    caseStudiesService.getCaseStudies()
      .then(data => { if (data && data.length > 0) setCases(data); })
      .catch(() => {});
  }, []);

  return (
    <section id="cases" className="py-24 md:py-32 relative">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="badge-neon mb-4">{t("cases.badge")}</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {t("cases.title1")} <span className="text-gradient">{t("cases.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("cases.subtitle")}</p>
        </div>

        <div className="space-y-6">
          {cases.map((c) => (
            <div key={c.id} className="card-glow rounded-3xl p-8 md:p-10 grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-2">
                <div className="font-mono text-sm text-primary mb-2">{t("cases.project")} {c.number}</div>
                <div className="font-display text-6xl font-bold text-gradient opacity-80">{c.number}</div>
                {c.badge && <div className="mt-3 text-xs">{c.badge}</div>}
              </div>

              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">{lang === "fr" ? c.title_fr : c.title_en}</h3>
                  {c.subtitle && <p className="text-secondary font-mono text-sm">{c.subtitle}</p>}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">{t("cases.problem")}</div>
                  <p className="text-muted-foreground">{lang === "fr" ? c.problem_fr : c.problem_en}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1">{t("cases.solution")}</div>
                  <p className="text-foreground/90">{lang === "fr" ? c.solution_fr : c.solution_en}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {c.tech.map((tech, j) => (
                    <span key={j} className="px-3 py-1 rounded-full text-xs font-mono bg-muted border border-border text-muted-foreground">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 space-y-3">
                {c.metrics.map((m, j) => {
                  const Icon = ICONS[m.icon] || TrendingUp;
                  return (
                    <div key={j} className="rounded-xl bg-muted/50 border border-border p-4">
                      <Icon className="w-5 h-5 text-primary mb-2" />
                      <div className="font-display text-2xl font-bold">{m.value}</div>
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
