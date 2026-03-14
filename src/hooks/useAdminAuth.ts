import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_STORAGE_KEY } from "@/config/admin";

export function useAdminAuth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.isAdmin) {
          setIsAuthenticated(true);
          setChecking(false);
          return;
        }
      }
    } catch {}
    setChecking(false);
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    navigate("/", { replace: true });
  };

  return { isAuthenticated, checking, logout };
}
