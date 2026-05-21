export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const isGuest = () => Boolean(localStorage.getItem("guest")) && !getToken();

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = (path, options = {}) => {
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.auth ? authHeaders() : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
};

export const getEntityId = (item = {}) =>
  item?._id ||
  item?.ubicacioId ||
  item?.ubicacio?._id ||
  item?.ubicacio?.id ||
  item?.id ||
  null;

export const readApiError = async (res, fallback) => {
  const data = await res.json().catch(() => ({}));
  return data.message || fallback;
};

export const assetUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("blob:")) return value;
  return `${API_ORIGIN}${value}`;
};
