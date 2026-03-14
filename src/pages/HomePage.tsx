import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface BookData {
  slug: string;
  titleKo: string;
  titleEn: string;
  authorKo: string;
  authorEn: string;
  year: number;
  theme: string;
  spine: string;
  tagsKo: string[];
  tagsEn: string[];
  featured?: boolean;
  descKo?: string;
  descEn?: string;
}

const books: BookData[] = [
  {
    slug: "crime-and-punishment",
    titleKo: "죄와 벌",
    titleEn: "Crime and Punishment",
    authorKo: "표도르 도스토옙스키",
    authorEn: "Fyodor Dostoevsky",
    year: 1866,
    theme: "theme-dark",
    spine: "spine-dark",
    tagsKo: ["심리소설", "러시아"],
    tagsEn: ["Psychological", "Russian"],
    featured: true,
    descKo: "이성의 오만, 그리고 양심에서 오는 벌에 대한 이야기",
    descEn: "A story of intellectual arrogance and the punishment of conscience",
  },
  {
    slug: "a-tale-of-two-cities",
    titleKo: "두 도시 이야기",
    titleEn: "A Tale of Two Cities",
    authorKo: "찰스 디킨스",
    authorEn: "Charles Dickens",
    year: 1859,
    theme: "theme-crimson",
    spine: "spine-crimson",
    tagsKo: ["역사소설", "혁명"],
    tagsEn: ["Historical", "Revolution"],
  },
  {
    slug: "1984",
    titleKo: "1984",
    titleEn: "1984",
    authorKo: "조지 오웰",
    authorEn: "George Orwell",
    year: 1949,
    theme: "theme-navy",
    spine: "spine-navy",
    tagsKo: ["디스토피아", "정치"],
    tagsEn: ["Dystopia", "Politics"],
  },
  {
    slug: "moby-dick",
    titleKo: "모비딕",
    titleEn: "Moby Dick",
    authorKo: "허먼 멜빌",
    authorEn: "Herman Melville",
    year: 1851,
    theme: "theme-teal",
    spine: "spine-teal",
    tagsKo: ["모험", "집착"],
    tagsEn: ["Adventure", "Obsession"],
  },
  {
    slug: "jane-eyre",
    titleKo: "제인 에어",
    titleEn: "Jane Eyre",
    authorKo: "샬럿 브론테",
    authorEn: "Charlotte Brontë",
    year: 1847,
    theme: "theme-purple",
    spine: "spine-purple",
    tagsKo: ["성장", "사랑"],
    tagsEn: ["Growth", "Love"],
  },
  {
    slug: "the-metamorphosis",
    titleKo: "변신",
    titleEn: "The Metamorphosis",
    authorKo: "프란츠 카프카",
    authorEn: "Franz Kafka",
    year: 1915,
    theme: "theme-green",
    spine: "spine-green",
    tagsKo: ["부조리", "철학"],
    tagsEn: ["Absurdist", "Philosophy"],
  },
];

const filtersKo = ["전체", "심리소설", "러시아문학", "영국문학", "철학", "비극", "사랑", "19세기"];
const filtersEn = ["All", "Psychological", "Russian Lit", "British Lit", "Philosophy", "Tragedy", "Love", "19th Century"];

const HomePage = () => {
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");
  const lang = isKo ? "ko" : "en";
  const filters = isKo ? filtersKo : filtersEn;
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <div className="hero">
      {/* Tagline */}
      <div className="hero-tagline">
        <div className="tagline-sub">Classic Literature</div>
        <div className="tagline-main">
          {isKo ? (
            <>위대한 고전을<br /><em>5분</em>에 만나다</>
          ) : (
            <>Great Classics,<br /><em>Distilled</em></>
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

        <div className="books-grid">
          {books.map((book) => (
            <Link
              key={book.slug}
              to={`/${lang}/book/${book.slug}`}
              className={`book-card ${book.featured ? "featured" : ""}`}
              style={{ animationDelay: book.featured ? "0.1s" : undefined }}
            >
              <div className={`book-cover ${book.theme}`}>
                <div className={`book-cover-spine ${book.spine}`} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  {book.featured && (
                    <div className="featured-label">
                      {isKo ? "이번 주 추천" : "Featured This Week"}
                    </div>
                  )}
                  <div className="book-cover-title">
                    {isKo ? book.titleKo : book.titleEn}
                  </div>
                </div>
              </div>
              <div className="book-info">
                <div className="book-author">
                  {isKo ? book.authorKo : book.authorEn} · {book.year}
                </div>
                <div className="book-tags">
                  {(isKo ? book.tagsKo : book.tagsEn).map((tag) => (
                    <div key={tag} className="book-tag">{tag}</div>
                  ))}
                </div>
                {book.featured && (
                  <>
                    <div className="featured-desc">
                      {isKo ? book.descKo : book.descEn}
                    </div>
                    <div className="featured-arrow">→</div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="spacer" />
    </div>
  );
};

export default HomePage;
