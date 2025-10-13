import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  AlertOctagon,
  Blocks,
  ClipboardList,
  MessagesSquare,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

export type WorkspaceSection = "general" | "private" | "admin" | "banned" | "events";

const iconMap: Record<WorkspaceSection, ReactNode> = {
  general: <MessagesSquare className="h-5 w-5" />,
  private: <UsersRound className="h-5 w-5" />,
  admin: <ShieldCheck className="h-5 w-5" />,
  banned: <AlertOctagon className="h-5 w-5" />,
  events: <Blocks className="h-5 w-5" />,
};

interface WorkspaceNavigationProps {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  className?: string;
}

export const WorkspaceNavigation = ({
  activeSection,
  onSectionChange,
  className,
}: WorkspaceNavigationProps) => {
  const {
    messages: {
      workspace: { navigation, navigationDescriptions },
    },
  } = useLocale();

  const sections: WorkspaceSection[] = [
    "general",
    "private",
    "admin",
    "banned",
    "events",
  ];

  return (
    <nav
      className={cn(
        "space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/25 backdrop-blur-lg",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
        Console
      </p>
      <ul className="space-y-2">
        {sections.map((section) => {
          const isActive = section === activeSection;
          return (
            <li key={section}>
              <button
                type="button"
                onClick={() => onSectionChange(section)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                  isActive
                    ? "border-primary/30 bg-primary/15 text-white shadow-lg shadow-primary/30"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/20 hover:bg-primary/10 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
                    isActive ? "bg-primary text-primary-foreground" : "bg-white/10 text-white" )}>
                    {iconMap[section]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">
                      {navigation[section]}
                    </p>
                    <p className="text-xs text-slate-400">
                      {navigationDescriptions[section]}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
