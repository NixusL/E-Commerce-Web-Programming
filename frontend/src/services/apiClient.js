// frontend/src/services/apiClient.js

// API base URL - can be overridden with REACT_APP_API_BASE env var
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

/**
 * Get auth token from localStorage or sessionStorage
 */
function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/**
 * Get stored user object from localStorage or sessionStorage
 */
function readStoredUser() {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Dispatch a toast event globally
 */
function pushToast(detail) {
  window.dispatchEvent(new CustomEvent("toast:push", { detail }));
}

/**
 * Store user and token in localStorage
 */
function storeUser(user, token) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

/**
 * Clear all auth data from storage
 */
function clearAuthData() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
}

export { API_BASE, getToken, readStoredUser, pushToast, storeUser, clearAuthData };
