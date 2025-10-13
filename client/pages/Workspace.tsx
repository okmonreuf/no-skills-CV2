import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { WorkspaceHeader } from "@/components/workspace/header";
import {
  WorkspaceNavigation,
  type WorkspaceSection,
} from "@/components/workspace/navigation";
import { GeneralPanel } from "@/components/workspace/general-panel";
import { PrivatePanel } from "@/components/workspace/private-panel";
import { AdminPanel } from "@/components/workspace/admin-panel";
import { BannedPanel } from "@/components/workspace/banned-panel";
import { EventsPanel } from "@/components/workspace/events-panel";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const renderPanel = (section: WorkspaceSection) => {
  switch (section) {
    case "general":
      return <GeneralPanel />;
    case "private":
      return <PrivatePanel />;
    case "admin":
      return <AdminPanel />;
    case "banned":
      return <BannedPanel />;
    case "events":
      return <EventsPanel />;
    default:
      return null;
  }
};

const Workspace = () => {
  const {
    messages: {
      workspace: { navigationDescriptions },
    },
  } = useLocale();
  const [section, setSection] = useState<WorkspaceSection>("general");
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <WorkspaceHeader
          onlineCount={18}
          onSignOut={handleSignOut}
          className="shadow-2xl"
        />

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[0.32fr,0.68fr]">
          <WorkspaceNavigation
            activeSection={section}
            onSectionChange={setSection}
          />

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-primary/15 bg-primary/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              {navigationDescriptions[section]}
            </div>
            <div className={cn("flex-1", section === "general" && "min-h-[680px]")}>{renderPanel(section)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
