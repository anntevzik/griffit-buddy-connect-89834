CREATE POLICY "Parents can insert messages for their children"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (
    SELECT c.id FROM public.children c
    WHERE c.parent_id IN (
      SELECT p.id FROM public.parents p WHERE p.user_id = auth.uid()
    )
  )
);