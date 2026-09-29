import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { getAdmin } from "@/lib/admin/auth";
import { supabaseConfig } from "@/lib/supabase/config";
import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const configured = !!supabaseConfig();
  return (
    <main id="main-content" className="admin-login-page">
      <div className="admin-login-card">
        <Link href="/" className="admin-brand">
          RBNB<span>Portfolio manager</span>
        </Link>
        <div className="admin-login-icon">
          <LockKeyhole size={25} aria-hidden="true" />
        </div>
        <p className="admin-kicker">Owner workspace</p>
        <h1>Welcome back.</h1>
        <p className="admin-description">
          Sign in to manage your portfolio, publish your work, and keep
          everything up to date.
        </p>
        <LoginForm configured={configured} />
        {!configured && (
          <div className="admin-setup" role="status">
            <h2>Connect your workspace</h2>
            <p>
              Supabase isn’t configured yet. Sign-in stays disabled until setup
              is complete.
            </p>
            <ol>
              <li>
                Add the project URL and public API key to{" "}
                <code>.env.local</code>.
              </li>
              <li>
                Run <code>supabase/migrations/001_portfolio.sql</code> in
                Supabase.
              </li>
              <li>
                Create your owner account and enroll its user ID using the setup
                guide.
              </li>
              <li>Restart the development server.</li>
            </ol>
            <p>
              Full instructions: <code>supabase/README.md</code>
            </p>
          </div>
        )}
        <p className="admin-login-note">
          Private access for the portfolio owner. No public registration.
        </p>
        <Link href="/" className="admin-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to portfolio
        </Link>
      </div>
    </main>
  );
}
