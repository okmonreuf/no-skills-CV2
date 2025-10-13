import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LogOut, Shield, SignalHigh } from "lucide-react";

interface WorkspaceHeaderProps {
  className?: string;
  onSignOut?: () => void;
  onlineCount: number;
}

export const WorkspaceHeader = ({
  className,
  onSignOut,
  onlineCount,
}: WorkspaceHeaderProps) => {
  const { messages } = useLocale();

  return (
    <header
      className={cn(
        "flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-xl shadow-black/25 backdrop-blur-lg lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold tracking-tight text-primary">
          NS
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-sky-200">
            <Shield className="h-4 w-4" />
            <span className="uppercase tracking-[0.4em] text-xs text-slate-300">
              {messages.workspace.header.environmentLabel}
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white">
            {messages.workspace.header.title}
          </h1>
          <p className="text-sm text-slate-400">
            {messages.workspace.header.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-inner shadow-black/30 md:flex-row md:items-center md:gap-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
          <SignalHigh className="h-4 w-4 text-primary" />
          <span>{messages.workspace.header.sessionLabel}</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
          <span className="text-sm font-semibold tracking-tight">
            {messages.workspace.header.onlineLabel}
          </span>
          <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm font-bold shadow">
            {onlineCount}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LanguageSwitch condensed className="text-white" />
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            {messages.workspace.header.signOut}
          </button>
        </div>
        <span className="text-xs text-slate-500">
          {messages.workspace.header.deployInfo}
        </span>
      </div>
    </header>
  );
};
