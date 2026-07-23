import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import defaultLogo from "@/assets/templar-logo.png";
import { getCompany } from "@/lib/storage";
import { Settings } from "lucide-react";

export function AppHeader({ showSettings = true }: { showSettings?: boolean }) {
  const [logo, setLogo] = useState<string>(defaultLogo);
  const [name, setName] = useState<string>("TEMPLAR ENGENHARIA");
  useEffect(() => {
    const c = getCompany();
    if (c.logoBase64) setLogo(c.logoBase64);
    if (c.name) setName(c.name);
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src={logo} alt={name} className="h-10 w-10 shrink-0 object-contain" />
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-wide text-foreground truncate">{name}</div>
            <div className="text-[10px] text-muted-foreground truncate">Vistoria de Imóveis</div>
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
