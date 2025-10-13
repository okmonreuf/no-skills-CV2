import { ArrowLeftCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLocale } from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  const { messages } = useLocale();

  useEffect(() => {
    console.warn("Route non trouvée", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
        <h1 className="text-5xl font-semibold tracking-tight text-white">404</h1>
        <p className="mt-4 text-base text-slate-300">{messages.notFoundTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{messages.notFoundDescription}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/25"
        >
          <ArrowLeftCircle className="h-5 w-5" />
          {messages.continuePlaceholder}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
