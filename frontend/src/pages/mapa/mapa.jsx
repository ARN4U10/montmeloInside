import { useCallback, useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapa.css";
import Navbar from "../components/nav/nav.jsx";
import { apiFetch } from "../../utils/api.js";

// ── Icones SVG per categoria ──────────────────────────────────────────────
const ICONS_SVG = {
  tribune: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10l8-7 8 7v10"/><path d="M10 20v-5h4v5"/></svg>`,
  zone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  facility: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  paddock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14l2 4v6a2 2 0 0 1-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  parking: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  access: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  medical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  food: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  merch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  heli: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M12 3v18M5 5l14 14M19 5L5 19"/></svg>`,
  bus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  wc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="4" r="2"/><circle cx="15" cy="4" r="2"/><path d="M6 20v-6H4l2-6h6l2 6h-2v6"/><path d="M18 20v-6l-2-6h4l2 6h-2v6"/></svg>`,
};

const CAT_META = {
  tribune: { color: "#534AB7", label: "Tribunes", iconKey: "tribune" },
  zone: { color: "#3B6D11", label: "Zones", iconKey: "zone" },
  paddock: { color: "#185FA5", label: "Paddock / Pits / VIP", iconKey: "paddock" },
  facility: { color: "#185FA5", label: "Instal·lacions", iconKey: "facility" },
  parking: { color: "#5F5E5A", label: "Pàrquings", iconKey: "parking" },
  access: { color: "#993C1D", label: "Accessos / Portes", iconKey: "access" },
  medical: { color: "#E24B4A", label: "Creu Roja / Serveis mèdics", iconKey: "medical" },
  info: { color: "#1D9E75", label: "Informació", iconKey: "info" },
  food: { color: "#BA7517", label: "Restauració", iconKey: "food" },
  merch: { color: "#854F0B", label: "Merchandising", iconKey: "merch" },
  heli: { color: "#378ADD", label: "Heliport", iconKey: "heli" },
  bus: { color: "#639922", label: "Transport públic", iconKey: "bus" },
  wc: { color: "#888780", label: "WC", iconKey: "wc" },
};

const TRANSPORT_MODES = [
  { id: "driving", label: "Cotxe", icon: "🚗", osrm: "driving", color: "#e63946" },
  { id: "walking", label: "A peu", icon: "🚶", osrm: "walking", color: "#1d7ef0" },
  { id: "cycling", label: "Bici", icon: "🚴", osrm: "cycling", color: "#3B6D11" },
];

const ROUTE_SPEEDS = {
  walking: 4.5,
  cycling: 14,
  driving: 28,
};

const PARKING_TIPS = [
  { label: "P1 — Nord (10 min a peu)", spots: 1200, dist: "1.1 km" },
  { label: "P2 — Est (5 min a peu)", spots: 800, dist: "0.6 km" },
  { label: "P3 — Sud (15 min a peu)", spots: 2000, dist: "1.8 km" },
];

const MAP_CENTER = [41.5705, 2.2615];

// ── Icones Leaflet ────────────────────────────────────────────────────────
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
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// ── Helpers ───────────────────────────────────────────────────────────────
function decodePolyline(encoded) {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coords = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let b;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
}

const distKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const r = (d) => (d * Math.PI) / 180;

  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) *
      Math.cos(r(lat2)) *
      Math.sin(r(lon2 - lon1) / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

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

const sumRouteDistance = (points, startIndex = 0) => {
  if (!points?.length || points.length < 2) return 0;

  let total = 0;

  for (let i = Math.max(0, startIndex); i < points.length - 1; i++) {
    total += distKm(
      points[i][0],
      points[i][1],
      points[i + 1][0],
      points[i + 1][1]
    );
  }

  return total;
};

const getNearestRouteIndex = (currentPos, points) => {
  if (!currentPos || !points?.length) {
    return { index: 0, distanceKm: 0 };
  }

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  points.forEach((point, index) => {
    const distance = distKm(
      currentPos[0],
      currentPos[1],
      point[0],
      point[1]
    );

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return {
    index: bestIndex,
    distanceKm: bestDistance,
  };
};

const buildNavigationInfo = ({
  currentPos,
  routePoints,
  rutaInfo,
  mode,
}) => {
  if (!currentPos || !routePoints?.length || !rutaInfo) return null;

  const nearest = getNearestRouteIndex(currentPos, routePoints);
  const remainingKm = sumRouteDistance(routePoints, nearest.index);
  const totalKm =
    Number.parseFloat(rutaInfo.distancia) || sumRouteDistance(routePoints, 0);

  const progress =
    totalKm > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((1 - remainingKm / totalKm) * 100))
        )
      : 0;

  return {
    remainingKm,
    remainingTime: formatMin(getRealRouteSeconds(remainingKm, mode)),
    progress,
    deviationKm: nearest.distanceKm,
  };
};

// ── Helpers de mapa ───────────────────────────────────────────────────────
function FlyTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target.center, target.zoom, { duration: 1.1 });
    }
  }, [map, target]);

  return null;
}

function FitRuta({ puntos }) {
  const map = useMap();

  useEffect(() => {
    if (puntos?.length > 1) {
      map.fitBounds(L.latLngBounds(puntos), {
        padding: [80, 50],
        animate: true,
      });
    }
  }, [map, puntos]);

  return null;
}

function MapRef({ onMap }) {
  const map = useMap();

  useEffect(() => {
    onMap(map);
  }, [map, onMap]);

  return null;
}

function ClickHandler({ onSelect }) {
  const map = useMap();

  useEffect(() => {
    const handler = (e) =>
      onSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        label: "Punt seleccionat",
        categoria: "info",
      });

    map.on("click", handler);

    return () => map.off("click", handler);
  }, [map, onSelect]);

  return null;
}

// ── Transport selector ────────────────────────────────────────────────────
function TransportSelector({ mode, onChange }) {
  return (
    <div className="mc-transport-selector">
      {TRANSPORT_MODES.map((m) => (
        <button
          key={m.id}
          className={`mc-transport-btn ${
            mode === m.id ? `mc-transport-btn--active-${m.id}` : ""
          }`}
          onClick={() => onChange(m.id)}
          title={m.label}
        >
          <div className="mc-transport-check">
            <svg viewBox="0 0 10 8" fill="none">
              <polyline
                points="1,4 4,7 9,1"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

// ── Panell pàrquing ───────────────────────────────────────────────────────
function ParkingPanel({ onClose, onSelectParking }) {
  return (
    <div className="mc-parking-panel">
      <div className="mc-parking-header">
        <span>🅿️ Pàrquings propers</span>
        <button onClick={onClose}>✕</button>
      </div>

      {PARKING_TIPS.map((p, i) => (
        <button
          key={i}
          className="mc-parking-row"
          onClick={() => onSelectParking(p)}
        >
          <div className="mc-parking-icon">P</div>

          <div className="mc-parking-info">
            <div className="mc-parking-name">{p.label}</div>
            <div className="mc-parking-meta">
              {p.spots} places · {p.dist}
            </div>
          </div>

          <div className="mc-parking-dist">{p.dist}</div>
        </button>
      ))}
    </div>
  );
}

// ── Panell de navegació activa ────────────────────────────────────────────
function NavigationPanel({
  puntSel,
  transportMode,
  rutaInfo,
  navigationInfo,
  onCenterUser,
  onOpenGoogleMaps,
  onStop,
}) {
  const mode = TRANSPORT_MODES.find((m) => m.id === transportMode);

  return (
    <div className="mc-live-navigation">
      <div className="mc-live-top">
        <div className="mc-live-badge">
          <span className="mc-live-dot" />
          Navegació activa
        </div>

        <button className="mc-live-close" onClick={onStop}>
          ✕
        </button>
      </div>

      <div className="mc-live-destination">
        <div className="mc-live-mode">{mode?.icon}</div>

        <div>
          <div className="mc-live-kicker">En recorregut cap a</div>
          <div className="mc-live-title">{puntSel?.label}</div>
        </div>
      </div>

      <div className="mc-live-stats">
        <div className="mc-live-stat">
          <span>Temps restant</span>
          <strong>
            {navigationInfo?.remainingTime || rutaInfo?.temps || "—"}
          </strong>
        </div>

        <div className="mc-live-stat">
          <span>Distància</span>
          <strong>
            {navigationInfo
              ? `${navigationInfo.remainingKm.toFixed(1)} km`
              : `${rutaInfo?.distancia || "—"} km`}
          </strong>
        </div>

        <div className="mc-live-stat">
          <span>Progrés</span>
          <strong>{navigationInfo?.progress ?? 0}%</strong>
        </div>
      </div>

      <div className="mc-live-progress-wrap">
        <div className="mc-live-progress-bar">
          <div
            className="mc-live-progress-fill"
            style={{ width: `${navigationInfo?.progress ?? 0}%` }}
          />
        </div>

        <span>{navigationInfo?.progress ?? 0}% completat</span>
      </div>

      {navigationInfo?.deviationKm > 0.08 && (
        <div className="mc-live-warning">
          ⚠️ T’estàs allunyant lleugerament de la ruta prevista.
        </div>
      )}

      <div className="mc-live-actions">
        <button className="mc-live-action" onClick={onCenterUser}>
          ◎ Centrar-me
        </button>

        <button className="mc-live-action" onClick={onOpenGoogleMaps}>
          ↗ Google Maps
        </button>

        <button
          className="mc-live-action mc-live-action--danger"
          onClick={onStop}
        >
          Finalitzar
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function MapaCircuit() {
  const [geoStatus, setGeoStatus] = useState("idle");
  const [userPos, setUserPos] = useState(null);
  const [puntSel, setPuntSel] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [rutaPuntos, setRutaPuntos] = useState(null);
  const [rutaInfo, setRutaInfo] = useState(null);
  const [rutaLoading, setRutaLoading] = useState(false);
  const [fitRuta, setFitRuta] = useState(null);
  const [mapInst, setMapInst] = useState(null);
  const [hiddenCats, setHiddenCats] = useState(new Set());
  const [sheet, setSheet] = useState("mid");
  const [punts, setPunts] = useState([]);
  const [destinacio, setDestinacio] = useState(null);
  const [menuObert, setMenuObert] = useState(false);
  const [menuTab, setMenuTab] = useState("categories");
  const [transportMode, setTransportMode] = useState("driving");
  const [showParking, setShowParking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [navegant, setNavegant] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState(null);

  const sheetRef = useRef(null);
  const dragStart = useRef(null);
  const routeRequestRef = useRef(0);
  const watchIdRef = useRef(null);

  const location = useLocation();

  // ── Fetch punts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPunts = async () => {
      try {
        const res = await apiFetch("/ubicacions");
        const data = await res.json();
        setPunts(data);
      } catch (err) {
        console.error("Error carregant ubicacions:", err);
      }
    };

    fetchPunts();
  }, []);

  const stopWatchPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const finalitzarRecorregut = useCallback(() => {
    stopWatchPosition();
    setNavegant(false);
    setNavigationInfo(null);
    setSheet("mid");
  }, [stopWatchPosition]);

  // ── Selecció de punt ─────────────────────────────────────────────────────
  const selPunt = useCallback(
    async (punt) => {
      if (navegant) {
        finalitzarRecorregut();
      }

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
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ lloc: punt.label }),
          });
        }
      } catch (err) {
        console.error("Error desant historial:", err);
      }
    },
    [finalitzarRecorregut, navegant]
  );

  // ── Punt entrant des de Destinació/Home ─────────────────────────────────
  useEffect(() => {
    const puntEntrant = location.state?.puntSeleccionat;
    if (!puntEntrant) return;

    const punt = {
      ...puntEntrant,
      lat: puntEntrant.lat ?? puntEntrant.latitud,
      lng: puntEntrant.lng ?? puntEntrant.longitud,
    };

    if (!punt.lat || !punt.lng) return;

    selPunt(punt);
    window.history.replaceState({}, "");
  }, [location.state, selPunt]);

  // ── Cercador ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();

    setSearchResults(
      punts
        .filter(
          (p) =>
            p.label?.toLowerCase().includes(q) ||
            p.sublabel?.toLowerCase().includes(q) ||
            CAT_META[p.categoria]?.label.toLowerCase().includes(q)
        )
        .slice(0, 5)
    );
  }, [searchQuery, punts]);

  // ── Ruta OSRM ────────────────────────────────────────────────────────────
  const obtenirRuta = useCallback(async (origen, desti, mode) => {
    if (!origen || !desti) return null;

    const requestId = ++routeRequestRef.current;
    setRutaLoading(true);

    try {
      const osrmMode =
        TRANSPORT_MODES.find((m) => m.id === mode)?.osrm || "driving";

      const url =
        `https://router.project-osrm.org/route/v1/${osrmMode}/` +
        `${origen[1]},${origen[0]};${desti.lng},${desti.lat}` +
        `?overview=full&geometries=polyline`;

      const res = await fetch(url);
      const data = await res.json();

      if (requestId !== routeRequestRef.current) return null;
      if (data.code !== "Ok" || !data.routes?.length) return null;

      const route = data.routes[0];
      const pts = decodePolyline(route.geometry);
      const km = route.distance / 1000;

      const info = {
        distancia: km.toFixed(1),
        temps: formatMin(getRealRouteSeconds(km, mode)),
        mode,
      };

      setRutaPuntos(pts);
      setRutaInfo(info);
      setFitRuta(pts);

      return {
        pts,
        info,
      };
    } catch (err) {
      console.error("Error calculant ruta:", err);
      setRutaPuntos(null);
      setRutaInfo(null);
      return null;
    } finally {
      if (requestId === routeRequestRef.current) {
        setRutaLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (userPos && destinacio && !navegant) {
      obtenirRuta(userPos, destinacio, transportMode);
    }
  }, [destinacio, navegant, obtenirRuta, transportMode, userPos]);

  // ── Actualització dades navegació ───────────────────────────────────────
  useEffect(() => {
    if (!navegant || !userPos || !rutaPuntos || !rutaInfo) return;

    const info = buildNavigationInfo({
      currentPos: userPos,
      routePoints: rutaPuntos,
      rutaInfo,
      mode: transportMode,
    });

    setNavigationInfo(info);
  }, [navegant, rutaInfo, rutaPuntos, transportMode, userPos]);

  useEffect(() => {
    return () => stopWatchPosition();
  }, [stopWatchPosition]);

  // ── Iniciar recorregut ───────────────────────────────────────────────────
  const iniciarRecorregut = async () => {
    if (!userPos || !puntSel) return;

    let route = null;

    if (rutaPuntos && rutaInfo) {
      route = {
        pts: rutaPuntos,
        info: rutaInfo,
      };
    } else {
      route = await obtenirRuta(userPos, puntSel, transportMode);
    }

    if (!route) return;

    setNavegant(true);
    setSheet("mid");

    const initialNavigationInfo = buildNavigationInfo({
      currentPos: userPos,
      routePoints: route.pts,
      rutaInfo: route.info,
      mode: transportMode,
    });

    setNavigationInfo(initialNavigationInfo);

    if (mapInst) {
      mapInst.fitBounds(L.latLngBounds(route.pts), {
        padding: [80, 60],
        animate: true,
      });
    }

    if (navigator.geolocation) {
      stopWatchPosition();

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Error actualitzant ubicació:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 4000,
          timeout: 12000,
        }
      );
    }
  };

  // ── Centrar usuari ───────────────────────────────────────────────────────
  const centrarUsuari = () => {
    if (!userPos || !mapInst) return;

    mapInst.flyTo(userPos, Math.max(mapInst.getZoom(), 16), {
      duration: 0.8,
    });
  };

  // ── Obrir Google Maps ────────────────────────────────────────────────────
  const obrirGoogleMaps = () => {
    if (!puntSel?.lat || !puntSel?.lng) return;

    const travelMode =
      transportMode === "walking"
        ? "walking"
        : transportMode === "cycling"
          ? "bicycling"
          : "driving";

    const destination = `${puntSel.lat},${puntSel.lng}`;

    const origin = userPos
      ? `&origin=${userPos[0]},${userPos[1]}`
      : "";

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      origin +
      `&destination=${destination}` +
      `&travelmode=${travelMode}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ── Categories i pàrquings ──────────────────────────────────────────────
  const toggleCat = (cat) => {
    setHiddenCats((prev) => {
      const n = new Set(prev);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });
  };

  const filterParking = () => {
    const onlyParking = hiddenCats.has("parking")
      ? new Set([...hiddenCats].filter((c) => c !== "parking"))
      : new Set(Object.keys(CAT_META).filter((c) => c !== "parking"));

    setHiddenCats(onlyParking);
    setMenuObert(false);
  };

  // ── Geolocalització inicial ─────────────────────────────────────────────
  const demanarUbicacio = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }

    setGeoStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      {
        enableHighAccuracy: true,
        timeout: 12000,
      }
    );
  };

  useEffect(() => {
    demanarUbicacio();
  }, []);

  // ── Drag sheet ──────────────────────────────────────────────────────────
  const onDragStart = (e) => {
    if (navegant) return;

    dragStart.current = {
      y: e.touches ? e.touches[0].clientY : e.clientY,
      sheet,
    };
  };

  const onDragEnd = (e) => {
    if (navegant || !dragStart.current) return;

    const y = e.changedTouches
      ? e.changedTouches[0].clientY
      : e.clientY;

    const delta = y - dragStart.current.y;

    if (delta < -40) {
      setSheet("full");
    } else if (delta > 40) {
      setSheet(sheet === "full" ? "mid" : "collapsed");
    }

    dragStart.current = null;
  };

  const distPuntSel =
    userPos && puntSel
      ? distKm(userPos[0], userPos[1], puntSel.lat, puntSel.lng).toFixed(1)
      : null;

  const rutaColor =
    TRANSPORT_MODES.find(
      (m) => m.id === (rutaInfo?.mode || transportMode)
    )?.color || "#e63946";

  if (geoStatus === "idle" || geoStatus === "requesting") {
    return (
      <div className="mc-page geo-screen">
        <div className="geo-anim">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`geo-ring gr-${i}`} />
          ))}
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
            <button className="geo-btn-red" onClick={demanarUbicacio}>
              Tornar a intentar
            </button>
          )}

          <button
            className="geo-btn-ghost"
            onClick={() => setGeoStatus("granted")}
          >
            Continuar sense ubicació
          </button>
        </div>
      </div>
    );
  }

  const SHEET_H = navegant
    ? { collapsed: 440, mid: 440, full: 440 }
    : { collapsed: 165, mid: puntSel ? 470 : 205, full: 655 };

  return (
    <div className="mc-page">
      <header className="mc-header">
        <div className="mc-header-row">
          <img
            className="mc-menu-btn"
            src="/images/filter.jpg"
            alt="Filtres"
            onClick={() => setMenuObert((v) => !v)}
          />

          <div className="mc-search" style={{ position: "relative" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>

            <input
              type="text"
              placeholder="Cercar destinacions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  const primer = punts.find(
                    (p) =>
                      p.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.sublabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      CAT_META[p.categoria]?.label
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  );

                  if (primer) selPunt(primer);
                }
              }}
            />

            {searchQuery && (
              <button
                style={{ color: "#888", fontSize: 14 }}
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            className="mc-parking-quick-btn"
            onClick={() => setShowParking((v) => !v)}
            title="Pàrquings"
          >
            🅿️
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mc-search-dropdown">
            {searchResults.map((p) => (
              <button
                key={p.id}
                className="mc-search-result"
                onClick={() => selPunt(p)}
              >
                <span
                  className="mc-search-result-dot"
                  style={{ background: CAT_META[p.categoria]?.color }}
                />

                <div>
                  <div className="mc-search-result-name">{p.label}</div>
                  <div className="mc-search-result-cat">
                    {CAT_META[p.categoria]?.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </header>

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
          <ClickHandler onSelect={selPunt} />

          {flyTarget && !fitRuta && <FlyTo target={flyTarget} />}
          {fitRuta && <FitRuta puntos={fitRuta} />}

          {userPos && (
            <Marker position={userPos} icon={iconUser}>
              <Popup className="mc-popup">
                <div className="popup-inner">
                  <strong>La teva posició</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {punts
            .filter((p) => !hiddenCats.has(p.categoria))
            .map((punt) => (
              <Marker
                key={punt.id}
                position={[punt.lat, punt.lng]}
                icon={makeCatIcon(punt.categoria, puntSel?.id === punt.id)}
                eventHandlers={{ click: () => selPunt(punt) }}
              >
                <Popup className="mc-popup">
                  <div className="popup-inner">
                    <strong>{punt.label}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
                      {punt.sublabel}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {rutaPuntos && (
            <>
              <Polyline
                positions={rutaPuntos}
                pathOptions={{
                  color: `${rutaColor}33`,
                  weight: 10,
                  lineCap: "round",
                }}
              />

              <Polyline
                positions={rutaPuntos}
                pathOptions={{
                  color: rutaColor,
                  weight: 4,
                  lineCap: "round",
                  dashArray:
                    transportMode === "walking"
                      ? "8 6"
                      : transportMode === "cycling"
                        ? "12 4"
                        : null,
                }}
              />
            </>
          )}
        </MapContainer>

        {rutaInfo && !navegant && (
          <div className="mc-ruta-pill">
            <span>
              {TRANSPORT_MODES.find((m) => m.id === rutaInfo.mode)?.icon}
            </span>
            <span style={{ fontWeight: 700 }}>{rutaInfo.temps}</span>
            <div className="pill-sep" />
            <span style={{ color: "#aaa" }}>{rutaInfo.distancia} km</span>
          </div>
        )}
      </div>

      <div className="mc-sheet" style={{ height: SHEET_H[sheet] }} ref={sheetRef}>
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
            navegant ? (
              <NavigationPanel
                puntSel={puntSel}
                transportMode={transportMode}
                rutaInfo={rutaInfo}
                navigationInfo={navigationInfo}
                onCenterUser={centrarUsuari}
                onOpenGoogleMaps={obrirGoogleMaps}
                onStop={finalitzarRecorregut}
              />
            ) : (
              <>
                <div className="mc-sheet-head">
                  <div
                    className="mc-sheet-cat-icon"
                    style={{ background: CAT_META[puntSel.categoria]?.color }}
                    dangerouslySetInnerHTML={{
                      __html: ICONS_SVG[CAT_META[puntSel.categoria]?.iconKey],
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mc-sheet-title">{puntSel.label}</div>
                    <div
                      className="mc-sheet-cat-label"
                      style={{ color: CAT_META[puntSel.categoria]?.color }}
                    >
                      {CAT_META[puntSel.categoria]?.label}
                    </div>
                  </div>

                  <button
                    className="mc-sheet-close"
                    onClick={() => {
                      setPuntSel(null);
                      setDestinacio(null);
                      setRutaPuntos(null);
                      setRutaInfo(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <TransportSelector
                  mode={transportMode}
                  onChange={setTransportMode}
                />

                <div className="mc-stat-row">
                  <div className="mc-stat-card">
                    <div className="mc-stat-icon mc-stat-icon--time">⏱</div>
                    <div>
                      <div className="mc-stat-label">Temps</div>
                      <div className="mc-stat-value">{rutaInfo?.temps ?? "—"}</div>
                    </div>
                  </div>

                  <div className="mc-stat-card">
                    <div className="mc-stat-icon mc-stat-icon--dist">📍</div>
                    <div>
                      <div className="mc-stat-label">Distància</div>
                      <div className="mc-stat-value">
                        {rutaInfo
                          ? `${rutaInfo.distancia} km`
                          : distPuntSel
                            ? `${distPuntSel} km`
                            : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="mc-btn-arribar"
                  style={{
                    background: rutaColor,
                    boxShadow: `0 4px 24px ${rutaColor}44`,
                  }}
                  onClick={iniciarRecorregut}
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
                          {TRANSPORT_MODES.find((m) => m.id === transportMode)?.icon}
                        </span>

                        <div className="mc-btn-texts">
                          <span className="mc-btn-main">Iniciar recorregut</span>
                          <span className="mc-btn-sub">
                            {rutaInfo
                              ? `${rutaInfo.distancia} km · ${rutaInfo.temps}`
                              : "Calcula la ruta"}
                          </span>
                        </div>
                      </div>

                      <div className="mc-btn-arrow">→</div>
                    </>
                  )}
                </button>

                <button
                  className="mc-btn-google-maps"
                  onClick={obrirGoogleMaps}
                  disabled={!puntSel}
                >
                  <span className="mc-google-maps-icon">🧭</span>

                  <div className="mc-google-maps-text">
                    <strong>Obrir a Google Maps</strong>
                    <span>Navegació real pas a pas</span>
                  </div>

                  <span className="mc-google-maps-arrow">↗</span>
                </button>
              </>
            )
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