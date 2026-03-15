import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getBookById, saveBook, type StoredBook } from "@/lib/bookStorage";
import { toast } from "@/hooks/use-toast";

interface EditState {
  [key: string]: string;
}

const BookDetailPage = () => {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");
  const isAdmin = !!localStorage.getItem("cgAdmin");

  const [book, setBook] = useState<StoredBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState>({});
  const [editValues, setEditValues] = useState<EditState>({});
  const [hasEdits, setHasEdits] = useState(false);

  useEffect(() => {
    if (slug) {
      getBookById(slug).then((found) => {
        if (found) setBook(found);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)" }}>
        {isKo ? "책을 찾을 수 없어요." : "Book not found."}
      </div>
    );
  }

  const startEdit = (key: string, value: string) => {
    setEditing((prev) => ({ ...prev, [key]: value }));
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const cancelEdit = (key: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const confirmEdit = (key: string) => {
    const val = editValues[key];
    const updated = { ...book };

    if (key === "intro") {
      if (isKo) updated.intro_ko = val; else updated.intro_en = val;
    } else if (key === "closing") {
      if (isKo) updated.closing_ko = val; else updated.closing_en = val;
    } else if (key === "question") {
      if (isKo) updated.question_ko = val; else updated.question_en = val;
    } else if (key.startsWith("ch_quote_")) {
      const idx = parseInt(key.split("_")[2]);
      updated.chapters = [...updated.chapters];
      updated.chapters[idx] = { ...updated.chapters[idx] };
      if (isKo) updated.chapters[idx].quote_ko = val; else updated.chapters[idx].quote_en = val;
    } else if (key.startsWith("ch_body_")) {
      const idx = parseInt(key.split("_")[2]);
      updated.chapters = [...updated.chapters];
      updated.chapters[idx] = { ...updated.chapters[idx] };
      if (isKo) updated.chapters[idx].body_ko = val; else updated.chapters[idx].body_en = val;
    }

    setBook(updated);
    setHasEdits(true);
    cancelEdit(key);
  };

  const saveAll = async () => {
    if (book) {
      const result = await saveBook(book);
      if (result.success) {
        toast({ title: "저장됐습니다 ✓" });
        setHasEdits(false);
      } else {
        toast({ title: "저장 실패", variant: "destructive" });
      }
    }
  };

  const intro = isKo ? book.intro_ko : book.intro_en;
  const closing = isKo ? book.closing_ko : book.closing_en;
  const question = isKo ? book.question_ko : book.question_en;
  const tags = isKo ? book.tags_ko : book.tags_en;
  const authorLabel = isKo ? "저자" : "by";

  const renderEditable = (key: string, content: string) => {
    if (editing[key] !== undefined) {
      return (
        <div className="inline-edit-area">
          <textarea
            className="inline-edit-textarea"
            value={editValues[key]}
            onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
            rows={5}
          />
          <div className="inline-edit-actions">
            <button className="inline-edit-save" onClick={() => confirmEdit(key)}>✅ 저장</button>
            <button className="inline-edit-cancel" onClick={() => cancelEdit(key)}>❌ 취소</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const editButton = (key: string, value: string) => {
    if (!isAdmin || editing[key] !== undefined) return null;
    return (
      <button className="admin-edit-pill section-edit" onClick={() => startEdit(key, value)}>
        ✏️ 수정
      </button>
    );
  };

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
              <div className="spine-text">{isKo ? book.title_ko : book.title_en}</div>
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
            <div className="book-title-hero">{isKo ? book.title_ko : book.title_en}</div>
            <div className="book-meta">
              {authorLabel} <strong>{book.author}</strong>
              <span className="sep">|</span> {book.year}
              <span className="sep">|</span> {book.pages}p
            </div>
            <div className="rating">
              <div className="rating-num">{book.rating}</div>
              <div className="stars">{"★".repeat(Math.round(book.rating))}{"☆".repeat(5 - Math.round(book.rating))}</div>
            </div>
            <div className="tags">
              {tags.map((tag) => (
                <div key={tag} className="tag">{tag}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INTRO */}
      <div className="intro-card editable-section">
        {editButton("intro", intro)}
        {editing["intro"] !== undefined ? renderEditable("intro", intro) : <p>{intro}</p>}
      </div>

      {/* SECTION TITLE */}
      <div className="section-header">{isKo ? "주요 요점" : "Key Points"}</div>

      {/* CHAPTERS */}
      {book.chapters.map((ch, idx) => {
        const quote = isKo ? ch.quote_ko : ch.quote_en;
        const body = isKo ? ch.body_ko : ch.body_en;
        return (
          <div key={ch.number} className="chapter-card">
            <div className="chapter-header">
              <div className="chapter-num">{ch.number}</div>
              <div className="chapter-title">{isKo ? ch.title_ko : ch.title_en}</div>
            </div>
            <div className="chapter-quote editable-section">
              {editButton(`ch_quote_${idx}`, quote)}
              {editing[`ch_quote_${idx}`] !== undefined
                ? renderEditable(`ch_quote_${idx}`, quote)
                : <span>{quote}</span>}
            </div>
            <div className="chapter-body editable-section">
              {editButton(`ch_body_${idx}`, body)}
              {editing[`ch_body_${idx}`] !== undefined
                ? renderEditable(`ch_body_${idx}`, body)
                : <p>{body}</p>}
            </div>
          </div>
        );
      })}

      {/* CLOSING */}
      <div className="closing-card editable-section">
        {editButton("closing", closing)}
        {editing["closing"] !== undefined ? renderEditable("closing", closing) : <p>{closing}</p>}
      </div>

      {/* QUESTION CARD */}
      <div className="question-card editable-section">
        {editButton("question", question)}
        {editing["question"] !== undefined
          ? renderEditable("question", question)
          : (
            <>
              <div className="question-label">{isKo ? "이 책을 읽고 난 뒤" : "After reading this book"}</div>
              <div className="question-text">{question}</div>
            </>
          )}
      </div>

      {/* Floating save bar */}
      {hasEdits && (
        <div className="floating-save-bar">
          <span>수정사항이 있어요</span>
          <button className="floating-save-btn" onClick={saveAll}>전체 저장</button>
        </div>
      )}

      <div className="spacer"></div>
    </>
  );
};

export default BookDetailPage;
