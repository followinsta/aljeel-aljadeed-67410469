
-- Create investors table for admin to manage subscribers
CREATE TABLE public.investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  bank_account_number TEXT,
  iban TEXT,
  bank_name TEXT,
  subscription_amount NUMERIC NOT NULL DEFAULT 0,
  daily_profit NUMERIC NOT NULL DEFAULT 0,
  subscription_duration_months INTEGER NOT NULL DEFAULT 4,
  subscription_duration_days INTEGER NOT NULL DEFAULT 120,
  subscription_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_accumulated_profit NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email TEXT,
  password_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor fees table
CREATE TABLE public.investor_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  amount NUMERIC,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor profit history table
CREATE TABLE public.investor_profit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  profit_amount NUMERIC NOT NULL,
  profit_date DATE NOT NULL,
  cumulative_profit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profit_history ENABLE ROW LEVEL SECURITY;

-- Admin policies for investors
CREATE POLICY "Admins can manage investors" 
ON public.investors 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors can view their own data" 
ON public.investors 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin policies for investor_fees
CREATE POLICY "Admins can manage investor fees" 
ON public.investor_fees 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors can view their own fees" 
ON public.investor_fees 
FOR SELECT 
USING (investor_id IN (SELECT id FROM public.investors WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Admin policies for investor_profit_history
CREATE POLICY "Admins can manage profit history" 
ON public.investor_profit_history 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors can view their own profit history" 
ON public.investor_profit_history 
FOR SELECT 
USING (investor_id IN (SELECT id FROM public.investors WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Create trigger for updated_at
CREATE TRIGGER update_investors_updated_at
BEFORE UPDATE ON public.investors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_investors_email ON public.investors(email);
CREATE INDEX idx_investors_is_active ON public.investors(is_active);
CREATE INDEX idx_investor_fees_investor_id ON public.investor_fees(investor_id);
CREATE INDEX idx_investor_profit_history_investor_id ON public.investor_profit_history(investor_id);
CREATE INDEX idx_investor_profit_history_date ON public.investor_profit_history(profit_date);
