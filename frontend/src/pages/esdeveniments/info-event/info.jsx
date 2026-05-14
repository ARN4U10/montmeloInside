import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/nav/nav.jsx";
import { apiFetch, assetUrl, getStoredUser, getToken, isGuest } from "../../../utils/api.js";
import "./info.css";

export default function EventInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id || currentUser?._id || localStorage.getItem("userId");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await apiFetch(`/events/${id}`);
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error("Error carregant event:", err);
    }
  }, [id]);

const joinEvent = async () => {
  setMessage("");

  if (isGuest() || !getToken()) {
    setMessage("Inicia sessió per inscriure't a l'event.");
    return;
  }

  try {
    setJoining(true);

    const res = await apiFetch(`/events/${id}/join`, {
      method: "POST",
      auth: true,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al join");
    }

    setEvent(data.event || data);
    setMessage(data.message || "Inscripció feta correctament.");
  } catch (err) {
    setMessage(err.message);
  } finally {
    setJoining(false);
  }
};

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (!event) {
    return <div className="eventinfo-loading">Carregant esdeveniment...</div>;
  }

  const placesRestants =
    event.placesRestants ?? event.numEntrades - (event.usuaris?.length || 0);
  const inscrit = event.inscrit || event.usuaris?.some((userId) => String(userId) === String(currentUserId));

  return (
    <div className="eventinfo-app">

      {/* HERO */}
      {event.imatge && (
        <div className="eventinfo-hero">
          <img
            src={assetUrl(event.imatge)}
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
        {message && <div className="eventinfo-message">{message}</div>}
        <button className="join-btn" onClick={joinEvent} disabled={joining || inscrit}>
          {inscrit ? "Ja estàs inscrit" : joining ? "Inscrivint..." : "Inscriure’m a l’event"}
        </button>

      </div>

      <Navbar />
    </div>
  );
}
