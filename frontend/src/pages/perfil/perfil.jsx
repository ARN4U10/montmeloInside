import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import "./perfil.css";

const API_URL = "http://localhost:3001";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const clearSession = () => {
  ["token", "user", "guest"].forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

const resolveImageSrc = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("blob:") || value.startsWith("http")) return value;
  return `${API_URL}${value}`;
};

export default function Perfil() {
  const navigate = useNavigate();

  const [usuari, setUsuari]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState({});
  const [saved, setSaved]           = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [events, setEvents]         = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [obert, setObert]           = useState(null); // "events" | "historial" | null

  const inputAvatarRef = useRef();
  const inputBannerRef = useRef();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = getToken();
        if (!token) { navigate("/login", { replace: true }); return; }

        const res = await fetch(`${API_URL}/api/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // fetch paral·lel events + historial
        fetch(`${API_URL}/api/perfil/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()).then(d => setEvents(d.events ?? [])).catch(() => {});

        fetch(`${API_URL}/api/perfil/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()).then(d => setHistorial(d.historial ?? [])).catch(() => {});

        if (res.status === 401) { clearSession(); navigate("/login", { replace: true }); return; }

        const data = await res.json();
        if (!res.ok) { clearSession(); navigate("/login", { replace: true }); return; }

        setUsuari(data);
        setForm({
          nom_complet:    data.nom_complet    || "",
          username:       data.username       || "",
          bio:            data.bio            || "",
          telefon:        data.telefon        || "",
          imatge_perfil:  data.imatge_perfil  || "",
          imatge_coberta: data.imatge_coberta || "",
          data_naixement: data.data_naixement
            ? new Date(data.data_naixement).toISOString().split("T")[0] : "",
          notificacions: {
            email: data.notificacions?.email ?? true,
            push:  data.notificacions?.push  ?? true,
          },
        });
      } catch (err) {
        console.error(err); setUsuari(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [navigate]);

  const handleImatge = (key, file) => {
    if (!file) return;
    if (key === "imatge_perfil")  setAvatarFile(file);
    if (key === "imatge_coberta") setBannerFile(file);
    setForm(f => ({ ...f, [key]: URL.createObjectURL(file) }));
  };

  const subirImagenes = async () => {
    const token = getToken();
    if (!token) { clearSession(); navigate("/login", { replace: true }); return; }
    if (!avatarFile && !bannerFile) return;
    const fd = new FormData();
    if (avatarFile) fd.append("avatar", avatarFile);
    if (bannerFile) fd.append("banner", bannerFile);
    const res  = await fetch(`${API_URL}/api/perfil/imagen`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd,
    });
    const data = await res.json();
    if (!res.ok) return;
    setUsuari(data);
    setForm(prev => ({
      ...prev,
      imatge_perfil:  data.imatge_perfil  || prev.imatge_perfil,
      imatge_coberta: data.imatge_coberta || prev.imatge_coberta,
    }));
    setAvatarFile(null); setBannerFile(null);
  };

  const guardarEdicio = async () => {
    try {
      const token = getToken();
      if (!token) { clearSession(); navigate("/login", { replace: true }); return; }
      const res = await fetch(`${API_URL}/api/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nom_complet: form.nom_complet, username: form.username,
          bio: form.bio, telefon: form.telefon,
          data_naixement: form.data_naixement, notificacions: form.notificacions,
        }),
      });
      const actualitzat = await res.json();
      if (!res.ok) { alert(actualitzat.message || "No s'ha pogut guardar el perfil"); return; }
      setUsuari(actualitzat.usuari);
      if (avatarFile || bannerFile) await subirImagenes();
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err); alert("Error guardant el perfil");
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const toggleObert = (key) => setObert(prev => prev === key ? null : key);

  if (loading) return (
    <div className="loading-screen">
      <img src="/images/logo.png" alt="logo" className="loading-logo" />
      <div className="loading-spinner" />
      <p className="loading-text">Carregant perfil...</p>
    </div>
  );

  if (!usuari) return <div className="mobile-screen">Error carregant perfil</div>;

  return (
    <div className="mobile-screen profile-screen">
      <main className="profile-content">

        {/* HERO */}
        <div className="hero-block">
          <div className="banner-wrapper" onClick={() => inputBannerRef.current.click()}>
            {form.imatge_coberta ? (
              <img src={resolveImageSrc(form.imatge_coberta, "/images/default-banner.jpg")}
                alt="coberta" className="banner-img" />
            ) : (
              <div className="banner-placeholder"><span>＋ Afegir portada</span></div>
            )}
            <div className="banner-edit-badge">✎</div>
          </div>
          <input ref={inputBannerRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleImatge("imatge_coberta", e.target.files[0])} />

          <div className="avatar-overlap" onClick={() => inputAvatarRef.current.click()}>
            <div className="avatar">
              <img src={resolveImageSrc(form.imatge_perfil, "/images/default-user.jpg")} alt="avatar" />
            </div>
            <div className="avatar-edit-badge">✎</div>
          </div>
          <input ref={inputAvatarRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleImatge("imatge_perfil", e.target.files[0])} />
        </div>

        {/* NOM I EMAIL */}
        <div className="profile-info">
          <h2 className="profile-name">{form.nom_complet || usuari.nom_complet}</h2>
          {form.username && <p className="profile-username">@{form.username}</p>}
          <p className="profile-email">{usuari.correu}</p>
        </div>

        {/* INFORMACIÓ PERSONAL */}
        <div className="card">
          <p className="card-title">Informació personal</p>
          <div className="fields-grid">
            <div className="edit-field">
              <label>Nom complet</label>
              <input value={form.nom_complet}
                onChange={e => setForm({ ...form, nom_complet: e.target.value })}
                placeholder="El teu nom" />
            </div>
            <div className="edit-field">
              <label>Nom d'usuari</label>
              <input value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="@username" />
            </div>
            <div className="edit-field">
              <label>Telèfon</label>
              <input value={form.telefon}
                onChange={e => setForm({ ...form, telefon: e.target.value })}
                placeholder="+34 600 000 000" />
            </div>
            <div className="edit-field">
              <label>Data de naixement</label>
              <input type="date" value={form.data_naixement}
                onChange={e => setForm({ ...form, data_naixement: e.target.value })} />
            </div>
          </div>
          <div className="edit-field full">
            <label>Bio <span className="char-count">{(form.bio || "").length}/160</span></label>
            <textarea maxLength={160} value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Escriu alguna cosa sobre tu..." />
          </div>
        </div>

        {/* NOTIFICACIONS */}
        <div className="card">
          <p className="card-title">Notificacions</p>
          <div className="toggle-row">
            <div className="toggle-info">
              <span>✉️</span>
              <div>
                <p className="toggle-label">Correu electrònic</p>
                <p className="toggle-sub">Rep alertes per email</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={form.notificacions?.email ?? true}
                onChange={e => setForm({ ...form, notificacions: { ...form.notificacions, email: e.target.checked } })} />
              <span className="slider" />
            </label>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <span>📲</span>
              <div>
                <p className="toggle-label">Notificacions push</p>
                <p className="toggle-sub">Alertes al dispositiu</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={form.notificacions?.push ?? true}
                onChange={e => setForm({ ...form, notificacions: { ...form.notificacions, push: e.target.checked } })} />
              <span className="slider" />
            </label>
          </div>
        </div>

        <button className={`save-btn ${saved ? "save-btn--ok" : ""}`} onClick={guardarEdicio}>
          {saved ? "✓ Desat!" : "Desar canvis"}
        </button>

        {/* MENÚ AMB ACORDIÓ */}
        <div className="profile-menu">

          {/* ── EVENTS ── */}
          <div className={`acord-item ${obert === "events" ? "acord-item--obert" : ""}`}>
            <button className="profile-menu-item" onClick={() => toggleObert("events")}>
              <span className="menu-left">
                <span>🏟️</span>
                <span>Els meus events</span>
              </span>
              <span className="menu-right">
                {events.length > 0 && <span className="menu-badge">{events.length}</span>}
                <span className={`menu-chevron ${obert === "events" ? "menu-chevron--obert" : ""}`}>›</span>
              </span>
            </button>

            {obert === "events" && (
              <div className="acord-body">
                {events.length === 0 ? (
                  <div className="acord-empty">
                    <span>🎟️</span><p>No estàs apuntat a cap event</p>
                  </div>
                ) : events.map(ev => (
                  <div key={ev._id} className="acord-event-card">
                    {ev.imatge && (
                      <img
                        src={ev.imatge.startsWith("http") ? ev.imatge : `${API_URL}${ev.imatge}`}
                        alt={ev.nom} className="acord-event-img" />
                    )}
                    <div className="acord-event-info">
                      <div className="acord-event-nom">{ev.nom}</div>
                      <div className="acord-event-meta">
                        {ev.data      && <span>📅 {ev.data}</span>}
                        {ev.horaInici && <span>🕐 {ev.horaInici}{ev.horaFi ? ` — ${ev.horaFi}` : ""}</span>}
                        {ev.direccio  && <span>📍 {ev.direccio}</span>}
                        {ev.preu !== undefined && (
                          <span>💶 {ev.preu === 0 ? "Gratuït" : `${ev.preu} €`}</span>
                        )}
                      </div>
                      <span className={`acord-estat acord-estat--${ev.estat?.replace("·", "")}`}>
                        {ev.estat}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── HISTORIAL ── */}
          <div className={`acord-item ${obert === "historial" ? "acord-item--obert" : ""}`}>
            <button className="profile-menu-item" onClick={() => toggleObert("historial")}>
              <span className="menu-left">
                <span>🕓</span>
                <span>Historial de navegació</span>
              </span>
              <span className="menu-right">
                {historial.length > 0 && <span className="menu-badge">{historial.length}</span>}
                <span className={`menu-chevron ${obert === "historial" ? "menu-chevron--obert" : ""}`}>›</span>
              </span>
            </button>

            {obert === "historial" && (
              <div className="acord-body">
                {historial.length === 0 ? (
                  <div className="acord-empty">
                    <span>🗺️</span><p>Cap cerca registrada encara</p>
                  </div>
                ) : historial.map((h, i) => (
                  <div key={i} className="acord-hist-row">
                    <span className="acord-hist-pin">📍</span>
                    <div>
                      <div className="acord-hist-lloc">{h.lloc}</div>
                      <div className="acord-hist-data">
                        {new Date(h.data).toLocaleString("ca-ES", {
                          day: "2-digit", month: "short",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ESTÀTICS ── */}
          <button className="profile-menu-item">
            <span className="menu-left"><span>💬</span><span>Ajuda i suport</span></span>
            <span className="menu-right"><span className="menu-chevron">›</span></span>
          </button>

          <button className="profile-menu-item">
            <span className="menu-left"><span>📄</span><span>Termes i condicions</span></span>
            <span className="menu-right"><span className="menu-chevron">›</span></span>
          </button>

        </div>

        <button className="logout-btn" onClick={handleLogout}>TANCAR SESSIÓ</button>
      </main>
      <Navbar />
    </div>
  );
}