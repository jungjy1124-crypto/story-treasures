import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "./ChatWidget";

const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isKo = pathname.startsWith("/ko");

  const toggleLanguage = () => {
    const newPath = isKo
      ? pathname.replace(/^\/ko/, "/en") || "/en"
      : pathname.replace(/^\/en/, "/ko") || "/ko";
    navigate(newPath);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="app-shell">
        {/* HEADER */}
        <div className="chaek-header">
          <Link to={isKo ? "/ko" : "/en"} className="logo">
            Chaek<span>gado</span>
          </Link>
          <div className="header-menu" onClick={toggleLanguage} title="Toggle language">
            ☰
          </div>
        </div>

        {/* MAIN CONTENT */}
        <Outlet />

        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <Link
            to={isKo ? "/ko" : "/en"}
            className={`nav-item ${
              pathname === "/ko" || pathname === "/en" ? "active" : ""
            }`}
          >
            <div className="nav-icon">🏠</div>
            <div>{isKo ? "홈" : "Home"}</div>
          </Link>
          <Link
            to={isKo ? "/ko/library" : "/en/library"}
            className={`nav-item ${pathname.includes("library") ? "active" : ""}`}
          >
            <div className="nav-icon">☰</div>
            <div>{isKo ? "목록" : "Library"}</div>
          </Link>
        </div>

        {/* CHAT WIDGET */}
        <ChatWidget />
      </div>
    </div>
  );
};

export default Layout;
