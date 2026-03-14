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

function parseTagsFromText(text: string): string[] {
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

function parseBulkText(text: string): Partial<ManualSummary> {
  const result: Partial<ManualSummary> = {};
  let filledSections = 0;

  // Helper: extract text between a start pattern and an end pattern (or end of string)
  const extract = (startPatterns: RegExp, endPatterns: RegExp | null): string => {
    for (const sp of [startPatterns]) {
      const match = text.match(sp);
      if (match) {
        const startIdx = match.index! + match[0].length;
        if (endPatterns) {
          const rest = text.slice(startIdx);
          const endMatch = rest.match(endPatterns);
          return endMatch ? rest.slice(0, endMatch.index!).trim() : rest.trim();
        }
        return text.slice(startIdx).trim();
      }
    }
    return "";
  };

  // 1. Intro
  const introText = extract(
    /(?:작가\s*소개|집필\s*배경)[^\n]*\n/i,
    /(?:챕터\s*1\b|마무리\s*분석|독자를\s*위한\s*질문|태그\s*\(|평점)/i
  );
  if (introText) { result.intro = introText; filledSections++; }

  // 2. Chapters
  const chapterRegex = /챕터\s*(\d+)/gi;
  const chapterPositions: { num: number; start: number }[] = [];
  let cm;
  while ((cm = chapterRegex.exec(text)) !== null) {
    chapterPositions.push({ num: parseInt(cm[1]), start: cm.index });
  }

  if (chapterPositions.length > 0) {
    const chapters: ManualSummary["chapters"] = [];
    for (let i = 0; i < chapterPositions.length && i < 10; i++) {
      const start = chapterPositions[i].start;
      const end = i + 1 < chapterPositions.length ? chapterPositions[i + 1].start : undefined;
      const block = end ? text.slice(start, end) : text.slice(start);

      // Extract next section boundary within block
      const extractField = (patterns: RegExp[], endP: RegExp): string => {
        for (const p of patterns) {
          const m = block.match(p);
          if (m) {
            const s = m.index! + m[0].length;
            const rest = block.slice(s);
            const eM = rest.match(endP);
            return eM ? rest.slice(0, eM.index!).trim() : rest.trim();
          }
        }
        return "";
      };

      const fieldEnd = /(?:제목\s*\((?:KO|EN)\)|제목:|Title:|인용\s*\((?:KO|EN)\)|인용:|Quote:|본문\s*\((?:KO|EN)\)|본문:|Body:|챕터\s*\d+|마무리|독자|태그|평점)/i;

      chapters.push({
        number: chapterPositions[i].num,
        title_ko: extractField([/제목\s*\(KO\)\s*:?\s*/i, /제목\s*:?\s*/i], /\n/),
        title_en: extractField([/제목\s*\(EN\)\s*:?\s*/i, /Title\s*:?\s*/i], /\n/),
        quote_ko: extractField([/인용\s*\(KO\)\s*:?\s*/i, /인용\s*:?\s*/i], fieldEnd),
        quote_en: extractField([/인용\s*\(EN\)\s*:?\s*/i, /Quote\s*:?\s*/i], fieldEnd),
        body_ko: extractField([/본문\s*\(KO\)\s*:?\s*/i, /본문\s*:?\s*/i], fieldEnd),
        body_en: extractField([/본문\s*\(EN\)\s*:?\s*/i, /Body\s*:?\s*/i], fieldEnd),
      });
    }
    if (chapters.length > 0) { result.chapters = chapters; filledSections++; }
  }

  // 3. Closing
  const closingKo = extract(
    /마무리\s*분석\s*\(KO\)[^\n]*\n/i,
    /마무리\s*분석\s*\(EN\)/i
  );
  if (closingKo) { result.closing_ko = closingKo; filledSections++; }

  const closingEn = extract(
    /마무리\s*분석\s*\(EN\)[^\n]*\n/i,
    /(?:독자를?\s*위한\s*질문|태그\s*\(|평점)/i
  );
  if (closingEn) { result.closing_en = closingEn; filledSections++; }

  // 4. Questions
  const questionKo = extract(
    /독자를?\s*위한\s*질문\s*\(KO\)[^\n]*\n/i,
    /독자를?\s*위한\s*질문\s*\(EN\)/i
  );
  if (questionKo) { result.question_ko = questionKo; filledSections++; }

  const questionEn = extract(
    /독자를?\s*위한\s*질문\s*\(EN\)[^\n]*\n/i,
    /(?:태그\s*\(|평점)/i
  );
  if (questionEn) { result.question_en = questionEn; filledSections++; }

  // 5. Tags
  const tagsKoBlock = extract(/태그\s*\(KO\)[^\n]*\n/i, /(?:태그\s*\(EN\)|Tags\s*\(EN\)|평점)/i);
  if (tagsKoBlock) {
    const backtickTags = [...tagsKoBlock.matchAll(/`([^`]+)`/g)].map(m => m[1]);
    result.tags_ko = backtickTags.length > 0
      ? backtickTags
      : tagsKoBlock.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    if (result.tags_ko.length > 0) filledSections++;
  }

  const tagsEnBlock = extract(/(?:태그\s*\(EN\)|Tags\s*\(EN\))[^\n]*\n/i, /(?:평점)/i);
  if (tagsEnBlock) {
    const backtickTags = [...tagsEnBlock.matchAll(/`([^`]+)`/g)].map(m => m[1]);
    result.tags_en = backtickTags.length > 0
      ? backtickTags
      : tagsEnBlock.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    if (result.tags_en.length > 0) filledSections++;
  }

  // 6. Rating
  const ratingMatch = text.match(/평점[^\d]*(\d+(?:\.\d+)?)/i) || text.match(/⭐\s*(\d+(?:\.\d+)?)/);
  if (ratingMatch) {
    result.rating = Math.min(5, Math.max(1, parseFloat(ratingMatch[1])));
    filledSections++;
  }

  return { ...result, _filledCount: filledSections } as any;
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
    if (lang === "ko" && newTagKo.trim()) {
      update({ tags_ko: [...summary.tags_ko, newTagKo.trim()] });
      setNewTagKo("");
    }
    if (lang === "en" && newTagEn.trim()) {
      update({ tags_en: [...summary.tags_en, newTagEn.trim()] });
      setNewTagEn("");
    }
  };

  const handleBulkParse = () => {
    if (!bulkText.trim()) return;
    const parsed = parseBulkText(bulkText) as any;
    const filledCount = parsed._filledCount || 0;
    delete parsed._filledCount;
    
    setSummary(prev => ({
      ...prev,
      ...(parsed.intro ? { intro: parsed.intro } : {}),
      ...(parsed.chapters ? { chapters: parsed.chapters } : {}),
      ...(parsed.closing_ko ? { closing_ko: parsed.closing_ko } : {}),
      ...(parsed.closing_en ? { closing_en: parsed.closing_en } : {}),
      ...(parsed.question_ko ? { question_ko: parsed.question_ko } : {}),
      ...(parsed.question_en ? { question_en: parsed.question_en } : {}),
      ...(parsed.tags_ko ? { tags_ko: parsed.tags_ko } : {}),
      ...(parsed.tags_en ? { tags_en: parsed.tags_en } : {}),
      ...(parsed.rating ? { rating: parsed.rating } : {}),
    }));

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
