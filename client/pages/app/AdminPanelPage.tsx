import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Ban, FilePlus2, Shield } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminPanelPage() {
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "member",
  });

  const [moderation, setModeration] = useState({
    username: "",
    reason: "",
    action: "ban",
  });

  const handleCreateUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleModeration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner-card">
        <header className="flex flex-col justify-between gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Création de comptes</h2>
            <p className="text-sm text-slate-300/70">
              Gérez l'accès à votre messagerie en créant manuellement chaque identité.
            </p>
          </div>
          <Badge variant="secondary" className="border border-primary/20 bg-primary/15 text-primary">
            Accès admins
          </Badge>
        </header>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
          <div className="space-y-2">
            <label htmlFor="admin-new-username" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
              Nom d'utilisateur
            </label>
            <Input
              id="admin-new-username"
              value={newUser.username}
              onChange={(event) => setNewUser((prev) => ({ ...prev, username: event.target.value }))}
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary"
              placeholder="ex: modération-paris"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-new-display" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
              Nom affiché
            </label>
            <Input
              id="admin-new-display"
              value={newUser.displayName}
              onChange={(event) => setNewUser((prev) => ({ ...prev, displayName: event.target.value }))}
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary"
              placeholder="ex: Modération Paris"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-new-password" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
              Mot de passe initial
            </label>
            <Input
              id="admin-new-password"
              type="password"
              value={newUser.password}
              onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary"
              placeholder="Définissez un mot de passe fort"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-new-role" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
              Rôle
            </label>
            <select
              id="admin-new-role"
              value={newUser.role}
              onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="member">Membre</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-primary-foreground shadow-glow transition hover:bg-primary/90"
            >
              <FilePlus2 className="size-4" />
              Créer le compte
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner-card">
          <header className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Modération ciblée</h3>
              <p className="text-sm text-slate-300/70">
                Appliquez une action immédiate sur un utilisateur identifié.
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Ban className="size-5" />
            </span>
          </header>

          <form className="mt-5 space-y-4" onSubmit={handleModeration}>
            <div className="space-y-2">
              <label htmlFor="moderation-username" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
                Nom d'utilisateur cible
              </label>
              <Input
                id="moderation-username"
                value={moderation.username}
                onChange={(event) => setModeration((prev) => ({ ...prev, username: event.target.value }))}
                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary"
                placeholder="ex: membre-01"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "ban", label: "Bannir" },
                { key: "unban", label: "Lever le bannissement" },
                { key: "mute", label: "Mute" },
                { key: "unmute", label: "Lever le mute" },
              ].map((action) => {
                const isActive = moderation.action === action.key;
                return (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => setModeration((prev) => ({ ...prev, action: action.key }))}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-semibold transition", 
                      "border-white/5 bg-white/5 hover:border-primary/40 hover:bg-primary/10",
                      isActive && "border-primary/60 bg-primary/15 text-white shadow-glow",
                    )}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label htmlFor="moderation-reason" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
                Justification
              </label>
              <Textarea
                id="moderation-reason"
                value={moderation.reason}
                onChange={(event) => setModeration((prev) => ({ ...prev, reason: event.target.value }))}
                className="min-h-[120px] rounded-2xl border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-400 focus-visible:ring-primary"
                placeholder="Documentez la décision pour l'audit. Rien ne doit être laissé au hasard."
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-2xl bg-primary py-3 text-primary-foreground shadow-glow transition hover:bg-primary/90"
            >
              Enregistrer l'action de modération
            </Button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner-card">
          <header className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Audit récent</h3>
              <p className="text-sm text-slate-300/70">
                Aperçu rapide des opérations de modération appliquées.
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Shield className="size-5" />
            </span>
          </header>

          <ul className="mt-5 space-y-3 text-sm text-slate-200/80">
            <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <span className="font-semibold text-white">Création compte</span> · @moderation-est · 12 mars 2025 • 09:24
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <span className="font-semibold text-white">Mute</span> · @membre-02 · 11 mars 2025 • 15:06
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <span className="font-semibold text-white">Suppression message</span> · @membre-05 · 10 mars 2025 • 22:18
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
