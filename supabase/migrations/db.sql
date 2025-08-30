-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  bank_name character varying NOT NULL,
  account_number character varying NOT NULL,
  account_holder_name character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.deposit_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  amount numeric NOT NULL,
  transaction_id character varying NOT NULL,
  bank_name character varying NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  admin_notes text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deposit_requests_pkey PRIMARY KEY (id),
  CONSTRAINT deposit_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exchange_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  from_currency character varying NOT NULL,
  to_currency character varying NOT NULL,
  amount numeric NOT NULL,
  receive_amount numeric NOT NULL,
  exchange_rate numeric NOT NULL,
  charges numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  admin_notes text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exchange_requests_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type character varying NOT NULL,
  amount numeric NOT NULL,
  currency character varying NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  reference_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  bdt_balance numeric DEFAULT 0.00,
  inr_balance numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.withdraw_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  amount numeric NOT NULL,
  bank_account_id uuid,
  status character varying DEFAULT 'pending'::character varying,
  admin_notes text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT withdraw_requests_pkey PRIMARY KEY (id),
  CONSTRAINT withdraw_requests_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id),
  CONSTRAINT withdraw_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);