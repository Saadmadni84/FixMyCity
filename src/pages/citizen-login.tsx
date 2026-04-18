import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  LogIn,
  CheckCircle2,
  Flag,
  Shield,
  Users,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api-url";

const wards = Array.from({ length: 20 }, (_, i) => `Ward ${i + 1}`);

async function parseResponseSafe(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: "Server returned an invalid response" };
  }
}

const PERKS = [
  {
    icon: Flag,
    label: "Report Issues",
    sub: "Submit civic complaints in 2 minutes",
  },
  {
    icon: Shield,
    label: "Track Progress",
    sub: "Real-time status updates on your reports",
  },
  {
    icon: Award,
    label: "Earn Rewards",
    sub: "Points, badges & city service vouchers",
  },
  {
    icon: Users,
    label: "Community Impact",
    sub: "Join 12,000+ active citizens",
  },
];

export default function CitizenLoginPage() {
  const { loginCitizen } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginUid, setLoginUid] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regWard, setRegWard] = useState("");
  const [regPass, setRegPass] = useState("");
  const [registered, setRegistered] = useState<{ uid: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/citizen/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: loginUid, password: loginPass }),
      });
      const json = await parseResponseSafe(res);
      if (!res.ok) throw new Error(String(json.error || "Login failed"));
      const citizen = json.citizen as Parameters<typeof loginCitizen>[0];
      const token = String(json.token || "");
      if (!citizen || !token) throw new Error("Invalid login response");
      loginCitizen(citizen, token);
      toast.success(`Welcome back, ${citizen.name}!`);
      navigate("/citizen-dashboard");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regWard) {
      toast.error("Please select your ward");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/citizen/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          ward: regWard,
          password: regPass,
        }),
      });
      const json = await parseResponseSafe(res);
      if (!res.ok) throw new Error(String(json.error || "Registration failed"));
      const citizen = json.citizen as Parameters<typeof loginCitizen>[0];
      const token = String(json.token || "");
      if (!citizen || !token) throw new Error("Invalid registration response");
      loginCitizen(citizen, token);
      setRegistered({ uid: citizen.uid });
      toast.success("Registration successful!");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 bg-muted/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Welcome to FixMyCity!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your citizen account has been created successfully.
          </p>
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-6 text-left">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
              Your Citizen ID
            </div>
            <div className="text-2xl font-bold text-primary font-mono">
              {registered.uid}
            </div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Save this ID — you'll need it to
              log in
            </div>
          </div>
          <Button
            className="w-full font-bold gap-2"
            onClick={() => navigate("/citizen-dashboard")}
          >
            Go to My Dashboard <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <title>Citizen Login — FixMyCity</title>

      <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2">
        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <span
              className="font-bold text-xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              FixMyCity
            </span>
          </div>

          <div>
            <h2
              className="text-4xl font-bold mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your City.
              <br />
              Your Voice.
              <br />
              <span className="text-accent">Your Fix.</span>
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-10 leading-relaxed">
              Join thousands of citizens making their city better — one report
              at a time.
            </p>
            <div className="flex flex-col gap-5">
              {PERKS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-primary-foreground/60 text-xs mt-0.5">
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-primary-foreground/40 text-xs">
            © {new Date().getFullYear()} FixMyCity — Nagar Nigam Digital
            Services
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex items-center justify-center px-6 py-12 bg-muted/30">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span
                className="font-bold text-xl text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                FixMyCity
              </span>
            </div>

            <div className="mb-8">
              <h1
                className="text-3xl font-bold text-foreground mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Citizen Portal
              </h1>
              <p className="text-muted-foreground">
                Sign in or create your account to get started.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <Tabs defaultValue="login">
                <TabsList className="w-full mb-6 bg-muted">
                  <TabsTrigger
                    value="login"
                    className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" /> Register
                  </TabsTrigger>
                </TabsList>

                {/* Login */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="uid" className="text-sm font-medium">
                        Citizen ID / Phone / Email
                      </Label>
                      <Input
                        id="uid"
                        placeholder="UID-2024-001234 or phone"
                        value={loginUid}
                        onChange={(e) => setLoginUid(e.target.value)}
                        className="mt-1.5 h-11"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pass" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="pass"
                          type={showPass ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                      className="w-full h-11 font-bold gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      Sign In
                    </Button>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-xs text-center text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Demo credentials:
                      </span>
                      <br />
                      UID-2024-001234 / citizen123
                    </div>
                  </form>
                </TabsContent>

                {/* Register */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name *</Label>
                      <Input
                        placeholder="Your full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="mt-1.5 h-11"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium">Mobile *</Label>
                        <Input
                          placeholder="10-digit number"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="mt-1.5 h-11"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Ward *</Label>
                        <Select onValueChange={setRegWard}>
                          <SelectTrigger className="mt-1.5 h-11">
                            <SelectValue placeholder="Select ward" />
                          </SelectTrigger>
                          <SelectContent>
                            {wards.map((w) => (
                              <SelectItem key={w} value={w}>
                                {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Email (for notifications)
                      </Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Password *</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                      className="w-full h-11 font-bold gap-2 bg-accent hover:bg-accent/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Municipal officer?{" "}
              <Link
                to="/officer-login"
                className="text-primary font-medium hover:underline"
              >
                Officer Portal →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
