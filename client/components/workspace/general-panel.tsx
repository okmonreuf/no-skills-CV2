import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

interface GeneralMessage {
  id: string;
  author: string;
  role: "admin" | "member";
  timestamp: string;
  content: string;
}

const seedMessages: GeneralMessage[] = [
  {
    id: "1",
    author: "Élodie",
    role: "admin",
    timestamp: "09:42",
    content: "Bienvenue sur No-Skills Messagerie. Merci de lire les règles avant toute publication.",
  },
  {
    id: "2",
    author: "Carlos",
    role: "member",
    timestamp: "09:45",
    content: "Ravi de rejoindre la communauté. Hâte de participer aux prochains événements.",
  },
];

export const GeneralPanel = () => {
  const {
    messages: {
      workspace: { general, statuses },
    },
  } = useLocale();
  const [messages, setMessages] = useState(seedMessages);
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: "Vous",
        role: "admin",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: draft,
      },
    ]);
    setDraft("");
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25 backdrop-blur-lg">
      <header className="border-b border-white/10 p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{general.title}</p>
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">{general.title}</h2>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Live
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-400">{general.subtitle}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
            {general.emptyState}
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-inner shadow-black/20"
            >
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-semibold text-white">{message.author}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                  message.role === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-700 text-slate-200",
                )}>
                  {message.role === "admin" ? statuses.admin : statuses.member}
                </span>
                <span>•</span>
                <time>{message.timestamp}</time>
              </div>
              <p className="mt-3 text-base text-slate-100">{message.content}</p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 p-6">
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/30">
          <textarea
            className="h-20 flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder={general.messagePlaceholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-primary/50"
          >
            <Send className="h-4 w-4" />
            {general.sendLabel}
          </button>
        </div>
      </form>
    </section>
  );
};
