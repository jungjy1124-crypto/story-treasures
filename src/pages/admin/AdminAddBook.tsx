import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AdminBookEditor from "./AdminBookEditor";

const THEMES = [
  { value: "theme-dark", label: "거의 검정" },
  { value: "theme-crimson", label: "진한 빨강" },
  { value: "theme-navy", label: "네이비" },
  { value: "theme-teal", label: "틸" },
  { value: "theme-purple", label: "보라" },
  { value: "theme-green", label: "진한 초록" },
];

const MOCK_SUMMARY = {
  intro: "표도르 도스토옙스키는 19세기 러시아 문학의 거장으로, 인간 심리의 깊은 곳을 탐구한 작가입니다. 이 작품은 상트페테르부르크를 배경으로 한 빈곤한 전직 대학생의 도덕적 갈등을 다룹니다.",
  chapters: Array.from({ length: 6 }, (_, i) => ({
    number: i + 1,
    title_ko: `제${i + 1}부: 챕터 제목`,
    title_en: `Part ${i + 1}: Chapter Title`,
    quote_ko: "어둠 속에서도 빛은 존재한다. 그것을 찾는 것은 우리의 몫이다.",
    quote_en: "Even in darkness, light exists. Finding it is our responsibility.",
    body_ko: "이 장에서는 주인공의 내적 갈등이 심화됩니다. 그는 자신의 행동이 정당한 것인지 끊임없이 고민하며, 주변 인물들과의 관계를 통해 인간 본성의 복잡함을 드러냅니다.",
    body_en: "In this chapter, the protagonist's internal conflict deepens. He constantly questions the justification of his actions, revealing the complexity of human nature through his relationships with surrounding characters.",
  })),
  closing_ko: "이 작품은 죄의식과 구원의 가능성에 대한 깊은 성찰을 담고 있습니다. 도스토옙스키는 인간의 고통과 도덕적 회복의 과정을 섬세하게 그려냅니다.",
  closing_en: "This work contains deep reflections on guilt and the possibility of redemption. Dostoevsky delicately portrays the process of human suffering and moral recovery.",
  question_ko: "우리는 과연 누군가의 고통을 온전히 이해할 수 있을까요? 그리고 그 이해가 진정한 용서로 이어질 수 있을까요?",
  question_en: "Can we truly understand someone's suffering? And can that understanding lead to genuine forgiveness?",
  tags_ko: ["러시아문학", "심리소설", "도덕", "구원"],
  tags_en: ["Russian Literature", "Psychological Novel", "Morality", "Redemption"],
  rating: 4.2,
};

interface BookInfo {
  gutenberg_url: string;
  title_ko: string;
  title_en: string;
  author: string;
  year: string;
  pages: string;
  cover_theme: string;
}

export default function AdminAddBook() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<BookInfo>({
    gutenberg_url: "",
    title_ko: "",
    title_en: "",
    author: "",
    year: "",
    pages: "",
    cover_theme: "theme-dark",
  });
  const [summary, setSummary] = useState<typeof MOCK_SUMMARY | null>(null);

  const allFilled = info.gutenberg_url && info.title_ko && info.title_en && info.author && info.year && info.pages;

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setSummary({ ...MOCK_SUMMARY });
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleSave = () => {
    toast({
      title: "✅ 책이 추가됐어요!",
      description: "백엔드 연결 후 실제 저장됩니다",
    });
    navigate("/admin/books");
  };

  return (
    <div>
      <h1 className="admin-page-title">새 책 추가</h1>

      {/* Step indicator */}
      <div className="admin-steps">
        <span className={`admin-step${step >= 1 ? " active" : ""}`}>① 기본 정보</span>
        <span className="admin-step-arrow">→</span>
        <span className={`admin-step${step >= 2 ? " active" : ""}`}>② AI 요약 생성</span>
        <span className="admin-step-arrow">→</span>
        <span className={`admin-step${step >= 3 ? " active" : ""}`}>③ 검토 및 저장</span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="admin-card">
          <div className="admin-form-grid">
            <div className="admin-field full">
              <label>Gutenberg URL</label>
              <input
                className="admin-input"
                placeholder="https://www.gutenberg.org/files/2554/2554-0.txt"
                value={info.gutenberg_url}
                onChange={(e) => setInfo({ ...info, gutenberg_url: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label>제목 (한국어)</label>
              <input className="admin-input" value={info.title_ko} onChange={(e) => setInfo({ ...info, title_ko: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Title (English)</label>
              <input className="admin-input" value={info.title_en} onChange={(e) => setInfo({ ...info, title_en: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>저자 / Author</label>
              <input className="admin-input" value={info.author} onChange={(e) => setInfo({ ...info, author: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>출판연도 / Year</label>
              <input className="admin-input" type="number" value={info.year} onChange={(e) => setInfo({ ...info, year: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>페이지수 / Pages</label>
              <input className="admin-input" type="number" value={info.pages} onChange={(e) => setInfo({ ...info, pages: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>커버 테마</label>
              <select
                className="admin-input"
                value={info.cover_theme}
                onChange={(e) => setInfo({ ...info, cover_theme: e.target.value })}
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>{t.value} — {t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="admin-btn-primary"
            disabled={!allFilled}
            onClick={() => setStep(2)}
          >
            다음 단계 →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="admin-card admin-step2">
          <div className="admin-step2-info">
            <p><strong>{info.title_ko}</strong> / {info.title_en}</p>
            <p>{info.author} · {info.year}</p>
          </div>

          {loading ? (
            <div className="admin-loading-area">
              <div className="admin-spinner" />
              <p className="admin-loading-text">원문을 분석하고 있어요...</p>
              <p className="admin-loading-sub">최대 30초 정도 걸릴 수 있어요</p>
            </div>
          ) : (
            <div className="admin-generate-area">
              <div className={`admin-spine-preview ${info.cover_theme}`} />
              <button className="admin-btn-primary large" onClick={handleGenerate}>
                ✨ AI 요약 생성하기
              </button>
              <p className="admin-generate-desc">
                Gutenberg 원문을 분석해 6개 챕터 요약을 자동 생성해요
              </p>
            </div>
          )}

          <button className="admin-btn-secondary" onClick={() => setStep(1)}>
            ← 이전 단계
          </button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && summary && (
        <AdminBookEditor
          summary={summary}
          onSummaryChange={setSummary}
          onBack={() => { setSummary(null); setStep(2); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
