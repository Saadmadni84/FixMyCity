// API client for communicating with vite-plugin-api endpoints

import { apiUrl } from "./api-url";

const API_BASE = "/api";

export async function checkHealth() {
  const response = await fetch(apiUrl(`${API_BASE}/health`));
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}
