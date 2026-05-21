import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import { apiFetch } from "../../utils/api.js";
import "./home.css";

const DEFAULT_STATUS = {
  occupancy: "BAIXA",
  access: "Fluids",
  alertLevel: "NORMAL",
};

const DEFAULT_COUNTERS = {
  locationsTotal: 0,
  servicesTotal: 0,
  eventsActive: 0,
};

const filters = ["Tots", "Lavabos", "Restauració", "Pàrquing", "Informació"];

const getStoredUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const servicesRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState("Tots");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  const user = useMemo(() => getStoredUser(), []);
  const isGuest = localStorage.getItem("guest") === "true";

  const fetchEvents = useCallback(async () => {
    try {
      const res = await apiFetch("/events");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error carregant events");
      }

      setEvents(data);
    } catch (err) {
      console.error("Error carregant events:", err);
      setEvents([]);
    }
  }, []);

  const upcomingEvents = useMemo(() => {
    if (!events.length) return [];

    const now = new Date();

    return events
      .map((e) => {
        const dateTimeString =
          e.data && e.horaInici
            ? `${e.data} ${e.horaInici}`
            : e.data;

        return {
          ...e,
          dateObj: new Date(dateTimeString),
        };
      })
      .filter((e) => !isNaN(e.dateObj) && e.dateObj >= now)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 2);
  }, [events]);

  const userName =
    user?.nom_complet?.trim()?.split(" ")?.[0] ||
    (isGuest ? "Convidat" : "Usuari");

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await apiFetch("/home/dashboard");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "No s'ha pogut carregar la home"
        );
      }

      setDashboard(data);
    } catch (err) {
      console.error("Error carregant dashboard home:", err);
      setError(
        err.message || "Error carregant la informació de la home"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchEvents();

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const refreshInterval = setInterval(() => {
      fetchDashboard({ silent: true });
    }, 60000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchDashboard, fetchEvents]);

  const status = dashboard?.status || DEFAULT_STATUS;
  const counters = dashboard?.counters || DEFAULT_COUNTERS;
  const nextEvent = dashboard?.nextEvent || null;
  const featuredServices = dashboard?.services || [];
  const liveAlerts = dashboard?.alerts || [];
  const smartTips = dashboard?.tips || [];

  const circuitHighlights = useMemo(
    () => [
      {
        id: "locations",
        label: "Ubicacions indexades",
        value: `${counters.locationsTotal || 0} punts`,
        icon: "📍",
      },
      {
        id: "services",
        label: "Serveis recomanats",
        value: `${counters.servicesTotal || 0} destacats`,
        icon: "🧭",
      },
      {
        id: "events",
        label: "Esdeveniments actius",
        value: `${counters.eventsActive || 0} disponibles`,
        icon: "🏁",
      },
    ],
    [counters]
  );

  const quickActions = useMemo(
    () => [
      {
        id: 1,
        title: "Mapa en viu",
        subtitle: "Consulta el circuit i les rutes",
        icon: "🗺️",
        color: "#e21212",
        action: () => navigate("/mapa"),
      },
      {
        id: 2,
        title: "Serveis propers",
        subtitle: "Lavabos, menjar i pàrquings",
        icon: "📍",
        color: "#4e78ac",
        action: () => navigate("/serveis"),
      },
      {
        id: 3,
        title: isGuest ? "Perfil convidat" : "Perfil",
        subtitle: isGuest
          ? "Registra't per personalitzar l'experiència"
          : "Edita dades i preferències",
        icon: "👤",
        color: "#28a745",
        action: () =>
          navigate(isGuest ? "/perfil-convidat" : "/perfil"),
      },
      {
        id: 4,
        title: "Cercar destinació",
        subtitle: "Troba grades, serveis i accessos",
        icon: "🎯",
        color: "#ff9800",
        action: () => navigate("/destinacio"),
      },
    ],
    [isGuest, navigate]
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return featuredServices.filter((service) => {
      const matchesFilter =
        selectedFilter === "Tots" ||
        service.type === selectedFilter;

      const matchesSearch =
        !normalizedQuery ||
        service.name?.toLowerCase().includes(normalizedQuery) ||
        service.type?.toLowerCase().includes(normalizedQuery) ||
        service.subtitle?.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [featuredServices, searchQuery, selectedFilter]);

  const getCrowdClass = (crowd) => {
    if (crowd === "BAIXA") return "crowd-badge baixa";
    if (crowd === "MITJANA") return "crowd-badge mitjana";
    return "crowd-badge alta";
  };

  const greetingByHour = () => {
    const hour = currentTime.getHours();

    if (hour < 12) return "Bon dia";
    if (hour < 19) return "Bona tarda";

    return "Bona nit";
  };

  const occupancyClass =
    status.occupancy === "BAIXA"
      ? "status-pill status-low"
      : status.occupancy === "MITJANA"
        ? "status-pill status-medium"
        : "status-pill status-high";

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      servicesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    navigate("/destinacio");
  };

  const goToServiceMap = (service) => {
    navigate("/mapa", {
      state: {
        puntSeleccionat: {
          id: service.id,
          _id: service._id || service.id,
          label: service.name,
          sublabel: service.subtitle,
          lat: service.lat,
          lng: service.lng,
          categoria: service.categoryKey || "info",
        },
      },
    });
  };

  const goToEventMap = () => {
    if (!nextEvent?.lat || !nextEvent?.lng) {
      navigate("/events");
      return;
    }

    navigate("/mapa", {
      state: {
        puntSeleccionat: {
          label: nextEvent.title,
          sublabel: nextEvent.place,
          lat: nextEvent.lat,
          lng: nextEvent.lng,
          categoria: "info",
        },
      },
    });
  };

  return (
    <div className="home-screen">
      <div className="home-content">
        <section className="home-hero">
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="hero-top-row">
              <div>
                <p className="hero-greeting">
                  {greetingByHour()}, {userName} 👋
                </p>

                <h1 className="hero-title">
                  Benvingut a MontmeloInside
                </h1>

                <p className="hero-subtitle">
                  Una home connectada al backend amb esdeveniments,
                  serveis i estat del circuit actualitzats.
                </p>
              </div>

              <div className="hero-clock-card">
                <span className="hero-clock-label">Ara mateix</span>

                <strong>
                  {currentTime.toLocaleTimeString("ca-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>

                <small>
                  {currentTime.toLocaleDateString("ca-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </small>

                <button
                  className="hero-refresh-btn"
                  type="button"
                  onClick={() =>
                    fetchDashboard({ silent: true })
                  }
                  disabled={refreshing}
                >
                  {refreshing ? "Actualitzant..." : "↻ Actualitzar"}
                </button>
              </div>
            </div>

            <div className="hero-search-box">
              <input
                type="text"
                placeholder="Cerca serveis destacats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                className="hero-search-input"
              />

              <button
                className="hero-search-btn"
                onClick={handleSearchSubmit}
                type="button"
              >
                🔍
              </button>
            </div>

            <div className="hero-stats-grid">
              <div className="hero-stat-card">
                <span className="hero-stat-icon">👥</span>
                <div>
                  <p>Ocupació general</p>
                  <strong className={occupancyClass}>
                    {status.occupancy}
                  </strong>
                </div>
              </div>

              <div className="hero-stat-card">
                <span className="hero-stat-icon">🏁</span>
                <div>
                  <p>Events actius</p>
                  <strong>{counters.eventsActive || 0}</strong>
                </div>
              </div>

              <div className="hero-stat-card">
                <span className="hero-stat-icon">📍</span>
                <div>
                  <p>Serveis destacats</p>
                  <strong>{counters.servicesTotal || 0}</strong>
                </div>
              </div>

              <div className="hero-stat-card">
                <span className="hero-stat-icon">🚪</span>
                <div>
                  <p>Accessos</p>
                  <strong>{status.access}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="home-content">
          {error && (
            <section className="section-block home-error-card">
              <div>
                <p className="section-kicker">Connexió</p>
                <h2 className="section-title">
                  No s'ha pogut actualitzar la home
                </h2>
                <p className="home-error-text">{error}</p>
              </div>

              <button
                className="primary-btn"
                type="button"
                onClick={() => fetchDashboard()}
              >
                Reintentar
              </button>
            </section>
          )}

          {isGuest && (
            <section className="section-block guest-home-banner">
              <div>
                <p className="section-kicker">Mode convidat</p>
                <h2 className="section-title">
                  Explora-ho tot i registra't quan vulguis
                </h2>
                <p className="guest-home-copy">
                  Pots consultar mapa, serveis i esdeveniments.
                  Per guardar preferències i veure el perfil complet,
                  crea un compte.
                </p>
              </div>

              <button
                className="primary-btn"
                type="button"
                onClick={() => navigate("/regist")}
              >
                Crear compte
              </button>
            </section>
          )}

          <section className="section-block">
            <div className="section-header">
              <div>
                <p className="section-kicker">Accés ràpid</p>
                <h2 className="section-title">Explora l’app</h2>
              </div>
            </div>

            <div className="quick-actions-grid">
              {quickActions.map((item) => (
                <button
                  key={item.id}
                  className="quick-action-card"
                  onClick={item.action}
                  style={{
                    borderTop: `4px solid ${item.color}`,
                  }}
                  type="button"
                >
                  <div
                    className="quick-action-icon"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div className="quick-action-text">
                    <h3>{item.title}</h3>
                    <p>{item.subtitle}</p>
                  </div>

                  <span className="quick-action-arrow">›</span>
                </button>
              ))}
            </div>
          </section>

          <section className="section-block highlighted-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">
                  Esdeveniment destacat
                </p>
                <h2 className="section-title">
                  Pròxima activitat
                </h2>
              </div>

              <button
                className="ghost-btn"
                onClick={() => navigate("/events")}
                type="button"
              >
                Veure events
              </button>
            </div>

            {loading ? (
              <div className="home-loading-card home-loading-dark">
                Carregant esdeveniments...
              </div>
            ) : upcomingEvents.length ? (
              <div className="events-stack">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="event-card">
                    <div className="event-left">
                      {ev.image && (
                        <div className="event-image">
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="event-img"
                          />
                        </div>
                      )}

                      <div className="event-badge">
                        🏁 {ev.nom}
                      </div>

                      <h3>{ev.title}</h3>
                      <p className="event-place">{ev.place}</p>

                      <div className="event-meta">
                        <span>📅 {ev.data || "Data pendent"}</span>

                        <span>
                          ⏰ {ev.horaInici}
                          {ev.horaFi ? ` - ${ev.horaFi}` : ""}
                        </span>

                        {ev.zona && (
                          <span>📍 {ev.zona}</span>
                        )}

                        {ev.direccio && !ev.zona && (
                          <span>📍 {ev.direccio}</span>
                        )}

                        {ev.spectators && (
                          <span>🎟️ {ev.spectators}</span>
                        )}

                        {ev.tipus && (
                          <span>🏷️ {ev.tipus}</span>
                        )}
                      </div>
                    </div>

                    <div className="event-right">
                      <span className="event-status">{ev.status}</span>

                      <div className="event-actions-stack">
                        <button
                          className="primary-btn"
                          onClick={() => navigate(`/events/${ev.id}`)}
                          type="button"
                        >
                          Detalls
                        </button>

                        <button
                          className="secondary-btn event-secondary-dark"
                          onClick={() => {
                            if (ev.lat && ev.lng) {
                              navigate("/mapa", {
                                state: {
                                  puntSeleccionat: {
                                    label: ev.title,
                                    sublabel: ev.place,
                                    lat: ev.lat,
                                    lng: ev.lng,
                                    categoria: "info",
                                  },
                                },
                              });
                            } else {
                              navigate("/events");
                            }
                          }}
                          type="button"
                        >
                          Veure al mapa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-loading-card home-loading-dark">
                No hi ha esdeveniments propers.
              </div>
            )}
          </section>

          <section className="section-block">
            <div className="section-header">
              <div>
                <p className="section-kicker">Informació útil</p>
                <h2 className="section-title">
                  Alertes i estat del circuit
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="home-loading-card">
                Carregant alertes...
              </div>
            ) : (
              <div className="alerts-list">
                {liveAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-card alert-${alert.level}`}
                  >
                    <div className="alert-icon">{alert.icon}</div>

                    <div className="alert-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            className="section-block"
            ref={servicesRef}
          >
            <div className="section-header">
              <div>
                <p className="section-kicker">
                  Assistència ràpida
                </p>
                <h2 className="section-title">
                  Serveis recomanats
                </h2>
              </div>

              <button
                className="ghost-btn"
                onClick={() => navigate("/serveis")}
                type="button"
              >
                Veure tot
              </button>
            </div>

            <div className="filters-row">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`filter-chip ${
                    selectedFilter === filter ? "active" : ""
                  }`}
                  onClick={() => setSelectedFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="home-loading-card">
                Carregant serveis del backend...
              </div>
            ) : (
              <div className="services-list">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="service-card-pro"
                    >
                      <div className="service-card-left">
                        <div className="service-main-icon">
                          {service.icon}
                        </div>

                        <div className="service-main-info">
                          <h3>{service.name}</h3>

                          <p>
                            {service.type} · {service.distance}
                          </p>

                          <div className="service-tags-row">
                            <span
                              className={getCrowdClass(service.crowd)}
                            >
                              {service.crowd}
                            </span>

                            <span className="mini-tag">
                              {service.open ? "OBERT" : "TANCAT"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="mini-action-btn"
                        onClick={() => goToServiceMap(service)}
                        type="button"
                      >
                        Veure al mapa
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-search-card">
                    <span>🔎</span>
                    <p>
                      No hi ha serveis que coincideixin amb aquesta
                      cerca.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="double-grid">
            <div className="section-block compact-card">
              <div className="section-header">
                <div>
                  <p className="section-kicker">
                    Consells intel·ligents
                  </p>
                  <h2 className="section-title">Recomanacions</h2>
                </div>
              </div>

              <div className="tips-list">
                {(smartTips.length
                  ? smartTips
                  : ["Carregant recomanacions..."]
                ).map((tip, index) => (
                  <div
                    className="tip-item"
                    key={`${tip}-${index}`}
                  >
                    <span className="tip-dot">💡</span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-block compact-card">
              <div className="section-header">
                <div>
                  <p className="section-kicker">
                    Resum del panell
                  </p>
                  <h2 className="section-title">
                    Dades del circuit
                  </h2>
                </div>
              </div>

              <div className="recent-list">
                {circuitHighlights.map((item) => (
                  <div
                    key={item.id}
                    className="recent-item"
                  >
                    <div className="recent-icon">{item.icon}</div>

                    <div className="recent-info">
                      <h4>{item.label}</h4>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section-block cta-panel">
            <div className="cta-content">
              <div>
                <p className="section-kicker">
                  Preparat per moure’t?
                </p>

                <h2 className="section-title">
                  Obre el mapa i troba la millor ruta
                </h2>

                <p className="cta-description">
                  Consulta accessos, serveis i destinacions amb dades
                  compartides entre backend i mapa.
                </p>
              </div>

              <div className="cta-actions">
                <button
                  className="primary-btn"
                  onClick={() => navigate("/mapa")}
                  type="button"
                >
                  Obrir mapa
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => navigate("/destinacio")}
                  type="button"
                >
                  Buscar destinació
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Navbar showCircuitLogo />
    </div>
  );
};

export default Home;
