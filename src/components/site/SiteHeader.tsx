import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/fabrica", label: "Fábrica de Canções" },
  { to: "/ranking", label: "Hit Parade" },
  { to: "/busca", label: "Busca" },
  { to: "/verificador", label: "Verificador" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AutoralMusic" width={36} height={36} className="drop-shadow-[0_0_10px_oklch(0.72_0.22_250/0.7)]" />
          <span className="font-display text-lg font-bold tracking-wide">
            <span className="text-gradient">Autoral</span>
            <span className="text-foreground">Music</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground bg-muted/60" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted/40" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/entrar" className="btn-ghost-neon !py-2 !px-4 text-sm">
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
          <Link to="/cadastro" className="btn-neon !py-2 !px-4 text-sm">
            <UserPlus className="h-4 w-4" /> Criar Conta
          </Link>
        </div>

        <button
          className="rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link to="/entrar" onClick={() => setOpen(false)} className="btn-ghost-neon flex-1 !py-2 text-sm">Entrar</Link>
              <Link to="/cadastro" onClick={() => setOpen(false)} className="btn-neon flex-1 !py-2 text-sm">Criar Conta</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}