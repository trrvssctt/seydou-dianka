import { useEffect, useState } from "react";
import caseStudiesService, { CaseStudy } from "@/services/caseStudies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty: Partial<CaseStudy> = {
  number: "", badge: "", title_en: "", title_fr: "", subtitle: "",
  problem_en: "", problem_fr: "", solution_en: "", solution_fr: "",
  tech: [], metrics: [], testimonial_en: "", testimonial_fr: "", testimonial_author: "",
  order_index: 0, published: true,
};

const AdminCaseStudies = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [editing, setEditing] = useState<Partial<CaseStudy> | null>(null);
  const [open, setOpen] = useState(false);
  const [techStr, setTechStr] = useState("");
  const [metricsStr, setMetricsStr] = useState("[]");

  const load = async () => {
    try {
      const data = await caseStudiesService.getCaseStudies(true);
      setItems(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const startEdit = (item: Partial<CaseStudy> | null) => {
    const e = item ? { ...item } : { ...empty };
    setEditing(e);
    setTechStr((e.tech || []).join(", "));
    setMetricsStr(JSON.stringify(e.metrics || [], null, 2));
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    let metrics: any[] = [];
    try { metrics = JSON.parse(metricsStr || "[]"); } catch { return toast.error("Invalid metrics JSON"); }

    const { id, created_at, updated_at, ...rest } = editing as CaseStudy;
    const payload = {
      ...rest,
      tech: techStr.split(",").map(s => s.trim()).filter(Boolean),
      metrics,
    };

    try {
      if (editing.id) {
        await caseStudiesService.updateCaseStudy(editing.id, payload);
      } else {
        await caseStudiesService.createCaseStudy(payload);
      }
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      await caseStudiesService.deleteCaseStudy(id);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Case Studies</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <Button variant="hero" onClick={() => startEdit(null)}><Plus className="w-4 h-4" /> New</Button>
      </div>

      <div className="space-y-2">
        {items.map(it => (
          <div key={it.id} className="card-glow rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">#{it.number}</span>
                <span className="font-semibold">{it.title_en}</span>
                {!it.published && <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">draft</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{it.subtitle}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => startEdit(it)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} case study</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Number</Label><Input value={editing.number || ""} onChange={e => setEditing({ ...editing, number: e.target.value })} /></div>
                <div><Label>Badge</Label><Input value={editing.badge || ""} onChange={e => setEditing({ ...editing, badge: e.target.value })} /></div>
                <div><Label>Order</Label><Input type="number" value={editing.order_index || 0} onChange={e => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div><Label>Subtitle</Label><Input value={editing.subtitle || ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Title (EN)</Label><Input value={editing.title_en || ""} onChange={e => setEditing({ ...editing, title_en: e.target.value })} /></div>
                <div><Label>Title (FR)</Label><Input value={editing.title_fr || ""} onChange={e => setEditing({ ...editing, title_fr: e.target.value })} /></div>
                <div><Label>Problem (EN)</Label><Textarea rows={2} value={editing.problem_en || ""} onChange={e => setEditing({ ...editing, problem_en: e.target.value })} /></div>
                <div><Label>Problem (FR)</Label><Textarea rows={2} value={editing.problem_fr || ""} onChange={e => setEditing({ ...editing, problem_fr: e.target.value })} /></div>
                <div><Label>Solution (EN)</Label><Textarea rows={2} value={editing.solution_en || ""} onChange={e => setEditing({ ...editing, solution_en: e.target.value })} /></div>
                <div><Label>Solution (FR)</Label><Textarea rows={2} value={editing.solution_fr || ""} onChange={e => setEditing({ ...editing, solution_fr: e.target.value })} /></div>
              </div>
              <div><Label>Tech (comma separated)</Label><Input value={techStr} onChange={e => setTechStr(e.target.value)} /></div>
              <div>
                <Label>Metrics (JSON array of {"{icon, value, label}"})</Label>
                <Textarea rows={4} className="font-mono text-xs" value={metricsStr} onChange={e => setMetricsStr(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Icons: TrendingUp, Clock, Zap</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.published ?? true} onCheckedChange={v => setEditing({ ...editing, published: v })} />
                <Label>Published</Label>
              </div>
              <Button variant="hero" className="w-full" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCaseStudies;
