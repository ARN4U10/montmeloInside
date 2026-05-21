import "./App.css";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="login-page">

      {/* Logo centrado */}
      <header className="login-header">
        <img
          src="/images/logo.png"
          alt="Montmeló Inside"
          className="logo"
        />
      </header>

      {/* Contenido */}
      <main className="login-content">

        <h2 className="subtitle">
          Navegació intel·ligent dins del circuit
        </h2>

        <div className="buttons">

          <a
            href="https://www.google.com/maps/search/?api=1&query=Circuit%20de%20Barcelona-Catalunya%2C%20Montmel%C3%B3"
            className="btn primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/iconLogin.png"
              alt="icon"
              className="btn-icon"
            />
            Com arribar-hi
          </a>

          <Link to="/login" className="btn secondary">
            Iniciar sessió
          </Link>

        </div>
      </main>

    </div>
  );
}
