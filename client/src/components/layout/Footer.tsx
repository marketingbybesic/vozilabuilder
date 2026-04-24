import { Link } from 'react-router-dom';
import { footerSections } from '../../config/navigation';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-card mt-auto">
      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Vozila.hr</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Najveća platforma za kupnju i prodaju vozila u Hrvatskoj.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};