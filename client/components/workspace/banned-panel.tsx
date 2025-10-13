import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CalendarX, CheckCircle } from "lucide-react";
import { useState } from "react";

interface BannedUser {
  id: string;
  username: string;
  displayName: string;
  reason: string;
  date: string;
}

const bannedSeed: BannedUser[] = [
  {
    id: "b1",
    username: "gecko",
    displayName: "Gecko",
    reason: "Spam répété dans les salons privés",
    date: "2024-08-10",
  },
  {
    id: "b2",
    username: "shadow",
    displayName: "Shadow",
    reason: "Propos contraires à la charte",
    date: "2024-09-02",
  },
];

export const BannedPanel = () => {
  const {
    messages: {
      workspace: { banned },
    },
  } = useLocale();
  const [users, setUsers] = useState(bannedSeed);

  const handleUnban = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25 backdrop-blur-lg">
      <header className="border-b border-white/10 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {banned.title}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{banned.subtitle}</h2>
          </div>
          <CalendarX className="h-6 w-6 text-rose-200" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {users.length === 0 ? (
          <p className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-slate-400">
            {banned.empty}
          </p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-inner shadow-black/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-slate-400">@{user.username}</p>
                  </div>
                  <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                    {banned.title}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-300">{user.reason}</p>
                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-500">
                  <span>{new Date(user.date).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => handleUnban(user.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition",
                      "hover:bg-emerald-500/20",
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {banned.unbanButton}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
