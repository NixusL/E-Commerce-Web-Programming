import React from "react";
import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">
          Sign up to start browsing and buying products.
        </p>

        <form className="auth-form">
          <label className="auth-label">
            Full name
            <input
              type="text"
              className="auth-input"
              placeholder="John Doe"
            />
          </label>

          <label className="auth-label">
            Email
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
            />
          </label>

          <label className="auth-label">
            Confirm password
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="auth-primary-button">
            Create account
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
