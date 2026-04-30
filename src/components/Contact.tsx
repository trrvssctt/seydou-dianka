import { Github, Linkedin, Calendar, Send, Star, Quote, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import leadsService from "@/services/leads";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/useProfile";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(200).optional(),
  role: z.string().max(50).optional(),
  mission_type: z.string().max(50).optional(),
  budget: z.string().max(50).optional(),
  message: z.string().trim().min(1).max(2000),
});

const Contact = () => {
  const { t } = useLanguage();
  const profile = useProfile();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", mission_type: "", budget: "", message: "" });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await leadsService.submitLead(parsed.data as any);
      toast.success(t("contact.success"));
      setForm({ name: "", email: "", company: "", role: "", mission_type: "", budget: "", message: "" });
    } catch {
      toast.error(t("contact.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="badge-neon mb-4">{t("contact.badge")}</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {t("contact.title1")} <span className="text-gradient">{t("contact.title2")}</span>
          </h2>
          <p className="text-muted-foreground">{t("contact.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 card-glow rounded-3xl p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.name")}</label>
                <Input required maxLength={100} value={form.name} onChange={e => update("name", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.email")}</label>
                <Input required type="email" maxLength={255} value={form.email} onChange={e => update("email", e.target.value)} placeholder="jane@company.com" />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.company")}</label>
              <Input maxLength={200} value={form.company} onChange={e => update("company", e.target.value)} placeholder="Acme Inc." />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.role")}</label>
                <Select value={form.role} onValueChange={v => update("role", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CTO">CTO</SelectItem>
                    <SelectItem value="Head of Marketing">Head of Marketing</SelectItem>
                    <SelectItem value="Founder">Founder</SelectItem>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.mission")}</label>
                <Select value={form.mission_type} onValueChange={v => update("mission_type", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.budget")}</label>
                <Select value={form.budget} onValueChange={v => update("budget", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$2k-5k/mo">$2k–5k/mo</SelectItem>
                    <SelectItem value="$5k-10k/mo">$5k–10k/mo</SelectItem>
                    <SelectItem value="$10k+/mo">$10k+/mo</SelectItem>
                    <SelectItem value="TBD">TBD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">{t("contact.message")}</label>
              <Textarea required maxLength={2000} rows={5} value={form.message} onChange={e => update("message", e.target.value)} placeholder={t("contact.messageph")} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              <Send className="w-4 h-4" />
              {loading ? t("contact.sending") : t("contact.send")}
            </Button>
          </form>

          <div className="lg:col-span-2 space-y-4">
            <div className="card-glow rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
              </div>
              <div className="text-sm font-mono text-primary mb-2">🏅 Top 3% n8n Expert · Upwork</div>
              <div className="text-xs text-muted-foreground">🤖 OpenClaw Contributor · 📦 15+ workflows deployed</div>
            </div>

            <div className="card-glow rounded-2xl p-6">
              <Quote className="w-6 h-6 text-secondary mb-3" />
              <p className="text-foreground/90 italic mb-4 text-sm leading-relaxed">
                "Built our entire lead gen pipeline in 2 weeks. Saved us $60k/year in ops costs."
              </p>
              <div className="text-xs font-mono text-muted-foreground">— Michael, CTO (SaaS US)</div>
            </div>

            <div className="card-glow rounded-2xl p-6 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">{t("contact.findme")}</div>
              <a href={`mailto:${profile?.email || 'diankaseydou52@gmail.com'}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> {profile?.email || 'diankaseydou52@gmail.com'}
              </a>
              <a href={`tel:${(profile?.phone || '+221781311371').replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> {profile?.phone || '+221 78 131 13 71'}
              </a>
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {profile?.calendar_url && (
                <a href={profile.calendar_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Calendar className="w-4 h-4" /> Book 15min
                </a>
              )}
            </div>

            <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="pulse-dot" />
                <div className="text-xs font-mono text-primary uppercase tracking-wider">{t("contact.available")}</div>
              </div>
              <div className="text-sm text-foreground/90">{t("contact.nextslot")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
