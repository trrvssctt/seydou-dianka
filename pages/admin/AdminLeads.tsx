import { useEffect, useState } from "react";
import leadsService, { Lead } from "@/services/leads";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await leadsService.updateLeadStatus(id, status);
      setLeads(ls => ls.map(l => l.id === id ? updated : l));
      toast.success("Updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await leadsService.deleteLead(id);
      setLeads(ls => ls.filter(l => l.id !== id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">{leads.length} total</p>
      </div>

      {leads.length === 0 ? (
        <div className="card-glow rounded-2xl p-10 text-center text-muted-foreground">No leads yet.</div>
      ) : (
        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.id} className="card-glow rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold">{l.name} {l.company && <span className="text-muted-foreground font-normal">· {l.company}</span>}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="w-3 h-3" />{l.email}</a>
                    {l.role && <span>· {l.role}</span>}
                    {l.mission_type && <span>· {l.mission_type}</span>}
                    {l.budget && <span>· {l.budget}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={l.status} onValueChange={v => updateStatus(l.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => remove(l.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{l.message}</p>
              <div className="text-xs text-muted-foreground/60 mt-2">{new Date(l.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
