<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
=======
import { useCallback, useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useLocation } from "react-router-dom";
>>>>>>> 77020e510cee1c45bcb9b589bfc199ac800b5d26
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapa.css";
import Navbar from "../components/nav/nav.jsx";
import { apiFetch } from "../../utils/api.js";

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
  tribune:  { color: "#534AB7", label: "Tribunes",                   iconKey: "tribune"  },
  zone:     { color: "#3B6D11", label: "Zones",                      iconKey: "zone"     },
  paddock:  { color: "#185FA5", label: "Paddock / Pits / VIP",       iconKey: "paddock"  },
  facility: { color: "#185FA5", label: "Instal·lacions",             iconKey: "facility" },
  parking:  { color: "#5F5E5A", label: "Pàrquings",                  iconKey: "parking"  },
  access:   { color: "#993C1D", label: "Accessos / Portes",          iconKey: "access"   },
  medical:  { color: "#E24B4A", label: "Creu Roja / Serveis mèdics", iconKey: "medical"  },
  info:     { color: "#1D9E75", label: "Informació",                 iconKey: "info"     },
  food:     { color: "#BA7517", label: "Restauració",                iconKey: "food"     },
  merch:    { color: "#854F0B", label: "Merchandising",              iconKey: "merch"    },
  heli:     { color: "#378ADD", label: "Heliport",                   iconKey: "heli"     },
  bus:      { color: "#639922", label: "Transport públic",           iconKey: "bus"      },
  wc:       { color: "#888780", label: "WC",                         iconKey: "wc"       },
};

<<<<<<< HEAD
const TRANSPORT_MODES = [
  { id: "driving", label: "Cotxe", icon: "🚗", osrm: "driving", color: "#e63946" },
  { id: "walking", label: "A peu", icon: "🚶", osrm: "walking", color: "#1d7ef0" },
  { id: "cycling", label: "Bici", icon: "🚴", osrm: "cycling", color: "#3B6D11" },
];
=======
// ── Modes de transport ────────────────────────────────────────────────────
const TRANSPORT_MODES = [
  { id: "driving",   label: "Cotxe",   icon: "🚗", osrm: "driving",   color: "#e63946" },
  { id: "walking",   label: "A peu",   icon: "🚶", osrm: "walking",   color: "#1d7ef0" },
  { id: "cycling",   label: "Bici",    icon: "🚴", osrm: "cycling",   color: "#3B6D11" },
];

const ROUTE_SPEEDS = {
  walking: 4.5,
  cycling: 14,
  driving: 28,
};
>>>>>>> 77020e510cee1c45bcb9b589bfc199ac800b5d26

// ── Pàrquings propers destacats ───────────────────────────────────────────
const PARKING_TIPS = [
  { label: "P1 — Nord (10 min a peu)", spots: 1200, dist: "1.1 km" },
  { label: "P2 — Est (5 min a peu)",   spots: 800,  dist: "0.6 km" },
  { label: "P3 — Sud (15 min a peu)",  spots: 2000, dist: "1.8 km" },
];

const MAP_CENTER = [41.5705, 2.2615];



// ── Genera icona Leaflet per categoria ───────────────────────────────────
const makeCatIcon = (cat, actiu = false) => {
  const meta    = CAT_META[cat] || CAT_META.facility;
  const color   = actiu ? "#e63946" : meta.color;
  const svgIcon = ICONS_SVG[meta.iconKey] || ICONS_SVG.facility;
  const size    = actiu ? 38 : 32;
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
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
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

<<<<<<< HEAD
const formatMin = (seg) => {
  const total = Math.round(seg / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
=======
const formatMin = (seg) => {
  const total = Math.round(seg / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;

  return h > 0 ? `${h}h ${m} min` : `${m} min`;
};

const getRealRouteSeconds = (km, mode) => {
  const speed = ROUTE_SPEEDS[mode] || 30;
  return (km / speed) * 3600;
};
>>>>>>> 77020e510cee1c45bcb9b589bfc199ac800b5d26

  return h > 0 ? `${h}h ${m} min` : `${m} min`;
};
// ── Map helpers ───────────────────────────────────────────────────────────
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target.center, target.zoom, { duration: 1.1 }); }, [map, target]);
  return null;
}
function FitRuta({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (puntos?.length > 1) map.fitBounds(L.latLngBounds(puntos), { padding: [80, 50], animate: true });
  }, [map, puntos]);
  return null;
}
function MapRef({ onMap }) {
  const map = useMap();
  useEffect(() => { onMap(map); }, [map, onMap]);
  return null;
}
function ClickHandler({ onSelect }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e) => onSelect({ lat: e.latlng.lat, lng: e.latlng.lng, label: "Punt seleccionat", categoria: "info" });
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [map, onSelect]);
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

// ── Transport Selector ────────────────────────────────────────────────────
function TransportSelector({ mode, onChange }) {
  return (
    <div className="mc-transport-selector">
      {TRANSPORT_MODES.map(m => (
        <button
          key={m.id}
          className={`mc-transport-btn ${mode === m.id ? `mc-transport-btn--active-${m.id}` : ""}`}
          onClick={() => onChange(m.id)}
          title={m.label}
        >
          <div className="mc-transport-check">
            <svg viewBox="0 0 10 8" fill="none">
              <polyline points="1,4 4,7 9,1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mc-transport-icon-wrap">
            <span>{m.icon}</span>
          </div>
          <span className="mc-transport-name">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Parking Panel ─────────────────────────────────────────────────────────
function ParkingPanel({ onClose, onSelectParking }) {
  return (
    <div className="mc-parking-panel">
      <div className="mc-parking-header">
        <span>🅿️ Pàrquings propers</span>
        <button onClick={onClose}>✕</button>
      </div>
      {PARKING_TIPS.map((p, i) => (
        <button key={i} className="mc-parking-row" onClick={() => onSelectParking(p)}>
          <div className="mc-parking-icon">P</div>
          <div className="mc-parking-info">
            <div className="mc-parking-name">{p.label}</div>
            <div className="mc-parking-meta">{p.spots} places · {p.dist}</div>
          </div>
          <div className="mc-parking-dist">{p.dist}</div>
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function MapaCircuit() {
  const [geoStatus, setGeoStatus]         = useState("idle");
  const [userPos, setUserPos]             = useState(null);
  const [puntSel, setPuntSel]             = useState(null);
  const [flyTarget, setFlyTarget]         = useState(null);
  const [rutaPuntos, setRutaPuntos]       = useState(null);
  const [rutaInfo, setRutaInfo]           = useState(null);
  const [rutaLoading, setRutaLoading]     = useState(false);
  const [fitRuta, setFitRuta]             = useState(null);
  const [mapInst, setMapInst]             = useState(null);
  const [hiddenCats, setHiddenCats]       = useState(new Set());
  const [sheet, setSheet]                 = useState("mid");
  const [punts, setPunts]                 = useState([]);
  const [destinacio, setDestinacio]       = useState(null);
  const [menuObert, setMenuObert]         = useState(false);
  const [menuTab, setMenuTab]             = useState("categories");
  const [transportMode, setTransportMode] = useState("driving");
  const [showParking, setShowParking]     = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
<<<<<<< HEAD
  const [searchResults, setSearchResults] = useState([]);
  const sheetRef  = useRef(null);
  const dragStart = useRef(null);
  const location = useLocation();
  const routeRequestRef = useRef(0);


 const SPEEDS = {
  walking: 4.5,  // km/h real caminant (urbà)
  cycling: 14,   // bici normal ciutat
  driving: 28,   // cotxe ciutat amb trànsit
};

const getRealTime = (km, mode) => {
  const speed = SPEEDS[mode] || 30;
  const hours = km / speed;
  return hours * 3600;
};
  
const obtenirRuta = async (origen, desti, mode) => {
  if (!origen || !desti) return;

  const requestId = ++routeRequestRef.current;
  setRutaLoading(true);

  try {
    const osrmMode =
      TRANSPORT_MODES.find(m => m.id === mode)?.osrm || "driving";

    const url =
      `https://router.project-osrm.org/route/v1/${osrmMode}/` +
      `${origen[1]},${origen[0]};${desti.lng},${desti.lat}` +
      `?overview=full&geometries=polyline`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("OSRM:", data);

    if (requestId !== routeRequestRef.current) return;
    if (!data.routes || !data.routes.length) return;

    // 👉 NOMÉS AQUÍ es declara route (IMPORTANT)
    const route = data.routes[0];

    const km = route.distance / 1000;

    const SPEEDS = {
      walking: 4.5,
      cycling: 14,
      driving: 28,
    };

    const speed = SPEEDS[mode] || 30;
    const realSeconds = (km / speed) * 3600;

    setRutaPuntos(decodePolyline(route.geometry));

    setRutaInfo({
      distancia: km.toFixed(1),
      temps: formatMin(realSeconds),
      mode,
    });

  } catch (err) {
    console.error("Error ruta:", err);
    setRutaPuntos(null);
    setRutaInfo(null);
  } finally {
    setRutaLoading(false);
  }
};


  // ── Fetch punts ──────────────────────────────────────────────────────────
  useEffect(() => {
    setRutaPuntos(null);
    setRutaInfo(null);
    const fetchPunts = async () => {
      try {
        const res  = await fetch("http://localhost:3001/api/ubicacions");
        const data = await res.json();
=======
  const [searchResults, setSearchResults] = useState([]);
  const sheetRef  = useRef(null);
  const dragStart = useRef(null);
  const routeRequestRef = useRef(0);
  const location = useLocation();

  // ── Fetch punts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPunts = async () => {
      try {
        const res  = await apiFetch("/ubicacions");
        const data = await res.json();
>>>>>>> 77020e510cee1c45bcb9b589bfc199ac800b5d26
        setPunts(data);
      } catch (err) {
        console.error("Error cargando ubicacions:", err);
      }
    };
    fetchPunts();
  }, []);

  // ── Seleccionar punt ─────────────────────────────────────────────────────
  const selPunt = useCallback(async (punt) => {
    setPuntSel(punt);
    setDestinacio(punt);
    setRutaPuntos(null);
    setRutaInfo(null);
    setFitRuta(null);
    setFlyTarget({ center: [punt.lat, punt.lng], zoom: 17 });
    setSheet("mid");
    setSearchQuery("");
    setSearchResults([]);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        await apiFetch("/historial", {
          method: "POST",
          auth: true,
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ lloc: punt.label }),
        });
      }
    } catch (err) {
      console.error("Error desant historial:", err);
    }
  }, []);

   // ── Selecció automàtica des de Destinacio ──────────────────────────────
  useEffect(() => {
    const puntEntrant = location.state?.puntSeleccionat;
    if (!puntEntrant) return;

    // Normalitza el punt per assegurar que té lat/lng
    const punt = {
      ...puntEntrant,
      lat: puntEntrant.lat ?? puntEntrant.latitud,
      lng: puntEntrant.lng ?? puntEntrant.longitud,
    };

    if (!punt.lat || !punt.lng) return;

    selPunt(punt);

    // Neteja l'estat de navegació per evitar re-seleccions
    window.history.replaceState({}, "");
  }, [location.state, selPunt]);


 useEffect(() => {
  if (!userPos || !destinacio) return;
}, [userPos, destinacio, transportMode]);



  // ── Search filter ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      punts.filter(p =>
        p.label?.toLowerCase().includes(q) ||
        p.sublabel?.toLowerCase().includes(q) ||
        CAT_META[p.categoria]?.label.toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }, [searchQuery, punts]);

<<<<<<< HEAD
// ── Seleccionar punt ─────────────────────────────────────────────────────
const selPunt = async (punt) => {
  setPuntSel(punt);
  setDestinacio({ ...punt });
  setRutaPuntos(null);
  setRutaInfo(null);
  setFitRuta(null);
  setFlyTarget({ center: [punt.lat, punt.lng], zoom: 17 });
  setSheet("mid");
  setSearchQuery("");
  setSearchResults([]);

  // 💾 Desa al historial_navegacio de l'usuari
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await fetch("http://localhost:3001/api/historial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ lloc: punt.label }),
      });
    }
  } catch (err) {
    console.error("Error desant historial:", err);
  }
};
=======
  // ── Ruta ─────────────────────────────────────────────────────────────────
  const obtenirRuta = useCallback(async (origen, desti, mode) => {
    if (!origen || !desti) return;
    const requestId = ++routeRequestRef.current;
    setRutaLoading(true);
    try {
      const osrmMode = TRANSPORT_MODES.find(m => m.id === mode)?.osrm || "driving";
      const url = `https://router.project-osrm.org/route/v1/${osrmMode}/` +
        `${origen[1]},${origen[0]};${desti.lng},${desti.lat}` +
        `?overview=full&geometries=polyline`;
      const res  = await fetch(url);
      const data = await res.json();
      if (requestId !== routeRequestRef.current) return;
      if (data.code !== "Ok" || !data.routes?.length) return;
      const route = data.routes[0];
      const pts   = decodePolyline(route.geometry);
      const km    = route.distance / 1000;
      setRutaPuntos(pts);
      setRutaInfo({
        distancia: km.toFixed(1),
        temps: formatMin(getRealRouteSeconds(km, mode)),
        mode,
      });
      setFitRuta(pts);
    } catch (err) {
      console.error("Error ruta:", err);
      setRutaPuntos(null);
      setRutaInfo(null);
    } finally {
      if (requestId === routeRequestRef.current) setRutaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userPos && destinacio) obtenirRuta(userPos, destinacio, transportMode);
  }, [destinacio, obtenirRuta, transportMode, userPos]);
>>>>>>> 77020e510cee1c45bcb9b589bfc199ac800b5d26

  const toggleCat = (cat) => {
    setHiddenCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  };

  const filterParking = () => {
    const onlyParking = hiddenCats.has("parking")
      ? new Set([...hiddenCats].filter(c => c !== "parking"))
      : new Set(Object.keys(CAT_META).filter(c => c !== "parking"));
    setHiddenCats(onlyParking);
    setMenuObert(false);
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

  // ── Sheet drag ────────────────────────────────────────────────────────────
  const onDragStart = (e) => {
    dragStart.current = { y: e.touches ? e.touches[0].clientY : e.clientY, sheet };
  };
  const onDragEnd = (e) => {
    if (!dragStart.current) return;
    const y     = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const delta = y - dragStart.current.y;
    if (delta < -40)     setSheet("full");
    else if (delta > 40) setSheet(sheet === "full" ? "mid" : "collapsed");
    dragStart.current = null;
  };

  const distPuntSel = userPos && puntSel
    ? distKm(userPos[0], userPos[1], puntSel.lat, puntSel.lng).toFixed(1)
    : null;

  const rutaColor = TRANSPORT_MODES.find(m => m.id === (rutaInfo?.mode || transportMode))?.color || "#e63946";

  // ── Loading screens ───────────────────────────────────────────────────────
  if (geoStatus === "idle" || geoStatus === "requesting") {
    return (
      <div className="mc-page geo-screen">
        <div className="geo-anim">
          {[1, 2, 3].map(i => <div key={i} className={`geo-ring gr-${i}`} />)}
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
          {geoStatus === "denied" && (
            <button className="geo-btn-red" onClick={demanarUbicacio}>Tornar a intentar</button>
          )}
          <button className="geo-btn-ghost" onClick={() => setGeoStatus("granted")}>
            Continuar sense ubicació
          </button>
        </div>
      </div>
    );
  }

  const SHEET_H = { collapsed: 88, mid: puntSel ? 395 : 130, full: 580 };

  return (
    <div className="mc-page">

      {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
      <header className="mc-header">
        <div className="mc-header-row">
          <img
            className="mc-menu-btn"
            src="/images/filter.jpg"
            alt="Filtres"
            onClick={() => setMenuObert(v => !v)}
          />

          <div className="mc-search" style={{ position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Cercar destinacions…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  const primer = punts.find(p =>
                    p.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sublabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    CAT_META[p.categoria]?.label.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (primer) selPunt(primer);
                }
              }}
            />
            {searchQuery && (
              <button style={{ color: "#888", fontSize: 14 }} onClick={() => { setSearchQuery(""); setSearchResults([]); }}>✕</button>
            )}
          </div>

          <button className="mc-parking-quick-btn" onClick={() => setShowParking(v => !v)} title="Pàrquings">
            🅿️
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mc-search-dropdown">
            {searchResults.map(p => (
              <button key={p.id} className="mc-search-result" onClick={() => selPunt(p)}>
                <span className="mc-search-result-dot" style={{ background: CAT_META[p.categoria]?.color }} />
                <div>
                  <div className="mc-search-result-name">{p.label}</div>
                  <div className="mc-search-result-cat">{CAT_META[p.categoria]?.label}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ═══ MAP ══════════════════════════════════════════════════════ */}
      <div className="mc-map-wrap" style={{ bottom: SHEET_H[sheet] }}>
        <MapContainer center={MAP_CENTER} zoom={15} className="mc-leaflet" zoomControl={false} attributionControl={false}>

          {/* DRAWER */}
          {menuObert && (
            <div className="mc-drawer-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setMenuObert(false); }}>
              <div className="mc-drawer" onClick={e => e.stopPropagation()}>
                <div className="mc-drawer-top">
                  <div className="mc-drawer-title">Filtres</div>
                  <button className="mc-drawer-close" onClick={() => setMenuObert(false)}>✕</button>
                </div>

                <div className="mc-drawer-tabs">
                  <button className={menuTab === "categories" ? "active" : ""} onClick={() => setMenuTab("categories")}>Categories</button>
                  <button className={menuTab === "accions"    ? "active" : ""} onClick={() => setMenuTab("accions")}>Accions</button>
                  <button className={menuTab === "guia"       ? "active" : ""} onClick={() => setMenuTab("guia")}>Guia</button>
                </div>

                <div className="mc-drawer-content">
                  {menuTab === "categories" && (
                    <div>
                      <button className="mc-drawer-parking-quick" onClick={filterParking}>
                        🅿️ Mostrar només pàrquings
                      </button>
                      {Object.entries(CAT_META).map(([key, meta]) => (
                        <button
                          key={key}
                          className={`mc-drawer-item ${hiddenCats.has(key) ? "off" : ""}`}
                          onClick={() => toggleCat(key)}
                        >
                          <span className="dot" style={{ background: meta.color }} />
                          {meta.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {menuTab === "accions" && (
                    <div className="mc-drawer-actions">
                      <button onClick={() => mapInst?.flyTo(MAP_CENTER, 15)}>🗺️ Centrar mapa</button>
                      <button onClick={demanarUbicacio}>📍 Actualitzar ubicació</button>
                      <button onClick={() => { setRutaPuntos(null); setRutaInfo(null); }}>🧹 Esborrar ruta</button>
                      <button onClick={() => { setPuntSel(null); setDestinacio(null); }}>❌ Desseleccionar punt</button>
                      <button onClick={() => { setHiddenCats(new Set()); }}>👁️ Mostrar tot</button>
                    </div>
                  )}

                  {menuTab === "guia" && (
                    <div className="mc-drawer-guide">
                      <h4>Com usar el mapa</h4>
                      <p>• Toca un punt per veure informació</p>
                      <p>• Selecciona el mode de transport per calcular la ruta</p>
                      <p>• Prem 🅿️ per veure pàrquings disponibles</p>
                      <p>• Cerca per nom o categoria al buscador</p>
                      <p>• Arrossega la fitxa inferior amunt/avall</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapRef onMap={setMapInst} />
          <ClickHandler onSelect={selPunt} />
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
              <Polyline positions={rutaPuntos} pathOptions={{ color: `${rutaColor}33`, weight: 10, lineCap: "round" }} />
              <Polyline positions={rutaPuntos} pathOptions={{ color: rutaColor, weight: 4, lineCap: "round", dashArray: transportMode === "walking" ? "8 6" : transportMode === "cycling" ? "12 4" : null }} />
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

        {showParking && (
          <ParkingPanel
            onClose={() => setShowParking(false)}
            onSelectParking={(p) => {
              setSearchQuery(p.label);
              setShowParking(false);
            }}
          />
        )}

        {rutaInfo && (
          <div className="mc-ruta-pill">
            <span>{TRANSPORT_MODES.find(m => m.id === rutaInfo.mode)?.icon}</span>
            <span style={{ fontWeight: 700 }}>{rutaInfo.temps}</span>
            <div className="pill-sep" />
            <span style={{ color: "#aaa" }}>{rutaInfo.distancia} km</span>
            <button className="pill-x" onClick={() => { setRutaPuntos(null); setRutaInfo(null); }}>✕</button>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM SHEET ═════════════════════════════════════════════ */}
      <div className="mc-sheet" style={{ height: SHEET_H[sheet] }} ref={sheetRef}>
        <div
          className="mc-sheet-handle-wrap"
          onMouseDown={onDragStart} onMouseUp={onDragEnd}
          onTouchStart={onDragStart} onTouchEnd={onDragEnd}
        >
          <div className="mc-sheet-handle" />
        </div>

        <div className="mc-sheet-body">
          {puntSel ? (
            <>
              {/* ── Capçalera ─────────────────────────────────────── */}
              <div className="mc-sheet-head">
                <div
                  className="mc-sheet-cat-icon"
                  style={{ background: CAT_META[puntSel.categoria]?.color }}
                  dangerouslySetInnerHTML={{ __html: ICONS_SVG[CAT_META[puntSel.categoria]?.iconKey] }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mc-sheet-title">{puntSel.label}</div>
                  <div className="mc-sheet-cat-label" style={{ color: CAT_META[puntSel.categoria]?.color }}>
                    {CAT_META[puntSel.categoria]?.label}
                  </div>
                </div>
                <button
                  className="mc-sheet-close"
                  onClick={() => { setPuntSel(null); setDestinacio(null); setRutaPuntos(null); setRutaInfo(null); }}
                >✕</button>
              </div>

              {/* ── Selector mode transport ───────────────────────── */}
              <TransportSelector mode={transportMode} onChange={setTransportMode} />

              {/* ── Stat row (temps + distància) ──────────────────── */}
              <div className="mc-stat-row">
                <div className="mc-stat-card">
                  <div className="mc-stat-icon mc-stat-icon--time">⏱</div>
                  <div>
                    <div className="mc-stat-label">Temps</div>
                    <div className="mc-stat-value">
                      {rutaInfo?.temps ?? (distPuntSel ? "—" : "—")}
                    </div>
                  </div>
                </div>
                <div className="mc-stat-card">
                  <div className="mc-stat-icon mc-stat-icon--dist">📍</div>
                  <div>
                    <div className="mc-stat-label">Distància</div>
                    <div className="mc-stat-value">
                      {rutaInfo
                        ? <>{rutaInfo.distancia} <span className="mc-stat-unit">km</span></>
                        : distPuntSel
                        ? <>{distPuntSel} <span className="mc-stat-unit">km</span></>
                        : "—"
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Llista sheet full ─────────────────────────────── */}
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

              {/* ── CTA Botó ──────────────────────────────────────── */}
              <button
                className="mc-btn-arribar"
                style={{ background: rutaColor, boxShadow: `0 4px 24px ${rutaColor}44` }}
                onClick={() => obtenirRuta(userPos, puntSel, transportMode)}
                disabled={rutaLoading || !userPos}
              >
                {rutaLoading ? (
                  <>
                    <div className="mc-spin mc-spin--w" />
                    Calculant…
                  </>
                ) : (
                  <>
                    <div className="mc-btn-left">
                      <span className="mc-btn-emoji">
                        {TRANSPORT_MODES.find(m => m.id === transportMode)?.icon}
                      </span>
                      <div className="mc-btn-texts">
                        <span className="mc-btn-main">Iniciar recorregut</span>
                        <span className="mc-btn-sub">
                          {rutaInfo
                            ? `${rutaInfo.distancia} km · ${rutaInfo.temps}`
                            : "Calcula la ruta"
                          }
                        </span>
                      </div>
                    </div>
                    <div className="mc-btn-arrow">→</div>
                  </>
                )}
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
