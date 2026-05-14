import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import { apiFetch, getToken, isGuest } from "../../utils/api.js";
import "./serveis.css";

const filters = ["Tots", "Lavabos", "Restauració", "Pàrquing"];

const iconsByType = {
  Lavabos: "🚻",
  Restauració: "🍴",
  Pàrquing: "🅿",
};

const getBadgeClass = (afluencia) => {
  switch (afluencia) {
    case "BAIXA":
      return "badge baixa";
    case "MITJANA":
      return "badge mitjana";
    case "ALTA":
      return "badge alta";
    default:
      return "badge";
  }
};

export default function Serveis() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Tots");
  const [serveis, setServeis] = useState([]);
  const [preferits, setPreferits] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadServeis = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiFetch("/serveis");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No s'han pogut carregar els serveis");
        if (!cancelled) setServeis(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadServeis();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!getToken()) return;

    apiFetch("/preferits", { auth: true })
      .then((res) => res.json())
      .then((data) => {
        setPreferits(new Set((data.preferits || []).map((item) => String(item.ubicacioId))));
      })
      .catch(() => {});
  }, []);

  const filteredServeis = useMemo(() => {
    return activeFilter === "Tots"
      ? serveis
      : serveis.filter((servei) => servei.tipus === activeFilter);
  }, [activeFilter, serveis]);

  const goToMap = (servei) => {
    navigate("/mapa", {
      state: {
        puntSeleccionat: {
          ...servei,
          label: servei.nom,
          categoria: servei.tipus,
        },
      },
    });
  };

  const togglePreferit = async (servei) => {
    if (isGuest() || !getToken()) {
      setMessage("Inicia sessió per guardar preferits.");
      return;
    }

    const id = String(servei.id || servei._id);
    const next = new Set(preferits);

    try {
      if (next.has(id)) {
        const res = await apiFetch(`/preferits/${id}`, { method: "DELETE", auth: true });
        if (!res.ok) throw new Error("No s'ha pogut treure el preferit");
        next.delete(id);
      } else {
        const res = await apiFetch("/preferits", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ ubicacioId: id }),
        });
        if (!res.ok) throw new Error("No s'ha pogut afegir el preferit");
        next.add(id);
      }

      setPreferits(next);
      setMessage(next.has(id) ? "Afegit a preferits." : "Eliminat de preferits.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="serveis-screen">
      <header className="serveis-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Tornar">←</button>
        <h1>Serveis propers</h1>
      </header>

      <main className="serveis-content">
        <div className="filters-row">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-chip ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {message && <div className="serveis-message">{message}</div>}
        {loading && <div className="serveis-state">Carregant serveis...</div>}
        {error && <div className="serveis-state serveis-state--error">{error}</div>}

        {!loading && !error && (
          <div className="serveis-list">
            {filteredServeis.length === 0 ? (
              <div className="serveis-state">No hi ha serveis per aquest filtre.</div>
            ) : (
              filteredServeis.map((servei) => {
                const id = String(servei.id || servei._id);
                const afluencia = servei.afluencia || "BAIXA";

                return (
                  <div className="servei-card" key={id}>
                    <div className="servei-left">
                      <div className="servei-icon">{iconsByType[servei.tipus] || "📍"}</div>

                      <div className="servei-info">
                        <h3>{servei.nom}</h3>
                        <p>{servei.direccio || servei.descripcio || servei.tipus}</p>
                      </div>
                    </div>

                    <div className="servei-right">
                      <span className={getBadgeClass(afluencia)}>
                        <span className="badge-dot"></span>
                        {afluencia}
                      </span>

                      <div className="servei-actions">
                        <button
                          className={`fav-btn ${preferits.has(id) ? "fav-btn--active" : ""}`}
                          onClick={() => togglePreferit(servei)}
                          aria-label={preferits.has(id) ? "Treure de preferits" : "Afegir a preferits"}
                        >
                          ★
                        </button>
                        <button className="go-btn" onClick={() => goToMap(servei)}>↗ Anar-hi</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}
