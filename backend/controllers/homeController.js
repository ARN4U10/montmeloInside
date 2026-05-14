import Esdeveniment from "../models/Esdeveniments.js";
import Ubicacio from "../models/Ubicacions.js";

const CIRCUIT_CENTER = { lat: 41.5705, lng: 2.2615 };

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const distKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (km) => {
  if (!Number.isFinite(km)) return "—";
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  return `${km.toFixed(1)} km`;
};

const inferServiceMeta = (ubicacio) => {
  const text = normalize(
    `${ubicacio.nom || ""} ${ubicacio.tipus || ""} ${ubicacio.categoria || ""} ${ubicacio.descripcio || ""}`
  );

  if (
    text.includes("wc") ||
    text.includes("lavabo") ||
    text.includes("toilet")
  ) {
    return {
      type: "Lavabos",
      categoryKey: "wc",
      icon: "🚻",
    };
  }

  if (
    text.includes("food") ||
    text.includes("restaur") ||
    text.includes("bar") ||
    text.includes("cafe") ||
    text.includes("burger") ||
    text.includes("pizza") ||
    text.includes("truck") ||
    text.includes("menjar")
  ) {
    return {
      type: "Restauració",
      categoryKey: "food",
      icon: "🍴",
    };
  }

  if (
    text.includes("parking") ||
    text.includes("parquing") ||
    text.includes("aparcament")
  ) {
    return {
      type: "Pàrquing",
      categoryKey: "parking",
      icon: "🅿️",
    };
  }

  if (
    text.includes("info") ||
    text.includes("informacio") ||
    text.includes("atencio")
  ) {
    return {
      type: "Informació",
      categoryKey: "info",
      icon: "ℹ️",
    };
  }

  if (
    text.includes("entrada") ||
    text.includes("sortida") ||
    text.includes("acces")
  ) {
    return {
      type: "Accessos",
      categoryKey: "access",
      icon: "🚪",
    };
  }

  if (
    text.includes("merch") ||
    text.includes("botiga")
  ) {
    return {
      type: "Merchandising",
      categoryKey: "merch",
      icon: "🛍️",
    };
  }

  if (
    text.includes("medical") ||
    text.includes("creu roja") ||
    text.includes("infermer")
  ) {
    return {
      type: "Assistència",
      categoryKey: "medical",
      icon: "🩺",
    };
  }

  return null;
};

const parseEventDate = (event) => {
  if (!event?.data) return null;

  const time = event.horaInici || "00:00";
  const date = new Date(`${event.data}T${time}:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const eventSeats = (event) => {
  const total = Math.max(0, safeNumber(event.numEntrades, 0));
  const used = Array.isArray(event.usuaris) ? event.usuaris.length : 0;
  const remaining = Math.max(0, total - used);
  const fillRatio = total > 0 ? used / total : 0;

  return {
    total,
    used,
    remaining,
    fillRatio,
  };
};

const occupancyFromEvents = (events) => {
  if (!events.length) return "BAIXA";

  const ratios = events
    .map((event) => eventSeats(event).fillRatio)
    .filter((ratio) => Number.isFinite(ratio));

  const average = ratios.length
    ? ratios.reduce((acc, ratio) => acc + ratio, 0) / ratios.length
    : 0;

  if (average >= 0.72) return "ALTA";
  if (average >= 0.38) return "MITJANA";
  return "BAIXA";
};

const crowdEstimate = (type, occupancy, eventsCount) => {
  if (occupancy === "ALTA") {
    return type === "Informació" ? "MITJANA" : "ALTA";
  }

  if (occupancy === "MITJANA") {
    if (type === "Pàrquing" || type === "Restauració") {
      return "ALTA";
    }

    return "MITJANA";
  }

  if (
    eventsCount >= 4 &&
    (type === "Restauració" || type === "Lavabos")
  ) {
    return "MITJANA";
  }

  return "BAIXA";
};

const startLabel = (eventDate, now) => {
  if (!eventDate) return "Data pendent";

  const diffMinutes = Math.round(
    (eventDate.getTime() - now.getTime()) / 60000
  );

  if (diffMinutes < -120) return "Ja celebrat";
  if (diffMinutes < 0) return "En curs";
  if (diffMinutes === 0) return "Comença ara";
  if (diffMinutes < 60) return `Comença en ${diffMinutes} min`;
  if (diffMinutes < 1440) return `Comença en ${Math.round(diffMinutes / 60)} h`;

  return "Properament";
};

const buildAlerts = ({
  nextEvent,
  activeEvents,
  servicesCount,
  occupancy,
  now,
}) => {
  const alerts = [];

  if (nextEvent) {
    const eventDate = parseEventDate(nextEvent);

    alerts.push({
      id: "next-event",
      title: nextEvent.nom,
      subtitle: `${startLabel(eventDate, now)} · ${
        nextEvent.direccio || "Circuit de Barcelona-Catalunya"
      }`,
      icon: "🏁",
      level: "info",
    });
  }

  if (occupancy === "ALTA") {
    alerts.push({
      id: "occupancy-high",
      title: "Afluència elevada prevista",
      subtitle:
        "Consulta el mapa i els accessos abans de desplaçar-te.",
      icon: "🚨",
      level: "warning",
    });
  } else {
    alerts.push({
      id: "occupancy-ok",
      title: "Flux del recinte controlat",
      subtitle:
        "Els serveis principals es mostren operatius al panell.",
      icon: "✅",
      level: "success",
    });
  }

  alerts.push({
    id: "services-summary",
    title: `${servicesCount} serveis útils disponibles`,
    subtitle: `${activeEvents.length} esdeveniments actius detectats al sistema.`,
    icon: "📍",
    level: "info",
  });

  return alerts.slice(0, 3);
};

const buildTips = ({ serviceCounts, nextEvent }) => {
  const tips = [];

  if (serviceCounts.Lavabos) {
    tips.push(
      `Tens ${serviceCounts.Lavabos} punts de lavabos localitzats dins del recinte.`
    );
  }

  if (serviceCounts.Restauració) {
    tips.push(
      `Hi ha ${serviceCounts.Restauració} zones de restauració disponibles al mapa.`
    );
  }

  if (nextEvent) {
    tips.push(
      `Consulta la ruta fins a “${nextEvent.nom}” abans que comenci l'activitat.`
    );
  }

  if (tips.length < 3 && serviceCounts.Pàrquing) {
    tips.push(
      `S'han detectat ${serviceCounts.Pàrquing} pàrquings o punts d'aparcament.`
    );
  }

  if (tips.length < 3) {
    tips.push(
      "Utilitza el cercador de la home per trobar serveis i obrir-los directament al mapa."
    );
  }

  return tips.slice(0, 3);
};

export const getHomeDashboard = async (req, res) => {
  try {
    const now = new Date();

    const [locations, events] = await Promise.all([
      Ubicacio.find().lean(),
      Esdeveniment.find({ estat: "actiu" }).lean(),
    ]);

    const activeEvents = events.filter(
      (event) => event.estat === "actiu"
    );

    const orderedEvents = [...activeEvents].sort((a, b) => {
      const aDate = parseEventDate(a);
      const bDate = parseEventDate(b);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return aDate.getTime() - bDate.getTime();
    });

    const nextEvent =
      orderedEvents.find((event) => {
        const date = parseEventDate(event);

        return (
          date &&
          date.getTime() >= now.getTime() - 2 * 60 * 60 * 1000
        );
      }) ||
      orderedEvents.find((event) => event.destacat) ||
      orderedEvents[0] ||
      null;

    const occupancy = occupancyFromEvents(activeEvents);

    const services = locations
      .map((location) => {
        const meta = inferServiceMeta(location);

        if (!meta) return null;

        const lat = safeNumber(location.latitud, null);
        const lng = safeNumber(location.longitud, null);

        const km =
          lat !== null && lng !== null
            ? distKm(CIRCUIT_CENTER.lat, CIRCUIT_CENTER.lng, lat, lng)
            : NaN;

        return {
          id: String(location._id),
          name: location.nom,
          subtitle:
            location.direccio ||
            location.descripcio ||
            "Servei del circuit",
          type: meta.type,
          categoryKey: meta.categoryKey,
          icon: meta.icon,
          lat,
          lng,
          distance: formatDistance(km),
          distanceValue: Number.isFinite(km)
            ? km
            : Number.MAX_SAFE_INTEGER,
          crowd: crowdEstimate(meta.type, occupancy, activeEvents.length),
          open: true,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, 8);

    const serviceCounts = services.reduce((acc, service) => {
      acc[service.type] = (acc[service.type] || 0) + 1;
      return acc;
    }, {});

    const nextEventPayload = nextEvent
      ? (() => {
          const date = parseEventDate(nextEvent);
          const seats = eventSeats(nextEvent);

          return {
            id: String(nextEvent._id),
            title: nextEvent.nom,
            description:
              nextEvent.descripcio ||
              "Consulta tots els detalls de l'activitat.",
            start: nextEvent.horaInici || "--:--",
            end: nextEvent.horaFi || "--:--",
            date: nextEvent.data || "",
            place:
              nextEvent.direccio ||
              "Circuit de Barcelona-Catalunya",
            category:
              nextEvent.categoria ||
              nextEvent.tipus ||
              "Esdeveniment",
            status: startLabel(date, now),
            spectators: `${seats.used}/${
              seats.total || "—"
            } places ocupades`,
            remainingSeats: seats.remaining,
            lat: nextEvent.latitud ?? null,
            lng: nextEvent.longitud ?? null,
            image: nextEvent.imatge || "",
          };
        })()
      : null;

    const alerts = buildAlerts({
      nextEvent,
      activeEvents,
      servicesCount: services.length,
      occupancy,
      now,
    });

    const tips = buildTips({
      serviceCounts,
      nextEvent,
    });

    return res.json({
      generatedAt: now.toISOString(),

      status: {
        occupancy,
        access:
          occupancy === "ALTA"
            ? "Amb afluència"
            : occupancy === "MITJANA"
              ? "Moderats"
              : "Fluids",
        alertLevel:
          occupancy === "ALTA"
            ? "ATENCIÓ"
            : occupancy === "MITJANA"
              ? "INFO"
              : "NORMAL",
      },

      counters: {
        locationsTotal: locations.length,
        servicesTotal: services.length,
        eventsActive: activeEvents.length,
        occupancy,
      },

      nextEvent: nextEventPayload,
      services,
      alerts,
      tips,
    });
  } catch (error) {
    console.error("Error getHomeDashboard:", error);

    return res.status(500).json({
      message: "No s'ha pogut carregar el panell de la home",
    });
  }
};