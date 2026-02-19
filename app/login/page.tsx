"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f4f5" }}>
      <form onSubmit={handleSubmit} style={{ background: "white", padding: 32, borderRadius: 8, boxShadow: "0 2px 8px #0001", minWidth: 320 }}>
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>Login Ferramentaria</h2>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
            required
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, borderRadius: 4, background: "#2563eb", color: "white", border: "none", fontWeight: 600 }}>Entrar</button>
      </form>
    </div>
  );
}
