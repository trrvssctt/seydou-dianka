import { useEffect, useState } from "react";
import statsService, { Stats } from "@/services/stats";
import { Users, FileText, Workflow, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ leads: 0, newLeads: 0, cases: 0, workflows: 0 });

  useEffect(() => {
    statsService.getStats().then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: "Total leads", value: stats.leads, icon: Users, color: "primary" },
    { label: "New leads", value: stats.newLeads, icon: TrendingUp, color: "secondary" },
    { label: "Case studies", value: stats.cases, icon: FileText, color: "primary" },
    { label: "Workflows", value: stats.workflows, icon: Workflow, color: "secondary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your portfolio activity.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card-glow rounded-2xl p-5">
            <div className={`inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3 ${c.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
