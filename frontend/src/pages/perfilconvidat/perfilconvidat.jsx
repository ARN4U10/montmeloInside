import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import "./perfilconvidat.css";

export default function PerfilConvidat() {
  const navigate = useNavigate();

  const sortirConvidat = () => {
    localStorage.removeItem("guest");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="guest-profile-screen">
      <main className="guest-profile-content">
        <section className="guest-hero">
          <div className="guest-avatar">👤</div>

          <h1>Perfil de convidat</h1>
          <p>
            Estàs navegant com a convidat. Pots consultar el mapa, serveis i
            destinacions, però no pots guardar preferències ni editar perfil.
          </p>
        </section>

        <section className="guest-card">
          <h2>Què pots fer com a convidat?</h2>

          <div className="guest-feature-list">
            <div className="guest-feature">
              <span>🗺️</span>
              <div>
                <h3>Consultar el mapa</h3>
                <p>Explora les zones del circuit i orienta’t ràpidament.</p>
              </div>
            </div>

            <div className="guest-feature">
              <span>📍</span>
              <div>
                <h3>Veure serveis propers</h3>
                <p>Troba lavabos, restauració, pàrquings i punts d’interès.</p>
              </div>
            </div>

            <div className="guest-feature">
              <span>🎯</span>
              <div>
                <h3>Cercar destinacions</h3>
                <p>Busca grades, entrades o zones concretes del recinte.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guest-card guest-locked-card">
          <h2>Funcions bloquejades</h2>

          <div className="guest-feature-list">
            <div className="guest-feature locked">
              <span>🔒</span>
              <div>
                <h3>Editar perfil</h3>
                <p>Necessites iniciar sessió per modificar les teves dades.</p>
              </div>
            </div>

            <div className="guest-feature locked">
              <span>⭐</span>
              <div>
                <h3>Guardar preferències</h3>
                <p>Registra’t per guardar la teva grada i configuració.</p>
              </div>
            </div>

            <div className="guest-feature locked">
              <span>🔔</span>
              <div>
                <h3>Notificacions personalitzades</h3>
                <p>Només disponibles amb un compte d’usuari.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guest-actions-card">
          <h2>Vols una experiència completa?</h2>
          <p>
            Inicia sessió o crea un compte per guardar dades, preferències i
            accedir al perfil complet.
          </p>

          <div className="guest-actions">
            <button
              className="guest-primary-btn"
              onClick={() => navigate("/login")}
            >
              Iniciar sessió
            </button>

            <button
              className="guest-secondary-btn"
              onClick={() => navigate("/regist")}
            >
              Crear compte
            </button>
          </div>
        </section>

        <section className="guest-quick-actions">
          <button onClick={() => navigate("/home")}>🏠 Home</button>
          <button onClick={() => navigate("/mapa")}>🗺️ Mapa</button>
          <button onClick={() => navigate("/serveis")}>📍 Serveis</button>
          <button onClick={() => navigate("/destinacio")}>🎯 Cercar</button>
        </section>

        <button className="guest-logout-btn" onClick={sortirConvidat}>
          SORTIR DEL MODE CONVIDAT
        </button>
      </main>

      <Navbar />
    </div>
  );
}