import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, ShieldCheck, Users, MessagesSquare, Lock } from "lucide-react";

const features = [
  {
    title: "Contrôle absolu",
    description: "Création de comptes uniquement par les administrateurs.",
    icon: ShieldCheck,
  },
  {
    title: "Modération avancée",
    description: "Ban, mute, suppression et journal d'audit centralisé.",
    icon: ShieldAlert,
  },
  {
    title: "Chats publics & privés",
    description: "Salons généraux et conversations directes en temps réel.",
    icon: MessagesSquare,
  },
  {
    title: "Profils gérés par l'admin",
    description: "Identité visuelle maîtrisée : photos et pseudos officiels.",
    icon: Users,
  },
];

export default function LoginPage() {
  const { user, login, authenticating, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("yupi");
  const [password, setPassword] = useState("1616Dh!dofly");
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    if (location.state && typeof (location.state as Record<string, unknown>).from === "string") {
      return (location.state as { from: string }).from;
    }
    return "/app/general";
  }, [location.state]);

  useEffect(() => {
    if (!initializing && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [initializing, navigate, redirectTo, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("Connexion impossible");
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(213_94%_60%/_0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_hsl(216_40%_32%/_0.35),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
        <section className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.45em] text-primary/80 shadow-glow">
            <span>NO-SKILLS</span>
            <span className="text-white/70">MESSAGERIE</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              La messagerie des communautés exigeantes.
            </h1>
            <p className="max-w-xl text-lg text-slate-200/80">
              No-Skills Messagerie offre une plateforme de conversation minimaliste,
              sécurisée et entièrement modérée par vos soins. Aucun compte public, aucun hasard : chaque membre est validé.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="group flex gap-4 rounded-3xl border border-white/5 bg-white/5/80 p-4 shadow-inner-card backdrop-blur transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-1 text-sm text-slate-200/70">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-slate-200/80 shadow-inner-card">
            <p className="font-semibold text-primary/90">
              Compte administrateur initial
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-200/70">
              Identifiant :
              <span className="ml-2 text-white">yupi</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-200/70">
              Mot de passe :
              <span className="ml-2 text-white">1616Dh!dofly</span>
            </p>
            <p className="mt-3 text-xs text-primary/80">
              Changez immédiatement ces identifiants après la première connexion depuis le panel administrateur.
            </p>
          </div>
        </section>

        <section className="flex-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/15 via-white/10 to-transparent p-[1px] shadow-glow">
            <div className="relative h-full w-full rounded-[26px] bg-slate-950/80 p-8 backdrop-blur-xl">
              <div className="absolute -top-20 right-12 h-40 w-40 rounded-full bg-primary/40 blur-3xl" aria-hidden />
              <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-blue-500/30 blur-3xl" aria-hidden />
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Lock className="size-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Connexion sécurisée</h2>
                    <p className="text-sm text-slate-200/70">
                      Accès réservé aux membres créés par les administrateurs.
                    </p>
                  </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
                      Nom d'utilisateur
                    </label>
                    <Input
                      id="username"
                      name="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Votre identifiant"
                      className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-primary"
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-300/80">
                      Mot de passe
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground shadow-glow transition hover:bg-primary/90"
                    disabled={authenticating}
                  >
                    {authenticating ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
