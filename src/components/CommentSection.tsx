import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { filterText, relativeTime } from "@/lib/contentFilter";

interface Comment {
  id: string;
  book_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

interface Props {
  bookId: string;
}

const CommentSection = ({ bookId }: Props) => {
  const isAdmin = !!localStorage.getItem("cgAdmin");
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setComments(data as Comment[]);
  }, [bookId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async () => {
    const nickCheck = filterText(nickname, '닉네임', 20);
    if (!nickCheck.ok) {
      toast({ title: nickCheck.reason, variant: "destructive" });
      return;
    }
    const contentCheck = filterText(content, '댓글', 300);
    if (!contentCheck.ok) {
      toast({ title: contentCheck.reason, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      book_id: bookId,
      nickname: nickname.trim(),
      content: content.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "댓글 등록에 실패했어요", variant: "destructive" });
      return;
    }

    setNickname("");
    setContent("");
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "24px 20px",
      margin: "0 16px 24px",
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", marginBottom: 16 }}>
        독자 반응 ({comments.length})
      </div>

      {/* Input form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 20))}
          placeholder="닉네임"
          maxLength={20}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#fff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 300))}
            placeholder="이 책에 대한 생각을 남겨주세요"
            maxLength={300}
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{
            textAlign: "right",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            marginTop: 2,
          }}>
            {content.length} / 300
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            alignSelf: "flex-end",
            background: "#c9a84c",
            color: "#1a1a1a",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          남기기
        </button>
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "32px 0",
          color: "rgba(255,255,255,0.3)",
          fontSize: 14,
        }}>
          첫 번째 댓글을 남겨보세요 ✍️
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {comments.map((c) => (
            <div key={c.id} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "14px 16px",
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: "#c9a84c", fontSize: 14 }}>{c.nickname}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{relativeTime(c.created_at)}</span>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{c.content}</div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.25)",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
