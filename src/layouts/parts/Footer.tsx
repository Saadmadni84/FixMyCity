import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Twitter, Facebook, Instagram, Youtube, ExternalLink, ArrowRight } from 'lucide-react';

const ISSUE_CATEGORIES = [
  'Road & Potholes', 'Streetlights', 'Drainage', 'Garbage',
  'Water Supply', 'Parks & Gardens', 'Damaged Walls', 'Other',
];

const QUICK_LINKS = [
  { label: 'Report an Issue', to: '/report' },
  { label: 'Track Your Issue', to: '/track' },
  { label: 'Live Issue Map', to: '/map' },
  { label: 'Citizen Login', to: '/citizen-login' },
  { label: 'Officer Portal', to: '/officer-login' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* CTA strip */}
      <div className="border-b border-primary-foreground/10 bg-primary/80">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              See a problem in your ward?
            </h3>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Report it in under 2 minutes. Your city needs your voice.
            </p>
          </div>
          <Link
            to="/report"
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shrink-0"
          >
            Report an Issue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                FixMyCity
              </span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-5">
              Empowering citizens to report, track, and resolve civic issues across every ward. Your voice drives change.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary-foreground/50 mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Issue categories */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary-foreground/50 mb-4">
              Issue Categories
            </h4>
            <ul className="flex flex-col gap-2.5">
              {ISSUE_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    to="/report"
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary-foreground/50 mb-4">
              Contact & Support
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <div>
                  <div className="font-medium text-primary-foreground">Helpline</div>
                  <div>1800-XXX-XXXX (Toll Free)</div>
                  <div className="text-xs mt-0.5">Mon–Sat, 9am–6pm</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <div>
                  <div className="font-medium text-primary-foreground">Email</div>
                  <div>support@fixmycity.gov.in</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <div>
                  <div className="font-medium text-primary-foreground">Office</div>
                  <div>Nagar Nigam Bhavan, Civic Centre</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
          <span>© {new Date().getFullYear()} FixMyCity — Nagar Nigam Digital Services. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Accessibility</a>
            <a href="#" className="hover:text-primary-foreground transition-colors flex items-center gap-1">
              RTI <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
