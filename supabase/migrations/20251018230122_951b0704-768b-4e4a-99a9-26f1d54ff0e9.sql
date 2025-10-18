-- Create chat messages table to sync between child and parent
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Children can insert their own messages
CREATE POLICY "Children can insert their own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

-- Children can view their own messages
CREATE POLICY "Children can view their own messages"
ON public.chat_messages
FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

-- Parents can view their children's messages
CREATE POLICY "Parents can view their children's messages"
ON public.chat_messages
FOR SELECT
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Enable realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;