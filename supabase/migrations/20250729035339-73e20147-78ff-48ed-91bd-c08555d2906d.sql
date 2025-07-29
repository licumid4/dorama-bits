-- Fix infinite recursion in profiles RLS policies by creating a security definer function
-- This prevents the policies from referencing the same table they're applied to

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Drop and recreate the admin policy to use the security definer function
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Also fix the subscriptions admin policy
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

CREATE POLICY "Admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Fix the videos admin policy 
DROP POLICY IF EXISTS "Admins podem gerenciar vídeos" ON public.videos;

CREATE POLICY "Admins podem gerenciar vídeos" 
ON public.videos 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Fix the admin_logs admin policy
DROP POLICY IF EXISTS "Admins podem ver logs" ON public.admin_logs;

CREATE POLICY "Admins podem ver logs" 
ON public.admin_logs 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');