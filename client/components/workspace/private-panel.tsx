import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MailPlus, MessageCircle, Search, Send, ShieldAlert } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

interface PrivateUser {
  id: string;
  username: string;
  displayName: string;
  status: "active" | "muted" | "banned";
  isAdmin?: boolean;
}

interface PrivateMessage {
  id: string;
  sender: "admin" | "member";
  content: string;
  timestamp: string;
}

const seedUsers: PrivateUser[] = [
  {
    id: "u1",
    username: "elodie",
    displayName: "Élodie",
    status: "active",
    isAdmin: true,
  },
  {
    id: "u2",
    username: "carlos",
    displayName: "Carlos",
    status: "active",
  },
  {
    id: "u3",
    username: "mei",
    displayName: "Mei",
    status: "muted",
  },
];

const archivedMessages: Record<string, PrivateMessage[]> = {
  u1: [
    {
      id: "m1",
      sender: "member",
      content: "Mise à jour : la charte de modération a été signée par tout le monde.",
      timestamp: "Hier",
    },
  ],
  u2: [
    {
      id: "m2",
      sender: "admin",
      content: "Bienvenue Carlos ! Présente-toi dans le salon général dès que possible.",
      timestamp: "09:15",
    },
  ],
  u3: [
    {
      id: "m3",
      sender: "admin",
      content: "Ton accès vocal est suspendu 24h. Rappel des règles envoyé.",
      timestamp: "08:50",
    },
  ],
};

export const PrivatePanel = () => {
  const {
    messages: {
      workspace: { private: labels, statuses },
    },
  } = useLocale();
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<PrivateUser | null>(seedUsers[1]);
  const [draft, setDraft] = useState("");

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return seedUsers;
    return seedUsers.filter((user) =>
      [user.username, user.displayName].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [query]);

  const currentMessages = selectedUser ? archivedMessages[selectedUser.id] ?? [] : [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || !selectedUser) return;
    archivedMessages[selectedUser.id] = [
      ...(archivedMessages[selectedUser.id] ?? []),
      {
        id: crypto.randomUUID(),
        sender: "admin",
        content: draft,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setDraft("");
  };

  const statusText = (status: PrivateUser["status"], isAdmin?: boolean) => {
    if (isAdmin) return statuses.admin;
    if (status === "muted") return statuses.muted;
    if (status === "banned") return statuses.banned;
    return statuses.member;
  };

  return (
    <section className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[0.42fr,0.58fr]">
      <aside className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25 backdrop-blur-lg">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {labels.title}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">{labels.subtitle}</h2>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              placeholder={labels.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {filteredUsers.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-xs text-slate-400">
              {labels.emptyUsers}
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredUsers.map((user) => {
                const isActive = selectedUser?.id === user.id;
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition",
                        isActive
                          ? "border-primary/30 bg-primary/15 text-white shadow-lg shadow-primary/25"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/20 hover:bg-primary/10 hover:text-white",
                      )}
                    >
                      <div>
                        <p className="font-semibold tracking-tight">{user.displayName}</p>
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider",
                          user.isAdmin
                            ? "bg-primary text-primary-foreground"
                            : user.status === "muted"
                              ? "bg-amber-500/30 text-amber-200"
                              : user.status === "banned"
                                ? "bg-rose-500/30 text-rose-200"
                                : "bg-white/10 text-slate-200",
                        )}
                      >
                        {statusText(user.status, user.isAdmin)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-white/10 p-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>{labels.statusMuted}</span>
          </div>
        </div>
      </aside>

      <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25 backdrop-blur-lg">
        {!selectedUser ? (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-400">
            {labels.noSelection}
          </div>
        ) : (
          <>
            <header className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {labels.title}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {selectedUser.displayName}
                  </h3>
                  <p className="text-xs text-slate-400">@{selectedUser.username}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                    selectedUser.isAdmin
                      ? "bg-primary text-primary-foreground"
                      : selectedUser.status === "muted"
                        ? "bg-amber-500/30 text-amber-200"
                        : selectedUser.status === "banned"
                          ? "bg-rose-500/30 text-rose-200"
                          : "bg-emerald-500/20 text-emerald-100",
                  )}
                >
                  {statusText(selectedUser.status, selectedUser.isAdmin)}
                </span>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {currentMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-sm text-slate-400">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <MailPlus className="h-6 w-6 text-primary" />
                    <span>{labels.noSelection}</span>
                  </div>
                </div>
              ) : (
                currentMessages.map((message) => (
                  <article
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl border border-white/10 bg-white/5 p-4 text-sm shadow-inner shadow-black/20",
                      message.sender === "admin"
                        ? "ml-auto text-slate-200"
                        : "mr-auto text-slate-100",
                    )}
                  >
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>
                        {message.sender === "admin" ? statuses.admin : statuses.member}
                      </span>
                      <span>•</span>
                      <time>{message.timestamp}</time>
                    </div>
                    <p className="mt-3 text-base text-white">{message.content}</p>
                  </article>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-6">
              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/30">
                <textarea
                  className="h-24 flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder={labels.messagePlaceholder}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-primary/50"
                >
                  <Send className="h-4 w-4" />
                  {labels.sendLabel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
};
