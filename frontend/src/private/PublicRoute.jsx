import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const guest = localStorage.getItem("guest");

  if (token || guest) {
    return <Navigate to="/home" replace />;
  }

  return children;
}