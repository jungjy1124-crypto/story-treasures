import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import AdminBookEditor from "./AdminBookEditor";

const MOCK_BOOKS: Record<string, any> = {
  "1": {
    intro: "표도르 도스토옙스키의 대표작으로, 19세기 러시아 사회의 어둠과 인간 내면의 갈등을 탐구합니다.",
    chapters: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      title_ko: `제${i + 1}부: 죄와 벌 챕터`,
      title_en: `Part ${i + 1}: Crime and Punishment Chapter`,
      quote_ko: "어둠 속에서도 빛은 존재한다.",
      quote_en: "Even in darkness, light exists.",
      body_ko: "주인공 라스콜니코프의 내적 갈등이 심화됩니다.",
      body_en: "Raskolnikov's internal conflict deepens.",
    })),
    closing_ko: "이 작품은 죄의식과 구원에 대한 깊은 성찰을 담고 있습니다.",
    closing_en: "This work contains deep reflections on guilt and redemption.",
    question_ko: "우리는 과연 누군가의 고통을 온전히 이해할 수 있을까요?",
    question_en: "Can we truly understand someone's suffering?",
    tags_ko: ["러시아문학", "심리소설", "도덕"],
    tags_en: ["Russian Literature", "Psychological Novel", "Morality"],
    rating: 4.5,
  },
  "2": {
    intro: "찰스 디킨스가 프랑스 혁명을 배경으로 쓴 역사 소설입니다.",
    chapters: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      title_ko: `제${i + 1}부: 두 도시 이야기 챕터`,
      title_en: `Part ${i + 1}: A Tale of Two Cities Chapter`,
      quote_ko: "최고의 시절이자 최악의 시절이었다.",
      quote_en: "It was the best of times, it was the worst of times.",
      body_ko: "런던과 파리를 오가며 이야기가 전개됩니다.",
      body_en: "The story unfolds between London and Paris.",
    })),
    closing_ko: "혁명과 희생에 대한 디킨스의 깊은 통찰이 담겨 있습니다.",
    closing_en: "Contains Dickens' deep insights on revolution and sacrifice.",
    question_ko: "진정한 희생이란 무엇일까요?",
    question_en: "What is true sacrifice?",
    tags_ko: ["영국문학", "역사소설", "혁명"],
    tags_en: ["British Literature", "Historical Novel", "Revolution"],
    rating: 4.0,
  },
};

export default function AdminEditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mockData = MOCK_BOOKS[id || ""] || MOCK_BOOKS["1"];
  const [summary, setSummary] = useState(mockData);

  const handleSave = () => {
    toast({ title: "✅ 수정됐어요!", description: "백엔드 연결 후 실제 저장됩니다" });
    navigate("/admin/books");
  };

  return (
    <div>
      <h1 className="admin-page-title">책 수정</h1>
      <AdminBookEditor
        summary={summary}
        onSummaryChange={setSummary}
        onBack={() => navigate("/admin/books")}
        onSave={handleSave}
        saveLabel="✅ 수정 저장"
      />
    </div>
  );
}
