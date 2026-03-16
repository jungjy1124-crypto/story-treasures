import { useState, useEffect, useRef, useCallback } from "react";

const DRAFT_KEY = "chaekgado_draft";

interface Chapter {
  number: number;
  title_ko: string;
  title_en: string;
  quotes_ko: string[];
  quotes_en: string[];
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

export interface ParsedBookInfo {
  title_ko?: string;
  title_en?: string;
  author?: string;
  year?: string;
  pages?: string;
  cover_theme?: string;
  tags_ko?: string[];
  rating?: number;
}

function createEmptyChapter(num: number): Chapter {
  return { number: num, title_ko: "", title_en: "", quotes_ko: ["", ""], quotes_en: ["", ""], body_ko: "", body_en: "" };
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
  onParsedInfo?: (info: ParsedBookInfo) => void;
  initialData?: ManualSummary | null;
}

export function parseTagsFromText(text: string): string[] {
  if (!text) return [];
  const backtickMatches = text.match(/`([^`]+)`/g);
  if (backtickMatches && backtickMatches.length > 0) {
    return backtickMatches.map(t => t.replace(/`/g, '').trim()).filter(t => t.length > 0);
  }
  if (text.includes(',') || text.includes('，')) {
    return text.split(/[,，]/).map(t => t.trim()).filter(t => t.length > 0);
  }
  return text.split(/\s+/).map(t => t.trim()).filter(t => t.length > 0);
}

const THEME_VALUES = ["theme-dark", "theme-crimson", "theme-navy", "theme-teal", "theme-purple", "theme-green"];

function parseBasicInfo(text: string): ParsedBookInfo {
  const info: ParsedBookInfo = {};

  const get = (key: string): string => {
    const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const titleKo = get('제목KO');
  if (titleKo) info.title_ko = titleKo;

  const titleEn = get('제목EN');
  if (titleEn) info.title_en = titleEn;

  const author = get('저자');
  if (author) info.author = author;

  const yearStr = get('연도');
  if (yearStr) {
    const yearNum = yearStr.match(/(\d{4})/);
    if (yearNum) info.year = yearNum[1];
  }

  const pagesStr = get('페이지수');
  if (pagesStr) {
    const pNum = pagesStr.match(/(\d+)/);
    if (pNum) info.pages = pNum[1];
  }

  const theme = get('커버테마');
  if (theme) {
    const found = THEME_VALUES.find(v => theme.includes(v));
    if (found) info.cover_theme = found;
  }

  const ratingStr = get('평점');
  if (ratingStr) {
    info.rating = Math.min(5, Math.max(1, parseFloat(ratingStr)));
  }

  const tagsKoRaw = get('태그KO');
  if (tagsKoRaw) {
    const tags_ko = parseTagsFromText(tagsKoRaw);
    if (tags_ko.length > 0) info.tags_ko = tags_ko;
  }

  return info;
}

function parseBulkText(text: string): Partial<ManualSummary> & { _filledCount?: number } {
  const get = (key: string): string => {
    const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const result: Partial<ManualSummary> = {};
  let filledSections = 0;

  // Intro
  const introKo = get('작가소개KO');
  if (introKo) { result.intro = introKo; filledSections++; }

  // Intro EN (stored separately for passing to parent if needed)
  const introEn = get('작가소개EN');

  // Parse chapters dynamically
  const chapters: Chapter[] = [];
  const chapterNumbers: number[] = [];
  for (const match of text.matchAll(/^챕터(\d+)제목KO:/gm)) {
    chapterNumbers.push(parseInt(match[1]));
  }
  for (const num of chapterNumbers) {
    chapters.push({
      number: num,
      title_ko: get(`챕터${num}제목KO`),
      title_en: get(`챕터${num}제목EN`),
      quotes_ko: [
        get(`챕터${num}인용1KO`) || get(`챕터${num}인용KO`) || "",
        get(`챕터${num}인용2KO`) || "",
        get(`챕터${num}인용3KO`) || "",
      ].filter((q, i) => i < 2 || q), // Keep first 2 always, 3rd only if filled
      quotes_en: [
        get(`챕터${num}인용1EN`) || get(`챕터${num}인용EN`) || "",
        get(`챕터${num}인용2EN`) || "",
        get(`챕터${num}인용3EN`) || "",
      ].filter((q, i) => i < 2 || q),
      body_ko: get(`챕터${num}본문KO`),
      body_en: get(`챕터${num}본문EN`),
    });
  }
  if (chapters.length > 0) { result.chapters = chapters; filledSections++; }

  // Closing
  const closingKo = get('마무리KO');
  if (closingKo) { result.closing_ko = closingKo; filledSections++; }
  const closingEn = get('마무리EN');
  if (closingEn) { result.closing_en = closingEn; }

  // Question
  const questionKo = get('질문KO');
  if (questionKo) { result.question_ko = questionKo; filledSections++; }
  const questionEn = get('질문EN');
  if (questionEn) { result.question_en = questionEn; }

  // Tags
  const tagsKoRaw = get('태그KO');
  if (tagsKoRaw) {
    const tags_ko = parseTagsFromText(tagsKoRaw);
    if (tags_ko.length > 0) { result.tags_ko = tags_ko; filledSections++; }
  }
  const tagsEnRaw = get('태그EN');
  if (tagsEnRaw) {
    const tags_en = parseTagsFromText(tagsEnRaw);
    if (tags_en.length > 0) { result.tags_en = tags_en; }
  }

  // Rating
  const ratingStr = get('평점');
  if (ratingStr) {
    const rating = parseFloat(ratingStr);
    if (!isNaN(rating)) { result.rating = Math.min(5, Math.max(1, rating)); filledSections++; }
  }

  return { ...result, _filledCount: filledSections };
}

export default function ManualBookForm({ onBack, onNext, onParsedInfo, initialData }: Props) {
  const [summary, setSummary] = useState<ManualSummary>(initialData || createEmptySummary());
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [chapterLang, setChapterLang] = useState<Record<number, "ko" | "en">>({});
  const [closingLang, setClosingLang] = useState<"ko" | "en">("ko");
  const [questionLang, setQuestionLang] = useState<"ko" | "en">("ko");
  const [newTagKo, setNewTagKo] = useState("");
  const [newTagEn, setNewTagEn] = useState("");
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(!initialData);
  const [bulkMessage, setBulkMessage] = useState("");
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
    const raw = lang === "ko" ? newTagKo : newTagEn;
    if (!raw.trim()) return;
    const parsed = parseTagsFromText(raw);
    if (parsed.length > 0) {
      const key = lang === "ko" ? "tags_ko" : "tags_en";
      update({ [key]: [...summary[key], ...parsed] });
    }
    if (lang === "ko") setNewTagKo("");
    else setNewTagEn("");
  };

  const handleBulkParse = () => {
    if (!bulkText.trim()) return;
    const parsed = parseBulkText(bulkText) as any;
    const filledCount = parsed._filledCount || 0;
    delete parsed._filledCount;
    
    // Fully replace state — do NOT merge with previous chapters
    setSummary(() => {
      const fresh = createEmptySummary();
      return {
        ...fresh,
        ...(parsed.intro ? { intro: parsed.intro } : {}),
        ...(parsed.chapters ? { chapters: parsed.chapters } : { chapters: fresh.chapters }),
        ...(parsed.closing_ko ? { closing_ko: parsed.closing_ko } : {}),
        ...(parsed.closing_en ? { closing_en: parsed.closing_en } : {}),
        ...(parsed.question_ko ? { question_ko: parsed.question_ko } : {}),
        ...(parsed.question_en ? { question_en: parsed.question_en } : {}),
        ...(parsed.tags_ko ? { tags_ko: parsed.tags_ko } : {}),
        ...(parsed.tags_en ? { tags_en: parsed.tags_en } : {}),
        ...(parsed.rating ? { rating: parsed.rating } : {}),
      };
    });

    // Extract basic info and notify parent
    if (onParsedInfo) {
      const basicInfo = parseBasicInfo(bulkText);
      if (!basicInfo.rating && parsed.rating) basicInfo.rating = parsed.rating;
      if (!basicInfo.tags_ko && parsed.tags_ko) basicInfo.tags_ko = parsed.tags_ko;
      onParsedInfo(basicInfo);
    }

    setBulkOpen(false);
    setBulkMessage(`✅ ${filledCount}개 섹션이 자동으로 채워졌어요! 내용을 확인하고 수정해주세요.`);
    setTimeout(() => setBulkMessage(""), 5000);
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
    localStorage.setItem(DRAFT_KEY, JSON.stringify(summary));
    onNext(summary);
  };

  return (
    <div className="manual-form-wrapper">
      {savedIndicator && <div className="manual-saved-indicator">임시저장됨 ✓</div>}

      {bulkMessage && (
        <div className="manual-bulk-success">{bulkMessage}</div>
      )}

      {validationError && (
        <div className="admin-login-error" style={{ marginBottom: 16 }}>{validationError}</div>
      )}

      {/* 일괄 붙여넣기 */}
      <div className="admin-card">
        <button
          className="manual-bulk-toggle"
          onClick={() => setBulkOpen(!bulkOpen)}
        >
          <span>{bulkOpen ? "📋 텍스트 일괄 입력" : "📋 다시 붙여넣기"}</span>
          <span className="admin-chevron">{bulkOpen ? "▲" : "▼"}</span>
        </button>

        {bulkOpen && (
          <div className="manual-bulk-body">
            <textarea
              className="admin-textarea"
              rows={15}
              placeholder={"클로드가 생성한 요약 전체를 여기에 붙여넣으세요.\n\n챕터 1, 챕터 2... 형식이면 자동으로 분류됩니다."}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <button
              className="admin-btn-primary manual-bulk-btn"
              onClick={handleBulkParse}
              disabled={!bulkText.trim()}
            >
              ✨ 자동 분류하기
            </button>
            <p className="manual-bulk-help">
              아래 형식을 지원해요: 작가소개 / 챕터N 제목·인용·본문 / 마무리분석 / 독자질문 / 태그 / 평점
            </p>
          </div>
        )}
      </div>

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

                {[0, 1, 2].map((qi) => {
                  const quotes = lang === "ko" ? ch.quotes_ko : ch.quotes_en;
                  const quoteVal = (quotes || [])[qi] || "";
                  // Always show quote 1 & 2, show 3 only if it exists or user wants to add
                  if (qi === 2 && !quoteVal && !(quotes || []).length) return null;
                  return (
                    <div key={qi}>
                      <label className="admin-label" style={{ fontSize: 12, color: "#8B6914" }}>
                        {lang === "ko" ? `인용구 ${qi + 1}` : `Quote ${qi + 1}`}
                        {qi === 2 && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> (선택)</span>}
                      </label>
                      <textarea
                        className="admin-textarea manual-quote-input"
                        rows={3}
                        placeholder={lang === "ko" ? `인용구 ${qi + 1}을 입력하세요...` : `Enter quote ${qi + 1}...`}
                        value={quoteVal}
                        onChange={(e) => {
                          const newQuotes = [...(lang === "ko" ? ch.quotes_ko : ch.quotes_en) || ["", ""]];
                          while (newQuotes.length <= qi) newQuotes.push("");
                          newQuotes[qi] = e.target.value;
                          updateChapter(idx, lang === "ko" ? { quotes_ko: newQuotes } : { quotes_en: newQuotes });
                        }}
                      />
                    </div>
                  );
                })}
                {/* Add quote 3 button if not shown */}
                {(() => {
                  const quotes = lang === "ko" ? ch.quotes_ko : ch.quotes_en;
                  if ((quotes || []).length < 3) {
                    return (
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        style={{ fontSize: 12, padding: "4px 12px", marginBottom: 8 }}
                        onClick={() => {
                          const newQuotes = [...(quotes || ["", ""])];
                          while (newQuotes.length < 3) newQuotes.push("");
                          updateChapter(idx, lang === "ko" ? { quotes_ko: newQuotes } : { quotes_en: newQuotes });
                        }}
                      >
                        + 인용구 3 추가
                      </button>
                    );
                  }
                  return null;
                })()}

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
