import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, FileText, Workflow, LogOut, Home, ShieldAlert, UserCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeLangToggle } from "@/components/ThemeLangToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import authService from "@/services/auth";

const AdminLayout = () => {
  const { t } = useLanguage();
  const nav = useNavigate();
  const { user, isLoggedIn, isAdmin, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      nav("/neka_page_connexion_admin/login");
    }
  }, [isLoading, isLoggedIn, nav]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    nav("/neka_page_connexion_admin/login");
  };

  const claimAdmin = async () => {
    try {
      const result = await authService.claimAdmin();
      if (result.success) {
        toast.success("Admin role granted! Please sign in again to refresh your session.");
        await logout();
        nav("/neka_page_connexion_admin/login");
      } else {
        toast.error("An admin already exists. Ask them to grant you access.");
      }
    } catch {
      toast.error("Failed to claim admin");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!isLoggedIn) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md card-glow rounded-3xl p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Access denied</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your account is not an admin yet. If you are the first user, claim admin access below. Otherwise ask an existing admin to grant you the role.
          </p>
          <div className="text-xs text-muted-foreground/70 mb-4 font-mono break-all">UID: {user?.id}</div>
          <div className="flex gap-2 justify-center">
            <Button onClick={claimAdmin} variant="hero">Claim admin</Button>
            <Button onClick={handleLogout} variant="outline">Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", label: t("admin.dashboard"), icon: LayoutDashboard, end: true },
    { to: "/admin/leads", label: t("admin.leads"), icon: Users },
    { to: "/admin/case-studies", label: t("admin.casestudies"), icon: FileText },
    { to: "/admin/workflows", label: t("admin.workflows"), icon: Workflow },
    { to: "/admin/profile", label: t("admin.profile"), icon: UserCircle },
    { to: "/admin/users", label: "Users", icon: Shield },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="font-display text-lg font-bold text-gradient">Admin</div>
          <div className="text-xs text-muted-foreground mt-1">Seydou DIANKA</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-3 py-2">
            <Home className="w-3.5 h-3.5" /> Public site
          </Link>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" /> {t("admin.logout")}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b border-border p-4 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map(i => (
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i.label}
              </NavLink>
            ))}
          </div>
        </header>
        <header className="border-b border-border p-4 flex items-center justify-end gap-2">
          <ThemeLangToggle />
          <Button onClick={handleLogout} variant="ghost" size="sm" className="md:hidden">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
