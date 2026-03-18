import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Chapter {
  number: number;
  title_ko: string;
  title_en: string;
  quotes_ko: string[];
  quotes_en: string[];
  body_ko: string;
  body_en: string;
}

interface Props {
  chapters: Chapter[];
  onApply: (chapters: Chapter[]) => void;
}

export default function RawTextClassifier({ chapters, onApply }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [rawText, setRawText] = useState("");
  const [splitBy, setSplitBy] = useState<"chapter" | "manual">("chapter");
  const [fillTitle, setFillTitle] = useState(true);
  const [fillQuote, setFillQuote] = useState(true);
  const [fillBody, setFillBody] = useState(true);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState<"success" | "error" | null>(null);

  const hasExistingContent = () => {
    return chapters.some((ch) => {
      const s = (v: unknown) => typeof v === "string" ? v.trim() : "";
      if (fillTitle && s(lang === "ko" ? ch.title_ko : ch.title_en)) return true;
      if (fillQuote) {
        const quotes = lang === "ko" ? ch.quotes_ko : ch.quotes_en;
        if (quotes && quotes.some((q) => s(q))) return true;
      }
      if (fillBody && s(lang === "ko" ? ch.body_ko : ch.body_en)) return true;
      return false;
    });
  };

  const applyResult = (parsed: any) => {
    const resultChapters = parsed.chapters || [];
    const updatedChapters = [...chapters];

    for (let i = 0; i < resultChapters.length && i < updatedChapters.length; i++) {
      const rc = resultChapters[i];
      const titleKey = lang === "ko" ? "title_ko" : "title_en";
      const quotesKey = lang === "ko" ? "quotes_ko" : "quotes_en";
      const bodyKey = lang === "ko" ? "body_ko" : "body_en";

      if (fillTitle) {
        updatedChapters[i] = { ...updatedChapters[i], [titleKey]: String(rc.title || "") };
      }
      if (fillQuote) {
        const quotes = [String(rc.quote_1 || ""), String(rc.quote_2 || "")].filter((q) => q);
        updatedChapters[i] = { ...updatedChapters[i], [quotesKey]: quotes };
      }
      if (fillBody) {
        updatedChapters[i] = { ...updatedChapters[i], [bodyKey]: String(rc.body || "") };
      }
    }

    for (let i = updatedChapters.length; i < resultChapters.length; i++) {
      const rc = resultChapters[i];
      const newCh: Chapter = {
        number: i + 1, title_ko: "", title_en: "",
        quotes_ko: [], quotes_en: [], body_ko: "", body_en: "",
      };
      if (fillTitle) newCh[lang === "ko" ? "title_ko" : "title_en"] = String(rc.title || "");
      if (fillQuote) newCh[lang === "ko" ? "quotes_ko" : "quotes_en"] = [String(rc.quote_1 || ""), String(rc.quote_2 || "")].filter(q => q);
      if (fillBody) newCh[lang === "ko" ? "body_ko" : "body_en"] = String(rc.body || "");
      updatedChapters.push(newCh);
    }

    onApply(updatedChapters);
    setClassifyResult("success");
    setRawText("");

    // Auto-scroll to first chapter
    setTimeout(() => {
      document.querySelector(".admin-chapter-card")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAutoClassify = async () => {
    if (!rawText.trim()) return;

    // Simple window.confirm for overwrite
    if (hasExistingContent()) {
      const confirmed = window.confirm(
        "이미 입력된 내용이 있습니다.\n새로운 내용으로 덮어쓰시겠습니까?"
      );
      if (!confirmed) return;
    }

    setIsClassifying(true);
    setClassifyResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("classify-text", {
        body: { rawText, lang, chapterCount: chapters.length || 6 },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      applyResult(data.result);
    } catch (e: any) {
      console.error("분류 실패:", e);
      setClassifyResult("error");
      toast({ title: "분류 실패", description: e.message, variant: "destructive" });
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="admin-classifier">
      {/* Header */}
      <div className="admin-classifier-header" onClick={() => setIsOpen(!isOpen)}>
        <span style={{ fontWeight: 600, color: "#2C1F0E" }}>
          📋 텍스트 붙여넣기 → 자동 분류
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="admin-classifier-body">
          {/* Language tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {(["ko", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`admin-classifier-lang-tab${lang === l ? " active" : ""}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            className="admin-classifier-textarea"
            placeholder={`여기에 원문 또는 요약 텍스트를 붙여넣으세요.\n챕터 구분이 있으면 자동으로 나눠서 분류해드립니다.`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
          />

          {/* Split mode */}
          <div className="admin-classifier-options">
            분류 기준:
            <label>
              <input
                type="radio"
                name="splitBy"
                checked={splitBy === "chapter"}
                onChange={() => setSplitBy("chapter")}
              />{" "}
              챕터 번호 기준
            </label>
            <label>
              <input
                type="radio"
                name="splitBy"
                checked={splitBy === "manual"}
                onChange={() => setSplitBy("manual")}
              />{" "}
              수동 분류
            </label>
          </div>

          {/* Field checkboxes */}
          <div className="admin-classifier-options">
            분류할 필드:
            <label>
              <input type="checkbox" checked={fillTitle} onChange={() => setFillTitle(!fillTitle)} />{" "}
              제목
            </label>
            <label>
              <input type="checkbox" checked={fillQuote} onChange={() => setFillQuote(!fillQuote)} />{" "}
              인용구
            </label>
            <label>
              <input type="checkbox" checked={fillBody} onChange={() => setFillBody(!fillBody)} />{" "}
              본문
            </label>
          </div>

          {/* Classify button */}
          <button
            className="admin-classifier-btn"
            onClick={handleAutoClassify}
            disabled={!rawText.trim() || isClassifying}
          >
            {isClassifying ? "분류 중..." : "✦ 자동 분류하기"}
          </button>

          {/* Result feedback */}
          {classifyResult === "success" && (
            <div className="admin-classifier-result success">
              ✓ 분류 완료! 아래 필드를 확인하고 저장하세요.
            </div>
          )}
          {classifyResult === "error" && (
            <div className="admin-classifier-result error">
              ✗ 분류에 실패했습니다. 텍스트를 확인하고 다시 시도하세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
