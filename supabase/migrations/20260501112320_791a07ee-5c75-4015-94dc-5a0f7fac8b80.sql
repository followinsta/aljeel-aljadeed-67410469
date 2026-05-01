-- Add display_name and note columns to payment_methods
ALTER TABLE public.payment_methods 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_1_label TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_1_value TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_2_label TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_2_value TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_3_label TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_3_value TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_4_label TEXT,
  ADD COLUMN IF NOT EXISTS custom_field_4_value TEXT;