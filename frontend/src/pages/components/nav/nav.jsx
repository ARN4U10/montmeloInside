import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./nav.css";

export default function Nav({ showCircuitLogo = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const goPerfil = (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const guest = localStorage.getItem("guest");

    if (guest && !token) {
      navigate("/perfil-convidat");
    } else {
      navigate("/perfil");
    }
  };

  return (
    <nav className={`bottom-nav ${showCircuitLogo ? "bottom-nav-logo" : ""}`}>
      {showCircuitLogo && (
        <div className="nav-logo-left">
          <img
            src="/images/logo-circuit.png"
            alt="Circuit de Barcelona-Catalunya"
            className="nav-logo-img"
          />
        </div>
      )}

      <div className="nav-main-row">
        <a href="/home" className={`nav-item ${isActive("/home") ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </a>

        <a href="/mapa" className={`nav-item ${isActive("/mapa") ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z" />
            <path d="M8 2V18" />
            <path d="M16 6V22" />
          </svg>
        </a>

        <a href="/events" className={`nav-item ${isActive("/events") ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
            <line x1={16} y1={2} x2={16} y2={6} />
            <line x1={8} y1={2} x2={8} y2={6} />
            <line x1={3} y1={10} x2={21} y2={10} />
          </svg>
        </a>

        <a href="/destinacio" className={`nav-item ${isActive("/destinacio") ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2="16.65" y2="16.65" />
          </svg>
        </a>

        <a
          href="/perfil"
          className={`nav-item ${
            isActive("/perfil") || isActive("/perfil-convidat") ? "active" : ""
          }`}
          onClick={goPerfil}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx={12} cy={7} r={4} />
          </svg>
        </a>
      </div>
    </nav>
  );
}