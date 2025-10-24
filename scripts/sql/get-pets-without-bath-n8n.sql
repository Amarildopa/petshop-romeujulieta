-- =============================================
-- FUNÇÃO: get_pets_without_bath_n8n
-- Descrição: Retorna pets que não tomaram banho há mais de 15 dias
-- Criado para integração com n8n para campanhas de marketing
-- Data: 2024
-- =============================================

CREATE OR REPLACE FUNCTION get_pets_without_bath_n8n() 
RETURNS TABLE ( 
  pet_id UUID, 
  pet_name TEXT, 
  owner_id UUID, 
  owner_name TEXT, 
  owner_phone TEXT, 
  dias_sem_banho INTEGER 
) AS $$ 
BEGIN 
  RETURN QUERY 
  SELECT 
    p.id as pet_id, 
    p.name as pet_name, 
    o.id as owner_id, 
    o.full_name as owner_name, 
    o.phone as owner_phone, 
    CASE 
      WHEN MAX(a.appointment_date) IS NULL THEN 999
      ELSE EXTRACT(DAY FROM NOW() - MAX(a.appointment_date))::INTEGER
    END as dias_sem_banho 
  FROM pets_pet p 
  JOIN profiles_pet o ON p.owner_id = o.id 
  LEFT JOIN communication_settings_pet cs ON o.id = cs.user_id
  LEFT JOIN appointments_pet a ON p.id = a.pet_id 
    AND a.service_id IN (
      SELECT s.id FROM services_pet s 
      WHERE s.category = 'grooming' 
        AND (s.name ILIKE '%banho%' OR s.name ILIKE '%tosa%')
        AND s.is_active = true
    )
    AND a.status IN ('completed', 'confirmed')
  WHERE COALESCE(cs.marketing_emails, true) = true 
    AND o.id NOT IN ( 
      SELECT DISTINCT cr.user_id 
      FROM campaign_recipients_pet cr
      JOIN marketing_campaigns_pet mc ON cr.campaign_id = mc.id
      WHERE cr.sent_at >= NOW() - INTERVAL '7 days' 
        AND cr.status IN ('sent', 'delivered', 'opened')
    ) 
  GROUP BY p.id, p.name, o.id, o.full_name, o.phone 
  HAVING (
    MAX(a.appointment_date) IS NULL 
    OR EXTRACT(DAY FROM NOW() - MAX(a.appointment_date)) >= 15
  )
  ORDER BY dias_sem_banho DESC 
  LIMIT 50; 
END; 
$$ LANGUAGE plpgsql;

-- =============================================
-- PERMISSÕES
-- =============================================

-- Conceder permissões de execução para usuários anônimos e autenticados
GRANT EXECUTE ON FUNCTION get_pets_without_bath_n8n() TO anon, authenticated;

-- =============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON FUNCTION get_pets_without_bath_n8n() IS 'Função para n8n: Retorna pets que não tomaram banho há mais de 15 dias para campanhas de marketing. Considera apenas donos com consentimento de marketing e exclui quem recebeu campanhas nos últimos 7 dias.';

-- =============================================
-- EXEMPLO DE USO
-- =============================================

/*
-- Para testar a função:
SELECT * FROM get_pets_without_bath_n8n();

-- Para verificar quantos pets serão retornados:
SELECT COUNT(*) as total_pets FROM get_pets_without_bath_n8n();
*/