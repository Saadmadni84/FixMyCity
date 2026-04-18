import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  Flag,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Calendar,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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
  department: string;
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

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted", icon: Flag, color: "bg-indigo-500" },
  {
    key: "under_review",
    label: "Under Review",
    icon: Clock,
    color: "bg-amber-500",
  },
  { key: "assigned", label: "Assigned", icon: Wrench, color: "bg-blue-500" },
  { key: "fixed", label: "Fixed", icon: CheckCircle2, color: "bg-green-500" },
];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Flag;
  }
> = {
  submitted: {
    label: "Submitted",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: Flag,
  },
  under_review: {
    label: "Under Review",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Clock,
  },
  assigned: {
    label: "Assigned",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Wrench,
  },
  in_progress: {
    label: "In Progress",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Wrench,
  },
  fixed: {
    label: "Fixed ✓",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle2,
  },
  resolved: {
    label: "Resolved ✓",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertCircle,
  },
};

const DEMO_IDS = ["FMC-2026-00142", "FMC-2026-00138", "FMC-2026-00155"];

export default function TrackPage() {
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get("id") || "");
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setTicketId(id);
      fetchIssue(id);
    }
  }, []);

  const fetchIssue = async (id?: string) => {
    const searchId = (id || ticketId).trim();
    if (!searchId) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/issues/${searchId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIssue(data.issue);
    } catch {
      setIssue(null);
      toast.error("Issue not found. Please check the ticket ID.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = issue
    ? STATUS_STEPS.findIndex((s) => s.key === issue.status)
    : -1;

  const sc = issue
    ? STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted
    : null;

  return (
    <>
      <title>Track Issue — FixMyCity</title>
      <meta
        name="description"
        content="Track the real-time status of your reported civic issue."
      />

      {/* Hero bar */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">
            Issue Tracker
          </Badge>
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Track Your Issue
          </h1>
          <p className="text-primary-foreground/70 text-lg mb-8">
            Enter your ticket ID to see real-time status and resolution
            progress.
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
              <Search className="w-4 h-4 text-white/50 shrink-0" />
              <input
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchIssue()}
                placeholder="FMC-2026-XXXXX"
                className="bg-transparent text-white placeholder:text-white/40 font-mono text-sm flex-1 outline-none"
              />
            </div>
            <Button
              onClick={() => fetchIssue()}
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-white font-bold px-6 rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
            </Button>
          </div>

          {/* Demo IDs */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-white/40">Try demo:</span>
            {DEMO_IDS.map((id) => (
              <button
                key={id}
                onClick={() => {
                  setTicketId(id);
                  fetchIssue(id);
                }}
                className="text-xs text-white/60 hover:text-white font-mono underline underline-offset-2 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Not found */}
        {searched && !loading && !issue && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Issue Not Found</h3>
            <p className="text-muted-foreground mb-6">
              No issue found with that ticket ID. Please double-check and try
              again.
            </p>
            <Button asChild variant="outline">
              <Link to="/report">
                <Flag className="w-4 h-4 mr-2" />
                Report a New Issue
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Issue result */}
        {issue && sc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Issue header card */}
            <Card className="border border-border overflow-hidden">
              <div
                className={`h-1.5 ${sc.bgColor.replace("bg-", "bg-").replace("50", "500")}`}
                style={{
                  background:
                    issue.status === "fixed" || issue.status === "resolved"
                      ? "#22c55e"
                      : issue.status === "rejected"
                        ? "#ef4444"
                        : "#1A365D",
                }}
              />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {issue.ticketId}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bgColor} ${sc.textColor} ${sc.borderColor}`}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <h2
                      className="text-xl font-bold text-foreground mb-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {issue.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {issue.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary/60" />
                        {issue.address}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-primary/60" />
                        {issue.citizenName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                      }}
                      className="gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress tracker */}
            {issue.status !== "rejected" && (
              <Card className="border border-border">
                <CardContent className="p-6">
                  <h3
                    className="font-semibold text-foreground mb-6"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Resolution Progress
                  </h3>
                  <div className="relative">
                    {/* Track line */}
                    <div className="absolute top-5 left-5 right-5 h-1 bg-border rounded-full" />
                    <div
                      className="absolute top-5 left-5 h-1 bg-primary rounded-full transition-all duration-700"
                      style={{
                        width:
                          currentStepIdx >= 0
                            ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * (100 - 10 / STATUS_STEPS.length)}%`
                            : "0%",
                      }}
                    />
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map(
                        ({ key, label, icon: Icon, color }, i) => {
                          const done = i <= currentStepIdx;
                          const active = i === currentStepIdx;
                          return (
                            <div
                              key={key}
                              className="flex flex-col items-center gap-2 z-10"
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  done
                                    ? `${color} border-transparent text-white`
                                    : "bg-background border-border text-muted-foreground"
                                } ${active ? "ring-4 ring-primary/20 scale-110" : ""}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-xs font-medium text-center max-w-[64px] leading-tight ${done ? "text-primary" : "text-muted-foreground"}`}
                              >
                                {label}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status history timeline */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <h3
                  className="font-semibold text-foreground mb-6"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Status History
                </h3>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
                  <div className="flex flex-col gap-6">
                    {[...issue.statusHistory].reverse().map((h, i) => {
                      const hsc =
                        STATUS_CONFIG[h.status] || STATUS_CONFIG.submitted;
                      const HIcon = hsc.icon;
                      return (
                        <div key={i} className="flex gap-4 relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-background ${hsc.bgColor}`}
                          >
                            <HIcon className={`w-3.5 h-3.5 ${hsc.textColor}`} />
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hsc.bgColor} ${hsc.textColor}`}
                              >
                                {hsc.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                by {h.updatedBy}
                              </span>
                            </div>
                            {h.note && (
                              <p className="text-sm text-foreground/80 mb-1">
                                {h.note}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.timestamp).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer actions */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/report">
                  <Flag className="w-4 h-4" />
                  Report Another Issue
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to="/map">
                  <MapPin className="w-4 h-4" />
                  View on Map
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-primary/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Enter a Ticket ID above
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Your ticket ID was provided when you submitted your issue. It
              looks like{" "}
              <span className="font-mono text-primary">FMC-2026-XXXXX</span>.
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
}
