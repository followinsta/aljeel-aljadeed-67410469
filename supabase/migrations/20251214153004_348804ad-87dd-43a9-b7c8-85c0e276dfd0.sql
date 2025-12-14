-- Drop the problematic policies that access auth.users directly
DROP POLICY IF EXISTS "Investors can view their own data" ON public.investors;
DROP POLICY IF EXISTS "Investors can view their own fees" ON public.investor_fees;
DROP POLICY IF EXISTS "Investors can view their own profit history" ON public.investor_profit_history;

-- Create a secure function to get user email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Create new policies using the secure function
CREATE POLICY "Investors can view their own data" 
ON public.investors 
FOR SELECT 
USING (email = public.get_current_user_email());

CREATE POLICY "Investors can view their own fees" 
ON public.investor_fees 
FOR SELECT 
USING (investor_id IN (
  SELECT id FROM public.investors 
  WHERE email = public.get_current_user_email()
));

CREATE POLICY "Investors can view their own profit history" 
ON public.investor_profit_history 
FOR SELECT 
USING (investor_id IN (
  SELECT id FROM public.investors 
  WHERE email = public.get_current_user_email()
));