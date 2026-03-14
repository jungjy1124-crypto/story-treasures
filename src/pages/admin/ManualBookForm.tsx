import { useState, useEffect, useRef, useCallback } from "react";

const DRAFT_KEY = "chaekgado_draft";

interface Chapter {
  number: number;
  title_ko: string;
  title_en: string;
  quote_ko: string;
  quote_en: string;
  body_ko: string;
  body_en: string;
}

export interface ManualSummary {
  intro: string;
  chapters: Chapter[];
  closing_ko: string;
  closing_en: string;
  question_ko: string;
  question_en: string;
  tags_ko: string[];
  tags_en: string[];
  rating: number;
}

function createEmptyChapter(num: number): Chapter {
  return { number: num, title_ko: "", title_en: "", quote_ko: "", quote_en: "", body_ko: "", body_en: "" };
}

function createEmptySummary(): ManualSummary {
  return {
    intro: "",
    chapters: Array.from({ length: 6 }, (_, i) => createEmptyChapter(i + 1)),
    closing_ko: "", closing_en: "",
    question_ko: "", question_en: "",
    tags_ko: [], tags_en: [],
    rating: 4,
  };
}

export function loadDraft(): ManualSummary | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

interface Props {
  onBack: () => void;
  onNext: (summary: ManualSummary) => void;
  initialData?: ManualSummary | null;
}

export default function ManualBookForm({ onBack, onNext, initialData }: Props) {
  const [summary, setSummary] = useState<ManualSummary>(initialData || createEmptySummary());
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [chapterLang, setChapterLang] = useState<Record<number, "ko" | "en">>({});
  const [closingLang, setClosingLang] = useState<"ko" | "en">("ko");
  const [questionLang, setQuestionLang] = useState<"ko" | "en">("ko");
  const [newTagKo, setNewTagKo] = useState("");
  const [newTagEn, setNewTagEn] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [validationError, setValidationError] = useState("");
  const summaryRef = useRef(summary);
  summaryRef.current = summary;

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(summaryRef.current));
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const update = useCallback((patch: Partial<ManualSummary>) => {
    setSummary(prev => ({ ...prev, ...patch }));
  }, []);

  const updateChapter = (idx: number, patch: Partial<Chapter>) => {
    const chapters = [...summary.chapters];
    chapters[idx] = { ...chapters[idx], ...patch };
    update({ chapters });
  };

  const addChapter = () => {
    if (summary.chapters.length >= 10) return;
    const num = summary.chapters.length + 1;
    update({ chapters: [...summary.chapters, createEmptyChapter(num)] });
  };

  const removeChapter = (idx: number) => {
    if (summary.chapters.length <= 1) return;
    const chapters = summary.chapters.filter((_, i) => i !== idx).map((ch, i) => ({ ...ch, number: i + 1 }));
    update({ chapters });
    if (openChapter === idx) setOpenChapter(null);
    else if (openChapter !== null && openChapter > idx) setOpenChapter(openChapter - 1);
  };

  const getLang = (idx: number) => chapterLang[idx] || "ko";

  const removeTag = (lang: "ko" | "en", idx: number) => {
    const key = lang === "ko" ? "tags_ko" : "tags_en";
    update({ [key]: summary[key].filter((_, i) => i !== idx) });
  };

  const addTag = (lang: "ko" | "en") => {
    if (lang === "ko" && newTagKo.trim()) {
      update({ tags_ko: [...summary.tags_ko, newTagKo.trim()] });
      setNewTagKo("");
    }
    if (lang === "en" && newTagEn.trim()) {
      update({ tags_en: [...summary.tags_en, newTagEn.trim()] });
      setNewTagEn("");
    }
  };

  const handleNext = () => {
    if (!summary.intro.trim()) {
      setValidationError("소개를 입력해주세요.");
      return;
    }
    const hasFilledChapter = summary.chapters.some(ch => ch.title_ko.trim() || ch.body_ko.trim());
    if (!hasFilledChapter) {
      setValidationError("최소 1개 챕터를 작성해주세요.");
      return;
    }
    setValidationError("");
    // Save draft before advancing
    localStorage.setItem(DRAFT_KEY, JSON.stringify(summary));
    onNext(summary);
  };

  return (
    <div className="manual-form-wrapper">
      {savedIndicator && <div className="manual-saved-indicator">임시저장됨 ✓</div>}

      {validationError && (
        <div className="admin-login-error" style={{ marginBottom: 16 }}>{validationError}</div>
      )}

      {/* 소개 */}
      <div className="admin-card">
        <label className="admin-label">작가 소개 / 집필 배경</label>
        <textarea
          className="admin-textarea"
          rows={4}
          placeholder="도스토옙스키는 이 소설을 빚을 갚기 위해 썼다..."
          value={summary.intro}
          onChange={(e) => update({ intro: e.target.value })}
        />
      </div>

      {/* 챕터 */}
      {summary.chapters.map((ch, idx) => {
        const lang = getLang(idx);
        const isOpen = openChapter === idx;
        return (
          <div key={idx} className="admin-card manual-chapter-card">
            <div className="manual-chapter-header">
              <button
                className="manual-chapter-toggle"
                onClick={() => setOpenChapter(isOpen ? null : idx)}
              >
                <span>챕터 {ch.number}{ch.title_ko ? `: ${ch.title_ko}` : ""}</span>
                <span className="admin-chevron">{isOpen ? "▲" : "▼"}</span>
              </button>
              {summary.chapters.length > 1 && (
                <button className="manual-chapter-remove" onClick={() => removeChapter(idx)}>× 삭제</button>
              )}
            </div>

            {isOpen && (
              <div className="admin-chapter-body">
                <div className="admin-lang-tabs">
                  <button className={`admin-lang-tab${lang === "ko" ? " active" : ""}`} onClick={() => setChapterLang({ ...chapterLang, [idx]: "ko" })}>KO</button>
                  <button className={`admin-lang-tab${lang === "en" ? " active" : ""}`} onClick={() => setChapterLang({ ...chapterLang, [idx]: "en" })}>EN</button>
                </div>

                <label className="admin-label">{lang === "ko" ? "제목" : "Title"}</label>
                <input
                  className="admin-input"
                  placeholder={lang === "ko" ? "챕터 제목을 입력하세요" : "Enter chapter title"}
                  value={lang === "ko" ? ch.title_ko : ch.title_en}
                  onChange={(e) => updateChapter(idx, lang === "ko" ? { title_ko: e.target.value } : { title_en: e.target.value })}
                />

                <label className="admin-label">{lang === "ko" ? "인용" : "Quote"}</label>
                <textarea
                  className="admin-textarea manual-quote-input"
                  rows={3}
                  placeholder={lang === "ko" ? "핵심 장면을 묘사하는 2-3문장..." : "2-3 sentences describing the key scene..."}
                  value={lang === "ko" ? ch.quote_ko : ch.quote_en}
                  onChange={(e) => updateChapter(idx, lang === "ko" ? { quote_ko: e.target.value } : { quote_en: e.target.value })}
                />

                <label className="admin-label">{lang === "ko" ? "본문" : "Body"}</label>
                <textarea
                  className="admin-textarea"
                  rows={6}
                  placeholder={lang === "ko" ? "챕터 내용을 자유롭게 작성해주세요..." : "Write the chapter content freely..."}
                  value={lang === "ko" ? ch.body_ko : ch.body_en}
                  onChange={(e) => updateChapter(idx, lang === "ko" ? { body_ko: e.target.value } : { body_en: e.target.value })}
                />
              </div>
            )}
          </div>
        );
      })}

      {summary.chapters.length < 10 && (
        <button className="admin-btn-secondary manual-add-chapter" onClick={addChapter}>
          + 챕터 추가
        </button>
      )}

      {/* 마무리 */}
      <div className="admin-card">
        <label className="admin-label">마무리 분석</label>
        <div className="admin-lang-tabs">
          <button className={`admin-lang-tab${closingLang === "ko" ? " active" : ""}`} onClick={() => setClosingLang("ko")}>KO</button>
          <button className={`admin-lang-tab${closingLang === "en" ? " active" : ""}`} onClick={() => setClosingLang("en")}>EN</button>
        </div>
        <textarea
          className="admin-textarea"
          rows={5}
          placeholder={closingLang === "ko" ? "마무리 분석을 작성해주세요..." : "Write the closing analysis..."}
          value={closingLang === "ko" ? summary.closing_ko : summary.closing_en}
          onChange={(e) => update(closingLang === "ko" ? { closing_ko: e.target.value } : { closing_en: e.target.value })}
        />
      </div>

      {/* 질문 */}
      <div className="admin-card">
        <label className="admin-label">독자를 위한 질문</label>
        <div className="admin-lang-tabs">
          <button className={`admin-lang-tab${questionLang === "ko" ? " active" : ""}`} onClick={() => setQuestionLang("ko")}>KO</button>
          <button className={`admin-lang-tab${questionLang === "en" ? " active" : ""}`} onClick={() => setQuestionLang("en")}>EN</button>
        </div>
        <textarea
          className="admin-textarea"
          rows={3}
          placeholder={questionLang === "ko" ? "독자에게 던질 질문을 작성해주세요..." : "Write a reflective question for readers..."}
          value={questionLang === "ko" ? summary.question_ko : summary.question_en}
          onChange={(e) => update(questionLang === "ko" ? { question_ko: e.target.value } : { question_en: e.target.value })}
        />
      </div>

      {/* 태그 */}
      <div className="admin-card">
        <label className="admin-label">태그 (KO)</label>
        <div className="admin-tags">
          {summary.tags_ko.map((t, i) => (
            <span key={i} className="admin-tag">{t} <button onClick={() => removeTag("ko", i)}>×</button></span>
          ))}
          <input
            className="admin-tag-input"
            placeholder="새 태그"
            value={newTagKo}
            onChange={(e) => setNewTagKo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("ko"))}
          />
        </div>
        <label className="admin-label mt">Tags (EN)</label>
        <div className="admin-tags">
          {summary.tags_en.map((t, i) => (
            <span key={i} className="admin-tag">{t} <button onClick={() => removeTag("en", i)}>×</button></span>
          ))}
          <input
            className="admin-tag-input"
            placeholder="New tag"
            value={newTagEn}
            onChange={(e) => setNewTagEn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("en"))}
          />
        </div>
      </div>

      {/* 평점 */}
      <div className="admin-card">
        <label className="admin-label">평점</label>
        <div className="admin-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} className={`admin-star${star <= Math.round(summary.rating) ? " filled" : ""}`} onClick={() => update({ rating: star })}>★</button>
          ))}
          <span className="admin-rating-num">{summary.rating}</span>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="admin-editor-actions">
        <button className="admin-btn-secondary" onClick={onBack}>← 이전 단계</button>
        <button className="admin-btn-primary" onClick={handleNext}>다음 단계 →</button>
      </div>
    </div>
  );
}
