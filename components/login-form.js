"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData) {
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        secret: formData.get("secret")
      })
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Clave inválida.");
      return;
    }

    startTransition(() => {
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="auth-card">
      <div className="auth-copy">
        <p className="section-kicker">acceso admin</p>
        <h1>Entrar con palabra clave de escuela</h1>
        <p>
          Login temporal para maestras y coordinación. Después puede cambiar a
          sistema formal.
        </p>
      </div>

      <label className="field">
        <span>Palabra clave</span>
        <input
          type="password"
          name="secret"
          placeholder="Escribe clave"
          autoComplete="current-password"
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="primary-pill primary-button" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
