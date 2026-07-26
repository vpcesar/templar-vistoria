import { Link } from "@tanstack/react-router";
import { EMPRESA } from "@/lib/company";
import { Settings } from "lucide-react";

export function AppHeader({ showSettings = true }: { showSettings?: boolean }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src={EMPRESA.logo} alt={EMPRESA.nome} className="h-9 w-auto max-w-[180px] shrink-0 object-contain" />
          <div className="min-w-0 hidden sm:block">
            <div className="text-[10px] text-muted-foreground truncate">{EMPRESA.tagline}</div>
          </div>
        </Link>
        {showSettings && (
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </Link>
        )}
      </div>
    </header>
  );
}
