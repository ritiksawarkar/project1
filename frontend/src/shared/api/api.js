import axios from "axios";
import {
  loadAuthSession,
  saveAuthSession,
} from "../../features/auth/model/authStorage.js";

function getStoredAuth() {
  return loadAuthSession();
}

function clearStoredAuth() {
  saveAuthSession(null);
}

function resolveBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof configuredBaseUrl !== "string" || !configuredBaseUrl.trim()) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }

  const trimmedBaseUrl = configuredBaseUrl.trim().replace(/\/+$/, "");
  const withoutVersionSuffix = trimmedBaseUrl.replace(/\/api\/v1$/i, "");

  return `${withoutVersionSuffix}/api/v1`;
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const authSession = getStoredAuth();

  if (authSession?.token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authSession.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl =
      typeof error?.config?.url === "string" ? error.config.url : "";
    const isAuthMeRequest = requestUrl.toLowerCase().includes("/auth/me");

    if (status === 401 && !isAuthMeRequest) {
      clearStoredAuth();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export { api, resolveBaseUrl };
export default api;
