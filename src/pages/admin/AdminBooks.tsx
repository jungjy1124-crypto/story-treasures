import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks, deleteBook, type StoredBook } from "@/lib/bookStorage";
import { toast } from "@/hooks/use-toast";

export default function AdminBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    const data = await getBooks();
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filtered = books.filter(
    (b) => b.title_ko.includes(search) || b.author.includes(search)
  );

  const handleDelete = async (id: string) => {
    const result = await deleteBook(id);
    if (result.success) {
      toast({ title: "삭제됐습니다 ✓" });
      await fetchBooks();
    } else {
      toast({ title: "삭제 실패", variant: "destructive" });
    }
    setConfirmId(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="admin-empty">
        <p>아직 등록된 책이 없어요.</p>
        <p>첫 번째 책을 추가해보세요!</p>
        <button className="admin-btn-primary" onClick={() => navigate("/admin/add")}>
          ➕ 새 책 추가
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">등록된 책</h1>
        <input
          className="admin-input admin-search"
          placeholder="제목 또는 저자 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>저자</th>
              <th>연도</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((book) => (
              <tr key={book.id}>
                <td
                  className="admin-table-title"
                  onClick={() => navigate(`/admin/edit/${book.id}`)}
                >
                  {book.title_ko}
                </td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td>{book.created_at.slice(0, 10)}</td>
                <td className="admin-table-actions">
                  <button
                    className="admin-btn-sm"
                    onClick={() => navigate(`/admin/edit/${book.id}`)}
                  >
                    수정
                  </button>
                  <button
                    className="admin-btn-sm danger"
                    onClick={() => setConfirmId(book.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmId && (
        <div className="admin-overlay" onClick={() => setConfirmId(null)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <p>정말 삭제할까요?</p>
            <div className="admin-dialog-actions">
              <button className="admin-btn-sm" onClick={() => setConfirmId(null)}>
                취소
              </button>
              <button
                className="admin-btn-sm danger"
                onClick={() => handleDelete(confirmId)}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
