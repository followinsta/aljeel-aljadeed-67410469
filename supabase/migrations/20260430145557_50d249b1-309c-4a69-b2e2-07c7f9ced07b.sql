-- 1. Add currency column to packages
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'SAR';

-- 2. Create payment_receipts table
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  customer_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  package_id UUID,
  package_name TEXT,
  package_amount NUMERIC,
  currency TEXT DEFAULT 'SAR',
  payment_method TEXT,
  receipt_image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment receipts"
ON public.payment_receipts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own receipts"
ON public.payment_receipts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipts"
ON public.payment_receipts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_payment_receipts_updated_at
BEFORE UPDATE ON public.payment_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for admin notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_receipts;

-- 3. Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view payment receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-receipts');

CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Admins can delete payment receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-receipts' AND has_role(auth.uid(), 'admin'::app_role));