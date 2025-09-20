-- =====================================================
-- QUERIES PARA VERIFICAR DADOS DO USUÁRIO LOGADO
-- Para usar no SQL Editor do Supabase
-- =====================================================

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário logado
-- Você pode obter o ID do usuário logado através do auth.users() ou da interface do Supabase

-- =====================================================
-- 1. VERIFICAR DADOS DO USUÁRIO LOGADO
-- =====================================================

-- Buscar informações do perfil do usuário
SELECT 
    'PERFIL DO USUÁRIO' as info,
    id,
    full_name,
    email,
    phone,
    address,
    cep,
    created_at,
    updated_at
FROM profiles_pet 
WHERE id = 'SEU_USER_ID_AQUI';

-- =====================================================
-- 2. VERIFICAR PETS DO USUÁRIO
-- =====================================================

-- Buscar todos os pets do usuário
SELECT 
    'PETS DO USUÁRIO' as info,
    id,
    name,
    species,
    breed,
    age,
    weight,
    height,
    color,
    gender,
    personality,
    allergies,
    medications,
    created_at
FROM pets_pet 
WHERE owner_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC;

-- =====================================================
-- 3. VERIFICAR AGENDAMENTOS DO USUÁRIO
-- =====================================================

-- Buscar todos os agendamentos do usuário com detalhes completos
SELECT 
    'AGENDAMENTOS DO USUÁRIO' as info,
    a.id as agendamento_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.total_price,
    a.extras,
    a.notes,
    a.created_at,
    p.name as pet_nome,
    p.species as pet_especie,
    s.name as servico_nome,
    s.price as servico_preco,
    s.duration as servico_duracao
FROM appointments_pet a
JOIN pets_pet p ON a.pet_id = p.id
JOIN services_pet s ON a.service_id = s.id
WHERE a.user_id = 'SEU_USER_ID_AQUI'
ORDER BY a.appointment_date DESC, a.appointment_time DESC;

-- =====================================================
-- 4. VERIFICAR ASSINATURAS DO USUÁRIO
-- =====================================================

-- Buscar assinaturas ativas do usuário
SELECT 
    'ASSINATURAS DO USUÁRIO' as info,
    id,
    plan_name,
    status,
    start_date,
    end_date,
    price,
    created_at,
    updated_at
FROM subscriptions_pet 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC;

-- =====================================================
-- 5. VERIFICAR NOTIFICAÇÕES DO USUÁRIO
-- =====================================================

-- Buscar notificações recentes do usuário
SELECT 
    'NOTIFICAÇÕES DO USUÁRIO' as info,
    id,
    title,
    message,
    type,
    is_read,
    created_at
FROM notifications_pet 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 6. VERIFICAR PROGRESSO DE SERVIÇOS
-- =====================================================

-- Buscar progresso dos serviços do usuário
SELECT 
    'PROGRESSO DE SERVIÇOS' as info,
    sp.id,
    sp.step_name,
    sp.completed,
    sp.completed_at,
    sp.notes,
    sp.created_at,
    a.appointment_date,
    a.appointment_time,
    s.name as servico_nome
FROM service_progress_pet sp
JOIN appointments_pet a ON sp.appointment_id = a.id
JOIN services_pet s ON a.service_id = s.id
WHERE a.user_id = 'SEU_USER_ID_AQUI'
ORDER BY sp.created_at DESC;

-- =====================================================
-- 7. VERIFICAR CARRINHO DE COMPRAS
-- =====================================================

-- Buscar itens no carrinho do usuário
SELECT 
    'CARRINHO DE COMPRAS' as info,
    ci.id,
    ci.quantity,
    ci.created_at,
    p.name as produto_nome,
    p.price as produto_preco,
    (ci.quantity * p.price) as subtotal
FROM cart_items_pet ci
JOIN products_pet p ON ci.product_id = p.id
WHERE ci.user_id = 'SEU_USER_ID_AQUI'
ORDER BY ci.created_at DESC;

-- =====================================================
-- 8. VERIFICAR PEDIDOS DO USUÁRIO
-- =====================================================

-- Buscar pedidos do usuário
SELECT 
    'PEDIDOS DO USUÁRIO' as info,
    id,
    order_number,
    status,
    total_amount,
    payment_status,
    shipping_address,
    created_at,
    updated_at
FROM orders_pet 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC;

-- =====================================================
-- 9. RESUMO COMPLETO DO USUÁRIO
-- =====================================================

-- Query resumo com contadores
SELECT 
    'RESUMO COMPLETO' as info,
    u.full_name as usuario_nome,
    u.email,
    (SELECT COUNT(*) FROM pets_pet WHERE owner_id = u.id) as total_pets,
    (SELECT COUNT(*) FROM appointments_pet WHERE user_id = u.id) as total_agendamentos,
    (SELECT COUNT(*) FROM appointments_pet WHERE user_id = u.id AND status = 'pending') as agendamentos_pendentes,
    (SELECT COUNT(*) FROM appointments_pet WHERE user_id = u.id AND status = 'completed') as agendamentos_concluidos,
    (SELECT COUNT(*) FROM subscriptions_pet WHERE user_id = u.id AND status = 'active') as assinaturas_ativas,
    (SELECT COUNT(*) FROM notifications_pet WHERE user_id = u.id AND is_read = false) as notificacoes_nao_lidas,
    (SELECT COUNT(*) FROM cart_items_pet WHERE user_id = u.id) as itens_carrinho,
    (SELECT COUNT(*) FROM orders_pet WHERE user_id = u.id) as total_pedidos
FROM profiles_pet u 
WHERE u.id = 'SEU_USER_ID_AQUI';

-- =====================================================
-- 10. COMO OBTER O ID DO USUÁRIO LOGADO
-- =====================================================

-- Para descobrir o ID do usuário logado, execute esta query:
SELECT 
    'USUÁRIO ATUAL LOGADO' as info,
    auth.uid() as user_id,
    auth.email() as email;

-- Ou veja todos os usuários cadastrados:
SELECT 
    'TODOS OS USUÁRIOS' as info,
    id,
    full_name,
    email,
    created_at
FROM profiles_pet 
ORDER BY created_at DESC;