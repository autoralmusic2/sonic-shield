import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="AutoralMusic" width={40} height={40} loading="lazy" />
            <span className="font-display text-xl font-bold">
              <span className="text-gradient">Autoral</span>Music
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Blindagem autoral em blockchain Bitcoin, rádio pública de músicas inéditas e vitrine
            profissional para gravadoras. Tecnologia jurídica em 181 países.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Navegação</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/fabrica" className="hover:text-foreground">Fábrica de Canções</Link></li>
            <li><Link to="/ranking" className="hover:text-foreground">Hit Parade</Link></li>
            <li><Link to="/busca" className="hover:text-foreground">Busca Inteligente</Link></li>
            <li><Link to="/verificador" className="hover:text-foreground">Verificador de Autenticidade</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Contato</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:contatoautoralmusic1@gmail.com" className="hover:text-foreground">contatoautoralmusic1@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              <a href="https://wa.me/5582999097909" target="_blank" rel="noreferrer" className="hover:text-foreground">(82) 99909-7909</a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-secondary" />
              <a href="https://instagram.com/autoralmusic" target="_blank" rel="noreferrer" className="hover:text-foreground">@autoralmusic</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © 2026 AutoralMusic. Todos os direitos reservados.
      </div>
    </footer>
  );
}