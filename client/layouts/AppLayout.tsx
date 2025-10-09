import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Ban, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";

interface NavItem {
  key: string;
  label: string;
  description: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        key: "general",
        label: "Chat général",
        description: "Salon public de la communauté",
        to: "/app/general",
        icon: MessageSquare,
      },
      {
        key: "messages",
        label: "Messages privés",
        description: "Conversations directes",
        to: "/app/messages",
        icon: Users,
      },
      {
        key: "admin",
        label: "Panel admin",
        description: "Gestion des comptes",
        to: "/app/admin",
        icon: ShieldCheck,
        adminOnly: true,
      },
      {
        key: "banned",
        label: "Utilisateurs bannis",
        description: "Liste de modération",
        to: "/app/banned",
        icon: Ban,
        adminOnly: true,
      },
    ],
    [],
  );

  const filteredNavItems = useMemo(
    () => navItems.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin, navItems],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  const fallbackInitials = useMemo(() => {
    if (!user) {
      return "NS";
    }
    const [first, second] = user.displayName.split(" ");
    if (first && second) {
      return `${first[0]}${second[0]}`.toUpperCase();
    }
    return user.displayName.substring(0, 2).toUpperCase();
  }, [user]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/98 to-slate-900">
      <div className="absolute inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,_hsl(213_94%_62%/_0.25),_transparent_65%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-4 py-6 lg:grid lg:grid-cols-[280px,1fr] lg:px-10">
        <aside className="hidden h-full min-h-[calc(100vh-3rem)] flex-col justify-between rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner-card backdrop-blur-lg lg:flex">
          <div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-glow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <span className="text-lg font-bold">NS</span>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary/80">No-Skills</p>
                <p className="text-base font-semibold text-white">Messagerie</p>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 transition-all", 
                      "hover:border-primary/40 hover:bg-primary/10", 
                      isActive ? "border-primary/60 bg-primary/15 text-white shadow-glow" : "text-slate-200/80",
                    )
                  }
                >
                  <item.icon className="size-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-300/70">{item.description}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-white/10">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                ) : (
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {fallbackInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user?.displayName}</span>
                <span className="text-xs text-slate-300/70">@{user?.username}</span>
                {isAdmin && (
                  <div className="mt-2 max-w-fit">
                    <Badge variant="secondary" className="border border-primary/20 bg-primary/15 text-primary">
                      Administrateur
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                void handleLogout();
              }}
              className="mt-4 w-full border-white/10 bg-transparent text-slate-200 hover:border-primary/50 hover:bg-primary/10 hover:text-white"
            >
              Se déconnecter
            </Button>
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-glow backdrop-blur-xl">
          <header className="flex flex-col gap-4 border-b border-white/5 bg-gradient-to-br from-white/10 to-transparent px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                {"Bienvenue dans No-Skills Messagerie"}
              </h1>
              <p className="text-sm text-slate-300/80">
                La plateforme de chat sécurisée et maîtrisée pour votre communauté.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs text-slate-200/80 shadow-inner-card sm:w-auto sm:text-sm">
              <span className="hidden font-medium uppercase tracking-widest text-primary/70 sm:block">
                Naviguer
              </span>
              <div className="flex flex-1 gap-1 sm:gap-2">
                {filteredNavItems.map((item) => (
                  <NavLink
                    key={`compact-${item.key}`}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition", 
                        "hover:bg-primary/10 hover:text-white",
                        isActive ? "bg-primary/20 text-white" : "text-slate-200/70",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
