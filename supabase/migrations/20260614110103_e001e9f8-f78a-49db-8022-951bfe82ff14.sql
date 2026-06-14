
CREATE TABLE public.color_meanings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  color_name text NOT NULL UNIQUE,
  hex_value text NOT NULL,
  emotional_meaning text NOT NULL,
  psychological_notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.color_meanings TO anon, authenticated;
GRANT ALL ON public.color_meanings TO service_role;

ALTER TABLE public.color_meanings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read color meanings"
ON public.color_meanings FOR SELECT
USING (true);

CREATE TABLE public.drawing_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  professional_analysis text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.drawing_references TO anon, authenticated;
GRANT ALL ON public.drawing_references TO service_role;

ALTER TABLE public.drawing_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read drawing references"
ON public.drawing_references FOR SELECT
USING (true);
