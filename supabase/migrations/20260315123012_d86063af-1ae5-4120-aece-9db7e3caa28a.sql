
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  nickname text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete" ON public.comments FOR DELETE USING (true);
