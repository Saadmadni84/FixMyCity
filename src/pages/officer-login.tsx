import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
  Lock,
  FileText,
  Users,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { WARDS } from "@/lib/wards";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api-url";

const DEPARTMENTS = [
  "electricity",
  "civil_works",
  "horticulture",
  "drainage",
  "sanitation",
  "water",
];

const DEPT_LABELS: Record<string, string> = {
  electricity: "Electricity Department",
  civil_works: "Civil Works Department",
  horticulture: "Horticulture Department",
  drainage: "Drainage Department",
  sanitation: "Sanitation Department",
  water: "Water Department",
};

async function parseResponseSafe(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: "Server returned an invalid response" };
  }
}

const FEATURES = [
  {
    icon: FileText,
    label: "Manage Reports",
    sub: "View & update all civic reports",
  },
  { icon: Users, label: "RBAC Access", sub: "Role-based department control" },
  { icon: BarChart2, label: "Analytics", sub: "Track resolution performance" },
  {
    icon: CheckCircle2,
    label: "Audit Trail",
    sub: "Full status history per issue",
  },
];

// Carousel slides for the left panel
const SLIDES = [
  {
    title: "Municipal Officer",
    accent: "Command Centre",
    sub: "Manage citizen reports, update resolution status, and keep your city running smoothly.",
  },
  {
    title: "Real-Time",
    accent: "Issue Tracking",
    sub: "Monitor every reported issue across your department with live status updates.",
  },
  {
    title: "Department",
    accent: "RBAC Control",
    sub: "Access is scoped to your department — secure, auditable, and role-aware.",
  },
];

export default function OfficerLoginPage() {
  const { loginOfficer } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  // Login state
  const [empId, setEmpId] = useState("");
  const [pass, setPass] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmpId, setRegEmpId] = useState("");
  const [regDept, setRegDept] = useState("");
  const [regWards, setRegWards] = useState<string[]>([]);
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const toggleWard = (ward: string) => {
    setRegWards((prev) =>
      prev.includes(ward) ? prev.filter((w) => w !== ward) : [...prev, ward],
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/officer/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId, password: pass }),
      });
      const json = await parseResponseSafe(res);
      if (!res.ok) throw new Error(String(json.error || "Login failed"));
      const officer = json.officer as Parameters<typeof loginOfficer>[0];
      const token = String(json.token || "");
      if (!officer || !token) throw new Error("Invalid login response");
      loginOfficer(officer, token);
      toast.success(`Welcome, ${officer.name}!`);
      navigate("/officer-dashboard");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDept) {
      toast.error("Please select your department");
      return;
    }
    if (regWards.length === 0) {
      toast.error("Please assign at least one ward");
      return;
    }
    if (regPass !== regConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/officer/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          employeeId: regEmpId,
          department: regDept,
          assignedWards: regWards,
          email: regEmail,
          password: regPass,
        }),
      });
      const json = await parseResponseSafe(res);
      if (!res.ok) throw new Error(String(json.error || "Registration failed"));
      const officer = json.officer as Parameters<typeof loginOfficer>[0];
      const token = String(json.token || "");
      if (!officer || !token) throw new Error("Invalid registration response");
      loginOfficer(officer, token);
      toast.success("Officer account created!");
      navigate("/officer-dashboard");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  const prevSlide = () =>
    setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);
  const nextSlide = () => setSlide((s) => (s + 1) % SLIDES.length);

  return (
    <>
      <title>Officer Portal — FixMyCity</title>

      <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f1f3d 0%, #1a365d 50%, #0d2a4a 100%)",
          }}
        >
          {/* Background image overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url(/assets/city-hero.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Dark grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 p-10 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div
                  className="text-white font-bold text-lg leading-none"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  FixMyCity
                </div>
                <div className="text-white/40 text-xs uppercase tracking-widest mt-0.5">
                  Officer Portal
                </div>
              </div>
            </div>

            {/* Carousel */}
            <div className="my-10 flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: "easeOut" as const }}
                >
                  <h2
                    className="text-5xl font-bold text-white leading-tight mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {SLIDES[slide].title}
                    <br />
                    <span className="text-accent">{SLIDES[slide].accent}</span>
                  </h2>
                  <p className="text-white/60 text-base mt-4 leading-relaxed max-w-xs">
                    {SLIDES[slide].sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Carousel controls */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1.5">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-accent" : "w-1.5 bg-white/20"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/8 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="text-white text-xs font-semibold">
                    {label}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5 leading-tight">
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div
          className="flex items-center justify-center px-6 py-12"
          style={{
            background: "linear-gradient(180deg, #0f1f3d 0%, #1a365d 100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            className="w-full max-w-md"
          >
            {/* Restricted badge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50">
                <Lock className="w-3 h-3" />
                RESTRICTED ACCESS
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1
                className="text-3xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {tab === "login" ? "Officer Login" : "Officer Registration"}
              </h1>
              <p className="text-white/40 text-sm">
                Nagar Nigam Officials Only · RBAC Enabled
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === "login"
                    ? "bg-accent text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
              <button
                onClick={() => setTab("register")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === "register"
                    ? "bg-accent text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>

            {/* Form card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div>
                      <Label className="text-white/70 text-sm">
                        Employee ID / Email
                      </Label>
                      <Input
                        placeholder="e.g. EMP-2023-0042"
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        className="mt-1.5 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent focus:ring-accent/20"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Password</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="Enter your password"
                          value={pass}
                          onChange={(e) => setPass(e.target.value)}
                          className="h-11 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent focus:ring-accent/20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold gap-2 bg-accent hover:bg-accent/90 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      Login to Officer Portal
                    </Button>

                    {/* Demo credentials */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/40 space-y-1">
                      <div className="text-white/60 font-medium mb-1">
                        Demo credentials:
                      </div>
                      <div>EMP-2023-0042 (Electricity) / officer123</div>
                      <div>EMP-2023-0078 (Drainage) / officer123</div>
                      <div>EMP-2022-0015 (Civil Works) / officer123</div>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div>
                      <Label className="text-white/70 text-sm">
                        Full Name *
                      </Label>
                      <Input
                        placeholder="e.g. Rajesh Kumar Sharma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="mt-1.5 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">
                        Employee ID *
                      </Label>
                      <Input
                        placeholder="e.g. MNN-2024-0042"
                        value={regEmpId}
                        onChange={(e) => setRegEmpId(e.target.value)}
                        className="mt-1.5 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">
                        Department *
                      </Label>
                      <Select onValueChange={setRegDept}>
                        <SelectTrigger className="mt-1.5 h-11 bg-white/5 border-white/10 text-white/70 focus:border-accent">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {DEPT_LABELS[d]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-white/70 text-sm">
                          Assigned Wards *
                        </Label>
                        {regWards.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setRegWards([])}
                            className="text-xs text-accent hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {WARDS.map((ward) => {
                          const selected = regWards.includes(ward);
                          return (
                            <button
                              key={ward}
                              type="button"
                              onClick={() => toggleWard(ward)}
                              className={`h-8 rounded-md border text-xs transition-colors ${
                                selected
                                  ? "border-accent bg-accent/20 text-accent"
                                  : "border-white/10 bg-white/5 text-white/70 hover:border-accent/40"
                              }`}
                            >
                              {ward.replace("Ward ", "W")}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-white/35 mt-2">
                        Selected: {regWards.length > 0 ? regWards.join(", ") : "None"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">
                        Official Email ID *
                      </Label>
                      <Input
                        type="email"
                        placeholder="officer@nagarnigam.gov.in"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="mt-1.5 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white/70 text-sm">
                          Password *
                        </Label>
                        <div className="relative mt-1.5">
                          <Input
                            type={showPass ? "text" : "password"}
                            placeholder="Min 6 chars"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            className="h-11 pr-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                          >
                            {showPass ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">
                          Confirm *
                        </Label>
                        <div className="relative mt-1.5">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            className="h-11 pr-8 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-accent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                          >
                            {showConfirm ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold gap-2 bg-accent hover:bg-accent/90 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      Register as Officer
                    </Button>
                    <p className="text-center text-xs text-white/30">
                      Already registered?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="text-accent hover:underline"
                      >
                        Login here
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-sm text-white/30 mt-5">
              Not an officer?{" "}
              <Link to="/citizen-login" className="text-accent hover:underline">
                Citizen Portal →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
