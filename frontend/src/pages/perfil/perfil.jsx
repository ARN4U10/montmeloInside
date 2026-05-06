import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/nav/nav.jsx";
import "./perfil.css";

const API_URL = "http://localhost:3001";

const menuItems = [
  { icon: "🏟️", label: "La meva grada" },
  { icon: "🎟️", label: "Entrades i esdeveniments" },
  { icon: "🔔", label: "Preferències de notificacions" },
  { icon: "🕓", label: "Historial de navegació" },
  { icon: "💬", label: "Ajuda i suport" },
  { icon: "📄", label: "Termes i condicions" },
];

const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const clearSession = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  localStorage.removeItem("guest");
};

const resolveImageSrc = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("blob:")) return value;
  if (value.startsWith("http")) return value;
  return `${API_URL}${value}`;
};

export default function Perfil() {
  const navigate = useNavigate();

  const [usuari, setUsuari] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const inputAvatarRef = useRef();
  const inputBannerRef = useRef();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = getToken();

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${API_URL}/api/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          console.log("ERROR PERFIL:", data);
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        setUsuari(data);

        setForm({
          nom_complet: data.nom_complet || "",
          username: data.username || "",
          bio: data.bio || "",
          telefon: data.telefon || "",
          imatge_perfil: data.imatge_perfil || "",
          imatge_coberta: data.imatge_coberta || "",
          data_naixement: data.data_naixement
            ? new Date(data.data_naixement).toISOString().split("T")[0]
            : "",
          notificacions: {
            email: data.notificacions?.email ?? true,
            push: data.notificacions?.push ?? true,
          },
        });
      } catch (err) {
        console.error(err);
        setUsuari(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [navigate]);

  const handleImatge = (key, file) => {
    if (!file) return;

    if (key === "imatge_perfil") setAvatarFile(file);
    if (key === "imatge_coberta") setBannerFile(file);

    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, [key]: url }));
  };

  const subirImagenes = async () => {
    const token = getToken();

    if (!token) {
      clearSession();
      navigate("/login", { replace: true });
      return;
    }

    const formData = new FormData();

    if (avatarFile) formData.append("avatar", avatarFile);
    if (bannerFile) formData.append("banner", bannerFile);

    if (!avatarFile && !bannerFile) return;

    const res = await fetch(`${API_URL}/api/perfil/imagen`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("ERROR PUJANT IMATGES:", data);
      return;
    }

    setUsuari(data);

    setForm((prev) => ({
      ...prev,
      imatge_perfil: data.imatge_perfil || prev.imatge_perfil,
      imatge_coberta: data.imatge_coberta || prev.imatge_coberta,
    }));

    setAvatarFile(null);
    setBannerFile(null);
  };

  const guardarEdicio = async () => {
    try {
      const token = getToken();

      if (!token) {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }

      const cleanForm = {
        nom_complet: form.nom_complet,
        username: form.username,
        bio: form.bio,
        telefon: form.telefon,
        data_naixement: form.data_naixement,
        notificacions: form.notificacions,
      };

      const res = await fetch(`${API_URL}/api/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanForm),
      });

      const actualitzat = await res.json();

      if (!res.ok) {
        console.log("ERROR GUARDANT PERFIL:", actualitzat);
        alert(actualitzat.message || "No s'ha pogut guardar el perfil");
        return;
      }

      setUsuari(actualitzat.usuari);

      if (avatarFile || bannerFile) {
        await subirImagenes();
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Error guardant el perfil");
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/images/logo.png" alt="logo" className="loading-logo" />
        <div className="loading-spinner" />
        <p className="loading-text">Carregant perfil...</p>
      </div>
    );
  }

  if (!usuari) {
    return <div className="mobile-screen">Error carregant perfil</div>;
  }

  return (
    <div className="mobile-screen profile-screen">
      <main className="profile-content">
        {/* HERO */}
        <div className="hero-block">
          <div
            className="banner-wrapper"
            onClick={() => inputBannerRef.current.click()}
          >
            {form.imatge_coberta ? (
              <img
                src={resolveImageSrc(
                  form.imatge_coberta,
                  "/images/default-banner.jpg"
                )}
                alt="coberta"
                className="banner-img"
              />
            ) : (
              <div className="banner-placeholder">
                <span>＋ Afegir portada</span>
              </div>
            )}

            <div className="banner-edit-badge">✎</div>
          </div>

          <input
            ref={inputBannerRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) =>
              handleImatge("imatge_coberta", e.target.files[0])
            }
          />

          <div
            className="avatar-overlap"
            onClick={() => inputAvatarRef.current.click()}
          >
            <div className="avatar">
              <img
                src={resolveImageSrc(
                  form.imatge_perfil,
                  "/images/default-user.jpg"
                )}
                alt="avatar"
              />
            </div>

            <div className="avatar-edit-badge">✎</div>
          </div>

          <input
            ref={inputAvatarRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) =>
              handleImatge("imatge_perfil", e.target.files[0])
            }
          />
        </div>

        {/* NOM I EMAIL */}
        <div className="profile-info">
          <h2 className="profile-name">
            {form.nom_complet || usuari.nom_complet}
          </h2>

          {form.username && (
            <p className="profile-username">@{form.username}</p>
          )}

          <p className="profile-email">{usuari.correu}</p>
        </div>

        {/* INFORMACIÓ PERSONAL */}
        <div className="card">
          <p className="card-title">Informació personal</p>

          <div className="fields-grid">
            <div className="edit-field">
              <label>Nom complet</label>
              <input
                value={form.nom_complet}
                onChange={(e) =>
                  setForm({ ...form, nom_complet: e.target.value })
                }
                placeholder="El teu nom"
              />
            </div>

            <div className="edit-field">
              <label>Nom d'usuari</label>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="@username"
              />
            </div>

            <div className="edit-field">
              <label>Telèfon</label>
              <input
                value={form.telefon}
                onChange={(e) =>
                  setForm({ ...form, telefon: e.target.value })
                }
                placeholder="+34 600 000 000"
              />
            </div>

            <div className="edit-field">
              <label>Data de naixement</label>
              <input
                type="date"
                value={form.data_naixement}
                onChange={(e) =>
                  setForm({ ...form, data_naixement: e.target.value })
                }
              />
            </div>
          </div>

          <div className="edit-field full">
            <label>
              Bio{" "}
              <span className="char-count">{(form.bio || "").length}/160</span>
            </label>

            <textarea
              maxLength={160}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Escriu alguna cosa sobre tu..."
            />
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
              <input
                type="checkbox"
                checked={form.notificacions?.email ?? true}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notificacions: {
                      ...form.notificacions,
                      email: e.target.checked,
                    },
                  })
                }
              />
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
              <input
                type="checkbox"
                checked={form.notificacions?.push ?? true}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notificacions: {
                      ...form.notificacions,
                      push: e.target.checked,
                    },
                  })
                }
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        <button
          className={`save-btn ${saved ? "save-btn--ok" : ""}`}
          onClick={guardarEdicio}
        >
          {saved ? "✓ Desat!" : "Desar canvis"}
        </button>

        {/* MENÚ */}
        <div className="profile-menu">
          {menuItems.map(({ icon, label }) => (
            <button key={label} className="profile-menu-item">
              <span className="menu-left">
                <span>{icon}</span>
                <span>{label}</span>
              </span>

              <span className="menu-arrow">›</span>
            </button>
          ))}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          TANCAR SESSIÓ
        </button>
      </main>

      <Navbar />
    </div>
  );
}