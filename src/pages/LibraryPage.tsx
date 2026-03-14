import { useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";

const LibraryPage = () => {
  const { pathname } = useLocation();
  const isKo = pathname.startsWith("/ko");

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-3xl">
        {isKo ? "전체 목록" : "Library"}
      </h2>
      <div className="flex flex-col items-center justify-center py-16 text-chaek-ink/30">
        <BookOpen size={48} className="mb-4" />
        <p className="text-sm font-medium">
          {isKo ? "곧 더 많은 작품이 추가됩니다" : "More titles coming soon"}
        </p>
      </div>
    </div>
  );
};

export default LibraryPage;
