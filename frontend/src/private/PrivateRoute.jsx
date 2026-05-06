import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowGuest = false }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const guest = localStorage.getItem("guest");

  if (!token && !(allowGuest && guest)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

