-- Create threads table for chat conversations
CREATE TABLE public.threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own threads" ON public.threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own threads" ON public.threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own threads" ON public.threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own threads" ON public.threads FOR DELETE USING (auth.uid() = user_id);

-- Create messages table for chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  parts JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their threads" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.threads WHERE id = messages.thread_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create messages in their threads" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.threads WHERE id = messages.thread_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete messages in their threads" ON public.messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.threads WHERE id = messages.thread_id AND user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on threads
CREATE TRIGGER update_threads_updated_at
BEFORE UPDATE ON public.threads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();