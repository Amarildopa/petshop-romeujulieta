-- Script para corrigir a tabela admin_reports_pet
-- Adiciona a coluna expires_at se ela não existir

-- Primeiro, verifica se a tabela existe
DO $$
BEGIN
    -- Verifica se a coluna expires_at existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_reports_pet' 
        AND column_name = 'expires_at'
    ) THEN
        -- Adiciona a coluna expires_at
        ALTER TABLE admin_reports_pet 
        ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Coluna expires_at adicionada à tabela admin_reports_pet';
    ELSE
        RAISE NOTICE 'Coluna expires_at já existe na tabela admin_reports_pet';
    END IF;
    
    -- Verifica se a tabela existe, se não, cria ela
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'admin_reports_pet'
    ) THEN
        -- Cria a tabela completa
        CREATE TABLE admin_reports_pet (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200) NOT NULL,
            type VARCHAR(50) NOT NULL, -- revenue, users, appointments, products, orders
            parameters JSONB DEFAULT '{}',
            data JSONB DEFAULT '{}',
            generated_by UUID REFERENCES admin_users_pet(id) ON DELETE SET NULL,
            generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Índices
        CREATE INDEX idx_admin_reports_type ON admin_reports_pet(type);
        CREATE INDEX idx_admin_reports_generated_by ON admin_reports_pet(generated_by);
        CREATE INDEX idx_admin_reports_generated_at ON admin_reports_pet(generated_at);
        
        -- RLS
        ALTER TABLE admin_reports_pet ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admins can view reports" ON admin_reports_pet
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admin_users_pet 
                WHERE admin_users_pet.user_id = auth.uid()
            )
        );
        
        RAISE NOTICE 'Tabela admin_reports_pet criada com sucesso';
    END IF;
END $$;