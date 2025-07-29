-- Add email column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN email TEXT;