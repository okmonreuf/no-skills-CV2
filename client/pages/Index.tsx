import { FormEvent, useState } from "react";
import { ShieldCheck, UserCheck } from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SESSION_QUERY_KEY } from "@/hooks/use-session";

export default function Index() {
  const { messages } = useLocale();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        console.error("Login failed:", errorData);
        setError(messages.loginError);
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean }
        | null;

      if (!payload?.success) {
        setError(messages.loginError);
        return;
      }

      console.log("Login successful, navigating to /app");

      // Invalidate session query cache and navigate
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      navigate("/app");
    } catch (err) {
      console.error("Login error:", err);
      setError(messages.loginNetworkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold tracking-tight text-primary">
              NS
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold tracking-tight">
                {messages.brand}
              </p>
              <p className="text-sm text-slate-400">
                {messages.heroDescription}
              </p>
            </div>
          </div>
          <LanguageSwitch />
        </header>

        <main className="grid flex-1 grid-cols-1 gap-10 py-10 lg:grid-cols-[1.05fr,0.95fr]">
          <section className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-10 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  {messages.heroTitle}
                </h1>
                <p className="text-lg text-slate-300">
                  {messages.heroDescription}
                </p>
              </div>

              <ul className="grid gap-3 text-sm text-slate-200">
                {messages.heroHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.05] p-4 backdrop-blur-sm"
                  >
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <UserCheck className="h-4 w-4" />
              <span>{messages.loginHelper}</span>
            </div>
          </section>

          <section className="flex items-center">
            <form
              onSubmit={handleSubmit}
              className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-10 shadow-2xl shadow-black/30 backdrop-blur"
            >
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold text-white">
                    {messages.loginTitle}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {messages.loginHelper}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="text-sm font-semibold text-slate-200"
                    >
                      {messages.usernameLabel}
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white shadow-inner shadow-black/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/60"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-200"
                    >
                      {messages.passwordLabel}
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white shadow-inner shadow-black/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/60"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/20 disabled:cursor-not-allowed disabled:bg-primary/60"
                >
                  {isSubmitting ? "���" : messages.loginButton}
                </button>
              </div>

            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
