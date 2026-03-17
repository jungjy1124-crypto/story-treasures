import { useState } from "react";
import RawTextClassifier from "@/components/admin/RawTextClassifier";

interface Chapter {
  number: number;
  title_ko: string;
  title_en: string;
  quotes_ko: string[];
  quotes_en: string[];
  body_ko: string;
  body_en: string;
  quote_ko?: string;
  quote_en?: string;
}

interface SummaryData {
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

interface Props {
  summary: SummaryData;
  onSummaryChange: (s: SummaryData) => void;
  onBack: () => void;
  onSave: () => void;
  saveLabel?: string;
}

export default function AdminBookEditor({ summary, onSummaryChange, onBack, onSave, saveLabel = "✅ 저장하기" }: Props) {
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [chapterLang, setChapterLang] = useState<Record<number, "ko" | "en">>({});
  const [newTagKo, setNewTagKo] = useState("");
  const [newTagEn, setNewTagEn] = useState("");

  const update = (patch: Partial<SummaryData>) => onSummaryChange({ ...summary, ...patch });

  const updateChapter = (idx: number, patch: Partial<Chapter>) => {
    const chapters = [...summary.chapters];
    chapters[idx] = { ...chapters[idx], ...patch };
    update({ chapters });
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

  return (
    <div className="admin-editor">
      {/* Raw Text Classifier */}
      <RawTextClassifier
        chapters={summary.chapters}
        onApply={(chapters) => update({ chapters })}
      />

      {/* Intro */}
      <div className="admin-card">
        <label className="admin-label">소개 / Intro</label>
        <textarea
          className="admin-textarea"
          rows={4}
          value={summary.intro}
          onChange={(e) => update({ intro: e.target.value })}
        />
      </div>

      {/* Chapters */}
      {summary.chapters.map((ch, idx) => {
        const lang = getLang(idx);
        const isOpen = openChapter === idx;
        return (
          <div key={idx} className="admin-card admin-chapter-card">
            <button
              className="admin-chapter-header"
              onClick={() => setOpenChapter(isOpen ? null : idx)}
            >
              <span>챕터 {ch.number}: {ch.title_ko}</span>
              <span className="admin-chevron">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className="admin-chapter-body">
                <div className="admin-lang-tabs">
                  <button
                    className={`admin-lang-tab${lang === "ko" ? " active" : ""}`}
                    onClick={() => setChapterLang({ ...chapterLang, [idx]: "ko" })}
                  >KO</button>
                  <button
                    className={`admin-lang-tab${lang === "en" ? " active" : ""}`}
                    onClick={() => setChapterLang({ ...chapterLang, [idx]: "en" })}
                  >EN</button>
                </div>

                <label className="admin-label">제목</label>
                <input
                  className="admin-input"
                  value={lang === "ko" ? ch.title_ko : ch.title_en}
                  onChange={(e) => updateChapter(idx, lang === "ko" ? { title_ko: e.target.value } : { title_en: e.target.value })}
                />

                {[0, 1, 2].map((qi) => {
                  const quotes = lang === "ko"
                    ? (ch.quotes_ko || (ch.quote_ko ? [ch.quote_ko] : [""]))
                    : (ch.quotes_en || (ch.quote_en ? [ch.quote_en] : [""]));
                  const quoteVal = quotes[qi] || "";
                  if (qi === 2 && !quoteVal && quotes.length < 3) return null;
                  return (
                    <div key={qi}>
                      <label className="admin-label" style={{ fontSize: 12, color: "#8B6914" }}>
                        인용구 {qi + 1}{qi === 2 && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> (선택)</span>}
                      </label>
                      <textarea
                        className="admin-textarea admin-quote"
                        rows={3}
                        value={quoteVal}
                        onChange={(e) => {
                          const newQuotes = [...quotes];
                          while (newQuotes.length <= qi) newQuotes.push("");
                          newQuotes[qi] = e.target.value;
                          updateChapter(idx, lang === "ko" ? { quotes_ko: newQuotes } : { quotes_en: newQuotes });
                        }}
                      />
                    </div>
                  );
                })}
                {(() => {
                  const quotes = lang === "ko"
                    ? (ch.quotes_ko || (ch.quote_ko ? [ch.quote_ko] : [""]))
                    : (ch.quotes_en || (ch.quote_en ? [ch.quote_en] : [""]));
                  if (quotes.length < 3) {
                    return (
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        style={{ fontSize: 12, padding: "4px 12px", marginBottom: 8 }}
                        onClick={() => {
                          const newQuotes = [...quotes];
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

                <label className="admin-label">본문</label>
                <textarea
                  className="admin-textarea"
                  rows={5}
                  value={lang === "ko" ? ch.body_ko : ch.body_en}
                  onChange={(e) => updateChapter(idx, lang === "ko" ? { body_ko: e.target.value } : { body_en: e.target.value })}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Closing */}
      <div className="admin-card">
        <label className="admin-label">마무리 (KO)</label>
        <textarea className="admin-textarea" rows={4} value={summary.closing_ko} onChange={(e) => update({ closing_ko: e.target.value })} />
        <label className="admin-label mt">마무리 (EN)</label>
        <textarea className="admin-textarea" rows={4} value={summary.closing_en} onChange={(e) => update({ closing_en: e.target.value })} />
      </div>

      {/* Question */}
      <div className="admin-card">
        <label className="admin-label">질문 (KO)</label>
        <textarea className="admin-textarea" rows={2} value={summary.question_ko} onChange={(e) => update({ question_ko: e.target.value })} />
        <label className="admin-label mt">질문 (EN)</label>
        <textarea className="admin-textarea" rows={2} value={summary.question_en} onChange={(e) => update({ question_en: e.target.value })} />
      </div>

      {/* Tags */}
      <div className="admin-card">
        <label className="admin-label">태그 (KO)</label>
        <div className="admin-tags">
          {summary.tags_ko.map((t, i) => (
            <span key={i} className="admin-tag">
              {t} <button onClick={() => removeTag("ko", i)}>×</button>
            </span>
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
            <span key={i} className="admin-tag">
              {t} <button onClick={() => removeTag("en", i)}>×</button>
            </span>
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

      {/* Rating */}
      <div className="admin-card">
        <label className="admin-label">평점</label>
        <div className="admin-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`admin-star${star <= Math.round(summary.rating) ? " filled" : ""}`}
              onClick={() => update({ rating: star })}
            >
              ★
            </button>
          ))}
          <span className="admin-rating-num">{summary.rating}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-editor-actions">
        <button className="admin-btn-secondary" onClick={onBack}>← 다시 생성</button>
        <button className="admin-btn-primary" onClick={onSave}>{saveLabel}</button>
      </div>
    </div>
  );
}
