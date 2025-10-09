import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { GeneralMessagesResponse } from "@shared/api";
import { MessageCircle, ShieldCheck, Trash2 } from "lucide-react";

export function GeneralChatPage() {
  const { user, isAdmin } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["general-messages"],
    queryFn: () => apiFetch<GeneralMessagesResponse>("/api/messages/general"),
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      await apiFetch("/api/messages/general", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onMutate: async (content) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ["general-messages"] });
      const previous = queryClient.getQueryData<GeneralMessagesResponse>(["general-messages"]);
      if (previous && user) {
        const optimisticMessage = {
          id: `optimistic-${Date.now()}`,
          content,
          senderId: user.id,
          senderUsername: user.username,
          senderDisplayName: user.displayName,
          senderRole: user.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          channel: "general" as const,
        };
        queryClient.setQueryData<GeneralMessagesResponse>(["general-messages"], {
          messages: [...previous.messages, optimisticMessage],
        });
      }
      return { previous };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["general-messages"], context.previous);
      }
      if (mutationError instanceof ApiError) {
        setError(mutationError.message);
      } else {
        setError("Impossible d'envoyer le message");
      }
    },
    onSuccess: () => {
      setMessage("");
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      await apiFetch(`/api/messages/general/${messageId}`, {
        method: "DELETE",
      });
    },
    onError: (mutationError: unknown) => {
      if (mutationError instanceof ApiError) {
        setError(mutationError.message);
      } else {
        setError("Impossible de supprimer le message");
      }
    },
  });

  const sortedMessages = useMemo(() => data?.messages ?? [], [data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    sendMessage.mutate(message.trim());
  };

  const disabled = sendMessage.isPending || user?.isMuted;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.65fr,1fr]">
      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-inner-card">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Salon général</h2>
            <p className="text-sm text-slate-300/70">
              Partagez les annonces officielles et les discussions ouvertes de votre communauté.
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <MessageCircle className="size-5" />
          </span>
        </header>

        <div className={cn("custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-6", isLoading && "animate-pulse")}> 
          {sortedMessages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center text-slate-300/70">
              <p className="text-base font-semibold text-white">Aucun message pour l'instant</p>
              <p className="mt-1 text-sm text-slate-300/70">
                Soyez le premier à partager une annonce ou à lancer une discussion dans le salon général.
              </p>
            </div>
          ) : (
            sortedMessages.map((item) => {
              const isAuthor = item.senderId === user?.id;
              const showDelete = isAdmin && item.id && !item.id.toString().startsWith("optimistic-");
              const initials = item.senderDisplayName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition",
                    isAuthor ? "border-primary/40 bg-primary/10" : "",
                  )}
                >
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{item.senderDisplayName}</span>
                      <span className="text-xs text-slate-400">@{item.senderUsername}</span>
                      {item.senderRole === "admin" && (
                        <Badge className="bg-primary/20 text-primary">
                          <ShieldCheck className="mr-1 size-3" /> Admin
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400/80">
                        {new Date(item.createdAt).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200/90">{item.content}</p>
                  </div>
                  {showDelete && (
                    <button
                      type="button"
                      onClick={() => deleteMessage.mutate(item.id)}
                      className="rounded-xl border border-transparent p-2 text-slate-400 transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Supprimer le message"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-white/5 bg-white/5 px-6 py-5 backdrop-blur">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
                {error}
              </div>
            )}
            {user?.isMuted && (
              <div className="rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-100">
                Vous êtes actuellement muet. Contactez un administrateur pour rétablir vos droits d'écriture.
              </div>
            )}
            <div className="flex gap-3">
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Écrire un message pour le salon général"
                className="h-12 flex-1 rounded-2xl border-white/10 bg-slate-950/70 text-white placeholder:text-slate-400 focus-visible:ring-primary"
                disabled={disabled}
              />
              <Button
                type="submit"
                className="h-12 rounded-2xl bg-primary px-6 text-primary-foreground transition hover:bg-primary/90"
                disabled={disabled || message.trim().length === 0}
              >
                {sendMessage.isPending ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner-card">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-slate-200/80">
          <h3 className="text-sm font-semibold text-white">Règles du salon</h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-200/70">
            <li className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
              Privilégiez les annonces officielles et les informations importantes.
            </li>
            <li className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
              Aucun lien externe sans validation de l'équipe d'administration.
            </li>
            <li className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
              Respect absolu entre membres : pas d'insulte, pas de spam.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-5 text-sm text-slate-200/70">
          <h3 className="text-sm font-semibold text-white">Statistiques</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-white/5 bg-white/5 p-3">
              <dt className="text-slate-400">Messages</dt>
              <dd className="mt-1 text-lg font-semibold text-white">{sortedMessages.length}</dd>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-3">
              <dt className="text-slate-400">Administrateurs</dt>
              <dd className="mt-1 text-lg font-semibold text-white">{data?.messages.filter((msg) => msg.senderRole === "admin").length ?? 0}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
