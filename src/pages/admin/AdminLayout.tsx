import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV_ITEMS = [
  { label: "📚 책 목록", path: "/admin/books" },
  { label: "➕ 새 책 추가", path: "/admin/add" },
  { label: "✏️ 구절 승인", path: "/admin/passages", hasBadge: true },
];

export default function AdminLayout() {
  const { isAuthenticated, checking, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase
      .from("user_passages")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count || 0));
  }, [location.pathname]);

  if (checking) return <div className="admin-loading">로딩 중...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="admin-shell">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo" onClick={() => navigate("/admin/books")}>
            📚 Chaekga
          </span>
          <span className="admin-badge">관리자</span>
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar (desktop) */}
        <nav className="admin-sidebar">
          <button
            className="admin-sidebar-home"
            onClick={() => navigate("/")}
          >
            🏠 메인으로
          </button>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`admin-sidebar-item${location.pathname === item.path ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
          <button className="admin-sidebar-item logout" onClick={logout}>
            🚪 로그아웃
          </button>
        </nav>

        {/* Main content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom tabs (mobile) */}
      <nav className="admin-bottom-nav">
        <button className="admin-bottom-item" onClick={() => navigate("/")}>
          🏠 메인
        </button>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`admin-bottom-item${location.pathname === item.path ? " active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
        <button className="admin-bottom-item" onClick={logout}>
          🚪 로그아웃
        </button>
      </nav>
    </div>
  );
}
