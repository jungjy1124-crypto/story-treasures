import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "./ChatWidget";

const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isKo = pathname.startsWith("/ko");
  const isAdmin = !!localStorage.getItem("cgAdmin");

  const switchTo = (lang: "ko" | "en") => {
    const base = lang === "ko" ? "/ko" : "/en";
    const rest = pathname.replace(/^\/(ko|en)/, "");
    navigate(base + rest || base);
  };

  return (
    <div className="app-outer">
      {/* HEADER — full width dark bg */}
      <div className="chaek-header">
        <div className="chaek-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to={isKo ? "/ko" : "/en"} className="logo">
              Chaek<span>gado</span>
            </Link>
            {isAdmin && (
              <span className="admin-mode-badge">관리자 모드</span>
            )}
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <div
                className={`lang-btn ${isKo ? "active" : ""}`}
                onClick={() => switchTo("ko")}
              >
                KO
              </div>
              <div
                className={`lang-btn ${!isKo ? "active" : ""}`}
                onClick={() => switchTo("en")}
              >
                EN
              </div>
            </div>
            <div className="menu-btn">☰</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT — centered 480px */}
      <div className="app-shell">
        <Outlet />
        <div className="spacer" />
      </div>

      {/* BOTTOM NAV — full width dark bg */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <Link
            to={isKo ? "/ko" : "/en"}
            className={`nav-item ${
              pathname === "/ko" || pathname === "/en" ? "active" : ""
            }`}
          >
            <div className="nav-icon">📚</div>
            <div>{isKo ? "홈" : "Home"}</div>
          </Link>
          <Link
            to={isKo ? "/ko/library" : "/en/library"}
            className={`nav-item ${pathname.includes("library") ? "active" : ""}`}
          >
            <div className="nav-icon">🔖</div>
            <div>{isKo ? "저장" : "Saved"}</div>
          </Link>
          <div className="nav-item">
            <div className="nav-icon">👤</div>
            <div>{isKo ? "내 서재" : "My Shelf"}</div>
          </div>
        </div>
      </div>

      {/* CHAT WIDGET */}
      <ChatWidget />
    </div>
  );
};

export default Layout;
