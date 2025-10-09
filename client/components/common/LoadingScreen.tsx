import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  label?: string;
  className?: string;
}

export function LoadingScreen({ label = "Chargement...", className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground",
        className,
      )}
    >
      <span className="relative flex h-12 w-12">
        <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <span className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
      </span>
      <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground/80">
        {label}
      </p>
    </div>
  );
}
