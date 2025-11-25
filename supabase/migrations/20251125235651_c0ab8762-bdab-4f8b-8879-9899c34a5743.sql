-- Add currency and onboarding_completed fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Update existing users to have onboarding completed
UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed = false;