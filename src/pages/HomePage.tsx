import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getBooks, type StoredBook } from "@/lib/bookStorage";

const THEME_TO_SPINE: Record<string, string> = {
  "theme-dark": "spine-dark",
  "theme-crimson": "spine-crimson",
  "theme-navy": "spine-navy",
  "theme-teal": "spine-teal",
  "theme-purple": "spine-purple",
  "theme-green": "spine-green",
};

const filtersKo = ["전체", "심리소설", "러시아문학", "영국문학", "철학", "비극", "사랑", "19세기"];
const filtersEn = ["All", "Psychological", "Russian Lit", "British Lit", "Philosophy", "Tragedy", "Love", "19th Century"];

const HomePage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isKo = pathname.startsWith("/ko");
  const lang = isKo ? "ko" : "en";
  const filters = isKo ? filtersKo : filtersEn;
  const [activeFilter, setActiveFilter] = useState(0);
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = !!localStorage.getItem("cgAdmin");

  useEffect(() => {
    getBooks().then((data) => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="hero">
      {/* Tagline */}
      <div className="hero-tagline">
        <div className="tagline-sub">Classic Literature</div>
        <div className="tagline-main">
          {isKo ? (
            <>위대한 고전을<br /><em>5분</em>에 만나다</>
          ) : (
            <>Classic literature,<br /><em>distilled</em></>
          )}
        </div>
        <div className="tagline-desc">
          {isKo
            ? "구텐베르크 공개 도메인 원문 기반\nAI 요약 + 전문가 큐레이션"
            : "Based on Project Gutenberg public domain texts — AI summaries, expert curation"}
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-icon">🔍</div>
        <input
          className="search-input"
          type="text"
          placeholder={isKo ? "작가, 제목, 주제로 검색..." : "Search by author, title, or theme..."}
        />
      </div>

      {/* Filters */}
      <div className="filter-row">
        {filters.map((f, i) => (
          <div
            key={f}
            className={`filter-chip ${activeFilter === i ? "active" : ""}`}
            onClick={() => setActiveFilter(i)}
          >
            {f}
          </div>
        ))}
      </div>

      {/* Book Grid */}
      <div className="books-section">
        <div className="books-section-header">
          <div className="books-label">
            {isKo ? "고전 명작 선집" : "Classic Collection"}
          </div>
          <div className="books-count">
            {books.length}{isKo ? "권" : " books"}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="admin-spinner" />
          </div>
        )}

        {!loading && books.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            {isKo ? "아직 등록된 책이 없어요." : "No books yet."}
          </div>
        )}

        <div className="books-grid">
          {books.map((book, idx) => (
            <Link
              key={book.id}
              to={`/${lang}/book/${book.id}`}
              className={`book-card ${idx === 0 ? "featured" : ""}`}
              style={{ position: "relative" }}
            >
              <div className={`book-cover ${book.cover_theme}`}>
                <div className={`book-cover-spine ${THEME_TO_SPINE[book.cover_theme] || "spine-dark"}`} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  {idx === 0 && (
                    <div className="featured-label">
                      {isKo ? "이번 주 추천" : "Featured This Week"}
                    </div>
                  )}
                  <div className="book-cover-title">
                    {isKo ? book.title_ko : book.title_en}
                  </div>
                </div>
              </div>
              <div className="book-info">
                <div className="book-author">
                  {book.author}
                </div>
                <div className="book-year">
                  {book.year}
                </div>
                <div className="book-tags">
                  {(isKo ? book.tags_ko : book.tags_en).slice(0, 2).map((tag) => (
                    <div key={tag} className="book-tag">{tag}</div>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <button
                  className="admin-edit-pill"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/admin/edit/${book.id}`);
                  }}
                >
                  ✏️
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="spacer" />
    </div>
  );
};

export default HomePage;
