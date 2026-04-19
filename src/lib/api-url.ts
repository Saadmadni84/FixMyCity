const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim();

const normalizedBase = configuredApiUrl.replace(/\/+$/, "");
const API_ORIGIN = normalizedBase.endsWith("/api")
  ? normalizedBase.slice(0, -4)
  : normalizedBase;

export function apiUrl(path: string): string {
  if (!path) return path;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedPath.startsWith("/api")) {
    return normalizedPath;
  }

  return API_ORIGIN ? `${API_ORIGIN}${normalizedPath}` : normalizedPath;
}
