-- =============================================
-- SCRIPT DE VALIDAÇÃO DO BANCO DE DADOS
-- PetShop Romeo & Julieta
-- =============================================

-- Este script valida se todas as tabelas, índices e triggers
-- foram criados corretamente com o sufixo "_pet"

-- =============================================
-- 1. VALIDAÇÃO DE TABELAS
-- =============================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'profiles_pet',
        'pets_pet',
        'services_pet',
        'appointments_pet',
        'products_pet',
        'subscriptions_pet',
        'service_progress_pet',
        'notifications_pet',
        'available_slots_pet',
        'care_extras_pet',
        'service_history_pet',
        'notification_settings_pet',
        'cart_items_pet',
        'orders_pet',
        'order_items_pet',
        'coupons_pet',
        'coupon_usage_pet',
        'product_reviews_pet',
        'wishlist_pet',
        'product_categories_pet',
        'product_category_relations_pet',
        'inventory_pet',
        'stock_movements_pet',
        'subscription_plans_pet',
        'user_subscriptions_pet',
        'payment_history_pet',
        'saved_payment_methods_pet',
        'cashback_transactions_pet',
        'promotions_pet',
        'promotion_usage_pet',
        'payment_settings_pet',
        'chat_messages_pet',
        'chat_rooms_pet',
        'chat_room_participants_pet',
        'notification_templates_pet',
        'marketing_campaigns_pet',
        'campaign_recipients_pet',
        'feedback_pet',
        'faq_pet',
        'help_articles_pet',
        'communication_settings_pet',
        'communication_logs_pet',
        'admin_users_pet',
        'admin_logs_pet',
        'system_settings_pet',
        'admin_reports_pet',
        'admin_notifications_pet',
        'support_tickets_pet',
        'support_messages_pet'
    ];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VALIDAÇÃO DE TABELAS COM SUFIXO "_pet"';
    RAISE NOTICE '=============================================';
    
    -- Contar tabelas com sufixo _pet
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%_pet';
    
    RAISE NOTICE 'Total de tabelas encontradas: %', table_count;
    
    -- Verificar cada tabela esperada
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    -- Relatório de tabelas faltantes
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ TABELAS FALTANTES:';
        FOREACH table_name IN ARRAY missing_tables
        LOOP
            RAISE NOTICE '   - %', table_name;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ TODAS AS TABELAS ESTÃO PRESENTES';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- =============================================
-- 2. VALIDAÇÃO DE ÍNDICES
-- =============================================

DO $$
DECLARE
    index_count INTEGER;
    expected_indexes TEXT[] := ARRAY[
        'idx_pets_pet_owner_id',
        'idx_appointments_pet_user_id',
        'idx_appointments_pet_pet_id',
        'idx_appointments_pet_date',
        'idx_products_pet_category',
        'idx_subscriptions_pet_user_id',
        'idx_notifications_pet_user_id',
        'idx_available_slots_pet_service_date',
        'idx_care_extras_pet_category',
        'idx_service_history_pet_appointment',
        'idx_cart_items_pet_user',
        'idx_orders_pet_user',
        'idx_orders_pet_status',
        'idx_coupons_pet_code',
        'idx_product_reviews_pet_product',
        'idx_wishlist_pet_user',
        'idx_subscription_plans_pet_active',
        'idx_user_subscriptions_pet_user',
        'idx_payment_history_pet_user',
        'idx_chat_messages_pet_room',
        'idx_chat_rooms_pet_type',
        'idx_admin_users_pet_user_id',
        'idx_admin_logs_pet_admin_id',
        'idx_system_settings_pet_key',
        'idx_support_tickets_pet_user_id'
    ];
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
    index_name TEXT;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VALIDAÇÃO DE ÍNDICES';
    RAISE NOTICE '=============================================';
    
    -- Contar índices com sufixo _pet
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE '%_pet%';
    
    RAISE NOTICE 'Total de índices encontrados: %', index_count;
    
    -- Verificar índices críticos
    FOREACH index_name IN ARRAY expected_indexes
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public'
            AND indexname = index_name
        ) THEN
            missing_indexes := array_append(missing_indexes, index_name);
        END IF;
    END LOOP;
    
    -- Relatório de índices faltantes
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE NOTICE '❌ ÍNDICES FALTANTES:';
        FOREACH index_name IN ARRAY missing_indexes
        LOOP
            RAISE NOTICE '   - %', index_name;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ TODOS OS ÍNDICES CRÍTICOS ESTÃO PRESENTES';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- =============================================
-- 3. VALIDAÇÃO DE TRIGGERS
-- =============================================

DO $$
DECLARE
    trigger_count INTEGER;
    expected_triggers TEXT[] := ARRAY[
        'update_profiles_pet_updated_at',
        'update_pets_pet_updated_at',
        'update_services_pet_updated_at',
        'update_appointments_pet_updated_at',
        'update_products_pet_updated_at',
        'update_subscriptions_pet_updated_at',
        'trigger_update_available_slots_pet_updated_at',
        'trigger_update_care_extras_pet_updated_at',
        'trigger_update_service_history_pet_updated_at',
        'trigger_update_notifications_pet_updated_at',
        'trigger_update_cart_items_pet_updated_at',
        'trigger_update_orders_pet_updated_at',
        'trigger_update_subscription_plans_pet_updated_at',
        'trigger_update_user_subscriptions_pet_updated_at',
        'trigger_update_chat_messages_pet_updated_at',
        'trigger_update_admin_users_pet_updated_at',
        'trigger_update_system_settings_pet_updated_at',
        'trigger_update_support_tickets_pet_updated_at'
    ];
    missing_triggers TEXT[] := ARRAY[]::TEXT[];
    trigger_name TEXT;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VALIDAÇÃO DE TRIGGERS';
    RAISE NOTICE '=============================================';
    
    -- Contar triggers com sufixo _pet
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%_pet%';
    
    RAISE NOTICE 'Total de triggers encontrados: %', trigger_count;
    
    -- Verificar triggers críticos
    FOREACH trigger_name IN ARRAY expected_triggers
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            AND trigger_name = trigger_name
        ) THEN
            missing_triggers := array_append(missing_triggers, trigger_name);
        END IF;
    END LOOP;
    
    -- Relatório de triggers faltantes
    IF array_length(missing_triggers, 1) > 0 THEN
        RAISE NOTICE '❌ TRIGGERS FALTANTES:';
        FOREACH trigger_name IN ARRAY missing_triggers
        LOOP
            RAISE NOTICE '   - %', trigger_name;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ TODOS OS TRIGGERS CRÍTICOS ESTÃO PRESENTES';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- =============================================
-- 4. VALIDAÇÃO DE RLS (ROW LEVEL SECURITY)
-- =============================================

DO $$
DECLARE
    rls_count INTEGER;
    expected_rls_tables TEXT[] := ARRAY[
        'profiles_pet',
        'pets_pet',
        'appointments_pet',
        'orders_pet',
        'admin_users_pet',
        'admin_logs_pet',
        'system_settings_pet',
        'support_tickets_pet'
    ];
    missing_rls_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VALIDAÇÃO DE ROW LEVEL SECURITY';
    RAISE NOTICE '=============================================';
    
    -- Contar tabelas com RLS habilitado
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname LIKE '%_pet'
    AND c.relrowsecurity = true;
    
    RAISE NOTICE 'Total de tabelas com RLS habilitado: %', rls_count;
    
    -- Verificar RLS em tabelas críticas
    FOREACH table_name IN ARRAY expected_rls_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relname = table_name
            AND c.relrowsecurity = true
        ) THEN
            missing_rls_tables := array_append(missing_rls_tables, table_name);
        END IF;
    END LOOP;
    
    -- Relatório de RLS faltante
    IF array_length(missing_rls_tables, 1) > 0 THEN
        RAISE NOTICE '❌ TABELAS SEM RLS HABILITADO:';
        FOREACH table_name IN ARRAY missing_rls_tables
        LOOP
            RAISE NOTICE '   - %', table_name;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ TODAS AS TABELAS CRÍTICAS TÊM RLS HABILITADO';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- =============================================
-- 5. VALIDAÇÃO DE DADOS INICIAIS
-- =============================================

DO $$
DECLARE
    settings_count INTEGER;
    faq_count INTEGER;
    templates_count INTEGER;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VALIDAÇÃO DE DADOS INICIAIS';
    RAISE NOTICE '=============================================';
    
    -- Verificar configurações do sistema
    SELECT COUNT(*) INTO settings_count
    FROM system_settings_pet;
    
    RAISE NOTICE 'Configurações do sistema: %', settings_count;
    
    -- Verificar FAQ
    SELECT COUNT(*) INTO faq_count
    FROM faq_pet;
    
    RAISE NOTICE 'Perguntas frequentes: %', faq_count;
    
    -- Verificar templates de notificação
    SELECT COUNT(*) INTO templates_count
    FROM notification_templates_pet;
    
    RAISE NOTICE 'Templates de notificação: %', templates_count;
    
    IF settings_count > 0 AND faq_count > 0 AND templates_count > 0 THEN
        RAISE NOTICE '✅ DADOS INICIAIS CARREGADOS CORRETAMENTE';
    ELSE
        RAISE NOTICE '❌ ALGUNS DADOS INICIAIS ESTÃO FALTANDO';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- =============================================
-- 6. RELATÓRIO FINAL
-- =============================================

DO $$
DECLARE
    total_tables INTEGER;
    total_indexes INTEGER;
    total_triggers INTEGER;
    total_rls_tables INTEGER;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'RELATÓRIO FINAL DE VALIDAÇÃO';
    RAISE NOTICE '=============================================';
    
    -- Contar totais
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%_pet';
    
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE '%_pet%';
    
    SELECT COUNT(*) INTO total_triggers
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%_pet%';
    
    SELECT COUNT(*) INTO total_rls_tables
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname LIKE '%_pet'
    AND c.relrowsecurity = true;
    
    RAISE NOTICE '📊 ESTATÍSTICAS FINAIS:';
    RAISE NOTICE '   Tabelas: %', total_tables;
    RAISE NOTICE '   Índices: %', total_indexes;
    RAISE NOTICE '   Triggers: %', total_triggers;
    RAISE NOTICE '   RLS Habilitado: %', total_rls_tables;
    
    IF total_tables >= 50 AND total_indexes >= 100 AND total_triggers >= 30 THEN
        RAISE NOTICE '🎉 BANCO DE DADOS VALIDADO COM SUCESSO!';
        RAISE NOTICE '✅ Sistema pronto para deploy';
    ELSE
        RAISE NOTICE '⚠️  VALIDAÇÃO INCOMPLETA';
        RAISE NOTICE '❌ Verifique os itens faltantes acima';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;
