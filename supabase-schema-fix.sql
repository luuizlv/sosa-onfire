-- SQL CORRIGIDA para configurar o banco de dados no Supabase
-- Execute este script COMPLETO no SQL Editor do Supabase

-- ========= IMPORTANTE =========
-- Execute TODOS os comandos abaixo em sequência
-- =============================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PRIMEIRO: Remover tabelas se existirem (para recriar com enum correto)
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- SEGUNDO: Remover ENUMs se existirem
DROP TYPE IF EXISTS bet_status CASCADE;
DROP TYPE IF EXISTS bet_type CASCADE;

-- TERCEIRO: Criar ENUMs corretamente
CREATE TYPE bet_type AS ENUM (
    'surebet',
    'giros',
    'superodd',
    'dnc',
    'gastos',
    'bingos',
    'extracao',
    'vicio'
);

CREATE TYPE bet_status AS ENUM (
    'pending',
    'completed',
    'lost'
);

-- QUARTO: Criar tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- QUINTO: Criar tabela de apostas
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stake DECIMAL(12, 2) NOT NULL,
    payout DECIMAL(12, 2) NOT NULL,
    bet_type bet_type NOT NULL,
    status bet_status DEFAULT 'pending' NOT NULL,
    house VARCHAR(100),
    description TEXT,
    placed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- SEXTO: Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_placed_at ON bets(placed_at);
CREATE INDEX IF NOT EXISTS idx_bets_bet_type ON bets(bet_type);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_user_placed_at ON bets(user_id, placed_at DESC);

-- SÉTIMO: Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- OITAVO: Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at 
    BEFORE UPDATE ON bets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- NONO: Habilitar RLS (Row Level Security) para segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- DÉCIMO: Criar políticas RLS
CREATE POLICY "Users can view own profile" ON users 
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own bets" ON bets 
    FOR ALL USING (auth.uid() = user_id);

-- DÉCIMO PRIMEIRO: Função para sincronizar usuário do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, users.username),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DÉCIMO SEGUNDO: Trigger para criar usuário automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- VERIFICAÇÃO: Testar se os ENUMs foram criados corretamente
-- Execute este SELECT para verificar se todos os valores estão corretos:
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'bet_type'::regtype ORDER BY enumsortorder;

-- Deve retornar: surebet, giros, superodd, dnc, gastos, bingos, extracao, vicio

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários integrada com Supabase Auth';
COMMENT ON TABLE bets IS 'Tabela de apostas dos usuários';
COMMENT ON COLUMN bets.stake IS 'Valor apostado';
COMMENT ON COLUMN bets.payout IS 'Valor retornado';
COMMENT ON COLUMN bets.placed_at IS 'Data e hora quando a aposta foi feita';