import { Building2, Leaf, LockKeyhole } from "lucide-react";
import { demoUsers } from "../data/mockData";
import { useState } from "react";
import type { User } from "../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = demoUsers.find((user) => user.email === email.trim().toLowerCase());
    if (!password.trim() || !account) {
      setError("Enter a valid partner email and password to continue.");
      return;
    }
    setError("");
    onLogin(account);
  }

  return (
    <main className="login-screen">
      <section className="login-brand-panel">
        <a className="brand" href="#login" aria-label="StokVault"><span className="brand-mark"><Leaf aria-hidden="true" size={20} /></span><span className="brand-word">Stok<span>Vault</span><small>VERIFIABLE STOCK LEDGER</small></span></a>
        <p className="eyebrow mt-16 text-emerald-100">HOSPITALITY PARTNER NETWORK</p>
        <h1>Every delivery.<br />Accounted for.</h1>
        <p className="login-brand-copy">Verifiable Stock Ledger &amp; Automated Invoicing Platform for Hospitality Partners.</p>
        <div className="login-proof"><span><LockKeyhole aria-hidden="true" size={14} /> Signed stock records</span><span><Building2 aria-hidden="true" size={14} /> CV. Alam Zempol partners</span></div>
        <div className="login-brand-number" aria-hidden="true">SV / 01</div>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-inner">
          <p className="eyebrow">PARTNER ACCESS</p>
          <h2 id="login-title">Sign in to StokVault</h2>
          <p className="login-description">Open your supplier or hotel workspace.</p>
          <form className="login-form" onSubmit={signIn}>
            <div className="mt-7"><label className="form-label" htmlFor="login-email">Username / Email</label><input className="form-control" id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required /></div>
            <div className="mt-4"><label className="form-label" htmlFor="login-password">Password</label><input className="form-control" id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            {error && <p className="field-error mt-3" role="alert">{error}</p>}
            <button className="button-primary mt-5 w-full" type="submit">Sign In</button>
          </form>
          <div className="login-footnote"><p>Local demo access · any non-empty password</p><p className="mt-2">Seller: seller@alamzempol.com</p><p>Grand Hyatt Bali: hotel@grandhyatt.com</p><p>Ayana Resort Bali: hotel@ayana.com</p></div>
        </div>
        <div className="login-footer"><span>STOKVAULT · CV. ALAM ZEMPOL</span><span>Seller + hotel access</span></div>
      </section>
    </main>
  );
}