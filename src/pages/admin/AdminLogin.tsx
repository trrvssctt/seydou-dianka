import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
});

const AdminLogin = () => {
  const { t } = useLanguage();
  const nav = useNavigate();
  const auth = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.isLoggedIn) {
      nav("/admin");
    }
  }, [auth.isLoggedIn, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await auth.login(email, password);
        toast.success("Welcome back");
        nav("/admin");
      } else {
        await auth.signup(email, password);
        toast.success("Account created. You can now sign in.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md card-glow rounded-3xl p-8">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Home</Link>
        <h1 className="font-display text-3xl font-bold mt-4 mb-2">{t("admin.login")}</h1>
        <p className="text-sm text-muted-foreground mb-6">Seydou DIANKA · Portfolio admin</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>{t("admin.password")}</Label>
            <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Loading..." : (mode === "signin" ? t("admin.signin") : t("admin.signup"))}
          </Button>
        </form>
        <button onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="w-full text-xs text-muted-foreground hover:text-primary mt-4">
          {mode === "signin" ? t("admin.signup") : t("admin.signin")}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
