import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import { apiFetch, getStoredUser, isGuest } from "../../utils/api.js";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState("Tots");
  const [dynamicStatus, setDynamicStatus] = useState({
    ocupacio: "MITJANA",
    temperatura: 23,
    temps: "Assolellat",
    tempsIcon: "☀️",
    accessos: "Fluid",
    alertLevel: "INFO",
  });
  const [featuredServices, setFeaturedServices] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);

  const storedUser = getStoredUser();
  const guest = isGuest() || storedUser?.guest;
  const userName = guest ? "Convidat" : storedUser?.nom_complet || storedUser?.username || "User";

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const dynamicInterval = setInterval(() => {
      const ocupacions = ["BAIXA", "MITJANA", "ALTA"];
      const climes = [
        { text: "Assolellat", icon: "☀️" },
        { text: "Ennuvolat", icon: "⛅" },
        { text: "Vent moderat", icon: "💨" },
      ];
      const accessos = ["Fluid", "Amb cues", "Ràpid"];
      const alerts = ["INFO", "ATENCIÓ", "URGENT"];

      const climaRandom = climes[Math.floor(Math.random() * climes.length)];

      setDynamicStatus({
        ocupacio: ocupacions[Math.floor(Math.random() * ocupacions.length)],
        temperatura: Math.floor(Math.random() * 8) + 20,
        temps: climaRandom.text,
        tempsIcon: climaRandom.icon,
        accessos: accessos[Math.floor(Math.random() * accessos.length)],
        alertLevel: alerts[Math.floor(Math.random() * alerts.length)],
      });
    }, 12000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dynamicInterval);
    };
  }, []);

  const quickActions = [
    {
      id: 1,
      title: "Mapa en viu",
      subtitle: "Consulta el circuit en temps real",
      icon: "🗺️",
      color: "#e21212",
      action: () => navigate("/mapa"),
    },
    {
      id: 2,
      title: "Serveis propers",
      subtitle: "Lavabos, menjar i pàrquing",
      icon: "📍",
      color: "#4e78ac",
      action: () => navigate("/serveis"),
    },
    {
      id: 3,
      title: "Perfil",
      subtitle: "Edita preferències i dades",
      icon: "👤",
      color: "#28a745",
      action: () => navigate("/perfil"),
    },
    {
      id: 4,
      title: "Cercar destinació",
      subtitle: "Troba grades i zones",
      icon: "🎯",
      color: "#ff9800",
      action: () => navigate("/destinacio"),
    },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadDynamicHome = async () => {
      try {
        const [eventsRes, serveisRes] = await Promise.all([
          apiFetch("/events"),
          apiFetch("/serveis"),
        ]);
        const [eventsData, serveisData] = await Promise.all([
          eventsRes.json(),
          serveisRes.json(),
        ]);

        if (cancelled) return;

        if (eventsRes.ok) {
          const activeEvents = eventsData.filter((event) => event.estat !== "finalitzat");
          setNextEvent(activeEvents.find((event) => event.destacat) || activeEvents[0] || null);
        }

        if (serveisRes.ok) {
          setFeaturedServices(
            serveisData.slice(0, 4).map((servei) => ({
              id: servei.id,
              name: servei.nom,
              type: servei.tipus || "Servei",
              icon: servei.tipus === "Lavabos" ? "🚻" : servei.tipus === "Pàrquing" ? "🅿️" : "🍴",
              distance: servei.direccio || "Al circuit",
              crowd: servei.afluencia || "BAIXA",
              open: true,
              action: () => navigate("/mapa", {
                state: {
                  puntSeleccionat: {
                    ...servei,
                    label: servei.nom,
                    categoria: servei.tipus,
                  },
                },
              }),
            }))
          );
        }
      } catch {
        if (!cancelled) {
          setNextEvent(null);
          setFeaturedServices([]);
        }
      }
    };

    loadDynamicHome();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const liveAlerts = [
    {
      id: 1,
      title: "Alta ocupació a la zona paddock",
      subtitle: "Es recomana accedir per l'entrada est",
      icon: "🚨",
      level: "warning",
    },
    {
      id: 2,
      title: "Accés principal fluid",
      subtitle: "Temps d'entrada estimat: 4 min",
      icon: "✅",
      level: "success",
    },
    {
      id: 3,
      title: "Nou esdeveniment en 35 minuts",
      subtitle: "Formula 1 Qualifying a la pista principal",
      icon: "🏁",
      level: "info",
    },
  ];

  const recentActivity = [
    { id: 1, label: "Has consultat el mapa del circuit", time: "fa 4 min", icon: "🗺️" },
    { id: 2, label: "Has vist serveis propers", time: "fa 12 min", icon: "📍" },
    { id: 3, label: "Has accedit al teu perfil", time: "fa 25 min", icon: "👤" },
  ];

  const smartTips = [
    "Els lavabos de Tribuna G tenen menys afluència ara mateix.",
    "L'accés est és actualment el més ràpid per entrar al recinte.",
    "La zona de restauració central té activitat mitjana.",
  ];

  const filters = ["Tots", "Lavabos", "Restauració", "Pàrquing", "Informació"];

  const filteredServices = useMemo(() => {
    return featuredServices.filter((service) => {
      const matchesFilter =
        selectedFilter === "Tots" || service.type === selectedFilter;
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.type.toLowerCase().includes(searchQuery.toLowerCase());

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
    dynamicStatus.ocupacio === "BAIXA"
      ? "status-pill status-low"
      : dynamicStatus.ocupacio === "MITJANA"
      ? "status-pill status-medium"
      : "status-pill status-high";

  return (
    <div className="home-screen">
      <section className="home-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-top-row">
            <div>
              <div className="hero-brand">
                <img src="/images/logo-circuit.png" alt="Circuit de Barcelona-Catalunya" />
              </div>
              <p className="hero-greeting">
                {greetingByHour()}, {userName} 👋
              </p>
              <h1 className="hero-title">Benvingut a MontmeloInside</h1>
              <p className="hero-subtitle">
                Gestiona la teva experiència al circuit amb informació útil,
                rutes ràpides i serveis en temps real.
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
            </div>
          </div>

          <div className="hero-search-box">
            <input
              type="text"
              placeholder="Cerca serveis, zones, grades o destinacions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button className="hero-search-btn" onClick={() => navigate("/destinacio")}>
              🔍
            </button>
          </div>

          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <span className="hero-stat-icon">👥</span>
              <div>
                <p>Ocupació general</p>
                <strong className={occupancyClass}>{dynamicStatus.ocupacio}</strong>
              </div>
            </div>

            <div className="hero-stat-card">
              <span className="hero-stat-icon">{dynamicStatus.tempsIcon}</span>
              <div>
                <p>Meteo</p>
                <strong>
                  {dynamicStatus.temperatura}º · {dynamicStatus.temps}
                </strong>
              </div>
            </div>

            <div className="hero-stat-card">
              <span className="hero-stat-icon">🚪</span>
              <div>
                <p>Accessos</p>
                <strong>{dynamicStatus.accessos}</strong>
              </div>
            </div>

            <div className="hero-stat-card">
              <span className="hero-stat-icon">📢</span>
              <div>
                <p>Nivell d’alerta</p>
                <strong>{dynamicStatus.alertLevel}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="home-content">
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
                style={{ borderTop: `4px solid ${item.color}` }}
              >
                <div
                  className="quick-action-icon"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
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
              <p className="section-kicker">Esdeveniment destacat</p>
              <h2 className="section-title">Pròxima activitat</h2>
            </div>
            <button className="ghost-btn" onClick={() => navigate("/mapa")}>
              Veure circuit
            </button>
          </div>

          {nextEvent ? (
            <div className="event-card">
              <div className="event-left">
                <div className="event-badge">🏁 {nextEvent.categoria || nextEvent.tipus || "Motor"}</div>
                <h3>{nextEvent.nom}</h3>
                <p className="event-place">{nextEvent.direccio || "Circuit de Barcelona-Catalunya"}</p>
                <div className="event-meta">
                  <span>⏰ {nextEvent.horaInici || "Hora pendent"}{nextEvent.horaFi ? ` - ${nextEvent.horaFi}` : ""}</span>
                  <span>🎟️ {nextEvent.placesRestants ?? nextEvent.numEntrades ?? 0} places</span>
                </div>
              </div>

              <div className="event-right">
                <span className="event-status">{nextEvent.estat || "Actiu"}</span>
                <button className="primary-btn" onClick={() => navigate(`/events/${nextEvent.id}`)}>
                  Veure event
                </button>
              </div>
            </div>
          ) : (
            <div className="event-card">
              <div className="event-left">
                <div className="event-badge">🏁 Events</div>
                <h3>Cap activitat destacada</h3>
                <p className="event-place">Quan hi hagi events actius apareixeran aquí.</p>
              </div>
              <div className="event-right">
                <button className="primary-btn" onClick={() => navigate("/events")}>
                  Veure events
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="section-block">
          <div className="section-header">
            <div>
              <p className="section-kicker">Informació útil</p>
              <h2 className="section-title">Alertes en viu</h2>
            </div>
          </div>

          <div className="alerts-list">
            {liveAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card alert-${alert.level}`}>
                <div className="alert-icon">{alert.icon}</div>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-header">
            <div>
              <p className="section-kicker">Assistència ràpida</p>
              <h2 className="section-title">Serveis recomanats</h2>
            </div>
            <button className="ghost-btn" onClick={() => navigate("/serveis")}>
              Veure tot
            </button>
          </div>

          <div className="filters-row">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-chip ${selectedFilter === filter ? "active" : ""}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="services-list">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div key={service.id} className="service-card-pro">
                  <div className="service-card-left">
                    <div className="service-main-icon">{service.icon}</div>
                    <div className="service-main-info">
                      <h3>{service.name}</h3>
                      <p>
                        {service.type} · {service.distance}
                      </p>
                      <div className="service-tags-row">
                        <span className={getCrowdClass(service.crowd)}>
                          {service.crowd}
                        </span>
                        <span className="mini-tag">
                          {service.open ? "OBERT" : "TANCAT"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="mini-action-btn" onClick={service.action}>
                    Veure
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-search-card">
                <span>🔎</span>
                <p>No hi ha serveis que coincideixin amb aquesta cerca.</p>
              </div>
            )}
          </div>
        </section>

        <section className="double-grid">
          <div className="section-block compact-card">
            <div className="section-header">
              <div>
                <p className="section-kicker">Consells intel·ligents</p>
                <h2 className="section-title">Recomanacions</h2>
              </div>
            </div>

            <div className="tips-list">
              {smartTips.map((tip, index) => (
                <div className="tip-item" key={index}>
                  <span className="tip-dot">💡</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-block compact-card">
            <div className="section-header">
              <div>
                <p className="section-kicker">Historial</p>
                <h2 className="section-title">Activitat recent</h2>
              </div>
            </div>

            <div className="recent-list">
              {recentActivity.map((item) => (
                <div key={item.id} className="recent-item">
                  <div className="recent-icon">{item.icon}</div>
                  <div className="recent-info">
                    <h4>{item.label}</h4>
                    <p>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block cta-panel">
          <div className="cta-content">
            <div>
              <p className="section-kicker">{guest ? "Guarda la teva experiència" : "Preparat per moure’t?"}</p>
              <h2 className="section-title">
                {guest ? "Crea un compte per guardar preferits i inscripcions" : "Obre el mapa i troba la millor ruta"}
              </h2>
              <p className="cta-description">
                {guest
                  ? "Pots continuar explorant com a convidat, però iniciar sessió et permet apuntar-te a events i desar llocs."
                  : "Consulta accessos, zones amb menys afluència i serveis disponibles al moment per arribar més ràpid on vulguis anar."}
              </p>
            </div>

            <div className="cta-actions">
              <button className="primary-btn" onClick={() => navigate(guest ? "/regist" : "/mapa")}>
                {guest ? "Registrar-se" : "Obrir mapa"}
              </button>
              <button className="secondary-btn" onClick={() => navigate(guest ? "/login" : "/destinacio")}>
                {guest ? "Iniciar sessió" : "Buscar destinació"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Navbar />
    </div>
  );
};

export default Home;
