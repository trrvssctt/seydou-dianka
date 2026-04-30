import { useEffect, useRef, useState } from "react";
import profileService from "@/services/profile";
import type { Profile } from "@/services/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminProfile = () => {
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileService.getProfile()
      .then(setP)
      .catch((e: any) => toast.error(e.message || "Failed to load profile"));
  }, []);

  const update = (k: keyof Profile, v: string) =>
    setP(prev => prev ? { ...prev, [k]: v } : prev);

  const save = async () => {
    if (!p) return;
    setSaving(true);
    try {
      const { id, created_at, updated_at, ...payload } = p;
      const updated = await profileService.updateProfile(payload);
      setP(updated);
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !p) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const data = ev.target?.result as string;
      try {
        const result = await profileService.uploadAvatar(file.name, data);
        setP(result.profile as Profile);
        toast.success("Photo updated");
      } catch (err: any) {
        toast.error(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!p) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your public identity, photo and contact info.</p>
      </div>

      <div className="card-glow rounded-2xl p-6 flex items-center gap-6">
        <Avatar className="w-24 h-24 ring-2 ring-primary/40">
          <AvatarImage src={p.avatar_url || undefined} alt={p.full_name} />
          <AvatarFallback className="text-2xl">{p.full_name?.[0] || "S"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold">{p.full_name}</div>
          <div className="text-xs text-muted-foreground mb-3">PNG/JPG · max 5MB</div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          <Button variant="outline-glow" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading…" : "Upload photo"}
          </Button>
        </div>
      </div>

      <div className="card-glow rounded-2xl p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input value={p.full_name} onChange={e => update("full_name", e.target.value)} /></div>
          <div><Label>Location</Label><Input value={p.location || ""} onChange={e => update("location", e.target.value)} /></div>
          <div><Label>Title (EN)</Label><Input value={p.title_en || ""} onChange={e => update("title_en", e.target.value)} /></div>
          <div><Label>Title (FR)</Label><Input value={p.title_fr || ""} onChange={e => update("title_fr", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Bio (EN)</Label><Textarea rows={3} value={p.bio_en || ""} onChange={e => update("bio_en", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Bio (FR)</Label><Textarea rows={3} value={p.bio_fr || ""} onChange={e => update("bio_fr", e.target.value)} /></div>
        </div>
      </div>

      <div className="card-glow rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Contact & social</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Email</Label><Input type="email" value={p.email || ""} onChange={e => update("email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={p.phone || ""} onChange={e => update("phone", e.target.value)} /></div>
          <div><Label>GitHub URL</Label><Input value={p.github_url || ""} onChange={e => update("github_url", e.target.value)} /></div>
          <div><Label>LinkedIn URL</Label><Input value={p.linkedin_url || ""} onChange={e => update("linkedin_url", e.target.value)} /></div>
          <div><Label>Twitter / X URL</Label><Input value={p.twitter_url || ""} onChange={e => update("twitter_url", e.target.value)} /></div>
          <div><Label>Calendar URL (Calendly…)</Label><Input value={p.calendar_url || ""} onChange={e => update("calendar_url", e.target.value)} /></div>
        </div>
      </div>

      <Button variant="hero" onClick={save} disabled={saving} className="w-full md:w-auto">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
};

export default AdminProfile;
