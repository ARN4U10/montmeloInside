import { useEffect, useState } from "react";
import Navbar from "../components/nav/nav.jsx";
import "./perfil.css";

const menuItems = [
  "La meva grada",
  "Entrades i esdeveniments",
  "Preferències de notificacions",
  "Historial de navegació",
  "Ajuda i suport",
  "Termes i condicions",
];

export default function Perfil() {
  const [usuari, setUsuari] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPerfil = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/perfil", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("PERFIL DATA:", data);

      setUsuari(data);

    } catch (error) {
      console.error("Error carregant perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPerfil();
}, []);

  if (loading) {
    return <div className="mobile-screen">Carregant perfil...</div>;
  }

  if (!usuari) {
    return <div className="mobile-screen">No s'ha pogut carregar el perfil</div>;
  }

  return (
    <div className="mobile-screen profile-screen">
      <header className="top-bar">
        <button className="back-button">←</button>
        <h1>Perfil</h1>
      </header>

      <main className="profile-content">
        <div className="avatar-wrapper">
          <div className="avatar">
            {usuari.imatge_perfil ? (
              <img src={usuari.imatge_perfil} alt="avatar" />
            ) : (
              "👤"
            )}
          </div>
        </div>

        <h2 className="profile-name">{usuari.nom_complet}</h2>
        <p className="profile-email">{usuari.correu}</p>

        <button className="edit-profile-btn">Editar perfil</button>

        <div className="profile-menu">
          {menuItems.map((item) => (
            <button key={item} className="profile-menu-item">
              <span>{item}</span>
              <span>›</span>
            </button>
          ))}
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          TANCAR SESSIÓ
        </button>
      </main>

      <Navbar />
    </div>
  );
}