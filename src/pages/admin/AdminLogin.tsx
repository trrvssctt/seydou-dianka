import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { Lock } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
});

const AdminLogin = () => {
  const nav = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.isLoggedIn) nav("/admin");
  }, [auth.isLoggedIn, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Invalid credentials");
      return;
    }
    setLoading(true);
    try {
      await auth.login(email, password);
      nav("/admin");
    } catch {
      toast.error("Access denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={submit} className="w-full max-w-xs space-y-3 px-6">
        <div className="flex justify-center mb-6">
          <Lock className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <Input
          type="email"
          placeholder="Email"
          required
          autoComplete="off"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-muted/30 border-border/40"
        />
        <Input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-muted/30 border-border/40"
        />
        <Button type="submit" variant="ghost" className="w-full text-muted-foreground" disabled={loading}>
          {loading ? "..." : "→"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
