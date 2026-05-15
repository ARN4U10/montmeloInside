import { useState } from "react";
import { API_BASE_URL } from "../../utils/api.js";
import "./forgotpassword.css";

const API_URL = API_BASE_URL;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [correu, setCorreu] = useState("");
  const [codi, setCodi] = useState("");
  const [novaPassword, setNovaPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const enviarCodi = async () => {
    setError("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correu }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error enviant el codi");
        return;
      }

      setMsg("Si el correu existeix, t'hem enviat un codi.");
      setStep(2);
    } catch {
      setError("Error de connexió");
    } finally {
      setLoading(false);
    }
  };

  const verificarCodi = async () => {
    setError("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correu, codi }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Codi incorrecte");
        return;
      }

      setMsg("Codi verificat correctament");
      setStep(3);
    } catch {
      setError("Error de connexió");
    } finally {
      setLoading(false);
    }
  };

  const canviarPassword = async () => {
    setError("");
    setMsg("");

    if (novaPassword !== confirmPassword) {
      setError("Les contrasenyes no coincideixen");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correu,
          codi,
          novaPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No s'ha pogut canviar la contrasenya");
        return;
      }

      setMsg("Contrasenya actualitzada correctament. Ja pots iniciar sessió.");
      setStep(4);
    } catch {
      setError("Error de connexió");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <a href="/login" className="fp-back">← Tornar</a>

        <h1>Recuperar contrasenya</h1>
        <p>
          Introdueix el teu correu i t’enviarem un codi per recuperar l’accés.
        </p>

        {error && <div className="fp-error">{error}</div>}
        {msg && <div className="fp-success">{msg}</div>}

        {step === 1 && (
          <>
            <label>Correu electrònic</label>
            <input
              type="email"
              value={correu}
              onChange={(e) => setCorreu(e.target.value)}
              placeholder="exemple@gmail.com"
            />

            <button onClick={enviarCodi} disabled={loading || !correu}>
              {loading ? "Enviant..." : "Enviar codi"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Correu electrònic</label>
            <input
              type="email"
              value={correu}
              onChange={(e) => setCorreu(e.target.value)}
            />

            <label>Codi de verificació</label>
            <input
              type="text"
              value={codi}
              onChange={(e) => setCodi(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />

            <button onClick={verificarCodi} disabled={loading || !codi}>
              {loading ? "Verificant..." : "Verificar codi"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label>Nova contrasenya</label>
            <input
              type="password"
              value={novaPassword}
              onChange={(e) => setNovaPassword(e.target.value)}
              placeholder="Nova contrasenya"
            />

            <label>Confirmar contrasenya</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeteix la contrasenya"
            />

            <button
              onClick={canviarPassword}
              disabled={loading || !novaPassword || !confirmPassword}
            >
              {loading ? "Actualitzant..." : "Canviar contrasenya"}
            </button>
          </>
        )}

        {step === 4 && (
          <a className="fp-login-link" href="/login">
            Anar a iniciar sessió
          </a>
        )}
      </div>
    </div>
  );
}
