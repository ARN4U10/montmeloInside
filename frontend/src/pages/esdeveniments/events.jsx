import { useEffect, useState } from "react";
import "./events.css";
import Navbar from "../components/nav/nav.jsx";

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

  const fetchEvents = async () => {
    const res = await fetch("http://localhost:3001/api/events");
    const data = await res.json();

    const normalized = data.map((item) => ({
      ...item,
      categoria: getCategory(item.nom, item.tipus),
    }));

    setEvents(normalized);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = filter
    ? events.filter((item) => item.categoria === filter)
    : events;
    console.log("IMATGE:", event.imatge);

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
              onClick={() => setFilter(c.id)}
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
        <section className="events-list">
            {filteredEvents.map((event) => (
            <div className="event-card" key={event.id}>

                {/* IMATGE */}
                {event.imatge && (
                <div className="event-image-wrapper">
                    <img
                    src={`http://localhost:3001${event.imatge}`}
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
                    {event.hora && <p>⏱️ {event.hora}</p>}
                    {event.zona && <p>📍 {event.zona}</p>}
                    </div>
                </div>

                </div>

                <span className="event-tag">
                {event.categoria}
                </span>

            </div>
            ))}

        </section>

      </main>

      <Navbar />
    </div>
  );
}