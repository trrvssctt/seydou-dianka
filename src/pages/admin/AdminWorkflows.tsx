import { useEffect, useState } from "react";
import workflowsService, { Workflow } from "@/services/workflows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty: Partial<Workflow> = {
  title_en: "", title_fr: "", trigger_en: "", trigger_fr: "",
  steps_en: [], steps_fr: [], nodes: [],
  status: "", exec_time: "", order_index: 0, published: true,
};

const AdminWorkflows = () => {
  const [items, setItems] = useState<Workflow[]>([]);
  const [editing, setEditing] = useState<Partial<Workflow> | null>(null);
  const [open, setOpen] = useState(false);
  const [stepsEn, setStepsEn] = useState("");
  const [stepsFr, setStepsFr] = useState("");
  const [nodesStr, setNodesStr] = useState("");

  const load = async () => {
    try {
      const data = await workflowsService.getWorkflows();
      setItems(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const startEdit = (item: Partial<Workflow> | null) => {
    const e = item ? { ...item } : { ...empty };
    setEditing(e);
    setStepsEn((e.steps_en || []).join("\n"));
    setStepsFr((e.steps_fr || []).join("\n"));
    setNodesStr((e.nodes || []).join(", "));
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const { id, created_at, updated_at, ...rest } = editing as Workflow;
    const payload = {
      ...rest,
      steps_en: stepsEn.split("\n").map(s => s.trim()).filter(Boolean),
      steps_fr: stepsFr.split("\n").map(s => s.trim()).filter(Boolean),
      nodes: nodesStr.split(",").map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editing.id) {
        await workflowsService.updateWorkflow(editing.id, payload);
      } else {
        await workflowsService.createWorkflow(payload);
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
      await workflowsService.deleteWorkflow(id);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Workflows</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <Button variant="hero" onClick={() => startEdit(null)}><Plus className="w-4 h-4" /> New</Button>
      </div>

      <div className="space-y-2">
        {items.map(it => (
          <div key={it.id} className="card-glow rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{it.title_en}</span>
                {!it.published && <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">draft</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{it.nodes.join(" → ")}</div>
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
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} workflow</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Title (EN)</Label><Input value={editing.title_en || ""} onChange={e => setEditing({ ...editing, title_en: e.target.value })} /></div>
                <div><Label>Title (FR)</Label><Input value={editing.title_fr || ""} onChange={e => setEditing({ ...editing, title_fr: e.target.value })} /></div>
                <div><Label>Trigger (EN)</Label><Input value={editing.trigger_en || ""} onChange={e => setEditing({ ...editing, trigger_en: e.target.value })} /></div>
                <div><Label>Trigger (FR)</Label><Input value={editing.trigger_fr || ""} onChange={e => setEditing({ ...editing, trigger_fr: e.target.value })} /></div>
                <div><Label>Steps (EN, one per line)</Label><Textarea rows={5} value={stepsEn} onChange={e => setStepsEn(e.target.value)} /></div>
                <div><Label>Steps (FR, one per line)</Label><Textarea rows={5} value={stepsFr} onChange={e => setStepsFr(e.target.value)} /></div>
              </div>
              <div><Label>Nodes (comma separated)</Label><Input value={nodesStr} onChange={e => setNodesStr(e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Status</Label><Input value={editing.status || ""} onChange={e => setEditing({ ...editing, status: e.target.value })} /></div>
                <div><Label>Exec time</Label><Input value={editing.exec_time || ""} onChange={e => setEditing({ ...editing, exec_time: e.target.value })} /></div>
                <div><Label>Order</Label><Input type="number" value={editing.order_index || 0} onChange={e => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} /></div>
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

export default AdminWorkflows;
