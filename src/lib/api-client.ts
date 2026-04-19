// API client for communicating with backend API endpoints.
// In production, set VITE_API_URL to your deployed backend (e.g. https://example.onrender.com/api).

import { apiUrl } from "./api-url";

const API_BASE = "/api";

export async function checkHealth() {
  const response = await fetch(apiUrl(`${API_BASE}/health`));
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}
