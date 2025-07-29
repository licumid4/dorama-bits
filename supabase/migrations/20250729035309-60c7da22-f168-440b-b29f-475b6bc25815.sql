-- Remove the whatsapp_number and payment_proof_url columns from subscriptions table
-- since users will contact directly via WhatsApp

ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS whatsapp_number,
DROP COLUMN IF EXISTS payment_proof_url;