import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import AdminBookEditor from "./AdminBookEditor";
import { getBookById, saveBook } from "@/lib/bookStorage";

export default function AdminEditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [originalBook, setOriginalBook] = useState<any>(null);

  useEffect(() => {
    getBookById(id || "").then((found) => {
      if (found) {
        setOriginalBook(found);
        setBook({
          intro: found.intro_ko,
          intro_en: found.intro_en,
          chapters: found.chapters,
          closing_ko: found.closing_ko,
          closing_en: found.closing_en,
          question_ko: found.question_ko,
          question_en: found.question_en,
          tags_ko: found.tags_ko,
          tags_en: found.tags_en,
          rating: found.rating,
        });
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="admin-empty">
        <p>책을 찾을 수 없어요.</p>
        <button className="admin-btn-primary" onClick={() => navigate("/admin/books")}>
          ← 목록으로
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (originalBook) {
      const result = await saveBook({
        ...originalBook,
        intro_ko: book.intro || originalBook.intro_ko,
        intro_en: book.intro_en || originalBook.intro_en,
        closing_ko: book.closing_ko,
        closing_en: book.closing_en,
        question_ko: book.question_ko,
        question_en: book.question_en,
        tags_ko: book.tags_ko,
        tags_en: book.tags_en,
        rating: book.rating,
        chapters: book.chapters,
      });
      if (result.success) {
        toast({ title: "저장됐습니다 ✓" });
        navigate("/admin/books");
      } else {
        toast({ title: "저장 실패", variant: "destructive" });
      }
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">책 수정</h1>
      <AdminBookEditor
        summary={book}
        onSummaryChange={setBook}
        onBack={() => navigate("/admin/books")}
        onSave={handleSave}
        saveLabel="✅ 수정 저장"
      />
    </div>
  );
}
