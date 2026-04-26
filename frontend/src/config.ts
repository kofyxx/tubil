const viteApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

export const API_BASE_URL = viteApiBaseUrl || "http://localhost:4000/api";
