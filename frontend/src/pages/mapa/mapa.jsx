import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapa.css";
import Navbar from "../components/nav/nav.jsx";

// ── POIs ─────────────────────────────────────────────────────────────────
const PUNTS = [
  {
    id: 1, lat: 41.5700, lng: 2.2609,
    label: "Circuit de Barcelona-Catalunya",
    sublabel: "Montmeló, Vallès Oriental",
    categoria: "Circuit", tipus: "main",
  },
  {
    id: 2, lat: 41.5668, lng: 2.2540,
    label: "Pàrquing P1 Oficial",
    sublabel: "Accés directe al circuit",
    categoria: "Pàrquing", tipus: "secondary",
  },
  {
    id: 3, lat: 41.5730, lng: 2.2670,
    label: "Porta Principal",
    sublabel: "Entrada visitants i premsa",
    categoria: "Accés", tipus: "info",
  },
  {
    id: 4, lat: 41.5655, lng: 2.2620,
    label: "Zona VIP Paddock",
    sublabel: "Accés exclusiu acreditats",
    categoria: "VIP", tipus: "vip",
  },
];

const MAP_CENTER = [41.5700, 2.2609];

// ── Icons ─────────────────────────────────────────────────────────────────
const makePinIcon = (actiu = false) => L.divIcon({
  className: "",
  html: `<div class="map-pin ${actiu ? "map-pin--actiu" : ""}">
    <div class="map-pin-head"></div>
    <div class="map-pin-tail"></div>
  </div>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -42],
});

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

// ══════════════════════════════════════════════════════════════════════════
export default function MapaCircuit() {
  const [geoStatus, setGeoStatus]     = useState("idle");
  const [userPos, setUserPos]         = useState(null);
  const [puntSel, setPuntSel]         = useState(PUNTS[0]);
  const [flyTarget, setFlyTarget]     = useState(null);
  const [rutaPuntos, setRutaPuntos]   = useState(null);
  const [rutaInfo, setRutaInfo]       = useState(null);
  const [rutaLoading, setRutaLoading] = useState(false);
  const [fitRuta, setFitRuta]         = useState(null);
  const [mapInst, setMapInst]         = useState(null);
  // sheet: "collapsed" | "mid" | "full"
  const [sheet, setSheet]             = useState("mid");
  const sheetRef                      = useRef(null);
  const dragStart                     = useRef(null);

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
    setFlyTarget({ center: [punt.lat, punt.lng], zoom: 15 });
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

  const SHEET_H = { collapsed: 88, mid: 240, full: 480 };

  return (
    <div className="mc-page">

      <header className="mc-header">
  <div className="mc-header-row">
    
    {/* Botón menú */}
    <button className="mc-menu-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>

    {/* Buscador */}
    <div className="mc-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7"/>
        <path d="M20 20l-3.5-3.5"/>
      </svg>
      <input
        type="text"
        placeholder="Cercar destinacions"
      />
    </div>

  </div>
</header>

      {/* ═══ MAP ══════════════════════════════════════════════════════ */}
      <div className="mc-map-wrap" style={{ bottom: SHEET_H[sheet] }}>
        <MapContainer
          center={userPos || MAP_CENTER}
          zoom={14}
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

          {rutaPuntos && (
            <>
              <Polyline positions={rutaPuntos} pathOptions={{ color: "rgba(230,57,70,.25)", weight: 10, lineCap: "round" }} />
              <Polyline positions={rutaPuntos} pathOptions={{ color: "#e63946", weight: 4, lineCap: "round" }} />
            </>
          )}
        </MapContainer>

        {/* Zoom */}
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
        {/* Drag handle */}
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
          {puntSel && (
            <>
              <div className="mc-sheet-title">{puntSel.label}</div>

              <div className="mc-sheet-meta">
                <span className="mc-meta-dot" />
                <span className="mc-meta-text">
                  {rutaInfo?.temps
                    ? `Temps d'arribada: ${rutaInfo.temps}`
                    : distPuntSel
                    ? `A ${distPuntSel} km de la teva ubicació`
                    : "Toca 'Com arribar' per calcular la ruta"}
                </span>
              </div>

              {sheet === "full" && (
                <div className="mc-sheet-locs">
                  {PUNTS.map(punt => (
                    <button
                      key={punt.id}
                      className={`mc-loc-row ${puntSel.id === punt.id ? "mc-loc-row--actiu" : ""}`}
                      onClick={() => selPunt(punt)}
                    >
                      <div className="mc-loc-pin">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
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
          )}
        </div>

        {/* Navbar always at bottom */}
        <Navbar />
      </div>

    </div>
  );
}