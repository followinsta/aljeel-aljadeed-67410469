-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage investors" ON public.investors;
DROP POLICY IF EXISTS "Investors can view their own data" ON public.investors;

-- Create new permissive policies
CREATE POLICY "Admins can manage investors" 
ON public.investors 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors can view their own data" 
ON public.investors 
FOR SELECT 
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text);

-- Fix investor_fees policies
DROP POLICY IF EXISTS "Admins can manage investor fees" ON public.investor_fees;
DROP POLICY IF EXISTS "Investors can view their own fees" ON public.investor_fees;

CREATE POLICY "Admins can manage investor fees" 
ON public.investor_fees 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors can view their own fees" 
ON public.investor_fees 
FOR SELECT 
TO authenticated
USING (investor_id IN (
  SELECT id FROM investors 
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
));

-- Fix investor_profit_history policies
DROP POLICY IF EXISTS "Admins can manage profit history" ON public.investor_profit_history;
DROP POLICY IF EXISTS "Investors can view their own profit history" ON public.investor_profit_history;

CREATE POLICY "Admins can manage profit history" 
ON public.investor_profit_history 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Investors can view their own profit history" 
ON public.investor_profit_history 
FOR SELECT 
TO authenticated
USING (investor_id IN (
  SELECT id FROM investors 
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
));