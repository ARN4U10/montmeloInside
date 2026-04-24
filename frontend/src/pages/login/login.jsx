import { useState } from "react";
import "./login.css";

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
  email: "",
  password: "",
  remember: false
});

const handleLogin = async () => {
  try {
    const payload = {
      email: form.email,
      password: form.password,
    };

    console.log("LOGIN SEND:", payload);

    const res = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error login");
      return;
    }

    if (!data.token) {
      alert("No s'ha rebut token");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/home";

  } catch (err) {
    console.error(err);
    alert("Error de connexió");
  }
};
  return (
    <div className="lp-page">
      <div className="lp-card">

      <a href="/">
        <img src="/images/arrow-left.png" className="lp-back" />
      </a>
        <h1 className="lp-title">Iniciar sessió</h1>
        <p className="lp-subtitle">
          Accedeix per guardar la teva grada i preferències
        </p>

        <label className="lp-label">Correu electrònic</label>
        <div className="lp-input-wrap">
          <span className="lp-input-icon">✉</span>
         <input
          type="email"
          placeholder="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />        </div>

        <label className="lp-label">Contrasenya</label>
        <div className="lp-input-wrap">
          <span className="lp-input-icon">🔒</span>

         <input
          type={showPwd ? "text" : "password"}
          placeholder="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

          <button
            type="button"
            className="lp-eye"
            onClick={() => setShowPwd((prev) => !prev)}
          >
            👁
          </button>
        </div>

        <div className="lp-options">
          <label className="lp-remember">
            <input type="checkbox"
                onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                } /> Recordar sessió
          </label>

          <a href="#" className="lp-forgot">
            Has oblidat la contrasenya?
          </a>
        </div>

        <button onClick={handleLogin} className="lp-submit">
        Entrar
        <img
            src="/images/icon-login-regist-button.png"
            alt="icon"
            className="lp-submit-icon"
        />
        </button>
        <div className="lp-divider">
          <div className="lp-divider-line" />
          <span className="lp-divider-text">O CONTINUA AMB</span>
          <div className="lp-divider-line" />
        </div>

        <div className="lp-social">
          <button className="lp-social-btn">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.21.6 4.4 1.58l3.28-3.28A11.94 11.94 0 0 0 12 1C8.02 1 4.57 3.1 2.73 6.28l2.54 3.48z"
              />
              <path
                fill="#34A853"
                d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.87 0-5.33-1.71-6.53-4.2l-3.46 2.69C4.45 20.8 8.01 23 12 23c3.15 0 6.04-1.18 8.22-3.12l-4.18-1.87z"
              />
              <path
                fill="#FBBC05"
                d="M19.1 12c0-.65-.07-1.27-.18-1.87H12v3.74h3.99a3.56 3.56 0 0 1-1.55 2.31l4.18 1.87A11.94 11.94 0 0 0 19.1 12z"
              />
              <path
                fill="#4285F4"
                d="M2.73 6.28A11.88 11.88 0 0 0 1 12c0 2.01.5 3.9 1.37 5.56l3.46-2.69A7.06 7.06 0 0 1 4.9 12c0-1.01.21-1.97.57-2.76L2.73 6.28z"
              />
            </svg>
            G
          </button>

          <button className="lp-social-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            iOS
          </button>
        </div>

        <p className="lp-register">
          No tens compte? <a href="/regist">Registrar-se</a>
        </p>

      </div>
    </div>
  );
}