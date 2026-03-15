import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface KeyPassage {
  chapter: number;
  context: string;
  text_en: string;
}

interface Props {
  bookId: string;
  passages: KeyPassage[];
  onUpdate: (passages: KeyPassage[]) => void;
}

export default function KeyPassagesEditor({ bookId, passages, onUpdate }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<KeyPassage>({ chapter: 1, context: "", text_en: "" });
  const [newForm, setNewForm] = useState<KeyPassage>({ chapter: 1, context: "", text_en: "" });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const persist = async (updated: KeyPassage[]) => {
    setSaving(true);
    const { error } = await supabase
      .from("books")
      .update({ key_passages: updated as any })
      .eq("id", bookId);
    setSaving(false);
    if (error) {
      console.error("Failed to save key_passages:", error);
      toast({ title: "저장 실패", variant: "destructive" });
      return false;
    }
    toast({ title: "저장됐습니다 ✓" });
    onUpdate(updated);
    return true;
  };

  const handleAdd = async () => {
    if (!newForm.text_en.trim()) return;
    const updated = [...passages, { ...newForm }];
    const ok = await persist(updated);
    if (ok) setNewForm({ chapter: 1, context: "", text_en: "" });
  };

  const handleEditSave = async () => {
    if (editingIdx === null) return;
    const updated = [...passages];
    updated[editingIdx] = { ...editForm };
    const ok = await persist(updated);
    if (ok) setEditingIdx(null);
  };

  const handleDelete = async (idx: number) => {
    const updated = passages.filter((_, i) => i !== idx);
    await persist(updated);
    setConfirmDeleteIdx(null);
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm({ ...passages[idx] });
    setConfirmDeleteIdx(null);
  };

  const newWc = wordCount(newForm.text_en);
  const editWc = wordCount(editForm.text_en);

  return (
    <div style={{
      margin: "32px 0",
      padding: "24px 20px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
    }}>
      <h3 style={{
        fontSize: 16,
        fontWeight: 700,
        color: "#c9a84c",
        marginBottom: 20,
        letterSpacing: "-0.02em",
      }}>대표 구절 관리</h3>

      {/* Existing passages */}
      {passages.map((p, idx) => (
        <div key={idx} style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 12,
        }}>
          {editingIdx === idx ? (
            /* Edit mode */
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: "0 0 80px" }}>
                  <label style={labelStyle}>Chapter</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editForm.chapter}
                    onChange={e => setEditForm({ ...editForm, chapter: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Context</label>
                  <input
                    value={editForm.context}
                    onChange={e => setEditForm({ ...editForm, context: e.target.value })}
                    placeholder="e.g. Darcy's first proposal"
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle}>Passage</label>
              <textarea
                value={editForm.text_en}
                onChange={e => setEditForm({ ...editForm, text_en: e.target.value })}
                rows={3}
                style={textareaStyle}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: editWc > 80 ? "#e74c3c" : "rgba(255,255,255,0.35)" }}>
                  {editWc}/80 words {editWc > 80 && "· 80 단어 초과"}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditingIdx(null)} style={btnSecondary}>취소</button>
                  <button onClick={handleEditSave} disabled={saving} style={btnPrimary}>저장</button>
                </div>
              </div>
            </div>
          ) : (
            /* Display mode */
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#c9a84c",
                      background: "rgba(201,168,76,0.12)",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}>Ch. {p.chapter}</span>
                    {p.context && (
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
                        {p.context}
                      </span>
                    )}
                  </div>
                  <p
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.75)",
                      margin: 0,
                      cursor: "pointer",
                      ...(expandedIdx !== idx ? {
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      } : {}),
                    }}
                  >{p.text_en}</p>
                </div>
                <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                  <button onClick={() => startEdit(idx)} style={pillBtn}>✏️</button>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setConfirmDeleteIdx(confirmDeleteIdx === idx ? null : idx)} style={pillBtn}>🗑️</button>
                    {confirmDeleteIdx === idx && (
                      <div style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        marginTop: 4,
                        background: "rgba(30,30,30,0.95)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.7)",
                      }}>
                        삭제할까요?{" "}
                        <button
                          onClick={() => handleDelete(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e74c3c",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >확인</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add new passage form */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 16,
        marginTop: passages.length > 0 ? 8 : 0,
      }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: "0 0 80px" }}>
            <label style={labelStyle}>Chapter</label>
            <input
              type="number"
              min={1}
              max={10}
              value={newForm.chapter}
              onChange={e => setNewForm({ ...newForm, chapter: Number(e.target.value) })}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Context</label>
            <input
              value={newForm.context}
              onChange={e => setNewForm({ ...newForm, context: e.target.value })}
              placeholder="e.g. Darcy's first proposal"
              style={inputStyle}
            />
          </div>
        </div>
        <label style={labelStyle}>Passage</label>
        <textarea
          value={newForm.text_en}
          onChange={e => setNewForm({ ...newForm, text_en: e.target.value })}
          placeholder="Enter passage (under 80 words)"
          rows={3}
          style={textareaStyle}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 12, color: newWc > 80 ? "#e74c3c" : "rgba(255,255,255,0.35)" }}>
            {newWc}/80 words {newWc > 80 && "· 80 단어 초과"}
          </span>
          <button onClick={handleAdd} disabled={saving || !newForm.text_en.trim()} style={btnPrimary}>
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.4)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "rgba(255,255,255,0.85)",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  lineHeight: 1.6,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "rgba(255,255,255,0.85)",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
};

const btnPrimary: React.CSSProperties = {
  padding: "6px 16px",
  fontSize: 13,
  fontWeight: 600,
  background: "rgba(201,168,76,0.2)",
  color: "#c9a84c",
  border: "1px solid rgba(201,168,76,0.3)",
  borderRadius: 6,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "6px 16px",
  fontSize: 13,
  fontWeight: 600,
  background: "transparent",
  color: "rgba(255,255,255,0.5)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  cursor: "pointer",
};

const pillBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  padding: "2px 4px",
};

