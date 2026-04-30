import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, Home, Search } from 'lucide-react';
import { navigationMenu } from '../config/taxonomy';

// Editorial 404 — instead of a dead end, surface category nav + search.
export const NotFound = () => {
  return (
    <div className="min-h-[80vh] bg-background flex items-center">
      <Helmet>
        <title>Stranica nije pronađena | Vozila.hr</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-[1480px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[10px] font-light uppercase tracking-[0.35em] text-primary mb-3">
              404
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light uppercase tracking-tight text-foreground leading-[1.05] mb-5">
              Stranica nije pronađena
            </h1>
            <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-md mb-8">
              Možda je oglas uklonjen, link netočan ili je stranica preimenovana. Probajte ispod.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
              >
                <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
                Početna
              </Link>
              <Link
                to="/pretraga"
                className="inline-flex items-center gap-2 px-5 py-3 border border-foreground text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
              >
                <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
                Sva vozila
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[10px] font-light uppercase tracking-[0.35em] text-muted-foreground mb-5">
              Odi na kategoriju
            </p>
            <ul className="border-t border-border">
              {navigationMenu.map((c, i) => (
                <li key={c.slug} className="border-b border-border">
                  <Link
                    to={`/${c.slug}`}
                    className="group flex items-center justify-between gap-4 py-4 hover:text-primary transition-colors"
                  >
                    <span className="flex items-baseline gap-4 min-w-0">
                      <span className="text-[11px] font-light uppercase tracking-[0.3em] text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-base sm:text-lg font-light uppercase tracking-[0.06em] text-foreground group-hover:text-primary transition-colors truncate">
                        {c.name}
                      </span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
