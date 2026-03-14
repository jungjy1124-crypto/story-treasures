import { Link, useLocation } from "react-router-dom";

const books = {
  en: [
    {
      slug: "crime-and-punishment",
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      year: 1866,
      pages: 671,
      rating: 4.21,
      tags: ["Psychological Fiction", "Russian Literature", "Philosophy", "Classic"],
      blurb: "Dostoevsky wrote this novel to pay off debt. The publisher's deadline was 26 days. He hired a stenographer and finished the manuscript the day before. That stenographer later became his wife.",
    },
    {
      slug: "the-great-gatsby",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      year: 1925,
      pages: 180,
      rating: 3.93,
      tags: ["American Literature", "Modernism", "Classic"],
      blurb: "A portrait of the Jazz Age in all of its decadence and excess, Gatsby captured the American spirit of the 1920s through the eyes of the enigmatic Jay Gatsby.",
    },
  ],
  ko: [
    {
      slug: "crime-and-punishment",
      title: "죄와 벌",
      author: "표도르 도스토옙스키",
      year: 1866,
      pages: 671,
      rating: 4.21,
      tags: ["심리소설", "러시아문학", "철학", "고전"],
      blurb: "도스토옙스키는 이 소설을 빚을 갚기 위해 썼다. 출판사와 계약한 기한은 26일. 속기사를 고용해 구술로 받아쓰게 했고, 기한 하루 전에 원고를 넘겼다. 그 속기사는 나중에 그의 아내가 됐다.",
    },
    {
      slug: "the-great-gatsby",
      title: "위대한 개츠비",
      author: "F. 스콧 피츠제럴드",
      year: 1925,
      pages: 180,
      rating: 3.93,
      tags: ["미국문학", "모더니즘", "고전"],
      blurb: "재즈 시대의 화려함과 과잉을 그린 이 소설은 수수께끼 같은 제이 개츠비의 눈을 통해 1920년대 미국의 정신을 포착했다.",
    },
  ],
};

const coverColors = [
  "bg-emerald-900",
  "bg-violet-900",
  "bg-amber-800",
  "bg-sky-900",
  "bg-rose-900",
];

const HomePage = () => {
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");
  const lang = isKo ? "ko" : "en";
  const bookList = books[lang];

  return (
    <div className="space-y-10">
      <section>
        <p className="font-display text-chaek-gold text-sm tracking-[0.2em] uppercase mb-2">
          {isKo ? "제1권" : "Volume 01"}
        </p>
        <h2 className="font-serif text-4xl leading-tight mb-8">
          {isKo ? "고전 명작 선집" : "Featured Classics"}
        </h2>

        <div className="space-y-6">
          {bookList.map((book, i) => (
            <Link
              key={book.slug}
              to={`/${lang}/book/${book.slug}`}
              className="group block bg-chaek-card p-6 rounded-lg shadow-chaek transition-all duration-200 ease-chaek hover:-translate-y-0.5 hover:shadow-chaek-hover"
            >
              {/* Mini bookshelf */}
              <div className="flex gap-1 mb-5">
                {coverColors.slice(0, 3 + (i % 2)).map((color, ci) => (
                  <div
                    key={ci}
                    className={`${color} w-8 h-24 rounded-sm flex items-center justify-center`}
                  >
                    {ci === 0 && (
                      <span className="text-chaek-gold font-serif text-[8px] writing-mode-vertical whitespace-nowrap"
                        style={{ writingMode: "vertical-rl" }}
                      >
                        {book.title.slice(0, 6)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="font-serif text-2xl mb-1">{book.title}</h3>
              <p className="text-chaek-ink/50 text-sm mb-1">
                {isKo ? "저자" : "by"}{" "}
                <span className="font-medium text-chaek-ink/70">{book.author}</span>
                <span className="mx-2">|</span>
                {book.year}
                <span className="mx-2">|</span>
                {book.pages}p
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-display font-bold text-sm">{book.rating}</span>
                <span className="text-chaek-gold text-sm">{"★".repeat(Math.floor(book.rating))}{"☆".repeat(5 - Math.floor(book.rating))}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-sm border border-chaek-ink/10 text-chaek-ink/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="h-px w-12 bg-chaek-gold/30 mb-4" />
              <p className="text-sm leading-relaxed text-chaek-ink/70 line-clamp-3">
                {book.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
