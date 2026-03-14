import { Link, useLocation } from "react-router-dom";

const BookDetailPage = () => {
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");

  const book = isKo
    ? {
        title: "죄와 벌",
        author: "표도르 도스토옙스키",
        year: 1866,
        pages: 671,
        rating: "4.21",
        ratingCount: "560K+ 평점",
        tags: ["심리소설", "러시아문학", "철학", "고전"],
        intro: [
          "도스토옙스키는 이 소설을 빚을 갚기 위해 썼다. 출판사와 계약한 기한은 26일. 속기사를 고용해 구술로 받아쓰게 했고, 기한 하루 전에 원고를 넘겼다. 그 속기사는 나중에 그의 아내가 됐다.",
          "그렇게 탄생한 소설이 지금까지 심리 소설의 교과서로 불린다.",
        ],
        sectionTitle: "가지 주요 요점",
        chapters: [
          {
            num: 1,
            title: "730걸음 — 한 청년의 위험한 수학",
            quote:
              "그는 집에서 노파의 집까지 걸음 수를 세며 걸었다. 730걸음. 한 달 전에도 세어봤고, 지금도 같았다. 그 숫자가 머릿속에서 떠나지 않았다. 지금 그는 예행연습을 하러 가는 것이었다.",
            body: [
              "라스콜니코프는 상트페테르부르크의 낡은 다락방에 살고 있었다. 전직 법대생. 지금은 학비도 집세도 밀린 처지. 그는 몇 달째 한 가지 생각을 혼자 다듬어왔다. 동네의 전당포 노파를 죽이는 것.",
              "그의 논리는 이랬다. 저 노파 하나를 없애면 그 재산으로 수십 명이 살아날 수 있다. 쓸모없는 한 생명과 수십 명의 미래를 맞바꾸는 일 — 이건 범죄가 아니라 수학이다. 나폴레옹은 수천 명을 죽이고도 영웅이 됐다. 나는 그 경계를 넘을 수 있는 인간인가, 아니면 그저 떨기만 하는 보통 사람인가.",
            ],
          },
          {
            num: 2,
            title: "계획에 없던 눈빛",
            quote:
              "리자베타는 두 손을 앞으로 내밀고 그를 바라봤다. 입을 열었지만 소리가 나오지 않았다. 그녀는 뒷걸음치지도, 눈을 돌리지도 않았다. 그저 바라봤다. 아이처럼.",
            body: [
              "이른 저녁, 라스콜니코프는 도끼를 들고 노파의 집에 들어갔다. 노파가 등을 돌린 순간 그는 도끼를 내리쳤다. 그런데 그 순간 뒷방에서 소리가 났다. 노파의 이복 동생 리자베타였다. 순하고 가난한 여자로, 노파에게 착취당하며 살던 사람. 계획에 없던 존재였다.",
              "착취자가 아닌, 착취당하던 사람의 죽음이었다. 그는 훔친 물건들을 장롱 밑에 숨기고 쓰러졌다. 열이 올랐다. 의식이 흐릿해졌다.",
            ],
          },
          {
            num: 3,
            title: "벌은 법정에서 오지 않았다",
            quote:
              "그는 길을 걷다 멈췄다. 누군가 자신을 보고 있는 것 같았다. 돌아봤지만 아무도 없었다. 다시 걸었다. 또 멈췄다. 그는 자신이 무엇을 두려워하는지 알 수 없었다. 아니, 알고 있었다. 그래서 더 두려웠다.",
            body: [
              "경찰은 그를 의심하지 않았다. 목격자도, 증거도 없었다. 그는 완벽하게 빠져나온 것처럼 보였다. 하지만 그의 내부에서 무언가가 무너지기 시작했다.",
              "논리적으로 완벽했던 이론이 실제 죽음 앞에서 아무 의미도 없어졌다. 노파는 나쁜 사람이었다. 하지만 리자베타는? 그는 그 얼굴을 지울 수가 없었다.",
            ],
          },
          {
            num: 4,
            title: "소냐 — 논리 없이 살아남은 사람",
            quote:
              "소냐는 한동안 말이 없었다. 그러다 천천히 그를 바라봤다. 공포도 경멸도 아니었다. 그녀의 눈에는 오직 헤아릴 수 없는 슬픔만이 가득했다. \"자수하세요,\" 그녀가 말했다. \"가서, 네거리에 무릎을 꿇고, 당신이 더럽힌 땅에 입을 맞추세요.\"",
            body: [
              "소냐는 라스콜니코프와 정반대의 삶을 살고 있었다. 논리도 이론도 없이, 그저 고통 속에서도 무너지지 않고 살아가는 사람. 라스콜니코프는 설명할 수 없는 이끌림으로 그녀에게 고백했다. 자신이 그 노파를 죽였다고.",
              "라스콜니코프는 거부했다. 자신이 틀렸다고는 생각하지 않았다. 실패한 건 이론이 틀려서가 아니라 자신이 나폴레옹이 아니었기 때문이라고, 그 한 가지만 인정했다.",
            ],
          },
          {
            num: 5,
            title: "포르피리 — 기다리는 사람",
            quote:
              "\"당신은 결국 우리에게 올 거예요. 스스로. 그게 인간이라는 거니까요. 나는 그냥 기다리면 됩니다.\"",
            body: [
              "수사 담당 예심판사 포르피리는 직접적으로 의심한다는 말을 한 번도 하지 않았다. 대신 철학 이야기를 꺼냈다. 위대한 인간과 평범한 인간의 구분에 대한 논문을 읽었다고. 라스콜니코프가 예전에 쓴 글이었다.",
              "두 사람은 서로 알면서 모르는 척하는 대화를 반복했다. 라스콜니코프는 포르피리의 말을 비웃었다. 하지만 밤마다 잠을 이루지 못했다.",
            ],
          },
          {
            num: 6,
            title: "네거리, 무릎, 그리고 고백",
            quote:
              "깨어난 뒤 그는 창밖을 봤다. 소냐가 거기 서 있었다. 그를 바라보고 있었다. 그 순간 무언가가 그의 안에서 끊어졌다. 그는 소냐의 발 앞에 무릎을 꿇고 울었다. 왜 우는지 몰랐다. 그냥 울었다. 그것이 시작이었다.",
            body: [
              "소냐가 말했다. 네거리에 나가서 무릎을 꿇어라. 라스콜니코프는 네거리에 나갔다. 무릎을 꿇었다. 사람들이 수군댔다. 그는 일어나 경찰서로 걸어갔다. \"내가 도끼로 노파를 죽였습니다.\"",
              "시베리아 유형 8년. 소냐는 자원해서 따라갔다. 수용소에서도 그는 달라지지 않았다. 자수한 것도 후회했다. 그러다 열에 들뜬 꿈을 꿨다 — 모든 사람이 자신만이 옳다고 확신하는 역병의 꿈. 사람들은 서로를 이해하지 못하고, 각자의 논리로 싸우다 세상이 무너졌다.",
            ],
          },
        ],
        closing: [
          "도스토옙스키는 이 소설을 쓰기 전 출판사에 보낸 편지에서 직접 밝혔다. 이성만으로 모든 것을 정당화할 수 있다는 사상이 인간에게 얼마나 위험한지를 보여주고 싶었다고.",
          "라스콜니코프는 끝내 논리로 무너지지 않았다. 그를 무너뜨린 건 리자베타의 눈빛이었고, 소냐의 울음이었고, 아무 이유 없이 자신을 따라온 한 사람의 존재였다.",
        ],
        closingBold:
          "도스토옙스키가 소냐에 대해 남긴 작가 노트에는 이런 메모가 있다. ",
        closingBoldText: "\"스비드리가일로프 — 절망. 소냐 — 희망.\"",
        questionLabel: "이 책을 읽고 난 뒤",
        questionLines: [
          "나는 지금 어떤 논리로 내 행동을 정당화하고 있는가.",
          "그리고 그 논리가 무너진다면, 내 곁에 소냐가 있는가.",
        ],
      }
    : {
        title: "Crime and Punishment",
        author: "Fyodor Dostoevsky",
        year: 1866,
        pages: 671,
        rating: "4.21",
        ratingCount: "560K+ ratings",
        tags: ["Psychological Fiction", "Russian Literature", "Philosophy", "Classic"],
        intro: [
          "Dostoevsky wrote this novel to pay off debt. The publisher's deadline was 26 days. He hired a stenographer and finished the manuscript the day before. That stenographer later became his wife.",
          "The novel born from that urgency is still called the textbook of psychological fiction.",
        ],
        sectionTitle: "Key Points",
        chapters: [
          {
            num: 1,
            title: "730 Steps — A Young Man's Dangerous Math",
            quote: "He counted steps from his room to the old woman's place. 730 steps.",
            body: [
              "Raskolnikov lived in a cramped attic in St. Petersburg. A former law student with unpaid rent and tuition.",
              "His logic: eliminate one useless life to save dozens. Not crime, but mathematics.",
            ],
          },
        ],
        closing: [
          "Dostoevsky revealed in a letter that he wanted to show how dangerous it is when reason alone justifies everything.",
        ],
        closingBold: "In his notes about Sonya: ",
        closingBoldText: "\"Svidrigailov — despair. Sonya — hope.\"",
        questionLabel: "After reading this book",
        questionLines: [
          "What logic am I using to justify my actions right now?",
          "And if that logic collapses, is there a Sonya by my side?",
        ],
      };

  const spineTitle = isKo ? "죄와 벌" : "Crime";
  const authorLabel = isKo ? "저자" : "by";

  return (
    <>
      {/* HERO */}
      <div className="book-detail-hero">
        <div className="shelf-scene">
          <div className="books-row">
            <div className="book-spine b1"></div>
            <div className="book-spine b2"></div>
            <div className="book-spine b3"></div>
            <div className="book-spine b-main active">
              <div className="spine-inner"></div>
              <div className="spine-text">{spineTitle}</div>
            </div>
            <div className="book-spine b5"></div>
            <div className="book-spine b6"></div>
            <div className="book-spine b7"></div>
            <div className="book-spine b8"></div>
          </div>
          <div className="shelf-plank"></div>
        </div>
        <div className="hero-info">
          <div className="hero-info-left">
            <div className="book-title-hero">{book.title}</div>
            <div className="book-meta">
              {authorLabel} <strong>{book.author}</strong>
              <span className="sep">|</span> {book.year}
              <span className="sep">|</span> {book.pages}p
            </div>
            <div className="rating">
              <div className="rating-num">{book.rating}</div>
              <div className="stars">★★★★☆</div>
              <div className="rating-count">{book.ratingCount}</div>
            </div>
            <div className="tags">
              {book.tags.map((tag) => (
                <div key={tag} className="tag">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INTRO */}
      <div className="intro-card">
        {book.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* SECTION TITLE */}
      <div className="section-header">{book.sectionTitle}</div>

      {/* CHAPTERS */}
      {book.chapters.map((ch) => (
        <div key={ch.num} className="chapter-card">
          <div className="chapter-header">
            <div className="chapter-num">{ch.num}</div>
            <div className="chapter-title">{ch.title}</div>
          </div>
          <div className="chapter-quote">{ch.quote}</div>
          <div className="chapter-body">
            {ch.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      ))}

      {/* CLOSING */}
      <div className="closing-card">
        {book.closing.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          {book.closingBold}
          <strong>{book.closingBoldText}</strong>
        </p>
      </div>

      {/* QUESTION CARD */}
      <div className="question-card">
        <div className="question-label">{book.questionLabel}</div>
        <div className="question-text">
          {book.questionLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < book.questionLines.length - 1 && (
                <>
                  <br />
                  <br />
                </>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="spacer"></div>
    </>
  );
};

export default BookDetailPage;
