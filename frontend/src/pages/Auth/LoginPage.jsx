import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../../services/apiClient";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      // This will set the HttpOnly cookie on success
      await loginRequest({ email, password });

      // Notify navbar/app that auth changed – it will refetch /api/auth/me
      window.dispatchEvent(new Event("authchange"));

      navigate("/");
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to continue shopping.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <div className="auth-row">
            <label className="auth-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button type="button" className="auth-link-button" onClick={() => {}}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-primary-button" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* ✅ inline error at bottom of card */}
          {error && <div className="auth-error">{error}</div>}
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;