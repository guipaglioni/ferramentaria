"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showFallbackLogo, setShowFallbackLogo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    // Simulação de autenticação
    router.push("/moldes");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#071127" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.04)", padding: 28, borderRadius: 10, boxShadow: "0 6px 20px rgba(2,6,23,0.6)", color: "#f8fafc" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            {!showFallbackLogo ? (
              <img
                className="form-logo"
                src="/login-banner.png"
                alt="Chamado Ferramentaria"
                style={{ width: 220, maxWidth: '92%', height: 'auto', objectFit: "contain", display: 'block', margin: '0 auto 12px' }}
                onError={() => setShowFallbackLogo(true)}
              />
            ) : (
              <div style={{ width: 96, height: 96, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "#111827" }}>
                <div style={{ color: "#ff7a00", fontWeight: 800, fontSize: 18 }}>CF</div>
              </div>
            )}

            <h2 style={{ marginTop: 12, marginBottom: 0, color: "#fff" }}>Entrar — Ferramentaria</h2>
            <p style={{ marginTop: 6, color: "#cbd5e1", fontSize: 14 }}>Acesse o painel de gestão de chamados</p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="email" style={{ display: "block", color: "#e2e8f0", marginBottom: 6 }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff" }}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="password" style={{ display: "block", color: "#e2e8f0", marginBottom: 6 }}>Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "#fff" }}
              required
            />
          </div>

          {error && <div style={{ color: "#ffb4b4", marginBottom: 12 }}>{error}</div>}

          <button type="submit" style={{ width: "100%", padding: 12, borderRadius: 8, background: "#ff7a00", color: "#071127", border: "none", fontWeight: 700 }}>Entrar</button>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <small style={{ color: "#94a3b8" }}>Se você não tem uma conta, contate o administrador.</small>
          </div>
        </form>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .form-logo { display: block; margin: 0 auto 16px; width: 260px; }
        }
        @media (max-width: 899px) {
          .form-logo { display: block; margin: 0 auto 8px; width: 160px; }
        }
      `}</style>
    </div>
  );
}
