import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Shield,
  Flag,
  Clock,
  Wrench,
  CheckCircle2,
  Loader2,
  BarChart3,
  LogOut,
  MapPin,
  User,
  Calendar,
  Filter,
  RefreshCw,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api-url";

interface Issue {
  id: string;
  ticketId: string;
  citizenName: string;
  category: string;
  title: string;
  description: string;
  address: string;
  ward: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pointsAwarded: number;
  statusHistory: {
    status: string;
    note: string;
    timestamp: string;
    updatedBy: string;
  }[];
}

interface NotificationItem {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; textColor: string; bgColor: string; icon: typeof Flag }
> = {
  submitted: {
    label: "Submitted",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-100",
    icon: Flag,
  },
  under_review: {
    label: "Under Review",
    textColor: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: Clock,
  },
  assigned: {
    label: "Assigned",
    textColor: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Wrench,
  },
  in_progress: {
    label: "In Progress",
    textColor: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Wrench,
  },
  fixed: {
    label: "Fixed",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
  },
  resolved: {
    label: "Resolved",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
    icon: AlertCircle,
  },
};

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};
const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function OfficerDashboard() {
  const { officer, logoutOfficer } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!officer) {
      navigate("/officer-login");
      return;
    }
    loadIssues();
    loadNotifications();
  }, [officer, navigate]);

  const loadNotifications = async () => {
    if (!officer) return;
    try {
      const res = await fetch(
        apiUrl(`/api/notifications?userType=officer&userId=${officer.id}`),
      );
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unread || 0));
    } catch {
      /* ignore */
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(apiUrl(`/api/notifications/${id}/read`), { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  const loadIssues = async () => {
    if (!officer) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("department", officer.department);
      if (officer.assignedWards.length > 0) {
        params.set("wards", officer.assignedWards.join(","));
      }

      const res = await fetch(apiUrl(`/api/issues?${params.toString()}`));
      const data = await res.json();
      setIssues(data.issues || []);
    } catch {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedIssue || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(apiUrl(`/api/issues/${selectedIssue.ticketId}/status`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note,
          updatedBy: officer?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Status updated — citizen notified by email");
      setSelectedIssue(null);
      setNote("");
      setNewStatus("");
      loadIssues();
      loadNotifications();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setUpdating(false);
    }
  };

  if (!officer) return null;

  const filtered =
    filterStatus === "all"
      ? issues
      : issues.filter((i) => i.status === filterStatus);
  const counts = {
    submitted: issues.filter((i) => i.status === "submitted").length,
    under_review: issues.filter((i) => i.status === "under_review").length,
    assigned: issues.filter((i) => i.status === "assigned").length,
    fixed: issues.filter((i) => i.status === "fixed" || i.status === "resolved")
      .length,
  };

  return (
    <>
      <title>Officer Dashboard — FixMyCity</title>

      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <motion.div variants={FADE_UP} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="text-primary-foreground/60 text-sm">
                  Officer Dashboard
                </div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {officer.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/10 text-white border-white/20 text-xs">
                    {officer.department}
                  </Badge>
                  {officer.assignedWards.length > 0 && (
                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                      {officer.assignedWards.join(", ")}
                    </Badge>
                  )}
                  <span className="text-primary-foreground/40 text-xs capitalize">
                    {officer.role}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={FADE_UP} className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent gap-2"
                onClick={loadIssues}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent gap-2"
                onClick={() => {
                  logoutOfficer();
                  navigate("/");
                }}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-700">{unreadCount} new</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${n.isRead ? "border-border bg-background" : "border-primary/30 bg-primary/5"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm">{n.title}</div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {n.ticketId}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "New Reports",
              value: counts.submitted,
              icon: Flag,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              status: "submitted",
            },
            {
              label: "Under Review",
              value: counts.under_review,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
              status: "under_review",
            },
            {
              label: "Assigned",
              value: counts.assigned,
              icon: Wrench,
              color: "text-blue-600",
              bg: "bg-blue-50",
              status: "assigned",
            },
            {
              label: "Resolved",
              value: counts.fixed,
              icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-50",
              status: "fixed",
            },
          ].map((s, i) => (
            <motion.div key={s.label} variants={FADE_UP}>
              <Card
                className={`border cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 ${filterStatus === s.status ? "ring-2 ring-primary border-primary" : "border-border"}`}
                onClick={() =>
                  setFilterStatus(filterStatus === s.status ? "all" : s.status)
                }
              >
                <CardContent className="p-5">
                  <div
                    className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}
                  >
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div
                    className="text-3xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Issues list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                {officer.department} Issues
                <Badge variant="secondary">{filtered.length}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-muted rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">All clear!</p>
                  <p className="text-sm mt-1">
                    No issues match the selected filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((issue) => {
                    const sc =
                      STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
                    const Icon = sc.icon;
                    return (
                      <div
                        key={issue.id}
                        className="flex items-start justify-between gap-3 p-4 rounded-xl border border-border hover:bg-muted/30 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg ${sc.bgColor} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            <Icon className={`w-4 h-4 ${sc.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-xs text-muted-foreground">
                                {issue.ticketId}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bgColor} ${sc.textColor}`}
                              >
                                {sc.label}
                              </span>
                            </div>
                            <div className="font-semibold text-sm text-foreground mb-1">
                              {issue.title}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {issue.ward}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {issue.citizenName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(issue.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1.5 text-xs"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setNewStatus(issue.status);
                          }}
                        >
                          Update <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Update Status Dialog */}
      <Dialog
        open={!!selectedIssue}
        onOpenChange={() => setSelectedIssue(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Update Issue Status
            </DialogTitle>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              {/* Issue summary */}
              <div className="bg-muted rounded-xl p-4">
                <div className="font-mono text-xs text-muted-foreground mb-1">
                  {selectedIssue.ticketId}
                </div>
                <div className="font-semibold text-sm">
                  {selectedIssue.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {selectedIssue.description}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedIssue.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {selectedIssue.citizenName}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="fixed">Fixed ✓</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Officer Note</Label>
                <Textarea
                  placeholder="Add a note for the citizen (e.g., 'Field crew dispatched, work begins tomorrow')"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This note will be included in the email notification to the
                  citizen.
                </p>
              </div>

              {/* History */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Status History
                </Label>
                <div className="mt-2 space-y-2 max-h-36 overflow-y-auto rounded-xl border border-border p-3">
                  {selectedIssue.statusHistory.map((h, i) => {
                    const hsc =
                      STATUS_CONFIG[h.status] || STATUS_CONFIG.submitted;
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <div
                          className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${hsc.bgColor.replace("bg-", "bg-").replace("100", "500")}`}
                          style={{
                            background:
                              h.status === "fixed"
                                ? "#22c55e"
                                : h.status === "rejected"
                                  ? "#ef4444"
                                  : h.status === "under_review"
                                    ? "#f59e0b"
                                    : "#6366f1",
                          }}
                        />
                        <div>
                          <span className="font-semibold capitalize">
                            {h.status.replace(/_/g, " ")}
                          </span>
                          {h.note && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {h.note}
                            </span>
                          )}
                          <div className="text-muted-foreground/70">
                            {new Date(h.timestamp).toLocaleString("en-IN")} ·{" "}
                            {h.updatedBy}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIssue(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="gap-2"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Update & Notify Citizen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
