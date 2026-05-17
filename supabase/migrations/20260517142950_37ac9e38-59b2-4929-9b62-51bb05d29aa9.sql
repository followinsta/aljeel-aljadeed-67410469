ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS withdraw_button_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS withdraw_button_text text;