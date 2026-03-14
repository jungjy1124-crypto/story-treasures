import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Globe } from "lucide-react";

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
    <div className="min-h-screen bg-chaek-bg font-sans text-chaek-ink antialiased">
      <div className="mx-auto max-w-[480px] min-h-screen bg-chaek-bg flex flex-col relative shadow-2xl">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-chaek-ink px-6">
          <Link to={isKo ? "/ko" : "/en"} className="font-serif text-xl font-medium tracking-tight">
            <span className="text-primary-foreground">Chaek</span>
            <span className="text-chaek-gold italic">gado</span>
          </Link>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-sm border border-primary-foreground/10 px-3 py-1 text-xs font-medium tracking-widest text-primary-foreground transition-colors duration-200 ease-chaek hover:bg-primary-foreground/10"
          >
            <Globe size={14} className="text-chaek-gold" />
            {isKo ? "KO" : "EN"}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-24 px-6 pt-8">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] border-t border-chaek-ink/5 bg-chaek-card/80 backdrop-blur-md z-50">
          <div className="flex h-20 items-center justify-around px-8 pb-4">
            <BottomNavLink
              to={isKo ? "/ko" : "/en"}
              icon={<Home size={22} />}
              label={isKo ? "홈" : "Home"}
              active={pathname === "/en" || pathname === "/ko"}
            />
            <BottomNavLink
              to={isKo ? "/ko/library" : "/en/library"}
              icon={<BookOpen size={22} />}
              label={isKo ? "목록" : "Library"}
              active={pathname.includes("library")}
            />
          </div>
        </nav>
      </div>
    </div>
  );
};

const BottomNavLink = ({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) => (
  <Link
    to={to}
    className={`flex flex-col items-center gap-1 transition-all duration-200 ease-chaek ${
      active
        ? "text-chaek-ink scale-110"
        : "text-chaek-ink/40 hover:text-chaek-ink/70"
    }`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
      {label}
    </span>
  </Link>
);

export default Layout;
