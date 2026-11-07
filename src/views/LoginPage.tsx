import { Building2, Leaf, LockKeyhole } from "lucide-react";
import { demoUsers } from "../data/mockData";
import { useState } from "react";
import type { User } from "../types";
import { loginSchema } from "../schemas/auth";
import { createSession } from "../actions/auth";

interface LoginPageProps {
  onLogin: (user: User) => void;
  statusMessage?: string;
}

export function LoginPage({ onLogin, statusMessage }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) {
        setEmailError(fieldErrors.email[0]);
      }
      if (fieldErrors.password?.[0]) {
        setPasswordError(fieldErrors.password[0]);
      }
      return;
    }

    try {
      const session = await createSession(result.data.email, result.data.password);
      if (!session.success) {
        setGeneralError(session.message ?? "Sign-in failed. Check your credentials and try again.");
        return;
      }
    }
    catch (error) {
      console.error("Could not establish the StokVault session.", error);
      setGeneralError("Sign-in could not be completed. Check the server configuration and try again.");
      return;
    }

    const account = demoUsers.find((user) => user.email === result.data.email);
    if (!account) {
      setGeneralError("Kredensial tidak valid: akun mitra tidak terdaftar pada sistem.");
      return;
    }

    onLogin(account);
  }

  return (
    <main className="login-screen">
      <section className="login-brand-panel">
        <a className="brand" href="#login" aria-label="StokVault">
          <span className="brand-mark"><Leaf aria-hidden="true" size={20} /></span>
          <span className="brand-word">Stok<span>Vault</span><small>VERIFIABLE STOCK LEDGER</small></span>
        </a>
        <p className="eyebrow mt-16 text-emerald-100">HOSPITALITY PARTNER NETWORK</p>
        <h1>Every delivery.<br />Accounted for.</h1>
        <p className="login-brand-copy">Verifiable Stock Ledger &amp; Automated Invoicing Platform for Hospitality Partners.</p>
        <div className="login-proof">
          <span><LockKeyhole aria-hidden="true" size={14} /> Signed stock records</span>
          <span><Building2 aria-hidden="true" size={14} /> CV. Alam Zempol partners</span>
        </div>
        <div className="login-brand-number" aria-hidden="true">SV / 01</div>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-inner">
          <p className="eyebrow">PARTNER ACCESS</p>
          <h2 id="login-title">Sign in to StokVault</h2>
          <p className="login-description">Open your supplier or hotel workspace.</p>
          
          <form className="login-form" onSubmit={signIn} noValidate suppressHydrationWarning>
            {statusMessage && <p className="field-error mt-3" role="alert">{statusMessage}</p>}
            <div className="mt-7">
              <label className="form-label" htmlFor="login-email">Username / Email</label>
              <input
                className={`form-control ${emailError ? "table-input-error" : ""}`}
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="name@company.com"
                required
                suppressHydrationWarning
              />
              {emailError && (
                <p className="field-error mt-1.5" role="alert" id="email-error">
                  {emailError}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                className={`form-control ${passwordError ? "table-input-error" : ""}`}
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required
                suppressHydrationWarning
              />
              {passwordError && (
                <p className="field-error mt-1.5" role="alert" id="password-error">
                  {passwordError}
                </p>
              )}
            </div>

            {generalError && (
              <p className="field-error mt-3" role="alert">
                {generalError}
              </p>
            )}

            <button className="button-primary mt-5 w-full" type="submit" suppressHydrationWarning>
              Sign In
            </button>
          </form>

          <div className="login-footnote">
            <p>Local demo password · StokVault-Test-2026!</p>
            <p className="mt-2">Seller: seller@alamzempol.com</p>
            <p>Grand Hyatt Bali: hotel@grandhyatt.com</p>
            <p>Ayana Resort Bali: hotel@ayana.com</p>
          </div>
        </div>
        <div className="login-footer">
          <span>STOKVAULT · CV. ALAM ZEMPOL</span>
          <span>Seller + hotel access</span>
        </div>
      </section>
    </main>
  );
}
