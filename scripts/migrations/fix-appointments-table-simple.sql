-- =====================================================
-- CORREÇÃO SIMPLES: Adicionar Colunas Faltantes na Tabela appointments_pet
-- Data: 19/09/2025
-- Descrição: Script focado apenas em corrigir as colunas total_price e extras
-- =====================================================

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments_pet') THEN
        RAISE EXCEPTION 'Tabela appointments_pet não encontrada. Verifique se o schema foi criado corretamente.';
    END IF;
    RAISE NOTICE '✅ Tabela appointments_pet encontrada';
END $$;

-- =====================================================
-- ADICIONAR COLUNAS FALTANTES
-- =====================================================

-- Adicionar coluna total_price (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'total_price'
    ) THEN
        ALTER TABLE appointments_pet ADD COLUMN total_price DECIMAL(10,2);
        RAISE NOTICE '✅ Coluna total_price adicionada com sucesso';
    ELSE
        RAISE NOTICE '⚠️  Coluna total_price já existe';
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
        RAISE NOTICE '✅ Coluna extras adicionada com sucesso';
    ELSE
        RAISE NOTICE '⚠️  Coluna extras já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as colunas foram criadas corretamente
DO $$
DECLARE
    total_price_exists BOOLEAN;
    extras_exists BOOLEAN;
BEGIN
    -- Verificar total_price
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'total_price'
    ) INTO total_price_exists;
    
    -- Verificar extras
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments_pet' AND column_name = 'extras'
    ) INTO extras_exists;
    
    -- Relatório final
    RAISE NOTICE '';
    RAISE NOTICE '📋 RELATÓRIO FINAL:';
    RAISE NOTICE '==================';
    
    IF total_price_exists THEN
        RAISE NOTICE '✅ Coluna total_price: OK';
    ELSE
        RAISE EXCEPTION '❌ Coluna total_price: FALHOU';
    END IF;
    
    IF extras_exists THEN
        RAISE NOTICE '✅ Coluna extras: OK';
    ELSE
        RAISE EXCEPTION '❌ Coluna extras: FALHOU';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE 'As colunas faltantes foram adicionadas à tabela appointments_pet';
    RAISE NOTICE 'O sistema de agendamento agora deve funcionar corretamente';
    RAISE NOTICE '';
END $$;