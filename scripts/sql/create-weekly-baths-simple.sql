-- Script para criar a tabela weekly_baths no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela weekly_baths
CREATE TABLE IF NOT EXISTS public.weekly_baths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    pet_name TEXT NOT NULL,
    pet_id UUID,
    image_url TEXT NOT NULL,
    bath_date DATE NOT NULL,
    approved BOOLEAN DEFAULT false NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    week_start DATE NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    curator_notes TEXT
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_weekly_baths_week_start ON public.weekly_baths(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_baths_approved ON public.weekly_baths(approved);
CREATE INDEX IF NOT EXISTS idx_weekly_baths_display_order ON public.weekly_baths(display_order);
CREATE INDEX IF NOT EXISTS idx_weekly_baths_bath_date ON public.weekly_baths(bath_date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.weekly_baths ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (apenas registros aprovados)
CREATE POLICY "weekly_baths_select_approved" ON public.weekly_baths
    FOR SELECT USING (approved = true);

-- Política para inserção por usuários autenticados
CREATE POLICY "weekly_baths_insert_authenticated" ON public.weekly_baths
    FOR INSERT TO authenticated WITH CHECK (true);

-- Política para atualização por administradores
CREATE POLICY "weekly_baths_update_admin" ON public.weekly_baths
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Política para exclusão por administradores
CREATE POLICY "weekly_baths_delete_admin" ON public.weekly_baths
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Inserir alguns dados de exemplo para testar
INSERT INTO public.weekly_baths (
    pet_name, 
    image_url, 
    bath_date, 
    approved, 
    week_start, 
    display_order
) VALUES 
    ('Luna', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop', CURRENT_DATE - INTERVAL '2 days', true, DATE_TRUNC('week', CURRENT_DATE - INTERVAL '2 days')::date, 1),
    ('Max', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop', CURRENT_DATE - INTERVAL '1 day', true, DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 day')::date, 2),
    ('Bella', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', CURRENT_DATE, true, DATE_TRUNC('week', CURRENT_DATE)::date, 3),
    ('Charlie', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop', CURRENT_DATE + INTERVAL '1 day', true, DATE_TRUNC('week', CURRENT_DATE)::date, 4),
    ('Milo', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop', CURRENT_DATE + INTERVAL '2 days', true, DATE_TRUNC('week', CURRENT_DATE)::date, 5)
ON CONFLICT DO NOTHING;

-- Comentário final
-- Tabela weekly_baths criada com sucesso!
-- Execute este script no SQL Editor do seu projeto Supabase para resolver o erro do carrossel.