import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight } from 'lucide-react';
import { navigationMenu } from '../../config/taxonomy';

// Editorial 4-column footer — sitemap + dealer signup CTA + brand block.
// Bottom spacer so the mobile bottom nav doesn't hide the legal line.

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const cats = navigationMenu.slice(0, 8);

  return (
    <footer className="w-full border-t border-border bg-background text-foreground mt-auto transition-colors duration-500">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 py-14 lg:py-20">
        {/* Top row: Brand block + sitemap columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
          {/* Brand — spans 2 cols on desktop */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2 lg:pr-8">
            <Link to="/" className="inline-flex items-center mb-5">
              <img src="/vozilahrlogo-light.svg" alt="Vozila.hr" className="h-7 w-auto block dark:hidden" />
              <img src="/vozilahrlogo-dark.svg" alt="Vozila.hr" className="h-7 w-auto hidden dark:block" />
            </Link>
            <p className="text-xs font-light text-muted-foreground leading-relaxed max-w-xs">
              Premium tržište vozila u Hrvatskoj. Kupujte i prodajte uz Match Score, verificirane prodavače i sigurnu komunikaciju.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="https://instagram.com/vozila.hr" target="_blank" rel="noopener noreferrer"
                 className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors">
                Instagram
              </a>
              <a href="https://facebook.com/vozila.hr" target="_blank" rel="noopener noreferrer"
                 className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors">
                Facebook
              </a>
              <a href="mailto:hello@vozila.hr"
                 className="inline-flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
                hello@vozila.hr
              </a>
            </div>
          </div>

          <FooterColumn title="Kategorije">
            {cats.map((c) => (
              <FooterLink key={c.slug} to={`/${c.slug}`}>{c.name}</FooterLink>
            ))}
            <FooterLink to="/pretraga">Sva vozila</FooterLink>
          </FooterColumn>

          <FooterColumn title="Za kupce">
            <FooterLink to="/favoriti">Favoriti</FooterLink>
            <FooterLink to="/pretraga">Napredna pretraga</FooterLink>
            <FooterLink to="/saloni">Aktivni saloni</FooterLink>
            <FooterLink to="/o-nama">O nama</FooterLink>
            <FooterLink to="/kontakt">Pomoć</FooterLink>
          </FooterColumn>

          <FooterColumn title="Za prodavače">
            <FooterLink to="/predaj-oglas">Objavi oglas</FooterLink>
            <FooterLink to="/za-partnere">Dealer paketi</FooterLink>
            <FooterLink to="/saloni">Pregled salona</FooterLink>
            <FooterLink to="/dashboard">Dashboard</FooterLink>
          </FooterColumn>
        </div>

        {/* Dealer signup CTA strip */}
        <div className="mt-14 lg:mt-16 pt-10 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-light uppercase tracking-[0.35em] text-primary mb-2">
                Za autosalone
              </p>
              <h3 className="text-lg sm:text-xl font-light uppercase tracking-tight text-foreground">
                Postanite verificirani Vozila prodavač
              </h3>
              <p className="mt-2 text-xs font-light text-muted-foreground max-w-md leading-relaxed">
                Veće rangiranje, više leadova, dashboard analitike. Pogledajte pakete za autosalone.
              </p>
            </div>
            <Link
              to="/za-partnere"
              className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[10px] font-light uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
            >
              Saznaj više
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground tabular-nums">
            © {currentYear} Vozila.hr · Sva prava pridržana
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <FooterLink to="/uvjeti-koristenja" inline>Uvjeti korištenja</FooterLink>
            <FooterLink to="/privatnost" inline>Privatnost</FooterLink>
            <FooterLink to="/kontakt" inline>Kontakt</FooterLink>
          </nav>
        </div>
      </div>
      <div className="lg:hidden h-16" aria-hidden="true" />
    </footer>
  );
};

const FooterColumn = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-[10px] font-light uppercase tracking-[0.3em] text-foreground mb-5">
      {title}
    </h4>
    <ul className="space-y-2.5">{children}</ul>
  </div>
);

const FooterLink = ({ to, children, inline = false }: { to: string; children: React.ReactNode; inline?: boolean }) => (
  <li className={inline ? 'inline' : ''}>
    <Link
      to={to}
      className={`group inline-flex items-center text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors ${inline ? '' : 'gap-1'}`}
    >
      {!inline && <span aria-hidden="true" className="block h-px w-2 bg-border group-hover:w-4 group-hover:bg-primary transition-all duration-500" />}
      {children}
    </Link>
  </li>
);
