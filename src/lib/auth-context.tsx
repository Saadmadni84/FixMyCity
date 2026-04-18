import { createContext, useContext, useState, type ReactNode } from "react";

interface CitizenUser {
  id: string;
  uid: string;
  name: string;
  phone: string;
  email: string;
  ward: string;
  points: number;
  reportsCount: number;
  verifiedReports: number;
  badges: string[];
}

interface OfficerUser {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  assignedWards: string[];
  role: string;
  email: string;
}

interface AuthContextType {
  citizen: CitizenUser | null;
  officer: OfficerUser | null;
  loginCitizen: (user: CitizenUser, token: string) => void;
  loginOfficer: (user: OfficerUser, token: string) => void;
  logoutCitizen: () => void;
  logoutOfficer: () => void;
  updateCitizen: (updates: Partial<CitizenUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [citizen, setCitizen] = useState<CitizenUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("fmc_citizen");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [officer, setOfficer] = useState<OfficerUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("fmc_officer");
      if (!stored) return null;
      const parsed = JSON.parse(stored) as Partial<OfficerUser>;
      return {
        id: String(parsed.id || ""),
        name: String(parsed.name || ""),
        employeeId: String(parsed.employeeId || ""),
        department: String(parsed.department || ""),
        assignedWards: Array.isArray(parsed.assignedWards)
          ? parsed.assignedWards.map(String)
          : [],
        role: String(parsed.role || "officer"),
        email: String(parsed.email || ""),
      };
    } catch {
      return null;
    }
  });

  const loginCitizen = (user: CitizenUser, token: string) => {
    setCitizen(user);
    sessionStorage.setItem("fmc_citizen", JSON.stringify(user));
    sessionStorage.setItem("fmc_citizen_token", token);
  };

  const loginOfficer = (user: OfficerUser, token: string) => {
    const normalizedOfficer: OfficerUser = {
      ...user,
      assignedWards: Array.isArray(user.assignedWards)
        ? user.assignedWards.map(String)
        : [],
    };

    setOfficer(normalizedOfficer);
    sessionStorage.setItem("fmc_officer", JSON.stringify(normalizedOfficer));
    sessionStorage.setItem("fmc_officer_token", token);
  };

  const logoutCitizen = () => {
    setCitizen(null);
    sessionStorage.removeItem("fmc_citizen");
    sessionStorage.removeItem("fmc_citizen_token");
  };

  const logoutOfficer = () => {
    setOfficer(null);
    sessionStorage.removeItem("fmc_officer");
    sessionStorage.removeItem("fmc_officer_token");
  };

  const updateCitizen = (updates: Partial<CitizenUser>) => {
    if (!citizen) return;
    const updated = { ...citizen, ...updates };
    setCitizen(updated);
    sessionStorage.setItem("fmc_citizen", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        citizen,
        officer,
        loginCitizen,
        loginOfficer,
        logoutCitizen,
        logoutOfficer,
        updateCitizen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
