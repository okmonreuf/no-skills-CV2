import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

const bannedUsers = [
  {
    username: "ancien-membre",
    displayName: "Ancien Membre",
    bannedAt: "05 mars 2025",
    reason: "Spam répétitif",
  },
  {
    username: "compte-temporaire",
    displayName: "Compte Temporaire",
    bannedAt: "28 février 2025",
    reason: "Partage de liens non autorisés",
  },
];

export function BannedUsersPage() {
  const items = useMemo(() => bannedUsers, []);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner-card">
        <h2 className="text-lg font-semibold text-white">Utilisateurs bannis</h2>
        <p className="mt-2 text-sm text-slate-300/70">
          Conservez une trace claire des sanctions appliquées et restaurez l'accès depuis cette interface.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner-card">
        <div className="grid grid-cols-[1.2fr,1fr,1fr,0.8fr] gap-4 border-b border-white/5 pb-4 text-xs uppercase tracking-widest text-slate-400 max-lg:hidden">
          <span>Identité</span>
          <span>Raison</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        <div className="space-y-3">
          {items.map((user) => (
            <div
              key={user.username}
              className="grid items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-200/80 max-lg:grid-cols-1 lg:grid-cols-[1.2fr,1fr,1fr,0.8fr]"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white">{user.displayName}</span>
                <span className="text-xs text-slate-300/70">@{user.username}</span>
              </div>

              <div className="text-sm">
                <Badge variant="secondary" className="border border-destructive/40 bg-destructive/20 text-destructive-foreground">
                  {user.reason}
                </Badge>
              </div>

              <div className="text-sm text-slate-300/70">{user.bannedAt}</div>

              <div className="text-right">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-white/10 bg-transparent text-slate-200 hover:border-primary/50 hover:bg-primary/10 hover:text-white"
                >
                  Réintégrer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
