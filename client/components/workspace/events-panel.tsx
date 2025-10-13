import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  CheckCheck,
  Clock3,
  ListPlus,
  Network,
  PlayCircle,
  StopCircle,
  Users,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

interface Participant {
  id: string;
  name: string;
}

const seedParticipants: Participant[] = [
  { id: "p1", name: "Élodie" },
  { id: "p2", name: "Carlos" },
  { id: "p3", name: "Mei" },
  { id: "p4", name: "Jonas" },
];

const computeRounds = (participants: Participant[]) => {
  const rounds: { index: number; pairs: [Participant, Participant][] }[] = [];
  if (participants.length < 2) return rounds;

  const list = [...participants];
  const anchor = list[0];
  const others = list.slice(1);
  const totalRounds = participants.length - 1;
  for (let round = 0; round < totalRounds; round += 1) {
    const pairs: [Participant, Participant][] = [];
    const rotated = [anchor, ...others.slice(round), ...others.slice(0, round)];
    const half = Math.floor(rotated.length / 2);
    for (let i = 0; i < half; i += 1) {
      const a = rotated[i];
      const b = rotated[rotated.length - 1 - i];
      if (a && b && a.id !== b.id) {
        pairs.push([a, b]);
      }
    }
    rounds.push({ index: round + 1, pairs });
  }
  return rounds;
};

export const EventsPanel = () => {
  const {
    messages: {
      workspace: { events },
    },
  } = useLocale();
  const [themes, setThemes] = useState<string[]>(["Sécurité des communautés", "Idées de contenu"]);
  const [themeInput, setThemeInput] = useState("");
  const [duration, setDuration] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [participants] = useState(seedParticipants);

  const rounds = useMemo(() => computeRounds(participants), [participants]);

  const handleAddTheme = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = themeInput.trim();
    if (!normalized) return;
    setThemes((prev) => {
      if (prev.includes(normalized)) return prev;
      return [...prev, normalized];
    });
    setThemeInput("");
  };

  const toggleEvent = () => {
    setIsRunning((prev) => !prev);
  };

  return (
    <section className="grid h-full grid-cols-1 gap-6 2xl:grid-cols-[0.55fr,0.45fr]">
      <article className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/25 backdrop-blur-lg">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {events.title}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{events.subtitle}</h2>
          </div>
          <Network className="h-7 w-7 text-primary" />
        </header>

        <form onSubmit={handleAddTheme} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm">
          <label className="space-y-2 text-slate-200">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {events.themePlaceholder}
            </span>
            <input
              value={themeInput}
              onChange={(event) => setThemeInput(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="flex items-center gap-3 text-xs text-slate-400">
            <Clock3 className="h-4 w-4 text-primary" />
            <span>{events.durationLabel}</span>
            <input
              type="number"
              min={5}
              max={30}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="w-20 rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white outline-none focus:border-primary"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <ListPlus className="h-4 w-4" />
              {events.addTheme}
            </button>
            <button
              type="button"
              onClick={toggleEvent}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5",
                isRunning
                  ? "bg-rose-500/80 shadow-rose-500/30"
                  : "bg-primary shadow-primary/30",
              )}
            >
              {isRunning ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  {events.stopButton}
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  {events.startButton}
                </>
              )}
            </button>
          </div>
          {isRunning ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
              {events.activeDescription}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
              {events.scheduleEmpty}
            </div>
          )}
        </form>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            <header className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              <Users className="h-4 w-4 text-primary" />
              <span>{events.participantsTitle}</span>
            </header>
            <ul className="mt-4 space-y-3">
              {participants.length === 0 ? (
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-slate-400">
                  {events.participantsEmpty}
                </li>
              ) : (
                participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300"
                  >
                    <span className="text-sm text-white">{participant.name}</span>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {events.roundLabel}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            <header className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              <CheckCheck className="h-4 w-4 text-primary" />
              <span>{events.themesTitle}</span>
            </header>
            <ul className="mt-4 space-y-3">
              {themes.length === 0 ? (
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-slate-400">
                  {events.noThemes}
                </li>
              ) : (
                themes.map((theme) => (
                  <li
                    key={theme}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {theme}
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </article>

      <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/25 backdrop-blur-lg">
        <header className="flex items-center gap-3">
          <Clock3 className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-white">{events.scheduleTitle}</h3>
            <p className="text-xs text-slate-400">{events.activeTitle}</p>
          </div>
        </header>
        <div className="mt-6 space-y-4 overflow-y-auto">
          {rounds.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
              {events.scheduleEmpty}
            </p>
          ) : (
            rounds.map((round) => (
              <article
                key={round.index}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-inner shadow-black/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {events.roundLabel} {round.index}
                  </span>
                  <span className="text-xs text-slate-500">{duration} {events.durationUnit}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {round.pairs.map(([a, b]) => (
                    <li
                      key={`${round.index}-${a.id}-${b.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200"
                    >
                      <span className="font-semibold text-white">{a.name}</span>
                      <span className="text-slate-500">{events.pairConnector}</span>
                      <span className="font-semibold text-white">{b.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      </aside>
    </section>
  );
};
