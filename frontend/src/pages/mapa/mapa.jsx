import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapa.css";
import Navbar from "../components/nav/nav.jsx";



// ── Icones SVG per categoria ──────────────────────────────────────────────
const ICONS_SVG = {
  tribune: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10l8-7 8 7v10"/><path d="M10 20v-5h4v5"/></svg>`,
  zone:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  facility:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  paddock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14l2 4v6a2 2 0 0 1-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  parking: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  access:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  medical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  food:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  merch:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  heli:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M12 3v18M5 5l14 14M19 5L5 19"/></svg>`,
  bus:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  wc:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="4" r="2"/><circle cx="15" cy="4" r="2"/><path d="M6 20v-6H4l2-6h6l2 6h-2v6"/><path d="M18 20v-6l-2-6h4l2 6h-2v6"/></svg>`,
};

const CAT_META = {
  tribune:  { color: "#534AB7", label: "Tribunes",           iconKey: "tribune"  },
  zone:     { color: "#3B6D11", label: "Zones",              iconKey: "zone"     },
  paddock:  { color: "#185FA5", label: "Paddock / Pits / VIP", iconKey: "paddock" },
  facility: { color: "#185FA5", label: "Instal·lacions",     iconKey: "facility" },
  parking:  { color: "#5F5E5A", label: "Pàrquings",          iconKey: "parking"  },
  access:   { color: "#993C1D", label: "Accessos / Portes",  iconKey: "access"   },
  medical:  { color: "#E24B4A", label: "Creu Roja / Serveis mèdics", iconKey: "medical" },
  info:     { color: "#1D9E75", label: "Informació",         iconKey: "info"     },
  food:     { color: "#BA7517", label: "Restauració",        iconKey: "food"     },
  merch:    { color: "#854F0B", label: "Merchandising",      iconKey: "merch"    },
  heli:     { color: "#378ADD", label: "Heliport",           iconKey: "heli"     },
  bus:      { color: "#639922", label: "Transport públic",   iconKey: "bus"      },
  wc:       { color: "#888780", label: "WC",                 iconKey: "wc"       },
};



const MAP_CENTER = [41.5705, 2.2615];

// ── Genera icona Leaflet per categoria ───────────────────────────────────
const makeCatIcon = (cat, actiu = false) => {
  const meta = CAT_META[cat] || CAT_META.facility;
  const color = actiu ? "#e63946" : meta.color;
  const svgIcon = ICONS_SVG[meta.iconKey] || ICONS_SVG.facility;
  const size = actiu ? 38 : 32;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      transition:transform .2s;transform:${actiu ? "scale(1.15)" : "scale(1)"};
    ">
      <div style="width:${size * 0.55}px;height:${size * 0.55}px;display:flex;align-items:center;justify-content:center;">
        ${svgIcon}
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
};

const iconUser = L.divIcon({
  className: "",
  html: `<div class="user-dot">
    <div class="user-dot-ring"></div>
    <div class="user-dot-core"></div>
  </div>`,
  iconSize: [26, 26], iconAnchor: [13, 13],
});

// ── Helpers ───────────────────────────────────────────────────────────────
function decodePolyline(encoded) {
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  while (index < encoded.length) {
    let shift = 0, result = 0, b;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

const distKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371, r = d => d * Math.PI / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatMin = (seg) => {
  const m = Math.round(seg / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target.center, target.zoom, { duration: 1.1 }); }, [target]);
  return null;
}

function FitRuta({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (puntos?.length > 1) map.fitBounds(L.latLngBounds(puntos), { padding: [80, 50], animate: true });
  }, [puntos]);
  return null;
}

function MapRef({ onMap }) {
  const map = useMap();
  useEffect(() => { onMap(map); }, []);
  return null;
}

// ── Llegenda ──────────────────────────────────────────────────────────────
function Llegenda({ hidden, onToggle }) {
  return (
    <div className="mc-llegenda">
      {Object.entries(CAT_META).map(([key, meta]) => (
        <button
          key={key}
          className={`mc-leg-btn ${hidden.has(key) ? "mc-leg-btn--off" : ""}`}
          onClick={() => onToggle(key)}
          title={meta.label}
        >
          <span
            className="mc-leg-dot"
            style={{ background: meta.color }}
            dangerouslySetInnerHTML={{ __html: `<div style="width:10px;height:10px">${ICONS_SVG[meta.iconKey]}</div>` }}
          />
          <span className="mc-leg-label">{meta.label}</span>
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function MapaCircuit() {
  const [geoStatus, setGeoStatus]     = useState("idle");
  const [userPos, setUserPos]         = useState(null);
  const [puntSel, setPuntSel]         = useState(null);
  const [flyTarget, setFlyTarget]     = useState(null);
  const [rutaPuntos, setRutaPuntos]   = useState(null);
  const [rutaInfo, setRutaInfo]       = useState(null);
  const [rutaLoading, setRutaLoading] = useState(false);
  const [fitRuta, setFitRuta]         = useState(null);
  const [mapInst, setMapInst]         = useState(null);
  const [hiddenCats, setHiddenCats]   = useState(new Set());
  const [sheet, setSheet]             = useState("mid");
  const [showLlegenda, setShowLlegenda] = useState(false);
  const sheetRef                      = useRef(null);
  const dragStart                     = useRef(null);
  const [punts, setPunts] = useState([]);


  useEffect(() => {
  const fetchPunts = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/ubicacions");
      const data = await res.json();
      setPunts(data);
    } catch (err) {
      console.error("Error cargando ubicacions:", err);
    }
  };

  fetchPunts();
}, []);


  const toggleCat = (cat) => {
    setHiddenCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // ── Geo ──────────────────────────────────────────────────────────────────
  const demanarUbicacio = () => {
    if (!navigator.geolocation) { setGeoStatus("unavailable"); return; }
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      pos => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setGeoStatus("granted"); },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };
  useEffect(() => { demanarUbicacio(); }, []);

  // ── Ruta ─────────────────────────────────────────────────────────────────
  const calcularRuta = async () => {
    if (!userPos || !puntSel) return;
    setRutaLoading(true); setRutaPuntos(null); setRutaInfo(null);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${puntSel.lng},${puntSel.lat}?overview=full&geometries=polyline`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code !== "Ok") throw new Error();
      const route = data.routes[0];
      const pts = decodePolyline(route.geometry);
      setRutaPuntos(pts);
      setRutaInfo({ distancia: (route.distance / 1000).toFixed(1), temps: formatMin(route.duration) });
      setFitRuta(pts);
    } catch { setRutaInfo({ error: true }); }
    finally { setRutaLoading(false); }
  };

  const selPunt = (punt) => {
    setPuntSel(punt);
    setRutaPuntos(null); setRutaInfo(null); setFitRuta(null);
    setFlyTarget({ center: [punt.lat, punt.lng], zoom: 17 });
    setSheet("mid");
  };

  // ── Sheet drag ────────────────────────────────────────────────────────────
  const onDragStart = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { y, sheet };
  };
  const onDragEnd = (e) => {
    if (!dragStart.current) return;
    const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const delta = y - dragStart.current.y;
    if (delta < -40)      setSheet("full");
    else if (delta > 40)  setSheet(sheet === "full" ? "mid" : "collapsed");
    dragStart.current = null;
  };

  const distPuntSel = userPos && puntSel
    ? distKm(userPos[0], userPos[1], puntSel.lat, puntSel.lng).toFixed(1)
    : null;

  // ── Loading screens ───────────────────────────────────────────────────────
  if (geoStatus === "idle" || geoStatus === "requesting") {
    return (
      <div className="mc-page geo-screen">
        <div className="geo-anim">
          {[1,2,3].map(i => <div key={i} className={`geo-ring gr-${i}`} />)}
          <div className="geo-icon">📍</div>
        </div>
        <p className="geo-title">Obtenint ubicació…</p>
        <p className="geo-sub">El navegador pot demanar permís</p>
      </div>
    );
  }

  if (geoStatus === "denied" || geoStatus === "unavailable") {
    return (
      <div className="mc-page geo-screen">
        <div style={{ fontSize: 52, marginBottom: 8 }}>🚫</div>
        <p className="geo-title">Ubicació no disponible</p>
        <p className="geo-sub">Activa-la des del navegador</p>
        <div className="geo-btns">
          {geoStatus === "denied" && <button className="geo-btn-red" onClick={demanarUbicacio}>Tornar a intentar</button>}
          <button className="geo-btn-ghost" onClick={() => setGeoStatus("granted")}>Continuar sense ubicació</button>
        </div>
      </div>
    );
  }

  const SHEET_H = { collapsed: 88, mid: puntSel ? 240 : 120, full: 520 };

  return (
    <div className="mc-page">

      <header className="mc-header">
        <div className="mc-header-row">
          <button className="mc-menu-btn" onClick={() => setShowLlegenda(v => !v)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="mc-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
            <input type="text" placeholder="Cercar destinacions" />
          </div>
        </div>

        {showLlegenda && (
          <Llegenda hidden={hiddenCats} onToggle={toggleCat} />
        )}
      </header>

      {/* ═══ MAP ══════════════════════════════════════════════════════ */}
      <div className="mc-map-wrap" style={{ bottom: SHEET_H[sheet] }}>
        <MapContainer
          center={MAP_CENTER}
          zoom={15}
          className="mc-leaflet"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapRef onMap={setMapInst} />
          {flyTarget && !fitRuta && <FlyTo target={flyTarget} />}
          {fitRuta && <FitRuta puntos={fitRuta} />}

          {userPos && (
            <Marker position={userPos} icon={iconUser}>
              <Popup className="mc-popup">
                <div className="popup-inner"><strong>La teva posició</strong></div>
              </Popup>
            </Marker>
          )}

          {punts.filter(p => !hiddenCats.has(p.categoria)).map(punt => (
            <Marker
              key={punt.id}
              position={[punt.lat, punt.lng]}
              icon={makeCatIcon(punt.categoria, puntSel?.id === punt.id)}
              eventHandlers={{ click: () => selPunt(punt) }}
            >
              <Popup className="mc-popup">
                <div className="popup-inner">
                  <strong>{punt.label}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{punt.sublabel}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: CAT_META[punt.categoria]?.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    {CAT_META[punt.categoria]?.label}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {rutaPuntos && (
            <>
              <Polyline positions={rutaPuntos} pathOptions={{ color: "rgba(230,57,70,.25)", weight: 10, lineCap: "round" }} />
              <Polyline positions={rutaPuntos} pathOptions={{ color: "#e63946", weight: 4, lineCap: "round" }} />
            </>
          )}
        </MapContainer>

        {mapInst && (
          <div className="mc-zoom">
            <button className="mc-zoom-btn" onClick={() => mapInst.zoomIn()}>+</button>
            <div className="mc-zoom-div" />
            <button className="mc-zoom-btn" onClick={() => mapInst.zoomOut()}>−</button>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM SHEET ═════════════════════════════════════════════ */}
      <div
        className="mc-sheet"
        style={{ height: SHEET_H[sheet] }}
        ref={sheetRef}
      >
        <div
          className="mc-sheet-handle-wrap"
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
        >
          <div className="mc-sheet-handle" />
        </div>

        <div className="mc-sheet-body">
          {puntSel ? (
            <>
              {/* Capçalera del punt seleccionat */}
              <div className="mc-sheet-head">
                <div
                  className="mc-sheet-cat-icon"
                  style={{ background: CAT_META[puntSel.categoria]?.color }}
                  dangerouslySetInnerHTML={{ __html: ICONS_SVG[CAT_META[puntSel.categoria]?.iconKey] }}
                />
                <div>
                  <div className="mc-sheet-title">{puntSel.label}</div>
                  <div className="mc-sheet-cat-label" style={{ color: CAT_META[puntSel.categoria]?.color }}>
                    {CAT_META[puntSel.categoria]?.label}
                  </div>
                </div>
              </div>

              <div className="mc-sheet-meta">
                <span className="mc-meta-dot" />
                <span className="mc-meta-text">
                  {rutaInfo?.temps
                    ? `Temps d'arribada: ${rutaInfo.temps} · ${rutaInfo.distancia} km`
                    : distPuntSel
                    ? `A ${distPuntSel} km de la teva ubicació`
                    : "Toca 'Com arribar' per calcular la ruta"}
                </span>
              </div>

              {/* Llista de tots els punts (sheet full) */}
              {sheet === "full" && (
                <div className="mc-sheet-locs">
                  {punts.map(punt => (
                    <button
                      key={punt.id}
                      className={`mc-loc-row ${puntSel.id === punt.id ? "mc-loc-row--actiu" : ""}`}
                      onClick={() => selPunt(punt)}
                    >
                      <div
                        className="mc-loc-pin"
                        style={{ background: CAT_META[punt.categoria]?.color, borderRadius: "50%", padding: 4 }}
                        dangerouslySetInnerHTML={{ __html: ICONS_SVG[CAT_META[punt.categoria]?.iconKey] }}
                      />
                      <div className="mc-loc-info">
                        <div className="mc-loc-name">{punt.label}</div>
                        <div className="mc-loc-sub">{punt.sublabel}</div>
                      </div>
                      {userPos && (
                        <div className="mc-loc-dist">
                          {distKm(userPos[0], userPos[1], punt.lat, punt.lng).toFixed(1)} km
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                className="mc-btn-arribar"
                onClick={calcularRuta}
                disabled={rutaLoading || !userPos}
              >
                {rutaLoading
                  ? <><div className="mc-spin mc-spin--w" />Calculant…</>
                  : "Com arribar"
                }
              </button>
            </>
          ) : (
            <div className="mc-sheet-hint">
              <p>Toca un marcador per veure els detalls</p>
            </div>
          )}
        </div>

        <Navbar />
      </div>
    </div>
  );
}