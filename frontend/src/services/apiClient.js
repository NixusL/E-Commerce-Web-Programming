// frontend/src/services/apiClient.js

// API base URL - can be overridden with REACT_APP_API_BASE env var
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// Simple fetch wrapper that includes credentials so cookies are sent
async function fetchJSON(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const defaultHeaders = { "Content-Type": "application/json" };
  const merged = {
    credentials: "include",
    headers: { ...defaultHeaders, ...(opts.headers || {}) },
    ...opts,
  };

  const res = await fetch(url, merged);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed: ${res.status}`);
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

async function getCurrentUser() {
  try {
    const data = await fetchJSON(`/api/auth/me`);
    return data?.user || null;
  } catch (e) {
    return null;
  }
}

async function loginRequest(body) {
  return fetchJSON(`/api/auth/login`, { method: "POST", body: JSON.stringify(body) });
}

async function registerRequest(body) {
  return fetchJSON(`/api/auth/register`, { method: "POST", body: JSON.stringify(body) });
}

async function logoutRequest() {
  try {
    await fetchJSON(`/api/auth/logout`, { method: "POST" });
  } catch (e) {
    // ignore
  }
}

function pushToast(detail) {
  window.dispatchEvent(new CustomEvent("toast:push", { detail }));
}

export { API_BASE, fetchJSON, getCurrentUser, loginRequest, registerRequest, logoutRequest, pushToast };
