import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api.js";
import "./destinacio.css";
import Navbar from "../components/nav/nav.jsx";

const categories = [
  { id: "grades", title: "Grades", icon: "🏟️", color: "red-card" },
  { id: "wc", title: "Lavabos", icon: "🚻", color: "blue-card" },
  { id: "menjar", title: "Menjar", icon: "🍴", color: "orange-card" },
  { id: "sortides", title: "Sortides", icon: "↪", color: "green-card" },
];

const getCategory = (item = {}) => {
  const t = [item.label, item.nom, item.categoria, item.tipus, item.descripcio]
    .join(" ")
    .toLowerCase();

  if (t.includes("wc") || t.includes("lavabo")) return "wc";
  if (t.includes("food") || t.includes("merch") || t.includes("restaur")) return "menjar";
  if (t.includes("heli") || t.includes("access") || t.includes("porta")) return "sortides";
  if (t.includes("tribuna") || t.includes("grada") || t.startsWith("t")) return "grades";

  return "grades";
};

const getIcon = (item = {}) => {
  const t = [item.label, item.nom, item.categoria, item.tipus, item.descripcio]
    .join(" ")
    .toLowerCase();

  if (t.includes("wc") || t.includes("lavabo")) return "🚻";
  if (t.includes("heli")) return "🚁";
  if (t.includes("food") || t.includes("merch") || t.includes("restaur")) return "🍴";

  return "📍";
};

export default function Destinacio() {
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSelect = (item) => {
    navigate("/mapa", {
      state: {
        puntSeleccionat: {
          ...item,
          label: item.label || item.nom,
          lat: item.lat ?? item.latitud,
          lng: item.lng ?? item.longitud,
        },
      },
    });
  };

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());

    const fetchDestinacions = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiFetch(`/destinacions?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No s'han pogut carregar destinacions");

        const normalized = data.map((item) => ({
          ...item,
          label: item.label || item.nom,
          categoria: getCategory(item),
        }));

        if (!cancelled) setResults(normalized);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(fetchDestinacions, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const filteredResults = useMemo(() => {
    return filter ? results.filter((item) => item.categoria === filter) : results;
  }, [filter, results]);

  return (
    <div className="mobile-screen">
      <header className="top-bar">
        <h1>Cercar destinació</h1>
      </header>

      <main className="screen-content">
        <div className="destination-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca grades, lavabos, menjar..."
          />
        </div>

        <section className="category-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter((current) => current === c.id ? null : c.id)}
              className={`category-card ${c.color} ${filter === c.id ? "active" : ""}`}
            >
              <span>{c.icon}</span>
              <span>{c.title}</span>
            </button>
          ))}
        </section>

        {loading && <div className="destination-state">Carregant destinacions...</div>}
        {error && <div className="destination-state destination-state--error">{error}</div>}

        {!loading && !error && (
          <section className="results-list">
            {filteredResults.length === 0 ? (
              <div className="destination-state">No hi ha resultats per aquesta cerca.</div>
            ) : (
              filteredResults.map((item) => (
                <button onClick={() => handleSelect(item)} className="result-card" key={item.id || item._id}>
                  <div className="result-left">
                    <div className="result-pin">{getIcon(item)}</div>

                    <div className="result-info">
                      <h3>{item.label}</h3>

                      <div className="result-meta">
                        {item.descripcio && <p>📝 {item.descripcio}</p>}
                        {item.tipus && <p>📌 {item.tipus}</p>}
                        {(item.latitud || item.longitud) && (
                          <p>📍 {item.latitud} · {item.longitud}</p>
                        )}
                        {item.direccio && <p>🏠 {item.direccio}</p>}
                      </div>
                    </div>
                  </div>

                  <span className="result-badge">{item.categoria}</span>
                </button>
              ))
            )}
          </section>
        )}
      </main>

      <Navbar showCircuitLogo />
    </div>
  );
}
