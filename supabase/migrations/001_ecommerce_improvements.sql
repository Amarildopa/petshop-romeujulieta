-- Script SQL para melhorias do E-commerce Pet Shop Romeo e Julieta
-- Fase 2: Administração
-- Data: 2024

-- =====================================================
-- 1. MELHORIAS NA TABELA DE PRODUTOS
-- =====================================================

-- Adicionar campos para melhor gestão de produtos
ALTER TABLE products_pet 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100),
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products_pet(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products_pet(featured);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products_pet(stock_quantity);

-- =====================================================
-- 2. TABELA DE CATEGORIAS DE PRODUTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_categories_pet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES product_categories_pet(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categories_active ON product_categories_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON product_categories_pet(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON product_categories_pet(sort_order);

-- =====================================================
-- 3. TABELA DE AVALIAÇÕES DE PRODUTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews_pet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products_pet(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles_pet(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Índices para avaliações
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews_pet(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews_pet(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews_pet(is_approved);

-- =====================================================
-- 4. MELHORIAS NA TABELA DE PEDIDOS
-- =====================================================

-- Adicionar campos para melhor rastreamento
ALTER TABLE orders_pet 
ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Criar índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders_pet(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders_pet(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_date ON orders_pet(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders_pet(tracking_code);

-- =====================================================
-- 5. TABELA DE CUPONS DE DESCONTO
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons_pet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_categories UUID[],
    applicable_products UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons_pet(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons_pet(valid_from, valid_until);

-- =====================================================
-- 6. TABELA DE USO DE CUPONS
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usage_pet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES coupons_pet(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles_pet(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders_pet(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para uso de cupons
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage_pet(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage_pet(order_id);

-- =====================================================
-- 7. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON product_categories_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON product_reviews_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar rating médio dos produtos
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products_pet 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM product_reviews_pet 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND is_approved = true
        ),
        reviews_count = (
            SELECT COUNT(*) 
            FROM product_reviews_pet 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND is_approved = true
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para atualizar rating automaticamente
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews_pet
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- =====================================================
-- 8. DADOS INICIAIS
-- =====================================================

-- Categorias padrão
INSERT INTO product_categories_pet (name, description, slug, sort_order) VALUES
('Ração', 'Rações para cães e gatos de todas as idades', 'racao', 1),
('Brinquedos', 'Brinquedos para entretenimento dos pets', 'brinquedos', 2),
('Higiene', 'Produtos de higiene e limpeza para pets', 'higiene', 3),
('Acessórios', 'Coleiras, guias, camas e outros acessórios', 'acessorios', 4),
('Medicamentos', 'Medicamentos e suplementos veterinários', 'medicamentos', 5)
ON CONFLICT (name) DO NOTHING;

-- Cupom de boas-vindas
INSERT INTO coupons_pet (code, name, description, type, value, minimum_order_amount, usage_limit, valid_until) VALUES
('BEMVINDO10', 'Cupom de Boas-vindas', 'Desconto de 10% para novos clientes', 'percentage', 10.00, 50.00, 100, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 9. PERMISSÕES RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE product_categories_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage_pet ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (leitura pública, escrita admin)
CREATE POLICY "Categorias são visíveis para todos" ON product_categories_pet FOR SELECT USING (true);
CREATE POLICY "Apenas admins podem gerenciar categorias" ON product_categories_pet FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para avaliações
CREATE POLICY "Avaliações aprovadas são visíveis para todos" ON product_reviews_pet FOR SELECT USING (is_approved = true);
CREATE POLICY "Usuários podem criar suas próprias avaliações" ON product_reviews_pet FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar suas próprias avaliações" ON product_reviews_pet FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins podem gerenciar todas as avaliações" ON product_reviews_pet FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para cupons (apenas leitura para usuários autenticados)
CREATE POLICY "Cupons ativos são visíveis para usuários autenticados" ON coupons_pet FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "Apenas admins podem gerenciar cupons" ON coupons_pet FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para uso de cupons
CREATE POLICY "Usuários podem ver seu próprio uso de cupons" ON coupon_usage_pet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode registrar uso de cupons" ON coupon_usage_pet FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins podem ver todos os usos de cupons" ON coupon_usage_pet FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 10. COMENTÁRIOS FINAIS
-- =====================================================

-- Este script adiciona as funcionalidades necessárias para:
-- 1. Gestão completa de produtos com categorias
-- 2. Sistema de avaliações de produtos
-- 3. Sistema de cupons de desconto
-- 4. Melhor rastreamento de pedidos
-- 5. Índices para melhor performance
-- 6. Triggers automáticos para manutenção de dados
-- 7. Políticas de segurança RLS apropriadas

COMMIT