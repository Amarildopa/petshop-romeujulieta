-- =====================================================
-- MIGRAÇÃO: Correção da Estrutura da Tabela appointments_pet
-- Data: $(date)
-- Descrição: Adiciona colunas faltantes e estruturas para integração externa
-- =====================================================

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments_pet') THEN
        RAISE EXCEPTION 'Tabela appointments_pet não encontrada. Verifique se o schema foi criado corretamente.';
    END IF;
END $$;

-- =====================================================
-- 1. ADICIONAR COLUNAS FALTANTES NA TABELA PRINCIPAL
-- =====================================================

-- Adicionar coluna total_price (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'total_price'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN total_price DECIMAL(10,2);
        RAISE NOTICE 'Coluna total_price adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna total_price já existe';
    END IF;
END $$;

-- Adicionar coluna extras (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'extras'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN extras TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna extras adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna extras já existe';
    END IF;
END $$;

-- =====================================================
-- 2. ADICIONAR COLUNAS PARA INTEGRAÇÃO EXTERNA
-- =====================================================

-- Adicionar coluna external_id (para referência na API externa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'external_id'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN external_id TEXT;
        RAISE NOTICE 'Coluna external_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna external_id já existe';
    END IF;
END $$;

-- Adicionar coluna external_provider (nome do provedor externo)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'external_provider'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN external_provider TEXT;
        RAISE NOTICE 'Coluna external_provider adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna external_provider já existe';
    END IF;
END $$;

-- Adicionar coluna source (origem do agendamento: local ou external)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'source'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN source TEXT DEFAULT 'local' CHECK (source IN ('local', 'external'));
        RAISE NOTICE 'Coluna source adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna source já existe';
    END IF;
END $$;

-- Adicionar coluna sync_status (status de sincronização)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'sync_status'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict'));
        RAISE NOTICE 'Coluna sync_status adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna sync_status já existe';
    END IF;
END $$;

-- Adicionar coluna sync_error (detalhes do erro de sincronização)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'sync_error'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN sync_error TEXT;
        RAISE NOTICE 'Coluna sync_error adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna sync_error já existe';
    END IF;
END $$;

-- Adicionar coluna last_sync_at (timestamp da última sincronização)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'last_sync_at'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna last_sync_at adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna last_sync_at já existe';
    END IF;
END $$;

-- =====================================================
-- 3. CRIAR TABELA DE LOGS DE SINCRONIZAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_logs_pet (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'sync', 'fetch_slots')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('appointment', 'slot')),
    local_id UUID,
    external_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'conflict')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    data_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sync_logs_timestamp ON sync_logs_pet(timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs_pet(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_entity ON sync_logs_pet(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_external_id ON sync_logs_pet(external_id);

COMMENT ON TABLE sync_logs_pet IS 'Logs de sincronização com sistemas externos';

-- =====================================================
-- 4. CRIAR TABELA DE CONFIGURAÇÃO DA API EXTERNA
-- =====================================================

CREATE TABLE IF NOT EXISTS external_api_config_pet (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_name TEXT NOT NULL UNIQUE,
    api_base_url TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT,
    webhook_url TEXT,
    webhook_secret_encrypted TEXT,
    sync_enabled BOOLEAN DEFAULT true,
    sync_interval_minutes INTEGER DEFAULT 15,
    cache_ttl_minutes INTEGER DEFAULT 5,
    conflict_resolution_strategy TEXT DEFAULT 'external_wins' CHECK (
        conflict_resolution_strategy IN ('external_wins', 'local_wins', 'manual_review', 'timestamp_based')
    ),
    max_retry_attempts INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    rate_limit_per_minute INTEGER DEFAULT 60,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE external_api_config_pet IS 'Configurações para integração com APIs externas de agendamento';

-- =====================================================
-- 5. CRIAR TABELA DE CACHE DE SLOTS EXTERNOS
-- =====================================================

CREATE TABLE IF NOT EXISTS external_slots_cache_pet (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_name TEXT NOT NULL,
    service_id TEXT,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    slots_data JSONB NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cache_key TEXT NOT NULL UNIQUE
);

-- Índices para cache
CREATE INDEX IF NOT EXISTS idx_external_slots_cache_key ON external_slots_cache_pet(cache_key);
CREATE INDEX IF NOT EXISTS idx_external_slots_expires ON external_slots_cache_pet(expires_at);
CREATE INDEX IF NOT EXISTS idx_external_slots_provider ON external_slots_cache_pet(provider_name);

COMMENT ON TABLE external_slots_cache_pet IS 'Cache de slots disponíveis de APIs externas';

-- =====================================================
-- 6. ADICIONAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices na tabela appointments_pet para integração externa
CREATE INDEX IF NOT EXISTS idx_appointments_external_id ON appointments_pet(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_source ON appointments_pet(source);
CREATE INDEX IF NOT EXISTS idx_appointments_sync_status ON appointments_pet(sync_status);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments_pet(external_provider) WHERE external_provider IS NOT NULL;

-- =====================================================
-- 7. CRIAR TRIGGERS PARA AUDITORIA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela de configuração
DROP TRIGGER IF EXISTS update_external_api_config_updated_at ON external_api_config_pet;
CREATE TRIGGER update_external_api_config_updated_at
    BEFORE UPDATE ON external_api_config_pet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. INSERIR CONFIGURAÇÃO PADRÃO (EXEMPLO)
-- =====================================================

-- Inserir configuração de exemplo (desabilitada por padrão)
INSERT INTO external_api_config_pet (
    provider_name,
    api_base_url,
    api_key_encrypted,
    sync_enabled,
    active
) VALUES (
    'exemplo_api',
    'https://api.exemplo.com/v1',
    'CHAVE_CRIPTOGRAFADA_AQUI',
    false,  -- Desabilitado por padrão
    false   -- Inativo por padrão
) ON CONFLICT (provider_name) DO NOTHING;

-- =====================================================
-- 9. CRIAR FUNÇÃO PARA LIMPEZA DE CACHE EXPIRADO
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM external_slots_cache_pet 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_cache() IS 'Remove entradas de cache expiradas';

-- =====================================================
-- 10. CRIAR FUNÇÃO PARA ESTATÍSTICAS DE SINCRONIZAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION get_sync_health_report(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    total_operations BIGINT,
    success_count BIGINT,
    error_count BIGINT,
    conflict_count BIGINT,
    success_rate NUMERIC,
    last_successful_sync TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_operations,
        COUNT(*) FILTER (WHERE status = 'success') as success_count,
        COUNT(*) FILTER (WHERE status = 'error') as error_count,
        COUNT(*) FILTER (WHERE status = 'conflict') as conflict_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND(COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC, 4)
            ELSE 0
        END as success_rate,
        MAX(timestamp) FILTER (WHERE status = 'success') as last_successful_sync
    FROM sync_logs_pet 
    WHERE timestamp >= NOW() - INTERVAL '1 hour' * hours_back;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sync_health_report(INTEGER) IS 'Retorna relatório de saúde da sincronização';

-- =====================================================
-- 11. VERIFICAÇÃO FINAL DA ESTRUTURA
-- =====================================================

-- Verificar se todas as colunas foram criadas corretamente
DO $$
DECLARE
    missing_columns TEXT[] := '{}';
    col_name TEXT;
    expected_columns TEXT[] := ARRAY[
        'total_price', 'extras', 'external_id', 'external_provider', 
        'source', 'sync_status', 'sync_error', 'last_sync_at'
    ];
BEGIN
    FOREACH col_name IN ARRAY expected_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'appointments_pet' AND column_name = col_name
        ) THEN
            missing_columns := array_append(missing_columns, col_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Colunas faltantes na tabela appointments_pet: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ Todas as colunas foram criadas com sucesso na tabela appointments_pet';
    END IF;
END $$;

-- Verificar se as tabelas auxiliares foram criadas
DO $$
DECLARE
    missing_tables TEXT[] := '{}';
    table_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'sync_logs_pet', 'external_api_config_pet', 'external_slots_cache_pet'
    ];
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Tabelas faltantes: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ Todas as tabelas auxiliares foram criadas com sucesso';
    END IF;
END $$;

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA COM SUCESSO
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '';
RAISE NOTICE 'Resumo das alterações:';
RAISE NOTICE '- ✅ Colunas adicionadas na tabela appointments_pet';
RAISE NOTICE '- ✅ Tabela sync_logs_pet criada';
RAISE NOTICE '- ✅ Tabela external_api_config_pet criada';
RAISE NOTICE '- ✅ Tabela external_slots_cache_pet criada';
RAISE NOTICE '- ✅ Índices de performance criados';
RAISE NOTICE '- ✅ Triggers de auditoria configurados';
RAISE NOTICE '- ✅ Funções auxiliares criadas';
RAISE NOTICE '';
RAISE NOTICE '📋 Próximos passos:';
RAISE NOTICE '1. Configurar as credenciais da API externa na tabela external_api_config_pet';
RAISE NOTICE '2. Implementar os serviços de integração no código';
RAISE NOTICE '3. Testar a sincronização com dados de exemplo';
RAISE NOTICE '';