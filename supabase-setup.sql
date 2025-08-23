-- SQL ATUALIZADO para configurar o banco de dados no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar extensões necessárias (se ainda não existirem)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar ENUMs para os tipos de apostas e status
DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bet_status AS ENUM (
        'pending',
        'completed',
        'lost'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de usuários (integrada com Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Criar tabela de apostas
CREATE TABLE IF NOT EXISTS bets (
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

-- Criar bucket para imagens de perfil no Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

-- Criar política para o bucket de imagens
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_placed_at ON bets(placed_at);
CREATE INDEX IF NOT EXISTS idx_bets_bet_type ON bets(bet_type);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_user_placed_at ON bets(user_id, placed_at DESC);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bets_updated_at ON bets;
CREATE TRIGGER update_bets_updated_at 
    BEFORE UPDATE ON bets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Política RLS para usuários - apenas o próprio usuário pode ver seus dados
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users 
    FOR ALL USING (auth.uid() = id);

-- Política RLS para apostas - apenas o próprio usuário pode ver suas apostas
DROP POLICY IF EXISTS "Users can view own bets" ON bets;
CREATE POLICY "Users can view own bets" ON bets 
    FOR ALL USING (auth.uid() = user_id);

-- Função para sincronizar usuário do Supabase Auth com a tabela users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'lastName', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente quando um novo usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários integrada com Supabase Auth';
COMMENT ON TABLE bets IS 'Tabela de apostas dos usuários';
COMMENT ON COLUMN bets.stake IS 'Valor apostado';
COMMENT ON COLUMN bets.payout IS 'Valor retornado';
COMMENT ON COLUMN bets.placed_at IS 'Data e hora quando a aposta foi feita';

-- Verificar se tudo foi criado corretamente
SELECT 'Configuração do banco de dados concluída!' as status;