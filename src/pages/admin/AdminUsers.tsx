import { useEffect, useState } from "react";
import usersService, { UserRole } from "@/services/users";
import authService from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";

const AdminUsers = () => {
  const [rows, setRows] = useState<UserRole[]>([]);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  const load = async () => {
    const currentUser = authService.getStoredUser();
    setMe(currentUser?.id || null);
    try {
      const data = await usersService.getUserRoles();
      setRows(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const grant = async () => {
    const id = uid.trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return toast.error("Invalid user UID");
    try {
      await usersService.grantAdminRole(id);
      toast.success("Admin granted");
      setUid("");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to grant role");
    }
  };

  const revoke = async (roleId: string, userId: string) => {
    if (userId === me) return toast.error("You cannot revoke your own admin role.");
    if (!confirm("Revoke admin from this user?")) return;
    try {
      await usersService.revokeAdminRole(roleId);
      toast.success("Revoked");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke role");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Grant or revoke admin access. Users must sign up at <code>/neka_page_connexion_admin/login</code> first, then share their UID with you.
        </p>
      </div>

      <div className="card-glow rounded-2xl p-6 space-y-3">
        <Label>Grant admin by user UID</Label>
        <div className="flex gap-2">
          <Input
            placeholder="00000000-0000-0000-0000-000000000000"
            value={uid}
            onChange={e => setUid(e.target.value)}
            className="font-mono text-xs"
          />
          <Button variant="hero" onClick={grant}>
            <UserPlus className="w-4 h-4" /> Grant
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Admins ({rows.filter(r => r.role === "admin").length})</h2>
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="card-glow rounded-2xl p-8 text-center text-muted-foreground text-sm">No roles yet.</div>
        ) : (
          rows.map(r => (
            <div key={r.id} className="card-glow rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs">{r.user_id}</span>
                  {r.user_id === me && <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">you</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r.role}{r.email ? ` · ${r.email}` : ''} · since {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => revoke(r.id, r.user_id)} disabled={r.user_id === me}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
