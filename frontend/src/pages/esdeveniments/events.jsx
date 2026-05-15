import { useEffect, useState } from "react";
import "./events.css";
import Navbar from "../components/nav/nav.jsx";
import { useNavigate } from "react-router-dom";
import { apiFetch, assetUrl } from "../../utils/api.js";

const categories = [
  { id: "cursa", title: "Curses", icon: "🏁", color: "red-card" },
  { id: "entrenament", title: "Entrenaments", icon: "🏎️", color: "blue-card" },
  { id: "paddock", title: "Paddock", icon: "🛠️", color: "orange-card" },
  { id: "activitat", title: "Activitats", icon: "🎉", color: "green-card" },
];

const getCategory = (label = "", tipus = "") => {
  const t = (label + " " + tipus).toLowerCase();

  if (t.includes("race") || t.includes("cursa")) return "cursa";
  if (t.includes("training") || t.includes("entren")) return "entrenament";
  if (t.includes("paddock") || t.includes("box")) return "paddock";
  if (t.includes("event") || t.includes("activitat")) return "activitat";

  return "activitat";
};

export default function EventsCircuit() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiFetch("/events");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No s'han pogut carregar els events");

        const normalized = data.map((item) => ({
          ...item,
          categoria: getCategory(item.nom, item.tipus || item.categoria),
        }));

        if (!cancelled) {
          setEvents(normalized);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const goToEvent = (id) => {
    navigate(`/events/${id}`);
  };

  const filteredEvents = filter
    ? events.filter((item) => item.categoria === filter)
    : events;

  const getIcon = (label = "") => {
    const t = label.toLowerCase();

    if (t.includes("race") || t.includes("cursa")) return "🏁";
    if (t.includes("training") || t.includes("entren")) return "🏎️";
    if (t.includes("paddock") || t.includes("box")) return "🛠️";

    return "📅";
  };

  return (
    <div className="events-app">

      <header className="events-header">
        <h1 className="events-title">Events del circuit</h1>
      </header>

      <main className="events-content">

        {/* CATEGORIES */}
        <section className="events-filters">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter((current) => current === c.id ? null : c.id)}
              className={`events-filter-btn ${c.color} ${
                filter === c.id ? "active" : ""
              }`}
            >
              <span className="events-filter-icon">{c.icon}</span>
              <span className="events-filter-text">{c.title}</span>
            </button>
          ))}
        </section>

        {/* EVENTS LIST */}
        {loading && <div className="events-state">Carregant events...</div>}
        {error && <div className="events-state events-state--error">{error}</div>}

        {!loading && !error && (
          <section className="events-list">
            {filteredEvents.length === 0 ? (
              <div className="events-state events-state--full">No hi ha events per aquest filtre.</div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  className="event-card"
                  key={event.id || event._id}
                  onClick={() => goToEvent(event.id || event._id)}
                  style={{ cursor: "pointer" }}
                >

                  {/* IMATGE */}
                  {event.imatge && (
                    <div className="event-image-wrapper">
                      <img
                        src={assetUrl(event.imatge)}
                        alt={event.nom}
                        className="event-image"
                      />
                    </div>
                  )}

                  <div className="event-main">

                    <div className="event-icon">
                      {getIcon(event.nom)}
                    </div>

                    <div className="event-body">
                      <h3 className="event-name">{event.nom}</h3>

                      <div className="event-details">
                        {event.descripcio && <p>📝 {event.descripcio}</p>}
                        {event.data && <p>📅 {event.data}</p>}
                        {(event.hora || event.horaInici) && (
                          <p>⏱️ {event.hora || event.horaInici}{event.horaFi ? ` - ${event.horaFi}` : ""}</p>
                        )}
                        {(event.zona || event.direccio) && <p>📍 {event.zona || event.direccio}</p>}
                      </div>
                    </div>

                  </div>

                  <span className="event-tag">
                    {event.categoria}
                  </span>

                  <div className="event-actions">
                    <button
                      className="event-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToEvent(event.id || event._id);
                      }}
                    >
                      Accedir
                    </button>
                  </div>

                </div>
              ))
            )}
          </section>
        )}

      </main>

      <Navbar />
    </div>
  );
}
