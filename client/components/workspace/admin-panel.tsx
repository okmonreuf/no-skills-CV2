import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  BookUp2,
  ClipboardList,
  CloudUpload,
  FileWarning,
  Gavel,
  KeyRound,
  UserPlus,
  VolumeX,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

interface AuditLogEntry {
  id: string;
  type: keyof ReturnType<typeof useLocale>["messages"]["workspace"]["admin"]["logMessages"];
  actor: string;
  target?: string;
  duration?: number;
  timestamp: string;
}

const initialLogs: AuditLogEntry[] = [
  {
    id: "log-1",
    type: "create",
    actor: "Élodie",
    target: "carlos",
    timestamp: "Hier • 21:10",
  },
  {
    id: "log-2",
    type: "ban",
    actor: "Mei",
    target: "gecko",
    timestamp: "Hier • 18:02",
  },
  {
    id: "log-3",
    type: "upload",
    actor: "Élodie",
    target: "carlos",
    timestamp: "Aujourd'hui • 09:10",
  },
];

const badgeMap: Record<AuditLogEntry["type"], { icon: JSX.Element; color: string }> = {
  create: {
    icon: <UserPlus className="h-4 w-4" />,
    color: "bg-emerald-500/20 text-emerald-200",
  },
  ban: {
    icon: <Gavel className="h-4 w-4" />,
    color: "bg-rose-500/20 text-rose-200",
  },
  mute: {
    icon: <VolumeX className="h-4 w-4" />,
    color: "bg-amber-500/20 text-amber-200",
  },
  unban: {
    icon: <KeyRound className="h-4 w-4" />,
    color: "bg-sky-500/20 text-sky-200",
  },
  upload: {
    icon: <CloudUpload className="h-4 w-4" />,
    color: "bg-primary/20 text-primary-foreground",
  },
  eventStart: {
    icon: <BookUp2 className="h-4 w-4" />,
    color: "bg-indigo-500/20 text-indigo-200",
  },
  eventStop: {
    icon: <ClipboardList className="h-4 w-4" />,
    color: "bg-slate-500/20 text-slate-100",
  },
};

export const AdminPanel = () => {
  const {
    messages: {
      workspace: { admin, feedback },
    },
  } = useLocale();
  const [logs, setLogs] = useState(initialLogs);
  const [alert, setAlert] = useState<string | null>(null);

  const handleCreateUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = (form.get("username") as string)?.trim();
    if (!username) return;

    setAlert(feedback.userCreated);
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        type: "create",
        actor: "Admin",
        target: username,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    event.currentTarget.reset();
  };

  const handleBanUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = (new FormData(event.currentTarget).get("banUsername") as string)?.trim();
    if (!username) return;
    setAlert(feedback.userBanned);
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        type: "ban",
        actor: "Admin",
        target: username,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    event.currentTarget.reset();
  };

  const handleMuteUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = (form.get("muteUsername") as string)?.trim();
    const duration = Number(form.get("muteDuration") ?? 0);
    if (!username || Number.isNaN(duration)) return;
    setAlert(feedback.userMuted);
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        type: "mute",
        actor: "Admin",
        target: username,
        duration,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    event.currentTarget.reset();
  };

  const renderLogDescription = useMemo(() => {
    return (entry: AuditLogEntry) => {
      const template = admin.logMessages[entry.type];
      return template
        .replace("{{actor}}", entry.actor)
        .replace("{{target}}", entry.target ?? "")
        .replace("{{duration}}", entry.duration?.toString() ?? "-");
    };
  }, [admin.logMessages]);

  return (
    <section className="grid h-full grid-cols-1 gap-6 xl:grid-cols-[0.55fr,0.45fr]">
      <div className="space-y-6">
        <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/25 backdrop-blur-lg">
          <header className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-white">{admin.createTitle}</h2>
              <p className="text-sm text-slate-400">{admin.createDescription}</p>
            </div>
          </header>
          <form onSubmit={handleCreateUser} className="mt-6 grid gap-5 text-sm">
            <label className="space-y-2">
              <span className="font-semibold text-slate-200">{admin.usernameLabel}</span>
              <input
                name="username"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold text-slate-200">{admin.displayNameLabel}</span>
              <input
                name="displayName"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold text-slate-200">{admin.passwordLabel}</span>
              <input
                name="password"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <label className="space-y-2">
              <span className="font-semibold text-slate-200">{admin.roleLabel}</span>
              <select
                name="role"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                defaultValue="member"
              >
                <option value="admin" className="text-slate-900">
                  {admin.roleAdmin}
                </option>
                <option value="member" className="text-slate-900">
                  {admin.roleMember}
                </option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {admin.createButton}
            </button>
          </form>
        </article>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/25 backdrop-blur-lg">
            <header className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-rose-300" />
              <div>
                <h3 className="text-lg font-semibold text-white">{admin.banTitle}</h3>
                <p className="text-xs text-slate-400">{admin.banDescription}</p>
              </div>
            </header>
            <form onSubmit={handleBanUser} className="mt-4 space-y-4 text-sm">
              <input
                name="banUsername"
                placeholder={admin.banPlaceholder}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-rose-500/80 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {admin.banButton}
              </button>
            </form>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/25 backdrop-blur-lg">
            <header className="flex items-center gap-3">
              <VolumeX className="h-5 w-5 text-amber-200" />
              <div>
                <h3 className="text-lg font-semibold text-white">{admin.muteTitle}</h3>
                <p className="text-xs text-slate-400">{admin.muteDescription}</p>
              </div>
            </header>
            <form onSubmit={handleMuteUser} className="mt-4 space-y-4 text-sm">
              <input
                name="muteUsername"
                placeholder={admin.mutePlaceholder}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex items-center gap-3">
                <input
                  name="muteDuration"
                  type="number"
                  min={5}
                  step={5}
                  defaultValue={30}
                  className="w-24 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-xs text-slate-400">{admin.muteDurationLabel}</span>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500/80 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {admin.muteButton}
              </button>
            </form>
          </article>
        </div>

        <article className="rounded-3xl border border-dashed border-white/15 bg-white/[0.05] p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-lg">
          <CloudUpload className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-4 text-lg font-semibold text-white">{admin.uploadTitle}</h3>
          <p className="mt-2 text-sm text-slate-400">{admin.uploadHelper}</p>
          <button
            type="button"
            className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            {admin.uploadButton}
          </button>
        </article>
      </div>

      <aside className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/25 backdrop-blur-lg">
        <header className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-slate-200" />
          <div>
            <h3 className="text-lg font-semibold text-white">{admin.logsTitle}</h3>
            <p className="text-xs text-slate-400">{admin.logsDescription}</p>
          </div>
        </header>
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
              {admin.logsEmpty}
            </p>
          ) : (
            logs.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner shadow-black/20"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider", badgeMap[entry.type].color)}>
                    {badgeMap[entry.type].icon}
                    {admin.logLabels[entry.type]}
                  </span>
                  <span>•</span>
                  <time>{entry.timestamp}</time>
                </div>
                <p className="mt-3 text-base text-white">{renderLogDescription(entry)}</p>
              </article>
            ))
          )}
        </div>
        {alert && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
            {alert}
          </div>
        )}
      </aside>
    </section>
  );
};
