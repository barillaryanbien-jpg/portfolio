"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "@/lib/admin/actions";
import { initialResult } from "@/lib/admin/schema";

export function LoginForm({ configured }: { configured: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, initialResult);
  return (
    <form action={action} className="admin-login-form">
      <fieldset disabled={pending || !configured}>
        <div className="admin-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="password">Password</label>
          <div className="admin-password">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={1000}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>
        <button type="submit" className="admin-button admin-button-primary">
          {pending ? "Signing in…" : "Sign in"}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </fieldset>
      {state.message && (
        <p className="admin-notice error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
