-- =====================================================
-- VERIFICAÇÃO DE DADOS DE AGENDAMENTO
-- Data: 19/01/2025
-- Descrição: Script para verificar se os dados do agendamento foram inseridos corretamente
-- =====================================================

-- Verificar se existem agendamentos na tabela
SELECT 
    '📊 TOTAL DE AGENDAMENTOS' as info,
    COUNT(*) as total_agendamentos
FROM appointments_pet;

-- Verificar o último agendamento criado
SELECT 
    '🆕 ÚLTIMO AGENDAMENTO CRIADO' as info,
    a.id,
    a.created_at,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.total_price,
    a.extras,
    p.full_name as cliente_nome,
    pet.name as pet_nome,
    s.name as servico_nome,
    s.price as servico_preco
FROM appointments_pet a
JOIN profiles_pet p ON a.user_id = p.id
JOIN pets_pet pet ON a.pet_id = pet.id
JOIN services_pet s ON a.service_id = s.id
ORDER BY a.created_at DESC
LIMIT 1;

-- Verificar todos os agendamentos de hoje
SELECT 
    '📅 AGENDAMENTOS DE HOJE' as info,
    COUNT(*) as total_hoje
FROM appointments_pet 
WHERE appointment_date = CURRENT_DATE;

-- Verificar agendamentos por status
SELECT 
    '📈 AGENDAMENTOS POR STATUS' as info,
    status,
    COUNT(*) as quantidade
FROM appointments_pet
GROUP BY status
ORDER BY quantidade DESC;

-- Verificar se as colunas extras e total_price estão sendo usadas
SELECT 
    '💰 VERIFICAÇÃO DE PREÇOS E EXTRAS' as info,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN total_price IS NOT NULL AND total_price > 0 THEN 1 END) as com_preco,
    COUNT(CASE WHEN extras IS NOT NULL AND array_length(extras, 1) > 0 THEN 1 END) as com_extras,
    AVG(total_price) as preco_medio
FROM appointments_pet;

-- Verificar integridade dos relacionamentos
SELECT 
    '🔗 VERIFICAÇÃO DE RELACIONAMENTOS' as info,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as com_usuario,
    COUNT(CASE WHEN pet_id IS NOT NULL THEN 1 END) as com_pet,
    COUNT(CASE WHEN service_id IS NOT NULL THEN 1 END) as com_servico,
    COUNT(*) as total
FROM appointments_pet;

-- Verificar se há agendamentos órfãos (sem relacionamentos válidos)
SELECT 
    '⚠️ AGENDAMENTOS ÓRFÃOS' as info,
    COUNT(*) as total_orfaos
FROM appointments_pet a
WHERE NOT EXISTS (SELECT 1 FROM profiles_pet p WHERE p.id = a.user_id)
   OR NOT EXISTS (SELECT 1 FROM pets_pet pet WHERE pet.id = a.pet_id)
   OR NOT EXISTS (SELECT 1 FROM services_pet s WHERE s.id = a.service_id);

-- Mostrar detalhes completos dos últimos 3 agendamentos
SELECT 
    '📋 ÚLTIMOS 3 AGENDAMENTOS - DETALHES COMPLETOS' as info,
    a.id as agendamento_id,
    a.created_at as criado_em,
    a.appointment_date as data_agendamento,
    a.appointment_time as hora_agendamento,
    a.status,
    a.total_price,
    a.extras,
    a.notes as observacoes,
    p.full_name as cliente,
    p.email as cliente_email,
    p.phone as cliente_telefone,
    pet.name as pet_nome,
    pet.species as pet_especie,
    pet.breed as pet_raca,
    s.name as servico,
    s.description as servico_descricao,
    s.price as servico_preco_base,
    s.duration as servico_duracao
FROM appointments_pet a
JOIN profiles_pet p ON a.user_id = p.id
JOIN pets_pet pet ON a.pet_id = pet.id
JOIN services_pet s ON a.service_id = s.id
ORDER BY a.created_at DESC
LIMIT 3;