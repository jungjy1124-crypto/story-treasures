
CREATE TABLE IF NOT EXISTS public.user_passages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  nickname text NOT NULL,
  content text NOT NULL,
  chapter integer,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_passages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert" ON public.user_passages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved" ON public.user_passages FOR SELECT USING (status = 'approved');
CREATE POLICY "Admin read all" ON public.user_passages FOR SELECT USING (true);
CREATE POLICY "Admin update" ON public.user_passages FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON public.user_passages FOR DELETE USING (true);
