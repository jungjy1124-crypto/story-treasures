import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { relativeTime } from "@/lib/contentFilter";

interface PendingPassage {
  id: string;
  book_id: string;
  nickname: string;
  content: string;
  chapter: number | null;
  status: string;
  created_at: string;
  books: { title_ko: string } | null;
}

export default function AdminPassages() {
  const [passages, setPassages] = useState<PendingPassage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    const { data } = await supabase
      .from("user_passages")
      .select("*, books(title_ko)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (data) setPassages(data as unknown as PendingPassage[]);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id: string, newStatus: "approved" | "rejected") => {
    await supabase.from("user_passages").update({ status: newStatus }).eq("id", id);
    toast({ title: newStatus === "approved" ? "승인됐습니다" : "거절됐습니다" });
    fetchPending();
  };

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        구절 승인 관리 ({passages.length})
      </h2>

      {passages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.4)" }}>
          대기 중인 구절이 없습니다
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {passages.map((p) => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 16,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 600, marginBottom: 4 }}>
                    {p.books?.title_ko || "알 수 없는 책"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {p.nickname} {p.chapter ? `| Ch. ${p.chapter}` : ""} | {relativeTime(p.created_at)}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                fontStyle: "italic",
                lineHeight: 1.6,
                margin: "12px 0",
                paddingLeft: 12,
                borderLeft: "2px solid rgba(201,168,76,0.3)",
              }}>
                "{p.content}"
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleAction(p.id, "approved")}
                  style={{
                    background: "rgba(80,180,80,0.15)",
                    border: "1px solid rgba(80,180,80,0.3)",
                    color: "rgba(80,200,80,0.9)",
                    borderRadius: 6,
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >승인 ✓</button>
                <button
                  onClick={() => handleAction(p.id, "rejected")}
                  style={{
                    background: "rgba(200,80,80,0.15)",
                    border: "1px solid rgba(200,80,80,0.3)",
                    color: "rgba(255,100,100,0.9)",
                    borderRadius: 6,
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >거절 ✗</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
