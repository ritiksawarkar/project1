import api from "../../../shared/api/api.js";

export function registerUser(data) {
  return api.post("/auth/register", data);
}

export function loginUser(data) {
  return api.post("/auth/login", data);
}

export function getProfile() {
  return api.get("/auth/me");
}
