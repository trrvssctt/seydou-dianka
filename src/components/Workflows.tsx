import { useEffect, useState } from "react";
import { ChevronDown, GitBranch, Clock } from "lucide-react";
import workflowsService, { Workflow } from "@/services/workflows";
import { useLanguage } from "@/contexts/LanguageContext";

const FALLBACK: Workflow[] = [
  {
    id: "1",
    title_en: "Cold Outreach Pipeline", title_fr: "Pipeline Cold Outreach",
    trigger_en: "New lead in Google Sheets", trigger_fr: "Nouveau lead dans Google Sheets",
    steps_en: ["Apollo.io enrichment", "Lead scoring (Python)", "Personalized email (OpenAI)", "Send via Gmail API", "HubSpot contact + task", "Slack alert sales team"],
    steps_fr: ["Enrichissement Apollo.io", "Scoring lead (Python)", "Email personnalisé (OpenAI)", "Envoi via Gmail API", "HubSpot contact + tâche", "Notif Slack équipe sales"],
    nodes: ["Webhook", "Apollo", "OpenAI", "Gmail", "HubSpot", "Slack"],
    status: "🟢 Production · 4000+ leads", exec_time: "~45s/lead",
    order_index: 0, published: true, created_at: "", updated_at: "",
  },
  {
    id: "2",
    title_en: "Weekly Competitor Watch", title_fr: "Veille Concurrentielle",
    trigger_en: "Cron · Mondays 8am UTC", trigger_fr: "Cron · Lundis 8h UTC",
    steps_en: ["Scrape competitor sites (Puppeteer)", "Analysis (OpenClaw)", "Executive summary (Claude)", "Post to Slack", "Save to Notion DB"],
    steps_fr: ["Scraping sites concurrents", "Analyse OpenClaw", "Résumé exécutif Claude", "Post Slack", "Sauvegarde Notion"],
    nodes: ["Cron", "Puppeteer", "OpenClaw", "Claude", "Slack", "Notion"],
    status: "🟢 Production · 6 months", exec_time: "~8min",
    order_index: 1, published: true, created_at: "", updated_at: "",
  },
  {
    id: "3",
    title_en: "AI Support Ticket Classifier", title_fr: "Classifieur de Tickets IA",
    trigger_en: "Inbound email (support@)", trigger_fr: "Email entrant (support@)",
    steps_en: ["Gmail webhook", "Classify (OpenClaw)", "Branch: bug → Jira / question → Notion RAG / feature → Canny", "Auto-reply if applicable"],
    steps_fr: ["Webhook Gmail", "Classification OpenClaw", "Branchement : bug → Jira / question → Notion RAG / feature → Canny", "Réponse auto si applicable"],
    nodes: ["Gmail", "OpenClaw", "Jira", "Notion", "Canny"],
    status: "🟢 94% accuracy", exec_time: "~12s/ticket",
    order_index: 2, published: true, created_at: "", updated_at: "",
  },
];

const Workflows = () => {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  const [workflows, setWorkflows] = useState<Workflow[]>(FALLBACK);

  useEffect(() => {
    workflowsService.getWorkflows()
      .then(data => { if (data && data.length > 0) setWorkflows(data); })
      .catch(() => {});
  }, []);

  return (
    <section id="workflows" className="py-24 md:py-32 relative">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="badge-neon mb-4">{t("wf.badge")}</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {t("wf.title1")} <span className="text-gradient">{t("wf.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("wf.subtitle")}</p>
        </div>

        <div className="space-y-4">
          {workflows.map((w, i) => {
            const isOpen = open === i;
            const steps = lang === "fr" ? w.steps_fr : w.steps_en;
            return (
              <div key={w.id} className="card-glow rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono text-sm">
                      0{i + 1}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{lang === "fr" ? w.title_fr : w.title_en}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" /> {lang === "fr" ? w.trigger_fr : w.trigger_en}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="mb-6 p-4 rounded-xl bg-background/50 border border-border overflow-x-auto">
                      <div className="flex items-center gap-2 min-w-max">
                        {w.nodes.map((node, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 text-xs font-mono text-foreground">
                              {node}
                            </div>
                            {j < w.nodes.length - 1 && <div className="w-6 h-px bg-gradient-to-r from-primary to-secondary" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 flex items-center gap-2">
                      <GitBranch className="w-3 h-3" /> {t("wf.steps")}
                    </div>
                    <ol className="space-y-2 mb-4">
                      {steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm">
                          <span className="font-mono text-primary mt-0.5">{j + 1}.</span>
                          <span className="text-foreground/90">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border pt-4">
                      {w.exec_time && <span>⏱ {w.exec_time}</span>}
                      {w.status && <span>{w.status}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-10">{t("wf.note")}</p>
      </div>
    </section>
  );
};

export default Workflows;
