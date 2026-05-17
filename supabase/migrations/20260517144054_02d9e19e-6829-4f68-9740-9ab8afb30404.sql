ALTER TABLE public.investors
ADD COLUMN IF NOT EXISTS withdraw_action_button_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS withdraw_action_button_text text,
ADD COLUMN IF NOT EXISTS withdraw_action_button_url text;