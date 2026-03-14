import { Link, useLocation } from "react-router-dom";

interface BookEntry {
  slug: string;
  title: string;
  author: string;
  year: number;
  pages: number;
  rating: string;
  ratingCount: string;
  tags: string[];
  spineLabel: string;
  featured?: boolean;
  chapters: {
    num: number;
    title: string;
    quote: string;
    summary: string;
  }[];
}

const booksKo: BookEntry[] = [
  {
    slug: "crime-and-punishment",
    title: "죄와 벌",
    author: "표도르 도스토옙스키",
    year: 1866,
    pages: 671,
    rating: "4.21",
    ratingCount: "560K+",
    tags: ["심리소설", "러시아문학", "철학", "고전"],
    spineLabel: "죄와 벌",
    featured: true,
    chapters: [
      {
        num: 1,
        title: "730걸음 — 한 청년의 위험한 수학",
        quote: "그는 집에서 노파의 집까지 걸음 수를 세며 걸었다. 730걸음.",
        summary:
          "라스콜니코프는 상트페테르부르크의 낡은 다락방에 살고 있었다. 전직 법대생. 그는 몇 달째 한 가지 생각을 혼자 다듬어왔다.",
      },
      {
        num: 2,
        title: "계획에 없던 눈빛",
        quote: "리자베타는 두 손을 앞으로 내밀고 그를 바라봤다.",
        summary:
          "이른 저녁, 라스콜니코프는 도끼를 들고 노파의 집에 들어갔다. 계획에 없던 존재가 나타났다.",
      },
      {
        num: 3,
        title: "벌은 법정에서 오지 않았다",
        quote: "그는 길을 걷다 멈췄다. 누군가 자신을 보고 있는 것 같았다.",
        summary:
          "경찰은 그를 의심하지 않았다. 하지만 그의 내부에서 무언가가 무너지기 시작했다.",
      },
    ],
  },
];

const booksEn: BookEntry[] = [
  {
    slug: "crime-and-punishment",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    year: 1866,
    pages: 671,
    rating: "4.21",
    ratingCount: "560K+",
    tags: ["Psychological Fiction", "Russian Literature", "Philosophy", "Classic"],
    spineLabel: "Crime",
    featured: true,
    chapters: [
      {
        num: 1,
        title: "730 Steps — A Young Man's Dangerous Math",
        quote: "He counted steps from his room to the old woman's place. 730 steps.",
        summary:
          "Raskolnikov lived in a cramped attic in St. Petersburg. A former law student nursing a dangerous idea.",
      },
      {
        num: 2,
        title: "The Unplanned Witness",
        quote: "Lizaveta placed both hands in front of her and stared at him.",
        summary:
          "One early evening, Raskolnikov entered the old woman's house with an axe. An unplanned witness appeared.",
      },
      {
        num: 3,
        title: "Punishment Came Not from the Court",
        quote: "He stopped walking. Someone seemed to be watching him.",
        summary:
          "The police didn't suspect him. But something inside him began to collapse.",
      },
    ],
  },
];

const spineBooks = [
  { cls: "b1", width: 26, bg: "linear-gradient(to bottom, #2d4d2d, #1b3020)" },
  { cls: "b2", width: 20, bg: "linear-gradient(to bottom, #4c2b6c, #2e1a4c)" },
  { cls: "b3", width: 18, bg: "linear-gradient(to bottom, #1e2e50, #101c34)" },
  { cls: "b-main", width: 32, bg: "linear-gradient(160deg, #1a1208 0%, #2c1e10 45%, #1a1208 100%)", featured: true },
  { cls: "b5", width: 24, bg: "linear-gradient(to bottom, #4c1c1c, #301010)" },
  { cls: "b6", width: 22, bg: "linear-gradient(to bottom, #3c3222, #251e12)" },
  { cls: "b7", width: 28, bg: "linear-gradient(to bottom, #1c3c4e, #0e2430)" },
  { cls: "b8", width: 16, bg: "linear-gradient(to bottom, #3c2c1c, #22180a)" },
];

const HomePage = () => {
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");
  const lang = isKo ? "ko" : "en";
  const books = isKo ? booksKo : booksEn;
  const featuredBook = books[0];

  return (
    <div>
      {/* ── HERO BOOKSHELF ── */}
      <div className="home-hero">
        <div className="home-shelf-scene">
          <div className="home-books-row">
            {spineBooks.map((spine, i) => (
              <div
                key={i}
                className={`home-spine ${spine.featured ? "home-spine-featured" : ""}`}
                style={{ width: spine.width, background: spine.bg }}
              >
                {spine.featured && (
                  <>
                    <div className="home-spine-inner" />
                    <div className="home-spine-text">{featuredBook.spineLabel}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="home-shelf-plank" />
        </div>

        {/* Book info panel */}
        <div className="home-book-info">
          <Link
            to={`/${lang}/book/${featuredBook.slug}`}
            className="home-book-info-link"
          >
            <div className="home-book-title">{featuredBook.title}</div>
            <div className="home-book-meta">
              {isKo ? "저자" : "by"}{" "}
              <strong>{featuredBook.author}</strong>
              <span className="home-sep">|</span>
              {featuredBook.year}
              <span className="home-sep">|</span>
              {featuredBook.pages}p
            </div>
            <div className="home-rating">
              <span className="home-rating-num">{featuredBook.rating}</span>
              <span className="home-stars">★★★★☆</span>
              <span className="home-rating-count">
                {featuredBook.ratingCount} {isKo ? "평점" : "ratings"}
              </span>
            </div>
            <div className="home-tags">
              {featuredBook.tags.map((tag) => (
                <span key={tag} className="home-tag">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </div>
      </div>

      {/* ── BOOK CARDS SECTION ── */}
      <div className="home-cards-section">
        <div className="home-section-label">
          {isKo ? "제1권" : "Volume 01"}
        </div>
        <h2 className="home-section-title">
          {isKo ? "고전 명작 선집" : "Featured Classics"}
        </h2>

        {books.map((book) => (
          <Link
            key={book.slug}
            to={`/${lang}/book/${book.slug}`}
            className="home-book-card"
          >
            {/* Mini bookshelf on card */}
            <div className="home-card-shelf">
              {spineBooks.slice(0, 5).map((spine, i) => (
                <div
                  key={i}
                  className="home-card-spine"
                  style={{
                    width: Math.max(spine.width * 0.7, 12),
                    background: spine.bg,
                    height: spine.featured ? 72 : 60,
                  }}
                />
              ))}
            </div>

            <div className="home-card-content">
              <div className="home-card-title">{book.title}</div>
              <div className="home-card-author">
                {isKo ? "저자" : "by"} {book.author} · {book.year}
              </div>

              <div className="home-card-divider" />

              {/* Chapter previews */}
              <div className="home-chapter-previews">
                {book.chapters.map((ch) => (
                  <div key={ch.num} className="home-chapter-preview">
                    <span className="home-ch-num">{ch.num}</span>
                    <div className="home-ch-right">
                      <div className="home-ch-title">{ch.title}</div>
                      <div className="home-ch-quote">{ch.quote}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="spacer" />
    </div>
  );
};

export default HomePage;
