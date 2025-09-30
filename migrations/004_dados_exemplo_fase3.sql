-- =====================================================
-- DADOS DE EXEMPLO PARA FASE 3
-- PetShop Romeo & Julieta E-commerce
-- =====================================================

-- =====================================================
-- 1. ATUALIZAR PRODUTOS EXISTENTES COM NOVOS CAMPOS
-- =====================================================

-- Atualizar produtos com marcas
UPDATE products SET 
    brand = 'Royal Canin',
    launch_date = '2024-01-15',
    discount_percentage = 15.00,
    original_price = price * 1.18
WHERE name ILIKE '%royal canin%';

UPDATE products SET 
    brand = 'Pedigree',
    launch_date = '2024-02-01',
    discount_percentage = 10.00,
    original_price = price * 1.11
WHERE name ILIKE '%pedigree%';

UPDATE products SET 
    brand = 'Whiskas',
    launch_date = '2024-01-20',
    discount_percentage = 20.00,
    original_price = price * 1.25
WHERE name ILIKE '%whiskas%';

UPDATE products SET 
    brand = 'Hills',
    launch_date = '2024-03-01',
    discount_percentage = 0.00,
    original_price = price
WHERE name ILIKE '%hills%';

UPDATE products SET 
    brand = 'Purina',
    launch_date = '2024-02-15',
    discount_percentage = 12.00,
    original_price = price * 1.14
WHERE name ILIKE '%purina%';

-- Produtos sem marca específica
UPDATE products SET 
    brand = 'PetShop Romeo & Julieta',
    launch_date = '2024-01-01',
    discount_percentage = 5.00,
    original_price = price * 1.05
WHERE brand IS NULL;

-- =====================================================
-- 2. ASSOCIAR TAGS AOS PRODUTOS
-- =====================================================

-- Produtos novos (lançados nos últimos 3 meses)
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Novo'
  AND p.launch_date >= CURRENT_DATE - INTERVAL '3 months'
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- Produtos em promoção
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Promoção'
  AND p.discount_percentage > 0
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- Produtos premium (preço acima de R$ 100)
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Premium'
  AND p.price > 100
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- Produtos orgânicos (baseado no nome/descrição)
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Orgânico'
  AND (p.name ILIKE '%orgânico%' OR p.description ILIKE '%orgânico%' OR p.description ILIKE '%natural%')
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- Produtos importados (marcas internacionais)
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Importado'
  AND p.brand IN ('Royal Canin', 'Hills', 'Whiskas', 'Pedigree')
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- Produtos nacionais
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Nacional'
  AND p.brand NOT IN ('Royal Canin', 'Hills', 'Whiskas', 'Pedigree')
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- =====================================================
-- 3. DADOS DE EXEMPLO PARA AVALIAÇÕES
-- =====================================================

-- Nota: Estas inserções assumem que existem usuários na tabela auth.users
-- Em um ambiente real, você substituiria pelos IDs reais dos usuários

-- Função para gerar avaliações de exemplo
DO $$
DECLARE
    product_record RECORD;
    user_ids UUID[] := ARRAY[
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000003'::UUID,
        '00000000-0000-0000-0000-000000000004'::UUID,
        '00000000-0000-0000-0000-000000000005'::UUID
    ];
    random_user_id UUID;
    random_rating INTEGER;
BEGIN
    -- Para cada produto, criar algumas avaliações de exemplo
    FOR product_record IN SELECT id FROM products LIMIT 10 LOOP
        -- Criar 2-5 avaliações por produto
        FOR i IN 1..(2 + floor(random() * 4)::INTEGER) LOOP
            random_user_id := user_ids[1 + floor(random() * array_length(user_ids, 1))::INTEGER];
            random_rating := 3 + floor(random() * 3)::INTEGER; -- Rating entre 3-5
            
            INSERT INTO reviews (product_id, user_id, rating, title, comment, verified_purchase)
            VALUES (
                product_record.id,
                random_user_id,
                random_rating,
                CASE random_rating
                    WHEN 5 THEN 'Excelente produto!'
                    WHEN 4 THEN 'Muito bom'
                    ELSE 'Produto satisfatório'
                END,
                CASE random_rating
                    WHEN 5 THEN 'Produto de excelente qualidade, meu pet adorou! Recomendo muito.'
                    WHEN 4 THEN 'Bom produto, atendeu às expectativas. Entrega rápida.'
                    ELSE 'Produto ok, dentro do esperado para o preço.'
                END,
                random() > 0.3 -- 70% chance de ser compra verificada
            )
            ON CONFLICT (product_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 4. DADOS DE EXEMPLO PARA WISHLIST
-- =====================================================

-- Adicionar alguns produtos à wishlist dos usuários de exemplo
DO $$
DECLARE
    product_record RECORD;
    user_ids UUID[] := ARRAY[
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000003'::UUID,
        '00000000-0000-0000-0000-000000000004'::UUID,
        '00000000-0000-0000-0000-000000000005'::UUID
    ];
    random_user_id UUID;
BEGIN
    -- Para cada produto, adicionar à wishlist de alguns usuários
    FOR product_record IN SELECT id FROM products LIMIT 15 LOOP
        -- Cada produto tem 20-60% chance de estar na wishlist de cada usuário
        FOR i IN 1..array_length(user_ids, 1) LOOP
            IF random() > 0.4 THEN -- 60% chance
                INSERT INTO wishlist (user_id, product_id)
                VALUES (user_ids[i], product_record.id)
                ON CONFLICT (user_id, product_id) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 5. DADOS DE EXEMPLO PARA NOTIFICAÇÕES
-- =====================================================

-- Notificações de exemplo para os usuários
INSERT INTO notifications (user_id, type, title, message, data, read) VALUES
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'order_confirmed',
    'Pedido Confirmado',
    'Seu pedido #12345 foi confirmado e está sendo preparado.',
    '{"orderId": "12345", "total": 89.90}',
    false
),
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'promotion',
    'Oferta Especial!',
    'Desconto de 20% em toda linha de rações premium. Válido até amanhã!',
    '{"discount": 20, "category": "rações"}',
    false
),
(
    '00000000-0000-0000-0000-000000000002'::UUID,
    'stock_available',
    'Produto Disponível',
    'O produto "Ração Royal Canin" que você estava esperando voltou ao estoque!',
    '{"productId": "produto-id-exemplo", "productName": "Ração Royal Canin"}',
    true
),
(
    '00000000-0000-0000-0000-000000000003'::UUID,
    'order_shipped',
    'Pedido Enviado',
    'Seu pedido #12346 foi enviado. Código de rastreamento: BR123456789',
    '{"orderId": "12346", "trackingCode": "BR123456789"}',
    false
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. ATUALIZAR ESTATÍSTICAS DOS PRODUTOS
-- =====================================================

-- Forçar atualização das estatísticas (os triggers já fazem isso automaticamente)
-- mas vamos garantir que esteja tudo correto

-- Atualizar contadores de reviews e ratings
UPDATE products 
SET 
    average_rating = (
        SELECT COALESCE(AVG(rating::DECIMAL), 0)
        FROM reviews 
        WHERE product_id = products.id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM reviews 
        WHERE product_id = products.id
    );

-- Atualizar contadores de wishlist
UPDATE products 
SET wishlist_count = (
    SELECT COUNT(*)
    FROM wishlist 
    WHERE product_id = products.id
);

-- =====================================================
-- 7. CRIAR ALGUNS PRODUTOS "MAIS VENDIDOS"
-- =====================================================

-- Marcar alguns produtos como mais vendidos baseado em critérios
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT 
    p.id,
    t.id
FROM products p
CROSS JOIN product_tags t
WHERE t.name = 'Mais Vendido'
  AND (
    p.review_count >= 3 OR 
    p.wishlist_count >= 2 OR 
    p.average_rating >= 4.5
  )
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- =====================================================
-- 8. VERIFICAÇÕES E RELATÓRIOS
-- =====================================================

-- Verificar estatísticas gerais
SELECT 
    'Produtos' as tabela,
    COUNT(*) as total
FROM products
UNION ALL
SELECT 
    'Reviews' as tabela,
    COUNT(*) as total
FROM reviews
UNION ALL
SELECT 
    'Wishlist Items' as tabela,
    COUNT(*) as total
FROM wishlist
UNION ALL
SELECT 
    'Tags' as tabela,
    COUNT(*) as total
FROM product_tags
UNION ALL
SELECT 
    'Notificações' as tabela,
    COUNT(*) as total
FROM notifications;

-- Produtos mais bem avaliados
SELECT 
    name,
    brand,
    average_rating,
    review_count,
    wishlist_count,
    price
FROM products 
WHERE review_count > 0
ORDER BY average_rating DESC, review_count DESC
LIMIT 5;

-- Produtos mais desejados
SELECT 
    name,
    brand,
    wishlist_count,
    average_rating,
    price
FROM products 
WHERE wishlist_count > 0
ORDER BY wishlist_count DESC
LIMIT 5;

-- =====================================================
-- FIM DOS DADOS DE EXEMPLO
-- =====================================================