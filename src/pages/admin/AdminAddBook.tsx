import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AdminBookEditor from "./AdminBookEditor";
import { saveBook, type StoredBook } from "@/lib/bookStorage";

const THEMES = [
  { value: "theme-dark", label: "거의 검정" },
  { value: "theme-crimson", label: "진한 빨강" },
  { value: "theme-navy", label: "네이비" },
  { value: "theme-teal", label: "틸" },
  { value: "theme-purple", label: "보라" },
  { value: "theme-green", label: "진한 초록" },
];

function createMockSummary(author: string, titleKo: string) {
  return {
    intro: `${author}의 ${titleKo}은 ...`,
    chapters: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      title_ko: `챕터 ${i + 1}`,
      title_en: `Chapter ${i + 1}`,
      quote_ko: "인용 문장이 여기에 생성됩니다.",
      quote_en: "A generated quote will appear here.",
      body_ko: "본문 내용이 여기에 생성됩니다.",
      body_en: "Generated body text will appear here.",
    })),
    closing_ko: "마무리 분석이 여기에 생성됩니다.",
    closing_en: "Closing analysis will appear here.",
    question_ko: "독자를 위한 질문이 여기에 생성됩니다.",
    question_en: "A reflective question will appear here.",
    tags_ko: ["태그1", "태그2", "태그3"],
    tags_en: ["tag1", "tag2", "tag3"],
    rating: 4.0,
  };
}

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
  const [summary, setSummary] = useState<ReturnType<typeof createMockSummary> | null>(null);

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const canProceed = !!info.gutenberg_url.trim();

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("API 키가 설정되지 않았어요. 관리자에게 문의하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Fetch Gutenberg text
      setLoadingMsg("원문을 불러오는 중...");
      console.log('Fetching from:', info.gutenberg_url);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(info.gutenberg_url)}`;
      const textRes = await fetch(proxyUrl);
      if (!textRes.ok) throw new Error("FETCH_FAIL");
      const fullText = await textRes.text();
      console.log('Text length:', fullText.length);
      const excerpt = fullText.slice(0, 30000);

      // Step 2: Call Anthropic API
      setLoadingMsg("AI가 요약을 생성하고 있어요... (30-60초 소요)");
      console.log('Calling Anthropic API...');
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [{
            role: "user",
             content: `You are a literary editor for Chaekgado.
Analyze this classic novel. Return ONLY valid JSON, no markdown.

JSON format:
{
  "title_ko": "한국어 제목",
  "title_en": "English Title",
  "author": "Author Name",
  "year": "Publication year (number as string)",
  "pages": "Estimated page count (number as string)",
  "intro": "2-3 sentences about the author and interesting writing backstory",
  "chapters": [
    {
      "number": 1,
      "title_ko": "챕터 제목",
      "title_en": "Chapter Title",
      "quote_ko": "핵심 장면 2-3문장. 문학적 문체로.",
      "quote_en": "Same scene in English, literary style.",
      "body_ko": "2-3 paragraphs in Korean",
      "body_en": "2-3 paragraphs in English"
    }
  ],
  "closing_ko": "3단락 마무리 분석",
  "closing_en": "3 paragraph closing analysis",
  "question_ko": "독자를 향한 성찰적 질문 2문장",
  "question_en": "Reflective question for readers",
  "tags_ko": ["태그1", "태그2", "태그3", "태그4"],
  "tags_en": ["tag1", "tag2", "tag3", "tag4"],
  "rating": 4.2
}

Generate exactly 6 chapters. Warm literary tone.

Novel excerpt:
${excerpt}`,
          }],
        }),
      });

      console.log('API status:', aiRes.status);
      const responseText = await aiRes.text();
      console.log('API response:', responseText);

      if (!aiRes.ok) {
        setError(`API 오류 (${aiRes.status}): ${responseText}`);
        return;
      }

      const data = JSON.parse(responseText);
      let parsed;
      try {
        parsed = JSON.parse(data.content[0].text);
        if (!parsed.intro || !parsed.chapters || parsed.chapters.length === 0) {
          throw new Error('요약 데이터가 불완전해요. 다시 시도해주세요.');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response:', data.content[0].text);
        throw new Error('요약 형식이 올바르지 않아요. 다시 시도해주세요.');
      }
      // Auto-fill book info from AI response
      setInfo(prev => ({
        ...prev,
        title_ko: parsed.title_ko || prev.title_ko,
        title_en: parsed.title_en || prev.title_en,
        author: parsed.author || prev.author,
        year: parsed.year || prev.year,
        pages: parsed.pages || prev.pages,
      }));
      setSummary(parsed);
      setStep(3);
    } catch (err: any) {
      console.error('Summary generation failed:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      if (err.message === "FETCH_FAIL") {
        setError("원문을 가져올 수 없어요. URL을 확인해주세요.");
      } else {
        setError(`요약 생성에 실패했어요: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleSave = () => {
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
    saveBook(book);
    toast({
      title: "✅ 책이 추가됐어요!",
      description: "책이 저장되었습니다",
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
            disabled={!canProceed}
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
              <button className="admin-btn-primary large" onClick={handleGenerate} disabled={!apiKey}>
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
