-- Update the generate_customer_id function to start from 12030 with 5 digits
CREATE OR REPLACE FUNCTION public.generate_customer_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_customer_id TEXT;
  counter INTEGER;
  max_id INTEGER;
BEGIN
  -- Get the max existing number from customer_ids
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_id FROM 4) AS INTEGER)), 12029) + 1 
  INTO counter 
  FROM public.profiles 
  WHERE customer_id LIKE 'GI-%';
  
  -- Ensure minimum is 12030
  IF counter < 12030 THEN
    counter := 12030;
  END IF;
  
  -- Generate customer ID like "GI-12030" (5 digits)
  new_customer_id := 'GI-' || LPAD(counter::TEXT, 5, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE customer_id = new_customer_id) LOOP
    counter := counter + 1;
    new_customer_id := 'GI-' || LPAD(counter::TEXT, 5, '0');
  END LOOP;
  
  NEW.customer_id := new_customer_id;
  RETURN NEW;
END;
$$;

-- Update existing profiles to use 5-digit IDs starting from 12030
DO $$
DECLARE
  profile_record RECORD;
  counter INTEGER := 12030;
BEGIN
  FOR profile_record IN SELECT id FROM public.profiles ORDER BY created_at LOOP
    UPDATE public.profiles 
    SET customer_id = 'GI-' || LPAD(counter::TEXT, 5, '0')
    WHERE id = profile_record.id;
    counter := counter + 1;
  END LOOP;
END;
$$;