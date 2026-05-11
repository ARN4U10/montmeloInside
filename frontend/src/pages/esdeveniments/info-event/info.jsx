import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/nav/nav.jsx";
import "./info.css";

export default function EventInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/events/${id}`);
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error("Error carregant event:", err);
    }
  };

const joinEvent = async () => {
  try {
    const userId = localStorage.getItem("userId");

    if (!userId || userId === "undefined") {
      console.error("❌ No hi ha userId vàlid");
      alert("Has d’iniciar sessió per apuntar-te a l’event");
      return;
    }

    const res = await fetch(
      `http://localhost:3001/api/events/${id}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al join");
    }

    console.log("✅ Joined event correctament");
    fetchEvent(); // refresca dades
  } catch (err) {
    console.error("❌ Error joinEvent:", err.message);
  }
};

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (!event) {
    return <div className="eventinfo-loading">Carregant esdeveniment...</div>;
  }

  const placesRestants =
    event.numEntrades - (event.usuaris?.length || 0);

  return (
    <div className="eventinfo-app">

      {/* HERO */}
      {event.imatge && (
        <div className="eventinfo-hero">
          <img
            src={`http://localhost:3001${event.imatge}`}
            alt={event.nom}
          />
        </div>
      )}

      {/* CONTENT */}
      <div className="eventinfo-content">

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Tornar
        </button>

        <h1 className="eventinfo-title">{event.nom}</h1>

        <div className="eventinfo-price">
          💰 {event.preu} €
        </div>

        {/* INFO GRID */}
        <div className="info-grid">

          <div className="info-card">
            📅 {event.data || "Data no definida"}
          </div>

          <div className="info-card">
            📍 {event.direccio}
          </div>

          <div className="info-card">
            🎟️ {placesRestants} places
          </div>

          <div className="info-card highlight">
            🏁 {event.tipus || "Event"}
          </div>

        </div>

        {/* DESCRIPCIÓ */}
        <div className="eventinfo-box">
          <h3>Descripció</h3>
          <p>{event.descripcio}</p>
        </div>

        {/* UBICACIÓ */}
        {event.latitud && event.longitud && (
          <div className="eventinfo-box">
            <h3>Ubicació</h3>
            <p>📍 Lat: {event.latitud}</p>
            <p>📍 Lng: {event.longitud}</p>
          </div>
        )}

        {/* BOTÓ */}
        <button className="join-btn" onClick={joinEvent}>
          Inscriure’m a l’event
        </button>

      </div>

      <Navbar />
    </div>
  );
}