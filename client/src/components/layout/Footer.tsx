import { footerSections } from '../../config/navigation';

// ============================================================================
// Footer Component - Multi-Column Grid Layout
// ============================================================================

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-card">
      <div className="container mx-auto px-8 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Vozila.hr</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Najveća platforma za kupnju i prodaju vozila u Hrvatskoj. 
              Pronađite savršeno vozilo ili prodajte svoje brzo i jednostavno.
            </p>
          </div>

          {/* Dynamic Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Vozila.hr. Sva prava pridržana.
            </p>
            
            <div className="flex gap-6">
              <a
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Uvjeti korištenja
              </a>
              <a
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Privatnost
              </a>
              <a
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Kontakt
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
