import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../../utils/api.js";
import "./login.css";

const API_URL = API_BASE_URL;

export default function Login() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

const guardarSessio = (data) => {
  const token = data.accessToken || data.token;

  if (!token) {
    alert("No s'ha rebut token");
    return;
  }

  localStorage.removeItem("guest");
  sessionStorage.removeItem("guest");

  localStorage.setItem("token", token);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));

    // 🔥 AFEGEIX AIXÒ
    const userId = data.user._id || data.user.id;

    if (userId && userId !== "undefined") {
      localStorage.setItem("userId", userId);
    } else {
      console.error("❌ userId no vàlid al login:", data.user);
    }
  }

  navigate("/home", { replace: true });
};
  const handleLogin = async () => {
    try {
      const payload = {
        email: form.email,
        password: form.password,
      };

      const res = await fetch(`${API_URL}/login`, {
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

      guardarSessio(data);
    } catch (err) {
      console.error(err);
      alert("Error de connexió");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setSocialLoading(true);

      const res = await fetch(`${API_URL}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error amb Google Login");
        return;
      }

      guardarSessio(data);
    } catch (err) {
      console.error(err);
      alert("Error de connexió amb Google");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    localStorage.setItem("guest", "true");
    localStorage.setItem(
      "user",
      JSON.stringify({
        nom_complet: "Convidat",
        correu: "",
        guest: true,
      })
    );

    navigate("/home", { replace: true });
  };

  return (
    <div className="lp-page">
      <div className="lp-card">
        <a href="/">
          <img src="/images/arrow-left.png" className="lp-back" alt="tornar" />
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
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <label className="lp-label">Contrasenya</label>

        <div className="lp-input-wrap">
          <span className="lp-input-icon">🔒</span>

          <input
            type={showPwd ? "text" : "password"}
            placeholder="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          <span></span>

          <a href="/forgot-password" className="lp-forgot">
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
          <div className="lp-google-btn-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Login amb Google fallit")}
              theme="outline"
              size="large"
              text="signin_with"
              shape="pill"
              width="280"
            />
          </div>

          <button
            type="button"
            className="lp-guest-btn"
            onClick={handleGuestLogin}
            disabled={socialLoading}
          >
            <span className="lp-guest-icon">👤</span>
            <span>Convidat</span>
          </button>
        </div>

        <p className="lp-register">
          No tens compte? <a href="/regist">Registrar-se</a>
        </p>
      </div>
    </div>
  );
}
