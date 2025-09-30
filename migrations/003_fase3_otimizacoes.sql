-- =====================================================
-- FASE 3: OTIMIZAÇÕES - SCRIPTS SQL
-- PetShop Romeo & Julieta E-commerce
-- =====================================================

-- =====================================================
-- 1. TABELA DE AVALIAÇÕES (REVIEWS)
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id) -- Um usuário pode avaliar um produto apenas uma vez
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_helpful_count ON reviews(helpful_count DESC);

-- =====================================================
-- 2. TABELA DE LISTA DE DESEJOS (WISHLIST)
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- Um produto pode estar na wishlist de um usuário apenas uma vez
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist(created_at DESC);

-- =====================================================
-- 3. TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'order_confirmed', 'order_shipped', 'order_delivered', 'promotion', 'stock_available'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Dados adicionais específicos do tipo de notificação
    read BOOLEAN DEFAULT FALSE,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 4. TABELA DE TAGS DE PRODUTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hexadecimal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento produto-tags (muitos para muitos)
CREATE TABLE IF NOT EXISTS product_tag_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, tag_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_product_id ON product_tag_relations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_tag_id ON product_tag_relations(tag_id);

-- =====================================================
-- 5. ATUALIZAR TABELA DE PRODUTOS (NOVAS COLUNAS)
-- =====================================================

-- Adicionar colunas para filtros avançados
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS launch_date DATE,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wishlist_count INTEGER DEFAULT 0;

-- Índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_launch_date ON products(launch_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_discount_percentage ON products(discount_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON products(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_review_count ON products(review_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_wishlist_count ON products(wishlist_count DESC);

-- =====================================================
-- 6. FUNÇÕES E TRIGGERS PARA MANTER ESTATÍSTICAS
-- =====================================================

-- Função para atualizar estatísticas de avaliação do produto
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas do produto
    UPDATE products 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0)
            FROM reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar estatísticas de reviews
DROP TRIGGER IF EXISTS trigger_update_product_review_stats_insert ON reviews;
CREATE TRIGGER trigger_update_product_review_stats_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();

DROP TRIGGER IF EXISTS trigger_update_product_review_stats_update ON reviews;
CREATE TRIGGER trigger_update_product_review_stats_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();

DROP TRIGGER IF EXISTS trigger_update_product_review_stats_delete ON reviews;
CREATE TRIGGER trigger_update_product_review_stats_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();

-- Função para atualizar contador de wishlist
CREATE OR REPLACE FUNCTION update_product_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de wishlist do produto
    UPDATE products 
    SET wishlist_count = (
        SELECT COUNT(*)
        FROM wishlist 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar contador de wishlist
DROP TRIGGER IF EXISTS trigger_update_product_wishlist_count_insert ON wishlist;
CREATE TRIGGER trigger_update_product_wishlist_count_insert
    AFTER INSERT ON wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_product_wishlist_count();

DROP TRIGGER IF EXISTS trigger_update_product_wishlist_count_delete ON wishlist;
CREATE TRIGGER trigger_update_product_wishlist_count_delete
    AFTER DELETE ON wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_product_wishlist_count();

-- =====================================================
-- 7. VIEWS PARA CONSULTAS OTIMIZADAS
-- =====================================================

-- View para produtos com estatísticas completas
CREATE OR REPLACE VIEW products_with_stats AS
SELECT 
    p.*,
    COALESCE(p.average_rating, 0) as avg_rating,
    COALESCE(p.review_count, 0) as total_reviews,
    COALESCE(p.wishlist_count, 0) as total_wishlist,
    CASE 
        WHEN p.discount_percentage > 0 AND p.original_price > 0 
        THEN p.original_price - (p.original_price * p.discount_percentage / 100)
        ELSE p.price 
    END as final_price,
    CASE 
        WHEN p.stock_quantity > 0 THEN 'available'
        ELSE 'out_of_stock'
    END as availability_status
FROM products p;

-- View para produtos mais desejados
CREATE OR REPLACE VIEW most_wished_products AS
SELECT 
    p.*,
    p.wishlist_count
FROM products_with_stats p
WHERE p.wishlist_count > 0
ORDER BY p.wishlist_count DESC, p.created_at DESC;

-- View para produtos mais bem avaliados
CREATE OR REPLACE VIEW top_rated_products AS
SELECT 
    p.*,
    p.avg_rating,
    p.total_reviews
FROM products_with_stats p
WHERE p.total_reviews >= 3 AND p.avg_rating >= 4.0
ORDER BY p.avg_rating DESC, p.total_reviews DESC;

-- =====================================================
-- 8. DADOS INICIAIS PARA TAGS
-- =====================================================

INSERT INTO product_tags (name, color) VALUES
('Novo', '#10B981'),
('Promoção', '#EF4444'),
('Mais Vendido', '#F59E0B'),
('Premium', '#8B5CF6'),
('Orgânico', '#059669'),
('Importado', '#3B82F6'),
('Nacional', '#6B7280'),
('Vegano', '#84CC16'),
('Sem Glúten', '#F97316'),
('Hipoalergênico', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 9. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_relations ENABLE ROW LEVEL SECURITY;

-- Políticas para reviews
CREATE POLICY "Reviews são públicas para leitura" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar suas próprias reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para wishlist
CREATE POLICY "Usuários podem ver apenas sua própria wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar sua própria wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para notifications
CREATE POLICY "Usuários podem ver apenas suas próprias notificações" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notificações" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para tags (públicas para leitura)
CREATE POLICY "Tags são públicas para leitura" ON product_tags
    FOR SELECT USING (true);

CREATE POLICY "Relações de tags são públicas para leitura" ON product_tag_relations
    FOR SELECT USING (true);

-- =====================================================
-- 10. PERMISSÕES PARA ROLES
-- =====================================================

-- Conceder permissões para role anon (usuários não autenticados)
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON product_tags TO anon;
GRANT SELECT ON product_tag_relations TO anon;
GRANT SELECT ON products_with_stats TO anon;
GRANT SELECT ON most_wished_products TO anon;
GRANT SELECT ON top_rated_products TO anon;

-- Conceder permissões para role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON reviews TO authenticated;
GRANT ALL PRIVILEGES ON wishlist TO authenticated;
GRANT ALL PRIVILEGES ON notifications TO authenticated;
GRANT SELECT ON product_tags TO authenticated;
GRANT SELECT ON product_tag_relations TO authenticated;
GRANT SELECT ON products_with_stats TO authenticated;
GRANT SELECT ON most_wished_products TO authenticated;
GRANT SELECT ON top_rated_products TO authenticated;

-- =====================================================
-- 11. ÍNDICES COMPOSTOS PARA CONSULTAS COMPLEXAS
-- =====================================================

-- Índice para busca de produtos com filtros múltiplos
CREATE INDEX IF NOT EXISTS idx_products_complex_search 
ON products(category_id, price, average_rating, stock_quantity, created_at DESC);

-- Índice para produtos em promoção
CREATE INDEX IF NOT EXISTS idx_products_promotion 
ON products(discount_percentage, original_price) 
WHERE discount_percentage > 0;

-- Índice para produtos disponíveis
CREATE INDEX IF NOT EXISTS idx_products_available 
ON products(stock_quantity, price) 
WHERE stock_quantity > 0;

-- =====================================================
-- 12. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE reviews IS 'Tabela de avaliações e comentários dos produtos';
COMMENT ON TABLE wishlist IS 'Lista de desejos dos usuários';
COMMENT ON TABLE notifications IS 'Sistema de notificações push';
COMMENT ON TABLE product_tags IS 'Tags/etiquetas para categorização adicional de produtos';
COMMENT ON TABLE product_tag_relations IS 'Relacionamento muitos-para-muitos entre produtos e tags';

COMMENT ON COLUMN products.average_rating IS 'Média das avaliações do produto (calculada automaticamente)';
COMMENT ON COLUMN products.review_count IS 'Número total de avaliações do produto';
COMMENT ON COLUMN products.wishlist_count IS 'Número de usuários que adicionaram o produto à wishlist';
COMMENT ON COLUMN products.discount_percentage IS 'Percentual de desconto aplicado ao produto';
COMMENT ON COLUMN products.original_price IS 'Preço original antes do desconto';

-- =====================================================
-- FIM DOS SCRIPTS DA FASE 3
-- =====================================================