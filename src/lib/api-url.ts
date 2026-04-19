const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim();

const API_ORIGIN = configuredApiUrl.replace(/\/$/, "");

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
