-- Script SQL para configuração de permissões
-- E-commerce Pet Shop Romeo e Julieta
-- Fase 2: Administração - Permissões
-- Data: 2024

-- =====================================================
-- PERMISSÕES PARA TABELAS EXISTENTES
-- =====================================================

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- =====================================================
-- PERMISSÕES PARA PRODUTOS
-- =====================================================

-- Conceder permissões básicas para produtos
GRANT SELECT ON products_pet TO anon;
GRANT ALL PRIVILEGES ON products_pet TO authenticated;

-- =====================================================
-- PERMISSÕES PARA PEDIDOS
-- =====================================================

-- Conceder permissões para pedidos
GRANT SELECT, INSERT, UPDATE ON orders_pet TO authenticated;
GRANT SELECT, INSERT, UPDATE ON order_items_pet TO authenticated;

-- =====================================================
-- PERMISSÕES PARA NOVAS TABELAS
-- =====================================================

-- Categorias de produtos
GRANT SELECT ON product_categories_pet TO anon;
GRANT ALL PRIVILEGES ON product_categories_pet TO authenticated;

-- Avaliações de produtos
GRANT SELECT ON product_reviews_pet TO anon;
GRANT ALL PRIVILEGES ON product_reviews_pet TO authenticated;

-- Cupons
GRANT SELECT ON coupons_pet TO authenticated;
GRANT ALL PRIVILEGES ON coupons_pet TO authenticated;

-- Uso de cupons
GRANT SELECT, INSERT ON coupon_usage_pet TO authenticated;
GRANT ALL PRIVILEGES ON coupon_usage_pet TO authenticated;

-- =====================================================
-- PERMISSÕES PARA PERFIS E USUÁRIOS
-- =====================================================

-- Conceder permissões para perfis
GRANT SELECT, UPDATE ON profiles_pet TO authenticated;

-- =====================================================
-- PERMISSÕES PARA OUTRAS TABELAS IMPORTANTES
-- =====================================================

-- Carrinho de compras
GRANT ALL PRIVILEGES ON cart_items_pet TO authenticated;

-- Endereços
GRANT ALL PRIVILEGES ON addresses_pet TO authenticated;

-- Pets
GRANT ALL PRIVILEGES ON pets_pet TO authenticated;

-- Agendamentos
GRANT ALL PRIVILEGES ON appointments_pet TO authenticated;

-- =====================================================
-- VERIFICAÇÃO FINAL DAS PERMISSÕES
-- =====================================================

-- Verificar todas as permissões após a configuração
SELECT 
    grantee,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated')
AND table_name LIKE '%_pet'
GROUP BY grantee, table