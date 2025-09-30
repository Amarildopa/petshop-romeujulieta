-- Script SQL para dados iniciais
-- E-commerce Pet Shop Romeo e Julieta
-- Fase 2: Administração - Dados Iniciais
-- Data: 2024

-- =====================================================
-- DADOS INICIAIS PARA CATEGORIAS
-- =====================================================

-- Inserir categorias principais (se não existirem)
INSERT INTO product_categories_pet (name, description, slug, is_active, sort_order)
VALUES 
    ('Ração', 'Rações e alimentos para pets', 'racao', true, 1),
    ('Brinquedos', 'Brinquedos e entretenimento', 'brinquedos', true, 2),
    ('Higiene', 'Produtos de higiene e limpeza', 'higiene', true, 3),
    ('Acessórios', 'Coleiras, guias e acessórios', 'acessorios', true, 4),
    ('Medicamentos', 'Medicamentos e suplementos', 'medicamentos', true, 5),
    ('Camas e Casinhas', 'Camas, casinhas e conforto', 'camas-casinhas', true, 6),
    ('Petiscos', 'Petiscos e snacks', 'petiscos', true, 7),
    ('Aquarismo', 'Produtos para aquários', 'aquarismo', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DADOS INICIAIS PARA CUPONS
-- =====================================================

-- Inserir cupons promocionais
INSERT INTO coupons_pet (code, name, description, type, value, minimum_order_amount, usage_limit, valid_from, valid_until, is_active)
VALUES 
    ('BEMVINDO10', 'Cupom de Boas-vindas', 'Desconto de 10% para novos clientes', 'percentage', 10.00, 50.00, 100, NOW(), NOW() + INTERVAL '30 days', true),
    ('FRETEGRATIS', 'Frete Grátis', 'Frete grátis para compras acima de R$ 100', 'free_shipping', 0.00, 100.00, NULL, NOW(), NOW() + INTERVAL '60 days', true),
    ('PRIMEIRACOMPRA', 'Primeira Compra', 'R$ 15 de desconto na primeira compra', 'fixed', 15.00, 80.00, 50, NOW(), NOW() + INTERVAL '45 days', true),
    ('BLACKFRIDAY', 'Black Friday', '25% de desconto - Black Friday', 'percentage', 25.00, 100.00, 200, NOW(), NOW() + INTERVAL '7 days', false)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ATUALIZAR PRODUTOS EXISTENTES COM NOVAS COLUNAS
-- =====================================================

-- Atualizar produtos existentes com dados padrão
UPDATE products_pet 
SET 
    sku = CONCAT('PET-', LPAD(id::text, 6, '0')),
    stock_quantity = CASE 
        WHEN stock_quantity IS NULL THEN 10
        ELSE stock_quantity
    END,
    min_stock_level = 5,
    is_active = COALESCE(is_active, true),
    featured = false,
    weight = 0.5,
    dimensions = '10x10x10'
WHERE sku IS NULL OR stock_quantity IS NULL;

-- Associar produtos às categorias (exemplo)
UPDATE products_pet 
SET category_id = (
    SELECT id FROM product_categories_pet 
    WHERE slug = 'racao' 
    LIMIT 1
)
WHERE category ILIKE '%ração%' OR name ILIKE '%ração%';

UPDATE products_pet 
SET category_id = (
    SELECT id FROM product_categories_pet 
    WHERE slug = 'brinquedos' 
    LIMIT 1
)
WHERE category ILIKE '%brinquedo%' OR name ILIKE '%brinquedo%';

UPDATE products_pet 
SET category_id = (
    SELECT id FROM product_categories_pet 
    WHERE slug = 'higiene' 
    LIMIT 1
)
WHERE category ILIKE '%higiene%' OR name ILIKE '%shampoo%' OR name ILIKE '%sabonete%';

UPDATE products_pet 
SET category_id = (
    SELECT id FROM product_categories_pet 
    WHERE slug = 'acessorios' 
    LIMIT 1
)
WHERE category ILIKE '%acessório%' OR name ILIKE '%coleira%' OR name ILIKE '%guia%';

-- =====================================================
-- CONFIGURAÇÕES ADICIONAIS
-- =====================================================

-- Criar sequência para números de pedidos se não existir
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Atualizar pedidos existentes com números sequenciais
UPDATE orders_pet 
SET order_number = CONCAT('PET-', LPAD(nextval('order_number_seq')::text, 6, '0'))
WHERE order_number IS NULL;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices para busca de produtos
CREATE INDEX IF NOT EXISTS idx_products_search ON products_pet USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products_pet (price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products_pet (featured, created_at DESC) WHERE is_active = true;

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders_pet (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders_pet (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders_pet (payment_status, created_at DESC);

-- Índices para avaliações
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON product_reviews_pet (product_id, is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews_pet (user_id, created_at DESC);

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View para produtos com informações completas
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
    p.*,
    pc.name as category_name,
    pc.slug as category_slug,
    COALESCE(p.rating, 0) as product_rating,
    COALESCE(p.reviews_count, 0) as total_reviews
FROM products_pet p
LEFT JOIN product_categories_pet pc ON p.category_id = pc.id;

-- View para estatísticas de vendas
CREATE OR REPLACE VIEW sales_stats AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(*) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as avg_order_value,
    COUNT(DISTINCT o.user_id) as unique_customers
FROM orders_pet o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- View para produtos mais vendidos
CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.price) as total_revenue,
    COUNT(DISTINCT oi.order_id) as orders_count
FROM products_pet p
JOIN order_items_pet oi ON p.id = oi.product_id
JOIN orders_pet o ON oi.order_id = o.id
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY p.id, p.name, p.price, p.image_url
ORDER BY total_sold DESC;

COMMIT;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este script completa a configuração inicial do banco de dados
-- com dados essenciais para o funcionamento do e-commerce.
-- 
-- Próximos passos:
-- 1. Executar os 3 scripts na ordem (001, 002, 003)
-- 2. Verificar se todas as tabelas foram criadas
-- 3. Testar as permissões com usuários anônimos e autenticados
-- 4. Popular com dados reais de produtos