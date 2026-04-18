import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import {
  Zap, Building2, Trees, Droplets, Trash2, Droplet, HelpCircle,
  CheckCircle2, Clock, ArrowRight, Shield, Users,
  Camera, MapPin, Bell, Award, ChevronRight, Star, TrendingUp,
  Flag, Map, Search, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ChatWidget from '@/components/ChatWidget';

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: Flag,        label: 'Issues Reported',  value: 12450, suffix: '+', color: 'text-accent' },
  { icon: CheckCircle2,label: 'Issues Resolved',  value: 8200,  suffix: '+', color: 'text-green-400' },
  { icon: MapPin,      label: 'Active Wards',     value: 45,    suffix: '',  color: 'text-blue-300' },
  { icon: Clock,       label: 'Avg. Resolution',  value: 3,     suffix: ' days', color: 'text-yellow-300' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: MapPin,
    title: 'Select Your Ward',
    desc: 'Choose your area or let GPS auto-detect your location on the map.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    step: '02',
    icon: Camera,
    title: 'Report the Issue',
    desc: 'Describe the problem, attach photos, and pin the exact location.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    step: '03',
    icon: Bell,
    title: 'Authorities Notified',
    desc: 'The right department receives your report instantly with all details.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Issue Gets Fixed',
    desc: 'Track progress in real-time and get notified when it\'s resolved.',
    color: 'bg-green-50 text-green-600',
  },
];

const CATEGORIES = [
  { icon: Building2, label: 'Roads & Potholes',  color: 'bg-red-50 text-red-600 border-red-100',      count: 3240 },
  { icon: Zap,       label: 'Streetlights',       color: 'bg-yellow-50 text-yellow-600 border-yellow-100', count: 1820 },
  { icon: Droplets,  label: 'Drainage',           color: 'bg-blue-50 text-blue-600 border-blue-100',    count: 2100 },
  { icon: Trash2,    label: 'Garbage',            color: 'bg-green-50 text-green-600 border-green-100', count: 1650 },
  { icon: Droplet,   label: 'Water Supply',       color: 'bg-cyan-50 text-cyan-600 border-cyan-100',    count: 980 },
  { icon: Trees,     label: 'Parks & Gardens',    color: 'bg-emerald-50 text-emerald-600 border-emerald-100', count: 540 },
  { icon: Shield,    label: 'Public Safety',      color: 'bg-purple-50 text-purple-600 border-purple-100', count: 720 },
  { icon: HelpCircle,label: 'Other Issues',       color: 'bg-gray-50 text-gray-600 border-gray-100',   count: 400 },
];

const RECENT_ISSUES = [
  { id: 'FMC-2026-00142', title: 'Broken streetlight near bus stop', category: 'Streetlights', ward: 'Ward 12', status: 'assigned',     icon: Zap,       time: '2 hours ago',  upvotes: 24 },
  { id: 'FMC-2026-00138', title: 'Blocked drain causing waterlogging', category: 'Drainage',  ward: 'Ward 7',  status: 'fixed',        icon: Droplets,  time: '5 hours ago',  upvotes: 41 },
  { id: 'FMC-2026-00155', title: 'Large pothole on Station Road',     category: 'Roads',      ward: 'Ward 12', status: 'under_review', icon: Building2, time: '1 day ago',    upvotes: 67 },
  { id: 'FMC-2026-00129', title: 'Garbage overflow near market',      category: 'Garbage',    ward: 'Ward 3',  status: 'in_progress',  icon: Trash2,    time: '1 day ago',    upvotes: 33 },
  { id: 'FMC-2026-00118', title: 'Water pipe leaking on MG Road',     category: 'Water',      ward: 'Ward 9',  status: 'submitted',    icon: Droplet,   time: '2 days ago',   upvotes: 18 },
  { id: 'FMC-2026-00101', title: 'Park benches damaged in Sector 4',  category: 'Parks',      ward: 'Ward 5',  status: 'fixed',        icon: Trees,     time: '3 days ago',   upvotes: 12 },
];

const TESTIMONIALS = [
  { name: 'Shivanshi Upadhyay', ward: 'Ward 12, Karol Bagh', quote: 'I reported a broken streetlight and it was fixed within 3 days. FixMyCity actually works!', rating: 5 },
  { name: 'Tanu', ward: 'Ward 7, Lajpat Nagar', quote: 'The pothole outside my building was there for months. After reporting here, it was patched in a week.', rating: 5 },
  { name: 'Meher',  ward: 'Ward 3, Connaught Place', quote: 'Love the tracking feature. I could see exactly what was happening with my garbage complaint.', rating: 4 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  submitted:    { label: 'Submitted',    color: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500' },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  assigned:     { label: 'Assigned',     color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  in_progress:  { label: 'In Progress',  color: 'bg-purple-100 text-purple-700',  dot: 'bg-purple-500' },
  fixed:        { label: 'Fixed',        color: 'bg-green-100 text-green-700',    dot: 'bg-green-500' },
};

const IMPACT_STATS = [
  { label: 'Resolution Rate',    value: 78,   suffix: '%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Citizen Reports',    value: 12450, suffix: '+', icon: Users,     color: 'text-blue-600',  bg: 'bg-blue-50' },
  { label: 'Active Officers',    value: 120,  suffix: '+', icon: Shield,    color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Wards Covered',      value: 45,   suffix: '',  icon: MapPin,    color: 'text-orange-600', bg: 'bg-orange-50' },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const [trackId, setTrackId] = useState('');

  return (
    <>
      <title>FixMyCity — Report. Track. Resolve. Fix Your City.</title>
      <meta name="description" content="Report civic issues in your ward, track resolution progress, and help make your city better. Join 12,000+ citizens already using FixMyCity." />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image + dark blue overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(10, 25, 47, 0.8) 0%, rgba(10, 25, 47, 0.72) 44%, rgba(10, 25, 47, 0.56) 72%, rgba(10, 25, 47, 0.42) 100%), url('/assets/city-hero.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-[#0a192f]/8" />

        <div className="relative max-w-7xl mx-auto w-full px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="text-white max-w-2xl"
          >
            <motion.div variants={FADE_UP}>
              <Badge className="bg-accent/20 text-accent border-accent/30 mb-5 text-sm px-3 py-1">
                🏙️ Nagar Nigam Digital Services
              </Badge>
            </motion.div>

            <motion.h1
              variants={FADE_UP}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Report.{' '}
              <span className="text-accent">Track.</span>{' '}
              Resolve.
              <br />
              <span className="text-white/90">Fix Your City.</span>
            </motion.h1>

            <motion.p variants={FADE_UP} className="text-white/75 text-lg leading-relaxed mb-8 max-w-lg">
              Spotted a pothole, broken streetlight, or overflowing drain? Report it in 2 minutes. 
              Track progress. Get it fixed. Your city needs your voice.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-wrap gap-3 mb-10">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-bold px-8 shadow-xl shadow-accent/30 gap-2"
              >
                <Link to="/report">
                  <Flag className="w-5 h-5" /> Report an Issue
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm font-semibold gap-2"
              >
                <Link to="/map">
                  <Map className="w-5 h-5" /> View Live Map
                </Link>
              </Button>
            </motion.div>

            {/* Quick track bar */}
            <motion.div variants={FADE_UP} className="flex gap-2 max-w-md">
              <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-white/50 shrink-0" />
                <input
                  value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                  placeholder="Enter Ticket ID (FMC-2026-XXXXX)"
                  className="bg-transparent text-white placeholder:text-white/40 text-sm flex-1 outline-none"
                />
              </div>
              <Button
                asChild
                className="bg-white text-primary hover:bg-white/90 font-semibold px-4 rounded-xl"
              >
                <Link to={`/track${trackId ? `?id=${trackId}` : ''}`}>Track</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: floating stats cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' as const }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {STATS.map(({ icon: Icon, label, value, suffix, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: 'easeOut' as const }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white"
              >
                <Icon className={`w-6 h-6 mb-3 ${color}`} />
                <div className={`text-3xl font-bold mb-1 ${color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div className="text-white/60 text-sm">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <div className="w-px h-8 bg-white/20" />
          <div className="text-xs">Scroll</div>
        </motion.div>
      </section>

      {/* ── MOBILE STATS ─────────────────────────────────────────────────── */}
      <section className="lg:hidden bg-primary py-6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-3">
          {STATS.map(({ icon: Icon, label, value, suffix, color }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-white">
              <Icon className={`w-5 h-5 mb-2 ${color}`} />
              <div className={`text-2xl font-bold ${color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <div className="text-white/60 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-14"
          >
            <motion.div variants={FADE_UP}>
              <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/5 mb-3">
                Simple Process
              </Badge>
            </motion.div>
            <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              How FixMyCity Works
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-muted-foreground text-lg max-w-xl mx-auto">
              From spotting an issue to seeing it resolved — it takes just 4 simple steps.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div key={step} variants={FADE_UP}>
                <Card className="border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-block mb-5">
                      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mx-auto`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ISSUE CATEGORIES ─────────────────────────────────────────────── */}
      <section id="issue-types" className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-12"
          >
            <motion.div variants={FADE_UP}>
              <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5 mb-3">
                Issue Categories
              </Badge>
            </motion.div>
            <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              What Can You Report?
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-muted-foreground text-lg max-w-xl mx-auto">
              From potholes to broken pipes — every civic issue deserves attention.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {CATEGORIES.map(({ icon: Icon, label, color, count }) => (
              <motion.div key={label} variants={FADE_UP}>
                <Link to="/report">
                  <Card className={`border hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${color.split(' ')[0]}`}>
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{count.toLocaleString('en-IN')} reports</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="text-center mt-8"
          >
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold gap-2 shadow-lg">
              <Link to="/report">
                <Flag className="w-5 h-5" /> Report an Issue Now
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── RECENT ISSUES FEED ───────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <motion.div variants={FADE_UP}>
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 mb-3">
                  Live Feed
                </Badge>
              </motion.div>
              <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Recent Issues
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-muted-foreground mt-2">
                Latest civic issues reported by citizens across all wards.
              </motion.p>
            </div>
            <motion.div variants={FADE_UP}>
              <Button asChild variant="outline" className="gap-2 shrink-0">
                <Link to="/map">View All on Map <Map className="w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {RECENT_ISSUES.map((issue) => {
              const Icon = issue.icon;
              const st = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
              return (
                <motion.div key={issue.id} variants={FADE_UP}>
                  <Link to={`/track?id=${issue.id}`}>
                    <Card className="border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 leading-snug">
                          {issue.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{issue.ward}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{issue.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            ▲ {issue.upvotes} support
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-14"
          >
            <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Real Impact. Real Numbers.
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-white/60 text-lg max-w-xl mx-auto">
              Together, citizens and authorities are transforming cities one issue at a time.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {IMPACT_STATS.map(({ label, value, suffix, icon: Icon, color, bg }) => (
              <motion.div key={label} variants={FADE_UP}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <div className="text-white/60 text-sm">{label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-12"
          >
            <motion.div variants={FADE_UP}>
              <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/5 mb-3">
                Citizen Voices
              </Badge>
            </motion.div>
            <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              What Citizens Are Saying
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map(({ name, ward, quote, rating }) => (
              <motion.div key={name} variants={FADE_UP}>
                <Card className="border border-border hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/20 mb-4" />
                    <p className="text-foreground/80 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{name}</div>
                        <div className="text-xs text-muted-foreground">{ward}</div>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── REWARDS SECTION ──────────────────────────────────────────────── */}
      <section id="rewards" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
              <motion.div variants={FADE_UP}>
                <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5 mb-3">
                  Rewards Program
                </Badge>
              </motion.div>
              <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Earn Points for Every Report
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Active citizens earn points, unlock badges, and get recognized for making their city better. Every report counts.
              </motion.p>
              <motion.div variants={STAGGER} className="flex flex-col gap-4">
                {[
                  { icon: Flag,    label: 'Report an Issue',        pts: '+10 pts', color: 'bg-blue-50 text-blue-600' },
                  { icon: Camera,  label: 'Add Photos to Report',   pts: '+20 pts', color: 'bg-orange-50 text-orange-600' },
                  { icon: CheckCircle2, label: 'Issue Gets Resolved', pts: 'Bonus pts', color: 'bg-green-50 text-green-600' },
                  { icon: Award,   label: 'Earn Badges & Milestones', pts: 'Rewards', color: 'bg-purple-50 text-purple-600' },
                ].map(({ icon: Icon, label, pts, color }) => (
                  <motion.div key={label} variants={FADE_UP} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-foreground font-medium flex-1">{label}</span>
                    <span className="text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">{pts}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={FADE_UP} className="mt-8">
                <Button asChild size="lg" className="gap-2 font-bold">
                  <Link to="/citizen-login">
                    Join & Start Earning <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Badge showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: '🏅', label: 'Welcome Badge',       sub: 'On registration',     color: 'from-blue-50 to-blue-100 border-blue-200' },
                { icon: '📋', label: 'Active Reporter',     sub: '5+ reports',          color: 'from-orange-50 to-orange-100 border-orange-200' },
                { icon: '🏆', label: 'Community Champion',  sub: '10+ reports',         color: 'from-purple-50 to-purple-100 border-purple-200' },
                { icon: '⭐', label: 'Point Collector',     sub: '100+ points',         color: 'from-amber-50 to-amber-100 border-amber-200' },
              ].map(({ icon, label, sub, color }) => (
                <Card key={label} className={`border bg-gradient-to-br ${color} hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                  <CardContent className="p-5 text-center">
                    <div className="text-4xl mb-3">{icon}</div>
                    <div className="font-bold text-sm text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{sub}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DUAL PORTAL CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-10"
          >
            <motion.h2 variants={FADE_UP} className="text-4xl font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Choose Your Portal
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-muted-foreground text-lg">
              Whether you're a citizen or a ward officer, FixMyCity has a portal for you.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {/* Citizen */}
            <motion.div variants={FADE_UP}>
              <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className="h-2 bg-primary" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Citizen Portal
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Report issues, track progress, earn rewards, and make your ward better.
                  </p>
                  <Button asChild className="w-full font-bold gap-2">
                    <Link to="/citizen-login">
                      Enter Citizen Portal <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Officer */}
            <motion.div variants={FADE_UP}>
              <Card className="border-2 border-secondary/20 hover:border-secondary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className="h-2 bg-secondary" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                    <Shield className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Officer Portal
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Manage ward issues, update statuses, coordinate field teams, and resolve complaints.
                  </p>
                  <Button asChild variant="outline" className="w-full font-bold gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white">
                    <Link to="/officer-login">
                      Officer Login <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <ChatWidget />
    </>
  );
}
