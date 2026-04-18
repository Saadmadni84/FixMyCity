// API client for communicating with backend API endpoints.
// In production, set VITE_API_URL to your deployed backend (e.g. https://example.onrender.com/api).

const RAW_API_BASE = (import.meta.env.VITE_API_URL || "/api").trim();
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutApiPrefix = normalized.startsWith("/api/")
    ? normalized.slice(4)
    : normalized === "/api"
      ? "/"
      : normalized;

  return `${API_BASE}${withoutApiPrefix}`;
}

export function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(apiUrl(path), init);
}

export async function checkHealth() {
  const response = await apiFetch("/api/health");
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}
