import { useParams, useLocation } from "react-router-dom";

const bookData: Record<string, Record<string, any>> = {
  "crime-and-punishment": {
    en: {
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      year: 1866,
      pages: 671,
      rating: 4.21,
      ratingCount: "560K+",
      tags: ["Psychological Fiction", "Russian Literature", "Philosophy", "Classic"],
      intro: "Dostoevsky wrote this novel to pay off debt. The publisher's deadline was 26 days. He hired a stenographer and finished the manuscript the day before. That stenographer later became his wife.\n\nThe novel born from that urgency is still called the textbook of psychological fiction.",
      chapters: [
        {
          num: 1,
          title: "730 Steps — A Young Man's Dangerous Math",
          quote: "He had been counting the steps from his room to the old woman's place. 730 steps. He had counted them a month ago, and again today. The number wouldn't leave his mind. Now he was going to rehearse.",
          body: "Raskolnikov lived in a cramped attic in St. Petersburg. A former law student. Rent unpaid, tuition unpaid. For months he had been nursing a single thought. To kill the pawnbroker woman in his neighborhood.\n\nHis logic was this: if one eliminates that old woman, dozens of lives can be saved with her fortune. A useless life exchanged for many — not a crime, but mathematics. Napoleon killed thousands and became a hero. Can I cross that boundary, or am I just an ordinary person who only trembles?"
        },
        {
          num: 2,
          title: "The Unplanned Witness",
          quote: "Lizaveta placed both hands in front of her and stared at him. She opened her mouth but no sound came. She didn't step back, didn't look away. She just stared. Like a child.",
          body: "One early evening, Raskolnikov took the axe and entered the old woman's house. The moment she turned her back, he brought the axe down. But then — a sound from the back room. The old woman's half-sister, Lizaveta. A gentle, poor woman who had been exploited by the pawnbroker all her life. An unplanned death.\n\nNot an exploiter, but an exploited person's death. He hid the stolen goods under a chest and collapsed. Fever rose. Consciousness blurred."
        },
      ],
    },
    ko: {
      title: "죄와 벌",
      author: "표도르 도스토옙스키",
      year: 1866,
      pages: 671,
      rating: 4.21,
      ratingCount: "560K+",
      tags: ["심리소설", "러시아문학", "철학", "고전"],
      intro: "도스토옙스키는 이 소설을 빚을 갚기 위해 썼다. 출판사와 계약한 기한은 26일. 속기사를 고용해 구술로 받아쓰게 했고, 기한 하루 전에 원고를 넘겼다. 그 속기사는 나중에 그의 아내가 됐다.\n\n그렇게 탄생한 소설이 지금까지 심리 소설의 교과서로 불린다.",
      chapters: [
        {
          num: 1,
          title: "730걸음 — 한 청년의 위험한 수학",
          quote: "그는 집에서 노파의 집까지 걸음 수를 세며 걸었다. 730걸음. 한 달 전에도 세어봤고, 지금도 같았다. 그 숫자가 머릿속에서 떠나지 않았다. 지금 그는 예행연습을 하러 가는 것이었다.",
          body: "라스콜니코프는 상트페테르부르크의 낡은 다락방에 살고 있었다. 전직 법대생. 지금은 학비도 집세도 밀린 처지. 그는 몇 달째 한 가지 생각을 혼자 다듬어왔다. 동네의 전당포 노파를 죽이는 것.\n\n그의 논리는 이랬다. 저 노파 하나를 없애면 그 재산으로 수십 명이 살아날 수 있다. 쓸모없는 한 생명과 수십 명의 미래를 맞바꾸는 일 — 이건 범죄가 아니라 수학이다. 나폴레옹은 수천 명을 죽이고도 영웅이 됐다. 나는 그 경계를 넘을 수 있는 인간인가, 아니면 그저 떨기만 하는 보통 사람인가."
        },
        {
          num: 2,
          title: "계획에 없던 눈빛",
          quote: "리자베타는 두 손을 앞으로 내밀고 그를 바라봤다. 입을 열었지만 소리가 나오지 않았다. 그녀는 뒷걸음치지도, 눈을 돌리지도 않았다. 그저 바라봤다. 아이처럼.",
          body: "이른 저녁, 라스콜니코프는 도끼를 들고 노파의 집에 들어갔다. 노파가 등을 돌린 순간 그는 도끼를 내리쳤다. 그런데 그 순간 뒷방에서 소리가 났다. 노파의 이복 동생 리자베타였다. 순하고 가난한 여자로, 노파에게 착취당하며 살던 사람. 계획에 없던 죽음이었다.\n\n착취자가 아닌, 착취당하던 사람의 죽음이었다. 그는 훔친 물건들을 장롱 밑에 숨기고 쓰러졌다. 열이 올랐다. 의식이 흐릿해졌다."
        },
      ],
    },
  },
};

const coverColors = ["bg-emerald-900", "bg-violet-900", "bg-amber-800", "bg-sky-900", "bg-rose-900"];

const BookDetailPage = () => {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");
  const lang = isKo ? "ko" : "en";
  const book = slug ? bookData[slug]?.[lang] : null;

  if (!book) {
    return (
      <div className="py-16 text-center text-chaek-ink/40">
        {isKo ? "책을 찾을 수 없습니다" : "Book not found"}
      </div>
    );
  }

  return (
    <div className="-mx-6 -mt-8">
      {/* Hero bookshelf */}
      <div className="bg-chaek-ink px-6 pt-6 pb-0">
        <div className="flex gap-1.5 pb-6">
          {coverColors.map((color, i) => (
            <div key={i} className={`${color} w-10 h-32 rounded-sm flex items-center justify-center`}>
              {i === 0 && (
                <span
                  className="text-chaek-gold font-serif text-[9px]"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {book.title.slice(0, 6)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-chaek-gold rounded-t-sm" />
      </div>

      {/* Book info */}
      <div className="px-6 pt-6 space-y-4">
        <h1 className="font-serif text-3xl">{book.title}</h1>
        <p className="text-chaek-ink/50 text-sm">
          {isKo ? "저자" : "by"}{" "}
          <span className="font-medium text-chaek-ink/80">{book.author}</span>
          <span className="mx-2">|</span>{book.year}
          <span className="mx-2">|</span>{book.pages}p
        </p>

        <div className="flex items-center gap-2">
          <span className="font-display font-bold">{book.rating}</span>
          <span className="text-chaek-gold">{"★".repeat(Math.floor(book.rating))}{"☆".repeat(5 - Math.floor(book.rating))}</span>
          <span className="text-chaek-ink/40 text-xs">{book.ratingCount} {isKo ? "평점" : "ratings"}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {book.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-sm border border-chaek-ink/10 text-chaek-ink/60">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Intro card */}
      <div className="mx-6 mt-8 bg-chaek-ink rounded-lg p-6">
        {book.intro.split("\n\n").map((p: string, i: number) => (
          <p key={i} className="text-primary-foreground/80 text-sm leading-relaxed mb-3 last:mb-0">
            {p}
          </p>
        ))}
      </div>

      {/* Chapters */}
      <div className="px-6 mt-10 mb-8">
        <h2 className="font-serif text-2xl mb-6">
          {isKo ? "가지 주요 요점" : "Key Points"}
        </h2>

        <div className="space-y-6">
          {book.chapters.map((ch: any) => (
            <div key={ch.num} className="bg-chaek-card rounded-lg p-6 shadow-chaek">
              <div className="flex items-start gap-4 mb-4">
                <span className="font-display text-3xl text-chaek-gold/60 leading-none">
                  {ch.num}
                </span>
                <h3 className="font-serif text-lg leading-snug pt-1">{ch.title}</h3>
              </div>

              {/* Quote */}
              <div className="border-l-2 border-chaek-gold/40 pl-4 mb-5">
                <p className="text-sm text-chaek-ink/60 italic leading-relaxed">
                  {ch.quote}
                </p>
              </div>

              {/* Body */}
              {ch.body.split("\n\n").map((p: string, i: number) => (
                <p key={i} className="text-sm leading-relaxed text-chaek-ink/80 mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
