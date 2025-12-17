-- Add customer_id to profiles table (auto-generated unique ID)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- Create function to generate unique customer ID
CREATE OR REPLACE FUNCTION public.generate_customer_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_customer_id TEXT;
  counter INTEGER;
BEGIN
  -- Get the count of existing profiles to generate sequential ID
  SELECT COUNT(*) + 1 INTO counter FROM public.profiles;
  -- Generate customer ID like "GI-0001"
  new_customer_id := 'GI-' || LPAD(counter::TEXT, 4, '0');
  
  -- Ensure uniqueness by checking if it exists
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE customer_id = new_customer_id) LOOP
    counter := counter + 1;
    new_customer_id := 'GI-' || LPAD(counter::TEXT, 4, '0');
  END LOOP;
  
  NEW.customer_id := new_customer_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate customer_id
DROP TRIGGER IF EXISTS generate_customer_id_trigger ON public.profiles;
CREATE TRIGGER generate_customer_id_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.customer_id IS NULL)
  EXECUTE FUNCTION public.generate_customer_id();

-- Update existing profiles without customer_id
DO $$
DECLARE
  profile_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR profile_record IN SELECT id FROM public.profiles WHERE customer_id IS NULL ORDER BY created_at LOOP
    UPDATE public.profiles 
    SET customer_id = 'GI-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = profile_record.id;
    counter := counter + 1;
  END LOOP;
END;
$$;

-- Create subscription_requests table for tracking new subscription requests
CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  package_id UUID REFERENCES public.packages(id),
  package_name TEXT,
  package_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID
);

-- Enable RLS on subscription_requests
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_requests
CREATE POLICY "Admins can manage subscription requests"
ON public.subscription_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own requests"
ON public.subscription_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
ON public.subscription_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add customer_id to investors table for linking
ALTER TABLE public.investors ADD COLUMN IF NOT EXISTS linked_customer_id TEXT;