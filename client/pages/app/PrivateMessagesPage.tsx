import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Mail, Send } from "lucide-react";
import { useState } from "react";

const sampleUsers = [
  { id: "1", displayName: "Equipe Support", username: "support" },
  { id: "2", displayName: "Modération Est", username: "moderation-est" },
  { id: "3", displayName: "Modération Ouest", username: "moderation-ouest" },
];

export function PrivateMessagesPage() {
  const [selectedUser, setSelectedUser] = useState(sampleUsers[0]);
  const [draft, setDraft] = useState("");

  return (
    <div className="grid min-h-[520px] gap-6 xl:grid-cols-[340px,1fr]">
      <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-inner-card">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Messages privés</p>
            <p className="text-xs text-slate-300/70">Canaux confidentiels administrés</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {sampleUsers.map((user) => {
            const isActive = selectedUser.id === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUser(user)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left transition", 
                  "border-white/5 bg-white/5 hover:border-primary/40 hover:bg-primary/10",
                  isActive && "border-primary/60 bg-primary/15 text-white shadow-glow",
                )}
              >
                <p className="text-sm font-semibold">{user.displayName}</p>
                <p className="text-xs text-slate-300/70">@{user.username}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-inner-card">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Conversation privée</h2>
            <p className="text-sm text-slate-300/70">
              Communication directe et archivage sécurisé avec {selectedUser.displayName}.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary/80">
            Utilisateur sélectionné : <span className="font-semibold text-white">@{selectedUser.username}</span>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center text-slate-300/70">
            <p className="text-base font-semibold text-white">Aucun message privé enregistré</p>
            <p className="max-w-md text-sm text-slate-300/70">
              Utilisez cette section pour des instructions ciblées, des vérifications utilisateurs ou des discussions réservées à l'équipe.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 bg-white/5 px-6 py-5 backdrop-blur">
          <form
            className="flex items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setDraft("");
            }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Envoyer un message à @${selectedUser.username}`}
              className="h-12 flex-1 rounded-2xl border-white/10 bg-slate-950/70 text-white placeholder:text-slate-400 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              className={cn(
                "flex items-center gap-2 rounded-2xl bg-primary px-6 text-primary-foreground transition", 
                draft.trim().length === 0 && "pointer-events-none opacity-40",
              )}
            >
              <Send className="size-4" />
              Envoyer
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
