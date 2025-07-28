-- Remove old purchase system and create subscription system
DROP TABLE IF EXISTS public.purchases;

-- Create subscriptions table for monthly plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled
  payment_proof_url TEXT, -- URL do comprovante enviado
  whatsapp_number TEXT, -- Número que enviou o comprovante
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription request" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update videos table structure for dorama format
ALTER TABLE public.videos 
ADD COLUMN tags TEXT[],
ADD COLUMN video_url TEXT, -- Para embed do vídeo
DROP COLUMN IF EXISTS price;

-- Update existing videos to be doramas
UPDATE public.videos SET 
  tags = ARRAY['Romance', 'Drama'],
  video_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid 
    AND status = 'active'
    AND expires_at > now()
  );
END;
$$;