-- Add shipping_vendor column to requests table
ALTER TABLE public.requests 
ADD COLUMN shipping_vendor text;