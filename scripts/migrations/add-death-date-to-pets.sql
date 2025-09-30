-- =====================================================
-- MIGRAÇÃO: Adicionar campo death_date na tabela pets_pet
-- Data: $(date)
-- Descrição: Adiciona campo para data de óbito do pet e trigger para inativação automática
-- =====================================================

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pets_pet') THEN
        RAISE EXCEPTION 'Tabela pets_pet não encontrada. Verifique se o schema foi criado corretamente.';
    END IF;
END $$;

-- =====================================================
-- 1. ADICIONAR COLUNA DEATH_DATE
-- =====================================================

-- Adicionar coluna death_date (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pets_pet' AND column_name = 'death_date'
    ) THEN
        ALTER TABLE "pets_pet" ADD COLUMN death_date DATE;
        RAISE NOTICE 'Coluna death_date adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna death_date já existe';
    END IF;
END $$;

-- =====================================================
-- 2. CRIAR FUNÇÃO PARA INATIVAÇÃO AUTOMÁTICA
-- =====================================================

-- Criar ou substituir função que inativa o pet quando death_date é preenchida
CREATE OR REPLACE FUNCTION auto_deactivate_pet_on_death()
RETURNS TRIGGER AS $$
BEGIN
    -- Se death_date foi preenchida e o pet ainda está ativo
    IF NEW.death_date IS NOT NULL AND (OLD.death_date IS NULL OR OLD.death_date IS DISTINCT FROM NEW.death_date) THEN
        NEW.active = false;
        RAISE NOTICE 'Pet % foi automaticamente inativado devido à data de óbito: %', NEW.name, NEW.death_date;
    END IF;
    
    -- Se death_date foi removida, reativar o pet
    IF NEW.death_date IS NULL AND OLD.death_date IS NOT NULL THEN
        NEW.active = true;
        RAISE NOTICE 'Pet % foi reativado após remoção da data de óbito', NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CRIAR TRIGGER PARA INATIVAÇÃO AUTOMÁTICA
-- =====================================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_auto_deactivate_pet_on_death ON "pets_pet";

-- Criar trigger que executa antes do UPDATE
CREATE TRIGGER trigger_auto_deactivate_pet_on_death
    BEFORE UPDATE ON "pets_pet"
    FOR EACH ROW
    EXECUTE FUNCTION auto_deactivate_pet_on_death();

-- =====================================================
-- 4. ADICIONAR COMENTÁRIOS
-- =====================================================

COMMENT ON COLUMN "pets_pet".death_date IS 'Data de óbito do pet. Quando preenchida, o pet é automaticamente inativado';
COMMENT ON FUNCTION auto_deactivate_pet_on_death() IS 'Função que inativa automaticamente o pet quando a data de óbito é preenchida';
COMMENT ON TRIGGER trigger_auto_deactivate_pet_on_death ON "pets_pet" IS 'Trigger que executa a inativação automática do pet quando death_date é preenchida';

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se a coluna foi criada com sucesso
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pets_pet' AND column_name = 'death_date'
    ) THEN
        RAISE NOTICE 'Migração concluída com sucesso! Coluna death_date criada na tabela pets_pet';
        RAISE NOTICE 'Migração add-death-date-to-pets concluída com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro na migração: Coluna death_date não foi criada';
    END IF;
END $$;