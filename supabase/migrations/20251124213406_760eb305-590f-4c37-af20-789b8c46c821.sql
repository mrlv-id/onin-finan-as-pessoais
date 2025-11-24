-- Primeiro, vamos atualizar as categorias existentes que usam os valores antigos
UPDATE fixed_accounts 
SET category = 'other' 
WHERE category IN ('bill', 'loan');

-- Remover o enum antigo e criar um novo com as categorias atualizadas
ALTER TABLE fixed_accounts 
ALTER COLUMN category TYPE text;

DROP TYPE IF EXISTS account_category;

CREATE TYPE account_category AS ENUM (
  'rent',
  'internet',
  'phone',
  'credit_card',
  'subscription',
  'electricity',
  'water',
  'other'
);

ALTER TABLE fixed_accounts 
ALTER COLUMN category TYPE account_category USING category::account_category;