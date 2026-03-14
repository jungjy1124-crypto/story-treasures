import { Link, useLocation } from "react-router-dom";

const HomePage = () => {
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");
  const lang = isKo ? "ko" : "en";

  const books = [
    {
      slug: "crime-and-punishment",
      title: isKo ? "죄와 벌" : "Crime and Punishment",
      author: isKo ? "표도르 도스토옙스키" : "Fyodor Dostoevsky",
      year: 1866,
      desc: isKo
        ? "도스토옙스키는 이 소설을 빚을 갚기 위해 썼다. 그렇게 탄생한 소설이 지금까지 심리 소설의 교과서로 불린다."
        : "Dostoevsky wrote this novel to pay off debt. The novel born from that urgency is still called the textbook of psychological fiction.",
    },
  ];

  return (
    <div style={{ padding: "28px 20px 80px" }}>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "var(--accent)",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          marginBottom: 8,
        }}
      >
        {isKo ? "제1권" : "Volume 01"}
      </div>
      <h2
        style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 24,
          letterSpacing: -0.4,
        }}
      >
        {isKo ? "고전 명작 선집" : "Featured Classics"}
      </h2>

      {books.map((book) => (
        <Link
          key={book.slug}
          to={`/${lang}/book/${book.slug}`}
          style={{
            display: "block",
            background: "var(--card)",
            borderRadius: 14,
            padding: 20,
            marginBottom: 12,
            border: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <div
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {book.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            {isKo ? "저자" : "by"} {book.author} · {book.year}
          </div>
          <div style={{ height: 1, width: 40, background: "var(--accent)", opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "#555" }}>
            {book.desc}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
