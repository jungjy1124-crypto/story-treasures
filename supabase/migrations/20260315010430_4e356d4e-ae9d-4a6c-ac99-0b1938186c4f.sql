
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS intro_en text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS closing_en text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS question_en text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS tags_en text[];
