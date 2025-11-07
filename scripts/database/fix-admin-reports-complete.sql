-- Script completo para corrigir/recriar a tabela admin_reports_pet
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos dropar a tabela se ela existir (para garantir estrutura limpa)
DROP TABLE IF EXISTS public.admin_reports_pet CASCADE;

-- 2. Recriar a tabela com a estrutura completa
CREATE TABLE public.admin_reports_pet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- revenue, users, appointments, products, orders
    parameters JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    generated_by UUID REFERENCES public.admin_users_pet(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. Criar índices para performance
CREATE INDEX idx_admin_reports_type ON public.admin_reports_pet(type);
CREATE INDEX idx_admin_reports_generated_by ON public.admin_reports_pet(generated_by);
CREATE INDEX idx_admin_reports_generated_at ON public.admin_reports_pet(generated_at);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.admin_reports_pet ENABLE ROW LEVEL SECURITY;

-- 5. Criar política RLS para permitir acesso apenas aos admins
CREATE POLICY "Only admins can view reports" ON public.admin_reports_pet
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_pet au 
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
        )
    );

-- 6. Comentários para documentação
COMMENT ON TABLE public.admin_reports_pet IS 'Tabela de relatórios administrativos do sistema';
COMMENT ON COLUMN public.admin_reports_pet.id IS 'Identificador único do relatório';
COMMENT ON COLUMN public.admin_reports_pet.name IS 'Nome descritivo do relatório';
COMMENT ON COLUMN public.admin_reports_pet.type IS 'Tipo do relatório: revenue, users, appointments, products, orders';
COMMENT ON COLUMN public.admin_reports_pet.parameters IS 'Parâmetros utilizados para gerar o relatório (JSON)';
COMMENT ON COLUMN public.admin_reports_pet.data IS 'Dados do relatório gerado (JSON)';
COMMENT ON COLUMN public.admin_reports_pet.generated_by IS 'ID do administrador que gerou o relatório';
COMMENT ON COLUMN public.admin_reports_pet.generated_at IS 'Data e hora de geração do relatório';
COMMENT ON COLUMN public.admin_reports_pet.expires_at IS 'Data e hora de expiração do relatório';

-- 7. Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_reports_pet' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Verificar se as políticas RLS foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_reports_pet';

-- Mensagem de sucesso
SELECT '✅ Tabela admin_reports_pet recriada com sucesso!' as status;