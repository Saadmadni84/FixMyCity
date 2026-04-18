import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Flag, Star, CheckCircle2, Clock, Wrench, AlertCircle, Plus,
  Award, TrendingUp, MapPin, ChevronRight, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

interface Issue {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  status: string;
  ward: string;
  createdAt: string;
  pointsAwarded: number;
}

interface NotificationItem {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Flag }> = {
  submitted:    { label: 'Submitted',    color: 'bg-indigo-100 text-indigo-700', icon: Flag },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700',   icon: Clock },
  assigned:     { label: 'Assigned',     color: 'bg-blue-100 text-blue-700',     icon: Wrench },
  in_progress:  { label: 'In Progress',  color: 'bg-purple-100 text-purple-700', icon: Wrench },
  fixed:        { label: 'Fixed',        color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-700',       icon: AlertCircle },
};

const REWARD_MILESTONES = [
  { reports: 1,  label: 'Welcome Badge',      pts: 50,   icon: '🏅' },
  { reports: 10, label: '₹200 Fee Waiver',    pts: 200,  icon: '🎁' },
  { reports: 25, label: '₹500 Cash',          pts: 500,  icon: '💰' },
  { reports: 50, label: 'Public Hero + ₹1,500', pts: 1500, icon: '🏆' },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const STAGGER = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function CitizenDashboard() {
  const { citizen, logoutCitizen } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizen) { navigate('/citizen-login'); return; }
    apiFetch(`/api/issues?citizenId=${citizen.id}`)
      .then(r => r.json())
      .then(d => setIssues(d.issues || []))
      .catch(() => toast.error('Failed to load issues'))
      .finally(() => setLoading(false));
  }, [citizen, navigate]);

  useEffect(() => {
    if (!citizen) return;
    apiFetch(`/api/notifications?userType=citizen&userId=${citizen.id}`)
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications || []);
        setUnreadCount(Number(d.unread || 0));
      })
      .catch(() => undefined);
  }, [citizen]);

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  if (!citizen) return null;

  const nextMilestone = REWARD_MILESTONES.find(m => m.reports > citizen.verifiedReports) || REWARD_MILESTONES[REWARD_MILESTONES.length - 1];
  const prevMilestone = REWARD_MILESTONES.filter(m => m.reports <= citizen.verifiedReports).pop();
  const progress = prevMilestone
    ? ((citizen.verifiedReports - prevMilestone.reports) / (nextMilestone.reports - prevMilestone.reports)) * 100
    : (citizen.verifiedReports / nextMilestone.reports) * 100;

  const resolvedCount = issues.filter(i => i.status === 'fixed' || i.status === 'resolved').length;
  const activeCount = issues.filter(i => !['fixed', 'resolved', 'rejected'].includes(i.status)).length;

  return (
    <>
      <title>My Dashboard — FixMyCity</title>

      {/* Hero header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            initial="hidden" animate="visible" variants={STAGGER}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <motion.div variants={FADE_UP} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                {citizen.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="text-primary-foreground/60 text-sm">Welcome back</div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {citizen.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-primary-foreground/50">{citizen.uid}</span>
                  <span className="text-primary-foreground/30">·</span>
                  <span className="text-xs text-primary-foreground/50 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{citizen.ward}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={FADE_UP} className="flex gap-2">
              <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold gap-2">
                <Link to="/report"><Plus className="w-4 h-4" />Report Issue</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent gap-2"
                onClick={() => { logoutCitizen(); navigate('/'); }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats row */}
        <motion.div
          initial="hidden" animate="visible" variants={STAGGER}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Reports',    value: citizen.reportsCount,    icon: Flag,         color: 'text-primary',  bg: 'bg-primary/10' },
            { label: 'Issues Resolved',  value: resolvedCount,           icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Reward Points',    value: citizen.points,          icon: Star,         color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Badges Earned',    value: citizen.badges.length,   icon: Award,        color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <motion.div key={s.label} variants={FADE_UP}>
              <Card className="border border-border hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress to next reward */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border border-border h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Progress to Next Reward
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{citizen.verifiedReports} verified reports</span>
                  <span className="font-semibold text-primary">{nextMilestone.icon} {nextMilestone.label}</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2.5 mb-5" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REWARD_MILESTONES.map(m => (
                    <div
                      key={m.reports}
                      className={`text-center p-3 rounded-xl text-xs border transition-all ${
                        citizen.verifiedReports >= m.reports
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-muted text-muted-foreground border-transparent'
                      }`}
                    >
                      <div className="text-lg mb-1">{m.icon}</div>
                      <div className="font-bold">{m.reports} reports</div>
                      <div className="leading-tight mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          >
            <Card className="border border-border h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  My Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {citizen.badges.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">🏅</div>
                    <p className="text-sm text-muted-foreground">No badges yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Start reporting to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {citizen.badges.map(b => (
                      <Badge key={b} className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                        {b}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Active issues summary */}
                {activeCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-muted-foreground">{activeCount} issue{activeCount !== 1 ? 's' : ''} in progress</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mb-8">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Notifications
                {unreadCount > 0 && <Badge className="bg-red-100 text-red-700">{unreadCount} new</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 6).map(n => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${n.isRead ? 'border-border bg-background' : 'border-primary/30 bg-primary/5'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm">{n.title}</div>
                        <span className="font-mono text-xs text-muted-foreground">{n.ticketId}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* My Reports */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                My Reports
                {issues.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{issues.length}</Badge>
                )}
              </CardTitle>
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link to="/report"><Plus className="w-3.5 h-3.5" />New Report</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Flag className="w-8 h-8 text-primary/30" />
                  </div>
                  <h3 className="font-semibold mb-2">No reports yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Be the first to report an issue in your ward!</p>
                  <Button asChild className="gap-2">
                    <Link to="/report"><Plus className="w-4 h-4" />Report Your First Issue</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {issues.map(issue => {
                    const sc = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
                    const Icon = sc.icon;
                    return (
                      <Link
                        key={issue.id}
                        to={`/track?id=${issue.ticketId}`}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/20 transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-mono text-xs text-muted-foreground">{issue.ticketId}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                            </div>
                            <div className="font-medium text-sm truncate text-foreground">{issue.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {issue.ward} · {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            +{issue.pointsAwarded} pts
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
