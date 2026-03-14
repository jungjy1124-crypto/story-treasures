import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "./ChatWidget";

const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isKo = pathname.startsWith("/ko");
  const isAdmin = !!localStorage.getItem("cgAdmin");
  const [menuOpen, setMenuOpen] = useState(false);

  const switchTo = (lang: "ko" | "en") => {
    const base = lang === "ko" ? "/ko" : "/en";
    const rest = pathname.replace(/^\/(ko|en)/, "");
    navigate(base + rest || base);
  };

  const handleAdminClick = () => {
    setMenuOpen(false);
    if (isAdmin) {
      navigate("/admin/books");
    } else {
      navigate("/admin/login");
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("cgAdmin");
    window.location.reload();
  };

  return (
    <div className="app-outer">
      {/* HEADER */}
      <div className="chaek-header">
        <div className="chaek-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to={isKo ? "/ko" : "/en"} className="logo">
              {isKo ? (
                <span style={{ fontFamily: "'Noto Serif KR', serif", fontWeight: 700 }}>책가</span>
              ) : (
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
                  <span style={{ fontFamily: "'EB Garamond', serif", fontWeight: 700 }}>Chaekga</span>
                  <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(249,245,235,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>classics, by your side</span>
                </span>
              )}
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
            <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
          </div>
        </div>
      </div>

      {/* Menu dropdown */}
      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="menu-dropdown">
            {isAdmin ? (
              <>
                <button className="menu-dropdown-item" onClick={handleAdminClick}>
                  📚 관리자 대시보드
                </button>
                <button className="menu-dropdown-item" onClick={handleLogout}>
                  🚪 로그아웃
                </button>
              </>
            ) : (
              <button className="menu-dropdown-item" onClick={handleAdminClick}>
                🔐 {isKo ? "관리자 로그인" : "Admin Login"}
              </button>
            )}
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="app-shell">
        <Outlet />
        <div className="spacer" />
      </div>

      {/* BOTTOM NAV */}
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

      <ChatWidget />
    </div>
  );
};

export default Layout;
