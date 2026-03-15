import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { filterText, relativeTime, maskNickname } from "@/lib/contentFilter";

interface Passage {
  id: string;
  book_id: string;
  nickname: string;
  content: string;
  chapter: number | null;
  status: string;
  created_at: string;
}

interface Props {
  bookId: string;
}

const UserPassageSection = ({ bookId }: Props) => {
  const isAdmin = !!localStorage.getItem("cgAdmin");
  const [passages, setPassages] = useState<Passage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [chapter, setChapter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPassages = useCallback(async () => {
    // Admin sees all, public sees only approved
    const query = supabase
      .from("user_passages")
      .select("*")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query.eq("status", "approved");
    }

    const { data } = await query;
    if (data) setPassages(data as Passage[]);
  }, [bookId, isAdmin]);

  useEffect(() => { fetchPassages(); }, [fetchPassages]);

  const approvedCount = passages.filter(p => p.status === "approved").length;

  const handleSubmit = async () => {
    const nickCheck = filterText(nickname, "닉네임", 20);
    if (!nickCheck.ok) { toast({ title: nickCheck.reason, variant: "destructive" }); return; }
    const contentCheck = filterText(content, "구절", 200);
    if (!contentCheck.ok) { toast({ title: contentCheck.reason, variant: "destructive" }); return; }

    setSubmitting(true);
    const insertData: Record<string, unknown> = {
      book_id: bookId,
      nickname: nickname.trim(),
      content: content.trim(),
      status: "pending",
    };
    if (chapter.trim()) insertData.chapter = parseInt(chapter.trim());

    const { error } = await supabase.from("user_passages").insert(insertData as any);
    setSubmitting(false);

    if (error) {
      toast({ title: "제출에 실패했어요", variant: "destructive" });
      return;
    }

    toast({ title: "소중한 구절이 접수됐어요. 검토 후 게시됩니다 ✓" });
    setNickname("");
    setContent("");
    setChapter("");
    setShowForm(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("user_passages").update({ status: newStatus }).eq("id", id);
    toast({ title: newStatus === "approved" ? "승인됐습니다" : "거절됐습니다" });
    fetchPassages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 구절을 삭제할까요?")) return;
    await supabase.from("user_passages").delete().eq("id", id);
    fetchPassages();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { emoji: string; label: string; color: string }> = {
      pending: { emoji: "🟡", label: "검토 중", color: "rgba(255,200,0,0.8)" },
      approved: { emoji: "🟢", label: "게시 중", color: "rgba(100,200,100,0.8)" },
      rejected: { emoji: "🔴", label: "거절됨", color: "rgba(255,100,100,0.8)" },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>
        {s.emoji} {s.label}
      </span>
    );
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "24px 20px",
      margin: "0 16px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c" }}>
          인상 깊은 구절 ({approvedCount})
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "transparent",
              border: "1px solid #c9a84c",
              color: "#c9a84c",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✏️ 구절 남기기
          </button>
        )}
      </div>

      {/* Submission form */}
      {showForm && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder="닉네임"
              maxLength={20}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
            <input
              type="number"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="챕터 번호 (선택)"
              style={{
                width: 130,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 200))}
              placeholder="책에서 인상 깊었던 구절을 남겨주세요"
              maxLength={200}
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
            <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {content.length} / 200
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.5)",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >취소</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
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
            >제출하기</button>
          </div>
        </div>
      )}

      {/* Passages list */}
      {passages.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "32px 0",
          color: "rgba(255,255,255,0.3)",
          fontSize: 14,
        }}>
          아직 등록된 구절이 없어요. 첫 번째 구절을 남겨보세요 ✍️
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {passages.map((p) => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.03)",
              borderLeft: "3px solid #c9a84c",
              borderRadius: 10,
              padding: "20px 20px 14px",
              position: "relative",
            }}>
              <div style={{
                fontSize: "1.15rem",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.7,
                textAlign: "center",
                marginBottom: 12,
              }}>
                "{p.content}"
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
              }}>
                <span>{maskNickname(p.nickname)}</span>
                {p.chapter && <span>| Ch. {p.chapter}</span>}
                <span>| {relativeTime(p.created_at)}</span>
                {isAdmin && statusBadge(p.status)}
              </div>

              {/* Admin controls */}
              {isAdmin && (
                <div style={{
                  display: "flex",
                  gap: 6,
                  justifyContent: "center",
                  marginTop: 10,
                }}>
                  {p.status !== "approved" && (
                    <button
                      onClick={() => handleStatusChange(p.id, "approved")}
                      style={{
                        background: "rgba(80,180,80,0.15)",
                        border: "1px solid rgba(80,180,80,0.3)",
                        color: "rgba(80,200,80,0.9)",
                        borderRadius: 6,
                        padding: "4px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >승인 ✓</button>
                  )}
                  {p.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(p.id, "rejected")}
                      style={{
                        background: "rgba(200,80,80,0.15)",
                        border: "1px solid rgba(200,80,80,0.3)",
                        color: "rgba(255,100,100,0.9)",
                        borderRadius: 6,
                        padding: "4px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >거절 ✗</button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.25)",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPassageSection;
