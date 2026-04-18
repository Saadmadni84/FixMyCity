import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Languages, Check, ChevronUp, X } from "lucide-react";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

interface Language {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", flag: "🇮🇳" },
];

function initTranslateWidget() {
  const TranslateElement = window.google?.translate?.TranslateElement;
  const mount = document.getElementById("google_translate_element");
  if (!TranslateElement || !mount) return;
  if (mount.childElementCount > 0 || document.querySelector(".goog-te-combo"))
    return;

  new TranslateElement(
    {
      pageLanguage: "en",
      autoDisplay: false,
      includedLanguages: LANGUAGES.map((l) => l.code).join(","),
    },
    "google_translate_element",
  );
}

function ensureTranslateScript() {
  if (window.google?.translate?.TranslateElement) {
    initTranslateWidget();
    return;
  }

  const existing = document.getElementById("google-translate-script");
  if (existing) return;

  window.googleTranslateElementInit = () => {
    initTranslateWidget();
  };

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.async = true;
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(script);
}

// Trigger Google Translate programmatically
function triggerGoogleTranslate(langCode: string) {
  if (langCode === "en") {
    // Restore original — reset the cookie and reload
    const iframe = document.querySelector<HTMLIFrameElement>(
      ".goog-te-banner-frame",
    );
    if (iframe) {
      const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const restoreBtn = innerDoc?.querySelector<HTMLElement>(
        ".goog-te-banner-frame",
      );
      restoreBtn?.click();
    }
    // Fallback: clear cookie and reload
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
      window.location.hostname;
    window.location.reload();
    return;
  }

  // Set the googtrans cookie
  const value = `/en/${langCode}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;

  // Try the select element approach (most reliable)
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
    return;
  }

  // Fallback: reload with cookie set
  window.location.reload();
}

function getCurrentLang(): string {
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("googtrans="));
  if (!cookie) return "en";
  const val = cookie.split("=")[1]?.trim();
  if (!val || val === "/en/en") return "en";
  const parts = val.split("/");
  return parts[parts.length - 1] || "en";
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<string>("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveLang(getCurrentLang());
    ensureTranslateScript();
    // In case script was preloaded before mount, initialize once more.
    const timer = window.setTimeout(() => {
      initTranslateWidget();
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const handleSelect = (lang: Language) => {
    setActiveLang(lang.code);
    setOpen(false);
    triggerGoogleTranslate(lang.code);
  };

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-sm font-medium transition-colors border border-primary-foreground/20"
        aria-label="Select language"
      >
        <Languages className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">
          {current.flag} {current.label}
        </span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronUp
          className={`w-3 h-3 transition-transform ${open ? "rotate-0" : "rotate-180"}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-[1200]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Languages className="w-4 h-4 text-primary" />
                Select Language
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language list */}
            <div className="py-1 max-h-72 overflow-y-auto">
              {LANGUAGES.map((lang) => {
                const isActive = lang.code === activeLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${isActive ? "bg-primary/5" : ""}`}
                  >
                    <span className="text-xl leading-none">{lang.flag}</span>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}
                      >
                        {lang.nativeLabel}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lang.label}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5 text-center">
              <span className="text-xs text-muted-foreground">
                Powered by Google Translate
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Google Translate element — required for the widget to initialise */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
