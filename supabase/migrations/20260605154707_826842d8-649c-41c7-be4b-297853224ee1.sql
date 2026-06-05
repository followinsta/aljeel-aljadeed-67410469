ALTER TABLE public.investors
ADD COLUMN IF NOT EXISTS notification_bar_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_bar_text text,
ADD COLUMN IF NOT EXISTS auto_enable_withdraw_after_24h boolean NOT NULL DEFAULT false;