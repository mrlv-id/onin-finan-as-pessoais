-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create transaction categories enum
CREATE TYPE public.transaction_category AS ENUM (
  'salary',
  'freelance',
  'investment',
  'other_income',
  'rent',
  'internet',
  'phone',
  'credit_card',
  'food',
  'transport',
  'entertainment',
  'health',
  'education',
  'other_expense'
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category transaction_category NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create account categories enum
CREATE TYPE public.account_category AS ENUM (
  'rent',
  'internet',
  'phone',
  'credit_card',
  'subscription',
  'bill',
  'loan',
  'other'
);

-- Create fixed accounts table
CREATE TABLE public.fixed_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  category account_category NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for fixed accounts
ALTER TABLE public.fixed_accounts ENABLE ROW LEVEL SECURITY;

-- Fixed accounts policies
CREATE POLICY "Users can view their own accounts"
  ON public.fixed_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON public.fixed_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.fixed_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.fixed_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixed_accounts_updated_at
  BEFORE UPDATE ON public.fixed_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fixed_accounts;