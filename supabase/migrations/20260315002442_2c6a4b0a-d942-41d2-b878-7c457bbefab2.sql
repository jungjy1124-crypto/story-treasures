CREATE TABLE IF NOT EXISTS public.books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ko text NOT NULL,
  title_en text,
  author text,
  year integer,
  pages integer,
  cover_theme text,
  rating numeric(2,1),
  intro_ko text,
  closing_ko text,
  question_ko text,
  tags_ko text[] DEFAULT '{}',
  chapters jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON public.books FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON public.books FOR DELETE USING (true);