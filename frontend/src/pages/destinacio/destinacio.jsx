import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./destinacio.css";
import Navbar from "../components/nav/nav.jsx";
const categories = [
  { id: "grades", title: "Grades", icon: "🏟️", color: "red-card" },
  { id: "wc", title: "Lavabos", icon: "🚻", color: "blue-card" },
  { id: "menjar", title: "Menjar", icon: "🍴", color: "orange-card" },
  { id: "sortides", title: "Sortides", icon: "↪", color: "green-card" },
];

const getCategory = (label = "") => {
  const t = label.toLowerCase();

  if (t.includes("wc")) return "wc";
  if (t.includes("food") || t.includes("merch")) return "menjar";
  if (t.includes("heli")) return "sortides";
  if (t.includes("tribuna") || t.startsWith("t")) return "grades";

  return "grades";
};

export default function Destinacio() {
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (item) => {
    navigate("/mapa", {state: { puntSeleccionat: item}})
  }

  useEffect(() => {
    let cancelled = false;

    const fetchUbicacions = async () => {
      const res = await fetch("http://localhost:3001/api/ubicacions");
      const data = await res.json();

      const normalized = data.map((item) => ({
        ...item,
        categoria: getCategory(item.label),
      }));

      if (!cancelled) {
        setResults(normalized);
      }
    };

    fetchUbicacions();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredResults = filter
    ? results.filter((item) => item.categoria === filter)
    : results;

  const getIcon = (label = "") => {
    const t = label.toLowerCase();

    if (t.includes("wc")) return "🚻";
    if (t.includes("heli")) return "🚁";
    if (t.includes("food") || t.includes("merch")) return "🍴";

    return "📍";
  };

  return (
    <div className="mobile-screen">

      <header className="top-bar">
        <h1>Cercar destinació</h1>
      </header>

      <main className="screen-content">

        {/* BOTONES */}
        <section className="category-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`category-card ${c.color} ${
                filter === c.id ? "active" : ""
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.title}</span>
            </button>
          ))}
        </section>

        {/* RESULTADOS */}
        <section className="results-list">

          {filteredResults.map((item) => (
            <div onClick={() => handleSelect(item)} className="result-card" key={item.id}>

              <div className="result-left">

                <div className="result-pin">
                  {getIcon(item.label)}
                </div>

                <div className="result-info">
                  <h3>{item.label}</h3>

                  <div className="result-meta">
                    {item.descripcio && <p>📝 {item.descripcio}</p>}
                    {item.categoria && <p>🏷️ {item.categoria}</p>}
                    {item.tipus && <p>📌 {item.tipus}</p>}

                    {(item.latitud || item.longitud) && (
                      <p>
                        📍 {item.latitud} · {item.longitud}
                      </p>
                    )}

                    {item.direccio && <p>🏠 {item.direccio}</p>}
                  </div>
                </div>

              </div>

              <span className="result-badge">
                {item.categoria}
              </span>

            </div>
          ))}

        </section>

      </main>

      <Navbar />
    </div>
  );
}
