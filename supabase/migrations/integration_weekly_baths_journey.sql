-- =============================================
-- MIGRAÇÃO: Integração Banhos Semanais e Jornada de Crescimento
-- Descrição: Adiciona campos e funções necessárias para integração unidirecional
-- Data: 2024
-- =============================================

-- =============================================
-- SEÇÃO 1: MODIFICAÇÕES NA TABELA weekly_baths
-- =============================================

-- Adicionar campos para integração
ALTER TABLE weekly_baths 
ADD COLUMN IF NOT EXISTS add_to_journey BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS journey_event_id UUID REFERENCES pet_events_pet(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_weekly_baths_add_to_journey ON weekly_baths(add_to_journey);
CREATE INDEX IF NOT EXISTS idx_weekly_baths_journey_event_id ON weekly_baths(journey_event_id);

-- Atualizar políticas RLS para permitir administradores gerenciarem campos de integração
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'weekly_baths' 
    AND policyname = 'Admins can update integration fields'
  ) THEN
    CREATE POLICY "Admins can update integration fields" ON weekly_baths
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles_pet
          WHERE profiles_pet.id = auth.uid()
          AND profiles_pet.email IN (SELECT email FROM admin_users_pet)
        )
      );
  END IF;
END $$;

-- =============================================
-- SEÇÃO 2: MODIFICAÇÕES NA TABELA pet_events_pet
-- =============================================

-- Adicionar campo para rastrear origem do evento
ALTER TABLE pet_events_pet 
ADD COLUMN IF NOT EXISTS weekly_bath_source_id UUID REFERENCES weekly_baths(id) ON DELETE SET NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_pet_events_weekly_bath_source ON pet_events_pet(weekly_bath_source_id);

-- =============================================
-- SEÇÃO 3: GARANTIR TIPO DE EVENTO "BANHO E TOSA"
-- =============================================

-- Inserir tipo de evento se não existir
INSERT INTO event_types_pet (name, description, icon, color)
VALUES ('Banho e Tosa', 'Serviços de higiene e estética', 'bath', '#3B82F6')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEÇÃO 4: FUNÇÃO PARA CRIAR EVENTO NA JORNADA
-- =============================================

-- Função para criar evento na jornada a partir do banho
CREATE OR REPLACE FUNCTION create_journey_event_from_bath(
  bath_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  bath_record weekly_baths%ROWTYPE;
  event_type_id UUID;
  new_event_id UUID;
BEGIN
  -- Buscar dados do banho
  SELECT * INTO bath_record FROM weekly_baths WHERE id = bath_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banho não encontrado';
  END IF;
  
  IF bath_record.pet_id IS NULL THEN
    RAISE EXCEPTION 'Pet não especificado para o banho';
  END IF;
  
  -- Verificar se já existe evento para este banho
  IF bath_record.journey_event_id IS NOT NULL THEN
    RAISE EXCEPTION 'Já existe evento na jornada para este banho';
  END IF;
  
  -- Buscar tipo de evento "Banho e Tosa"
  SELECT id INTO event_type_id 
  FROM event_types_pet 
  WHERE name = 'Banho e Tosa' 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de evento "Banho e Tosa" não encontrado';
  END IF;
  
  -- Criar evento na jornada
  INSERT INTO pet_events_pet (
    pet_id,
    event_type_id,
    title,
    description,
    event_date,
    weekly_bath_source_id,
    created_by
  ) VALUES (
    bath_record.pet_id,
    event_type_id,
    'Banho e Tosa - ' || bath_record.pet_name,
    'Evento criado automaticamente a partir dos banhos semanais.',
    bath_record.bath_date,
    bath_id,
    admin_id
  ) RETURNING id INTO new_event_id;
  
  -- Criar foto do evento
  INSERT INTO event_photos_pet (
    event_id,
    file_path,
    caption,
    is_primary
  ) VALUES (
    new_event_id,
    bath_record.image_url,
    'Foto do banho semanal',
    true
  );
  
  -- Atualizar banho com referência ao evento
  UPDATE weekly_baths 
  SET journey_event_id = new_event_id 
  WHERE id = bath_id;
  
  RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION create_journey_event_from_bath(UUID, UUID) TO authenticated;

-- =============================================
-- SEÇÃO 5: FUNÇÃO PARA APROVAÇÃO COM INTEGRAÇÃO
-- =============================================

-- Função para aprovar banho e criar evento na jornada se marcado
CREATE OR REPLACE FUNCTION approve_bath_with_integration(
  bath_id UUID,
  admin_id UUID,
  should_add_to_journey BOOLEAN DEFAULT false
) RETURNS JSON AS $$
DECLARE
  bath_record weekly_baths%ROWTYPE;
  event_id UUID;
  result JSON;
BEGIN
  -- Atualizar status de aprovação do banho
  UPDATE weekly_baths 
  SET 
    approved = true,
    approved_by = admin_id,
    approved_at = NOW(),
    add_to_journey = should_add_to_journey
  WHERE id = bath_id
  RETURNING * INTO bath_record;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banho não encontrado';
  END IF;
  
  -- Se marcado para adicionar à jornada, criar evento
  IF should_add_to_journey AND bath_record.pet_id IS NOT NULL THEN
    BEGIN
      event_id := create_journey_event_from_bath(bath_id, admin_id);
    EXCEPTION WHEN OTHERS THEN
      -- Log do erro mas não falha a aprovação
      RAISE WARNING 'Erro ao criar evento na jornada: %', SQLERRM;
      event_id := NULL;
    END;
  END IF;
  
  -- Retornar resultado
  result := json_build_object(
    'bath_id', bath_id,
    'approved', true,
    'added_to_journey', should_add_to_journey,
    'journey_event_id', event_id,
    'success', true
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION approve_bath_with_integration(UUID, UUID, BOOLEAN) TO authenticated;

-- =============================================
-- SEÇÃO 6: FUNÇÃO PARA BUSCAR PETS PARA SELEÇÃO
-- =============================================

-- Função para buscar pets disponíveis para seleção
CREATE OR REPLACE FUNCTION get_pets_for_selection()
RETURNS TABLE (
  id UUID,
  name TEXT,
  breed TEXT,
  avatar_url TEXT,
  owner_name TEXT,
  owner_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.breed,
    p.avatar_url,
    prof.full_name as owner_name,
    prof.email as owner_email
  FROM pets_pet p
  LEFT JOIN profiles_pet prof ON p.owner_id = prof.id
  WHERE p.active = true
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION get_pets_for_selection() TO authenticated;

-- =============================================
-- SEÇÃO 7: FUNÇÃO PARA ESTATÍSTICAS DE INTEGRAÇÃO
-- =============================================

-- Função para obter estatísticas de integração
CREATE OR REPLACE FUNCTION get_integration_stats(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  total_baths INTEGER;
  integrated_baths INTEGER;
  integration_rate DECIMAL;
  result JSON;
BEGIN
  -- Definir datas padrão se não fornecidas
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;
  
  -- Contar total de banhos aprovados no período
  SELECT COUNT(*) INTO total_baths
  FROM weekly_baths
  WHERE approved = true
    AND approved_at::date BETWEEN start_date AND end_date;
  
  -- Contar banhos integrados à jornada
  SELECT COUNT(*) INTO integrated_baths
  FROM weekly_baths
  WHERE approved = true
    AND add_to_journey = true
    AND journey_event_id IS NOT NULL
    AND approved_at::date BETWEEN start_date AND end_date;
  
  -- Calcular taxa de integração
  IF total_baths > 0 THEN
    integration_rate := (integrated_baths::DECIMAL / total_baths::DECIMAL) * 100;
  ELSE
    integration_rate := 0;
  END IF;
  
  -- Construir resultado
  result := json_build_object(
    'period', json_build_object(
      'start_date', start_date,
      'end_date', end_date
    ),
    'total_approved_baths', total_baths,
    'integrated_baths', integrated_baths,
    'integration_rate', ROUND(integration_rate, 2),
    'non_integrated_baths', total_baths - integrated_baths
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION get_integration_stats(DATE, DATE) TO authenticated;

-- =============================================
-- SEÇÃO 8: COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

-- Adicionar comentários às colunas
COMMENT ON COLUMN weekly_baths.add_to_journey IS 'Indica se o banho deve ser adicionado à jornada do pet';
COMMENT ON COLUMN weekly_baths.journey_event_id IS 'ID do evento criado na jornada (se aplicável)';
COMMENT ON COLUMN pet_events_pet.weekly_bath_source_id IS 'ID do banho semanal que originou este evento';

-- Adicionar comentários às funções
COMMENT ON FUNCTION create_journey_event_from_bath(UUID, UUID) IS 'Cria evento na jornada do pet a partir de um banho semanal';
COMMENT ON FUNCTION approve_bath_with_integration(UUID, UUID, BOOLEAN) IS 'Aprova banho e opcionalmente cria evento na jornada';
COMMENT ON FUNCTION get_pets_for_selection() IS 'Retorna lista de pets disponíveis para seleção';
COMMENT ON FUNCTION get_integration_stats(DATE, DATE) IS 'Retorna estatísticas de integração entre banhos e jornada';

-- =============================================
-- FINALIZAÇÃO
-- =============================================

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Migração de integração Banhos Semanais x Jornada de Crescimento concluída com sucesso!';
  RAISE NOTICE 'Campos adicionados: add_to_journey, journey_event_id, weekly_bath_source_id';
  RAISE NOTICE 'Funções criadas: create_journey_event_from_bath, approve_bath_with_integration, get_pets_for_selection, get_integration_stats';
  RAISE NOTICE 'Tipo de evento "Banho e Tosa" garantido';
END $$;