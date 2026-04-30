import { Server, Code2, Bot, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Stack = () => {
  const { t } = useLanguage();
  const stacks = [
    {
      icon: Server,
      title: t("stack.backend"),
      color: "primary",
      items: ["Python (FastAPI, LangChain, Pandas)", "Node.js (Express, Bull, Webhooks)", "Java (Spring Boot, Maven)", "PostgreSQL / Supabase"],
    },
    {
      icon: Code2,
      title: t("stack.frontend"),
      color: "secondary",
      items: ["React.js (Hooks, Context)", "Next.js 14 (App Router)", "TypeScript", "TailwindCSS"],
    },
    {
      icon: Bot,
      title: t("stack.ai"),
      color: "primary",
      highlight: true,
      items: ["n8n (workflows complexes, webhooks)", "OpenClaw (agents autonomes)", "LangChain / LangGraph", "RAG / Pinecone, Chroma", "OpenAI / Anthropic APIs"],
    },
    {
      icon: BarChart3,
      title: t("stack.marketing"),
      color: "secondary",
      items: ["API scraping (Apollo, LinkedIn)", "CRM (HubSpot, Pipedrive, Salesforce)", "Email (SendGrid, Mailgun)", "Analytics (GA4, Plausible)"],
    },
  ];

  return (
    <section id="stack" className="py-24 md:py-32 relative">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="badge-neon mb-4">{t("stack.badge")}</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {t("stack.title1")} <span className="text-gradient">{t("stack.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("stack.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stacks.map((stack, i) => {
            const Icon = stack.icon;
            return (
              <div key={i} className={`card-glow rounded-2xl p-6 ${stack.highlight ? 'ring-1 ring-primary/40' : ''}`}>
                <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4 ${stack.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-4">{stack.title}</h3>
                <ul className="space-y-2">
                  {stack.items.map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${stack.color === 'primary' ? 'bg-primary' : 'bg-secondary'}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground/60 mt-8 italic">{t("stack.note")}</p>
      </div>
    </section>
  );
};

export default Stack;
