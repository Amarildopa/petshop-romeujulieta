-- =====================================================
-- SCRIPTS SQL PARA FUNCIONALIDADES ADMINISTRATIVAS
-- Pet Shop Romeo & Julieta - E-commerce
-- =====================================================

-- 1. TABELA DE PRODUTOS (Melhorias para administração)
-- =====================================================

-- Adicionar campos para gestão administrativa de produtos
ALTER TABLE products_pet ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products_pet ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'rejected'));
ALTER TABLE products_pet ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE products_pet ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES auth.users(id);
ALTER TABLE products_pet ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Índices para melhor performance nas consultas administrativas
CREATE INDEX IF NOT EXISTS idx_products_featured ON products_pet(featured);
CREATE INDEX IF NOT EXISTS idx_products_status ON products_pet(status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products_pet(category, status);
CREATE INDEX IF NOT EXISTS idx_products_stock_low ON products_pet(stock) WHERE stock <= 10;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products_pet;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products_pet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. TABELA DE PEDIDOS (Melhorias para administração)
-- =====================================================

-- Adicionar campos para gestão administrativa de pedidos
ALTER TABLE orders_pet ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100);
ALTER TABLE orders_pet ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders_pet ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES auth.users(id);
ALTER TABLE orders_pet ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE orders_pet ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Índices para consultas administrativas
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders_pet(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders_pet(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders_pet(priority);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders_pet(tracking_code) WHERE tracking_code IS NOT NULL;

-- 3. TABELA DE USUÁRIOS ADMINISTRATIVOS
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Trigger para updated_at em admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. TABELA DE CUPONS (Sistema completo)
-- =====================================================
-- Nota: A tabela coupons_pet já existe no database-schema.sql
-- Apenas adicionando índices e triggers adicionais se necessário

-- Índices para coupons_pet
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons_pet(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_validity ON coupons_pet(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_usage ON coupons_pet(usage_limit, used_count);

-- Trigger para updated_at em coupons_pet
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons_pet;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons_pet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. TABELA DE USO DE CUPONS
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons_pet(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para coupon_usage
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_date ON coupon_usage(used_at);

-- 6. TABELA DE NOTIFICAÇÕES ADMINISTRATIVAS
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('order', 'product', 'user', 'review', 'system', 'support')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    recipient_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Índices para admin_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON admin_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON admin_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON admin_notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at);

-- 7. TABELA DE LOGS DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- 8. TABELA DE RELATÓRIOS SALVOS
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    filters JSONB DEFAULT '{}',
    schedule JSONB DEFAULT '{}', -- Para relatórios automáticos
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para saved_reports
CREATE INDEX IF NOT EXISTS idx_reports_type ON saved_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_active ON saved_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_reports_creator ON saved_reports(created_by);

-- Trigger para updated_at em saved_reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON saved_reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON saved_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. VIEWS PARA RELATÓRIOS E DASHBOARD
-- =====================================================

-- View para estatísticas de vendas
CREATE OR REPLACE VIEW sales_statistics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(DISTINCT user_id) as unique_customers
FROM orders_pet 
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- View para produtos com estoque baixo
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    id,
    name,
    category,
    stock,
    price,
    status,
    created_at
FROM products_pet 
WHERE stock <= 10 AND status = 'active'
ORDER BY stock ASC, created_at DESC;

-- View para pedidos pendentes
CREATE OR REPLACE VIEW pending_orders AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    o.priority,
    u.email as customer_email
FROM orders_pet o
JOIN auth.users u ON o.user_id = u.id
WHERE o.status IN ('pending', 'confirmed', 'processing')
ORDER BY 
    CASE o.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    o.created_at ASC;

-- View para top produtos
CREATE OR REPLACE VIEW top_products AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    COUNT(oi.id) as total_sold,
    SUM(oi.quantity * p.price) as total_revenue
FROM products_pet p
JOIN order_items_pet oi ON p.id = oi.product_id
JOIN orders_pet o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.name, p.category, p.price
ORDER BY total_sold DESC, total_revenue DESC;

-- 10. FUNÇÕES PARA RELATÓRIOS
-- =====================================================

-- Função para calcular métricas de dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue NUMERIC,
    total_customers BIGINT,
    average_order_value NUMERIC,
    orders_growth NUMERIC,
    revenue_growth NUMERIC
) AS $$
DECLARE
    prev_start_date DATE := start_date - (end_date - start_date);
    prev_end_date DATE := start_date;
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COUNT(*) as curr_orders,
            COALESCE(SUM(total_amount), 0) as curr_revenue,
            COUNT(DISTINCT user_id) as curr_customers,
            COALESCE(AVG(total_amount), 0) as curr_avg_order
        FROM orders_pet 
        WHERE created_at::DATE BETWEEN start_date AND end_date
        AND status != 'cancelled'
    ),
    previous_period AS (
        SELECT 
            COUNT(*) as prev_orders,
            COALESCE(SUM(total_amount), 0) as prev_revenue
        FROM orders_pet 
        WHERE created_at::DATE BETWEEN prev_start_date AND prev_end_date
        AND status != 'cancelled'
    )
    SELECT 
        cp.curr_orders,
        cp.curr_revenue,
        cp.curr_customers,
        cp.curr_avg_order,
        CASE 
            WHEN pp.prev_orders > 0 THEN 
                ROUND(((cp.curr_orders - pp.prev_orders)::NUMERIC / pp.prev_orders * 100), 2)
            ELSE 0
        END as orders_growth,
        CASE 
            WHEN pp.prev_revenue > 0 THEN 
                ROUND(((cp.curr_revenue - pp.prev_revenue) / pp.prev_revenue * 100), 2)
            ELSE 0
        END as revenue_growth
    FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

-- 11. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_users (apenas super_admin pode gerenciar)
CREATE POLICY "Super admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        )
    );

-- Políticas para coupons_pet (admins podem gerenciar)
CREATE POLICY "Admins can manage coupons" ON coupons_pet
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
        )
    );

-- Políticas para coupon_usage (leitura para admins)
CREATE POLICY "Admins can view coupon usage" ON coupon_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
        )
    );

-- Políticas para admin_notifications
CREATE POLICY "Admins can manage their notifications" ON admin_notifications
    FOR ALL USING (
        recipient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin')
            AND au.is_active = true
        )
    );

-- Políticas para audit_logs (apenas leitura para admins)
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
        )
    );

-- Políticas para saved_reports
CREATE POLICY "Admins can manage reports" ON saved_reports
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin')
            AND au.is_active = true
        )
    );

-- 12. PERMISSÕES PARA ROLES
-- =====================================================

-- Conceder permissões para role anon (usuários não autenticados)
GRANT SELECT ON coupons_pet TO anon;

-- Conceder permissões para role authenticated (usuários autenticados)
GRANT SELECT ON coupons_pet TO authenticated;
GRANT INSERT, UPDATE ON coupon_usage TO authenticated;
GRANT SELECT ON products_pet TO authenticated;
GRANT SELECT ON orders_pet TO authenticated;

-- Conceder permissões completas para administradores (será controlado via RLS)
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON coupons_pet TO authenticated;
GRANT ALL ON coupon_usage TO authenticated;
GRANT ALL ON admin_notifications TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON saved_reports TO authenticated;

-- Permissões para views
GRANT SELECT ON sales_statistics TO authenticated;
GRANT SELECT ON low_stock_products TO authenticated;
GRANT SELECT ON pending_orders TO authenticated;
GRANT SELECT ON top_products TO authenticated;

-- 13. DADOS INICIAIS
-- =====================================================

-- Inserir usuário super admin inicial (ajustar conforme necessário)
-- INSERT INTO admin_users (user_id, name, email, role, is_active) 
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'admin@petshop.com' LIMIT 1),
--     'Administrador Principal',
--     'admin@petshop.com',
--     'super_admin',
--     true
-- ) ON CONFLICT (email) DO NOTHING;

-- Inserir alguns cupons de exemplo
INSERT INTO coupons_pet (code, description, discount_type, discount_value, minimum_amount, usage_limit, valid_from, valid_until, is_active)
VALUES 
    ('WELCOME10', 'Desconto de boas-vindas para novos clientes', 'percentage', 10.00, 50.00, 100, NOW(), NOW() + INTERVAL '30 days', true),
    ('FRETE20', 'Desconto fixo no frete', 'fixed_amount', 20.00, 100.00, 50, NOW(), NOW() + INTERVAL '15 days', true),
    ('MEGA50', 'Super desconto para compras acima de R$ 200', 'percentage', 15.00, 200.00, 20, NOW(), NOW() + INTERVAL '7 days', true)
ON CONFLICT (code) DO NOTHING;

-- Inserir notificações de exemplo
INSERT INTO admin_notifications (type, category, title, message, priority, metadata)
VALUES 
    ('warning', 'product', 'Estoque Baixo', 'Alguns produtos estão com estoque baixo', 'medium', '{"products_count": 5}'),
    ('info', 'system', 'Sistema Atualizado', 'O sistema foi atualizado com sucesso', 'low', '{"version": "1.2.0"}'),
    ('success', 'order', 'Meta de Vendas', 'Meta mensal de vendas foi atingida!', 'high', '{"target": 10000, "achieved": 12500}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DOS SCRIPTS SQL
-- =====================================================

-- Para aplicar estes scripts:
-- 1. Execute cada seção individualmente no Supabase SQL Editor
-- 2. Verifique se não há conflitos com estruturas existentes
-- 3. Ajuste os dados iniciais conforme necessário
-- 4. Teste as permissões com diferentes tipos de usuários

-- Comandos úteis para verificação:
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM information_schema.columns WHERE table_name = 'products_pet';
-- SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public';