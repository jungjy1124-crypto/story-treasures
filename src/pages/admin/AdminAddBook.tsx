import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AdminBookEditor from "./AdminBookEditor";
import ManualBookForm, { loadDraft, clearDraft, parseTagsFromText, type ManualSummary, type ParsedBookInfo } from "./ManualBookForm";
import { saveBook, type StoredBook } from "@/lib/bookStorage";

const THEMES = [
  { value: "theme-dark", label: "거의 검정" },
  { value: "theme-crimson", label: "진한 빨강" },
  { value: "theme-navy", label: "네이비" },
  { value: "theme-teal", label: "틸" },
  { value: "theme-purple", label: "보라" },
  { value: "theme-green", label: "진한 초록" },
];

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
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState<BookInfo>({
    gutenberg_url: "",
    title_ko: "",
    title_en: "",
    author: "",
    year: "",
    pages: "",
    cover_theme: "theme-dark",
  });
  const [summary, setSummary] = useState<any>(null);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftData, setDraftData] = useState<ManualSummary | null>(null);
  const [manualInitial, setManualInitial] = useState<ManualSummary | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const canProceed = !!info.gutenberg_url.trim();

  // Check for draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setDraftData(draft);
      setShowDraftBanner(true);
    }
  }, []);

  const handleResumeDraft = () => {
    setManualInitial(draftData);
    setShowDraftBanner(false);
    setMode("manual");
    setStep(1); // Content input is now Step 1
  };

  const handleNewStart = () => {
    clearDraft();
    setManualInitial(null);
    setShowDraftBanner(false);
  };

  const handleParsedInfo = (parsedInfo: ParsedBookInfo) => {
    const filled = new Set<string>();
    setInfo(prev => {
      const updated = { ...prev };
      if (parsedInfo.title_ko) { updated.title_ko = parsedInfo.title_ko; filled.add("title_ko"); }
      if (parsedInfo.title_en) { updated.title_en = parsedInfo.title_en; filled.add("title_en"); }
      if (parsedInfo.author) { updated.author = parsedInfo.author; filled.add("author"); }
      if (parsedInfo.year) { updated.year = parsedInfo.year; filled.add("year"); }
      if (parsedInfo.pages) { updated.pages = parsedInfo.pages; filled.add("pages"); }
      if (parsedInfo.cover_theme) { updated.cover_theme = parsedInfo.cover_theme; filled.add("cover_theme"); }
      return updated;
    });
    setAutoFilledFields(filled);
  };

  const handleManualNext = (manualSummary: ManualSummary) => {
    setSummary(manualSummary);
    setStep(2); // Basic info is now Step 2
  };

  const buildPrompt = (bookInfo: BookInfo): string => {
    return `You are a book summary writer for Book Spine (책등), a Korean classic literature summary site.
Write a bilingual summary for the following book.
Return ONLY a JSON object with no markdown, no preamble, no explanation.

Book info:
- Title: ${bookInfo.title_en || bookInfo.title_ko}
- Author: ${bookInfo.author}
- Year: ${bookInfo.year}

The summary must follow this EXACT JSON structure:
{
  "intro_ko": "작가에 대한 흥미로운 사실 2~3문장. 출판 비화, 집필 배경 등.",
  "intro_en": "2-3 sentences about the author. Publication story, writing background.",
  "chapters": [
    {
      "number": 1,
      "title_ko": "챕터 주제 (한글 / English)",
      "title_en": "Chapter Theme Title",
      "quote_ko": "이 챕터를 대표하는 인상적인 한 문단. 소설 속 장면이나 분위기를 살린 문장.",
      "quote_en": "A vivid representative passage capturing the mood of this chapter.",
      "body_ko": "이 챕터의 핵심 사건과 의미를 3~4문장으로 요약.",
      "body_en": "3-4 sentences summarizing the key events and significance of this chapter."
    }
  ],
  "closing_ko": "이 책의 문학적 의의와 작가가 전달하려 한 메시지. 2~3문장.",
  "closing_en": "Literary significance and the author's core message. 2-3 sentences.",
  "question_ko": "독자에게 던지는 질문. 삶과 연결되는 깊은 질문 한 문장.",
  "question_en": "A single deep question for the reader connecting the book to life.",
  "tags_ko": "태그1 태그2 태그3 태그4 태그5",
  "tags_en": "tag1 tag2 tag3 tag4 tag5",
  "rating": 4.3
}

Rules:
- chapters array must have 5 to 6 items
- All KO text must be in Korean (한국어)
- All EN text must be in English
- quote fields should feel literary and evocative, NOT just plot description
- body fields should include both plot summary AND thematic significance
- tags should be single words or short phrases, space-separated (NOT comma-separated)
- rating is a float between 3.5 and 5.0
- Return ONLY the JSON object. No other text.`;
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("API 키가 설정되지 않았어요. 관리자에게 문의하세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setLoadingMsg("AI가 요약을 생성하고 있어요... (30-60초 소요)");
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 8000,
          messages: [{ role: "user", content: buildPrompt(info) }],
        }),
      });

      const responseText = await aiRes.text();
      if (!aiRes.ok) {
        setError(`API 오류 (${aiRes.status}): ${responseText}`);
        return;
      }
      const data = JSON.parse(responseText);
      const raw = data.content[0].text;
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!parsed.chapters || parsed.chapters.length === 0) {
        throw new Error('요약 데이터가 불완전해요.');
      }

      setInfo(prev => ({
        ...prev,
        title_ko: parsed.title_ko || prev.title_ko,
        title_en: parsed.title_en || prev.title_en,
        author: parsed.author || prev.author,
        year: parsed.year || prev.year,
        pages: parsed.pages || prev.pages,
      }));

      // Set auto-filled fields for Step 2 badges
      const filled = new Set<string>();
      if (parsed.title_ko) filled.add("title_ko");
      if (parsed.title_en) filled.add("title_en");
      if (parsed.author) filled.add("author");
      if (parsed.year) filled.add("year");
      if (parsed.pages) filled.add("pages");
      setAutoFilledFields(filled);

      setSummary({
        intro: parsed.intro_ko || '',
        intro_en: parsed.intro_en || '',
        chapters: (parsed.chapters || []).map((ch: any) => ({
          number: ch.number,
          title_ko: ch.title_ko || '',
          title_en: ch.title_en || '',
          quote_ko: ch.quote_ko || '',
          quote_en: ch.quote_en || '',
          body_ko: ch.body_ko || '',
          body_en: ch.body_en || '',
        })),
        closing_ko: parsed.closing_ko || '',
        closing_en: parsed.closing_en || '',
        question_ko: parsed.question_ko || '',
        question_en: parsed.question_en || '',
        tags_ko: parseTagsFromText(typeof parsed.tags_ko === 'string' ? parsed.tags_ko : (parsed.tags_ko || []).join(' ')),
        tags_en: parseTagsFromText(typeof parsed.tags_en === 'string' ? parsed.tags_en : (parsed.tags_en || []).join(' ')),
        rating: parsed.rating || 4.0,
      });
      setStep(3);
    } catch (err: any) {
      console.error("AI generation error:", err);
      setError("AI 생성 실패 — 직접입력 탭을 이용해주세요");
      toast({ title: "AI 생성 실패 — 직접입력 탭을 이용해주세요", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleBasicInfoNext = () => {
    setStep(3);
  };

  const handleSave = async () => {
    if (!summary) return;
    const book: StoredBook = {
      id: crypto.randomUUID(),
      title_ko: info.title_ko,
      title_en: info.title_en,
      author: info.author,
      year: Number(info.year) || 0,
      pages: Number(info.pages) || 0,
      cover_theme: info.cover_theme,
      rating: summary.rating || 4.0,
      intro_ko: summary.intro || "",
      intro_en: (summary as any).intro_en || summary.intro || "",
      closing_ko: summary.closing_ko || "",
      closing_en: summary.closing_en || "",
      question_ko: summary.question_ko || "",
      question_en: summary.question_en || "",
      tags_ko: summary.tags_ko || [],
      tags_en: summary.tags_en || [],
      chapters: summary.chapters.map((ch: any) => ({
        number: ch.number,
        title_ko: ch.title_ko,
        title_en: ch.title_en,
        quote_ko: ch.quote_ko,
        quote_en: ch.quote_en,
        body_ko: ch.body_ko,
        body_en: ch.body_en,
      })),
      created_at: new Date().toISOString(),
    };
    const result = await saveBook(book);
    if (result.success) {
      clearDraft();
      toast({ title: "저장됐습니다 ✓" });
      navigate("/admin/books");
    } else {
      console.error("Save failed:", result.error);
      toast({ title: "저장 실패", variant: "destructive" });
    }
  };

  const isAutoFilled = (field: string) => autoFilledFields.has(field);
  const autoFieldClass = (field: string) => isAutoFilled(field) ? " admin-field-autofilled" : "";

  return (
    <div>
      <h1 className="admin-page-title">새 책 추가</h1>

      {/* Draft recovery banner */}
      {showDraftBanner && (
        <div className="manual-draft-banner">
          <span>📝 작성 중인 내용이 있어요. 이어서 작성할까요?</span>
          <div className="manual-draft-banner-actions">
            <button className="admin-btn-primary" onClick={handleResumeDraft}>이어서 작성</button>
            <button className="admin-btn-secondary" onClick={handleNewStart}>새로 시작</button>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="admin-steps">
        <span className={`admin-step${step >= 1 ? " active" : ""}`}>① 내용 입력</span>
        <span className="admin-step-arrow">→</span>
        <span className={`admin-step${step >= 2 ? " active" : ""}`}>② 기본 정보</span>
        <span className="admin-step-arrow">→</span>
        <span className={`admin-step${step >= 3 ? " active" : ""}`}>③ 검토 및 저장</span>
      </div>

      {/* Step 1: Content input (was Step 2) */}
      {step === 1 && (
        <div>
          {/* Mode tabs */}
          <div className="manual-mode-tabs">
            <button
              className={`manual-mode-tab${mode === "manual" ? " active" : ""}`}
              onClick={() => setMode("manual")}
            >
              ✍️ 직접 입력
            </button>
            <button
              className={`manual-mode-tab${mode === "ai" ? " active" : ""}`}
              onClick={() => setMode("ai")}
            >
              ✨ AI 자동 생성
            </button>
          </div>

          {mode === "manual" ? (
            <ManualBookForm
              onBack={() => navigate("/admin/books")}
              onNext={handleManualNext}
              onParsedInfo={handleParsedInfo}
              initialData={manualInitial}
            />
          ) : (
            /* AI mode */
            <div className="admin-card admin-step2">
              <div className="admin-field full" style={{ marginBottom: 16 }}>
                <label>Gutenberg URL</label>
                <input
                  className="admin-input"
                  placeholder="https://www.gutenberg.org/files/2554/2554-0.txt"
                  value={info.gutenberg_url}
                  onChange={(e) => setInfo({ ...info, gutenberg_url: e.target.value })}
                />
              </div>

              {!apiKey && (
                <div className="admin-login-error" style={{ marginBottom: 16 }}>
                  ⚠️ API 키가 설정되지 않았어요. 관리자에게 문의하세요.
                </div>
              )}

              {error && (
                <div className="admin-login-error" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {loading ? (
                <div className="admin-loading-area">
                  <div className="admin-spinner" />
                  <p className="admin-loading-text">{loadingMsg}</p>
                  <p className="admin-loading-sub">잠시만 기다려주세요</p>
                </div>
              ) : (
                <div className="admin-generate-area">
                  <div className={`admin-spine-preview ${info.cover_theme}`} />
                  <button className="admin-btn-primary large" onClick={handleGenerate} disabled={!apiKey || !canProceed}>
                    ✨ AI 요약 생성하기
                  </button>
                  {!canProceed && (
                    <p className="admin-generate-desc" style={{ color: "rgba(255,100,100,0.7)" }}>
                      Gutenberg URL을 먼저 입력해주세요
                    </p>
                  )}
                  <p className="admin-generate-desc">
                    Gutenberg 원문을 분석해 6개 챕터 요약을 자동 생성해요
                  </p>
                </div>
              )}

              <button className="admin-btn-secondary" onClick={() => navigate("/admin/books")}>
                ← 돌아가기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Basic info (was Step 1) */}
      {step === 2 && (
        <div className="admin-card">
          <div className="admin-form-grid">
            <div className={`admin-field full${autoFieldClass("gutenberg_url")}`}>
              <label>Gutenberg URL</label>
              <input
                className="admin-input"
                placeholder="https://www.gutenberg.org/files/2554/2554-0.txt"
                value={info.gutenberg_url}
                onChange={(e) => { setInfo({ ...info, gutenberg_url: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("gutenberg_url"); return n; }); }}
              />
            </div>
            <div className={`admin-field${autoFieldClass("title_ko")}`}>
              <label>
                제목 (한국어)
                {isAutoFilled("title_ko") && <span className="admin-autofill-badge">자동입력됨</span>}
              </label>
              <input className="admin-input" value={info.title_ko} onChange={(e) => { setInfo({ ...info, title_ko: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("title_ko"); return n; }); }} />
            </div>
            <div className={`admin-field${autoFieldClass("title_en")}`}>
              <label>
                Title (English)
                {isAutoFilled("title_en") && <span className="admin-autofill-badge">자동입력됨</span>}
              </label>
              <input className="admin-input" value={info.title_en} onChange={(e) => { setInfo({ ...info, title_en: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("title_en"); return n; }); }} />
            </div>
            <div className={`admin-field${autoFieldClass("author")}`}>
              <label>
                저자 / Author
                {isAutoFilled("author") && <span className="admin-autofill-badge">자동입력됨</span>}
              </label>
              <input className="admin-input" value={info.author} onChange={(e) => { setInfo({ ...info, author: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("author"); return n; }); }} />
            </div>
            <div className={`admin-field${autoFieldClass("year")}`}>
              <label>
                출판연도 / Year
                {isAutoFilled("year") && <span className="admin-autofill-badge">자동입력됨</span>}
              </label>
              <input className="admin-input" type="number" value={info.year} onChange={(e) => { setInfo({ ...info, year: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("year"); return n; }); }} />
            </div>
            <div className={`admin-field${autoFieldClass("pages")}`}>
              <label>
                페이지수 / Pages
                {isAutoFilled("pages") && <span className="admin-autofill-badge">자동입력됨</span>}
              </label>
              <input className="admin-input" type="number" value={info.pages} onChange={(e) => { setInfo({ ...info, pages: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("pages"); return n; }); }} />
            </div>
            <div className={`admin-field${autoFieldClass("cover_theme")}`}>
              <label>
                커버 테마
                {isAutoFilled("cover_theme") && <span className="admin-autofill-badge">자동입력됨</span>}
              </label>
              <select
                className="admin-input"
                value={info.cover_theme}
                onChange={(e) => { setInfo({ ...info, cover_theme: e.target.value }); setAutoFilledFields(prev => { const n = new Set(prev); n.delete("cover_theme"); return n; }); }}
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>{t.value} — {t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-editor-actions">
            <button className="admin-btn-secondary" onClick={() => { setSummary(null); setStep(1); }}>
              ← 이전 단계
            </button>
            <button className="admin-btn-primary" onClick={handleBasicInfoNext}>
              다음 단계 →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review and save */}
      {step === 3 && summary && (
        <div>
          <div className="admin-book-info-card">
            <div className="admin-book-info-item">
              <span className="admin-book-info-label">제목 (KO) <button className="admin-edit-link" onClick={() => setStep(2)}>수정</button></span>
              <span className="admin-book-info-value">{info.title_ko || "—"}</span>
            </div>
            <div className="admin-book-info-item">
              <span className="admin-book-info-label">Title (EN) <button className="admin-edit-link" onClick={() => setStep(2)}>수정</button></span>
              <span className="admin-book-info-value">{info.title_en || "—"}</span>
            </div>
            <div className="admin-book-info-item">
              <span className="admin-book-info-label">저자 <button className="admin-edit-link" onClick={() => setStep(2)}>수정</button></span>
              <span className="admin-book-info-value">{info.author || "—"}</span>
            </div>
            <div className="admin-book-info-item">
              <span className="admin-book-info-label">출판연도 <button className="admin-edit-link" onClick={() => setStep(2)}>수정</button></span>
              <span className="admin-book-info-value">{info.year || "—"}</span>
            </div>
            <div className="admin-book-info-item">
              <span className="admin-book-info-label">페이지수 <button className="admin-edit-link" onClick={() => setStep(2)}>수정</button></span>
              <span className="admin-book-info-value">{info.pages || "—"}</span>
            </div>
            <div className="admin-book-info-item">
              <span className="admin-book-info-label">커버 테마 <button className="admin-edit-link" onClick={() => setStep(2)}>수정</button></span>
              <span className="admin-book-info-value">
                <span className={`admin-spine-preview ${info.cover_theme}`} style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", marginRight: 6, verticalAlign: "middle" }} />
                {THEMES.find(t => t.value === info.cover_theme)?.label || info.cover_theme}
              </span>
            </div>
          </div>
          <AdminBookEditor
            summary={summary}
            onSummaryChange={setSummary}
            onBack={() => { setSummary(null); setStep(2); }}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
}
