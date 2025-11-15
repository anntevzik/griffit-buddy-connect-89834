-- Add explicit denial policies to prevent unauthorized access

-- Children table: Explicitly deny SELECT for users who are not the child or parent
CREATE POLICY "Deny unauthorized children access"
ON public.children
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
);

-- Drop old permissive policies and replace with restrictive ones
DROP POLICY IF EXISTS "Children can view their own profile" ON public.children;
DROP POLICY IF EXISTS "Parents can view their children" ON public.children;

-- Chat messages: Restrict access more explicitly
DROP POLICY IF EXISTS "Children can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Parents can view their children's messages" ON public.chat_messages;

CREATE POLICY "Restrict chat message access"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() 
    OR parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  )
);

-- Emotion logs: Restrict access
DROP POLICY IF EXISTS "Children can view their own emotion logs" ON public.emotion_logs;
DROP POLICY IF EXISTS "Parents can view their children's emotion logs" ON public.emotion_logs;

CREATE POLICY "Restrict emotion log access"
ON public.emotion_logs
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() 
    OR parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  )
);

-- Choice logs: Restrict access
DROP POLICY IF EXISTS "Children can view their own choice logs" ON public.choice_logs;
DROP POLICY IF EXISTS "Parents can view their children's choice logs" ON public.choice_logs;

CREATE POLICY "Restrict choice log access"
ON public.choice_logs
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() 
    OR parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  )
);

-- Shared drawings: Restrict access
DROP POLICY IF EXISTS "Children can view their own drawings" ON public.shared_drawings;
DROP POLICY IF EXISTS "Parents can view their children's drawings" ON public.shared_drawings;

CREATE POLICY "Restrict shared drawing access"
ON public.shared_drawings
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() 
    OR parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  )
);

-- Add length constraints via CHECK constraints on text fields
ALTER TABLE chat_messages 
  ADD CONSTRAINT chat_content_length CHECK (length(content) <= 2000);

ALTER TABLE emotion_logs 
  ADD CONSTRAINT emotion_type_length CHECK (length(emotion_type) <= 50);

ALTER TABLE choice_logs 
  ADD CONSTRAINT choice_value_length CHECK (length(choice_value) <= 100),
  ADD CONSTRAINT choice_type_length CHECK (length(choice_type) <= 50);

-- Limit image data size for shared drawings (5MB base64 is roughly 6.6MB text)
ALTER TABLE shared_drawings 
  ADD CONSTRAINT image_data_length CHECK (length(image_data) <= 7000000),
  ADD CONSTRAINT ai_analysis_length CHECK (length(ai_analysis) <= 5000);