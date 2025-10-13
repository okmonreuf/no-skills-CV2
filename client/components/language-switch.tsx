import { availableLocales, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitchProps {
  className?: string;
  condensed?: boolean;
}

export const LanguageSwitch = ({ className, condensed = false }: LanguageSwitchProps) => {
  const { locale, setLocale, messages } = useLocale();

  return (
    <div className={cn("flex items-center gap-3", condensed && "gap-2", className)}>
      {!condensed && (
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
          {messages.languageToggle.label}
        </span>
      )}
      <div className="flex overflow-hidden rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur">
        {availableLocales.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold transition",
              value === locale
                ? "bg-primary text-primary-foreground shadow"
                : "text-slate-300 hover:bg-white/10",
            )}
          >
            {messages.languageToggle[value]}
          </button>
        ))}
      </div>
    </div>
  );
};
