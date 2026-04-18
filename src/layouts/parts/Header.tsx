import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Flag, User, LogOut, ChevronDown, Map, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import LanguageSelector from '@/components/LanguageSelector';

export default function Header() {
  const { citizen, officer, logoutCitizen, logoutOfficer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-[1000] transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 opacity-80">
            <span>🇮🇳</span>
            <span>Official Nagar Nigam Digital Services Portal</span>
            <span className="opacity-40">|</span>
            <span>Helpline: 1800-XXX-XXXX &nbsp;·&nbsp; Mon–Sat, 9am–6pm</span>
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg leading-none text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  FixMyCity
                </div>
                <div className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
                  Civic Issue Reporting
                </div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/map', label: 'Live Map', icon: <Map className="w-3.5 h-3.5" /> },
                { to: '/track', label: 'Track Issue' },
              ].map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Report CTA */}
              <Button
                asChild
                size="sm"
                className="hidden md:flex bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-sm gap-1.5"
              >
                <Link to="/report">
                  <Flag className="w-3.5 h-3.5" />
                  Report Issue
                </Link>
              </Button>

              {/* Auth state */}
              {citizen ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-sm">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden sm:block font-medium text-foreground max-w-[100px] truncate">
                        {citizen.name.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2 border-b border-border">
                      <div className="font-semibold text-sm">{citizen.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{citizen.uid}</div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/citizen-dashboard" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" /> My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/report" className="cursor-pointer">
                        <Flag className="w-4 h-4 mr-2" /> Report Issue
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { logoutCitizen(); navigate('/'); }}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : officer ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-sm">
                      <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="hidden sm:block font-medium text-foreground max-w-[100px] truncate">
                        {officer.name.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2 border-b border-border">
                      <div className="font-semibold text-sm">{officer.name}</div>
                      <div className="text-xs text-muted-foreground">{officer.department}</div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/officer-dashboard" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" /> Officer Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { logoutOfficer(); navigate('/'); }}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                    <Link to="/citizen-login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="text-sm font-semibold">
                    <Link to="/citizen-login">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-border shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/map', label: 'Live Map' },
              { to: '/track', label: 'Track Issue' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="pt-3 border-t border-border mt-2 flex flex-col gap-2">
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold w-full">
                <Link to="/report"><Flag className="w-4 h-4 mr-2" />Report an Issue</Link>
              </Button>
              {!citizen && !officer && (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/citizen-login">Sign In / Register</Link>
                </Button>
              )}
              <div className="pt-1">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
