-- Função RPC para deletar dados de usuário específico
-- Execute este SQL no Supabase SQL Editor com service_role

CREATE OR REPLACE FUNCTION delete_user_data(
  table_name TEXT,
  where_condition TEXT
)
RETURNS INTEGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  sql_query TEXT;
  deleted_count INTEGER;
BEGIN
  -- Construir query dinâmica
  sql_query := format('DELETE FROM %I WHERE %s', table_name, where_condition);
  
  -- Executar query e obter contagem
  EXECUTE sql_query;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar 0
    RETURN 0;
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION delete_user_data(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data(TEXT, TEXT) TO service_role;

-- Função auxiliar para deletar usuário completo
CREATE OR REPLACE FUNCTION delete_complete_user(user_email TEXT)
RETURNS JSONB
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  user_id UUID;
  result JSONB := '{}';
  deleted_count INTEGER;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO user_id 
  FROM profiles_pet 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Usuário não encontrado');
  END IF;
  
  -- Deletar registros dependentes
  
  -- Admin logs
  DELETE FROM admin_logs_pet 
  WHERE admin_id IN (SELECT id FROM admin_users_pet WHERE user_id = user_id);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{admin_logs}', to_jsonb(deleted_count));
  
  -- Admin notifications
  DELETE FROM admin_notifications_pet 
  WHERE admin_id IN (SELECT id FROM admin_users_pet WHERE user_id = user_id);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{admin_notifications}', to_jsonb(deleted_count));
  
  -- Admin users
  DELETE FROM admin_users_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{admin_users}', to_jsonb(deleted_count));
  
  -- Service progress
  DELETE FROM service_progress_pet 
  WHERE appointment_id IN (SELECT id FROM appointments_pet WHERE user_id = user_id);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{service_progress}', to_jsonb(deleted_count));
  
  -- Appointments
  DELETE FROM appointments_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{appointments}', to_jsonb(deleted_count));
  
  -- Pets
  DELETE FROM pets_pet WHERE owner_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{pets}', to_jsonb(deleted_count));
  
  -- Orders
  DELETE FROM orders_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{orders}', to_jsonb(deleted_count));
  
  -- Subscriptions
  DELETE FROM subscriptions_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{subscriptions}', to_jsonb(deleted_count));
  
  -- Notifications
  DELETE FROM notifications_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{notifications}', to_jsonb(deleted_count));
  
  -- Communication settings
  DELETE FROM communication_settings_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{communication_settings}', to_jsonb(deleted_count));
  
  -- Support tickets
  DELETE FROM support_tickets_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{support_tickets}', to_jsonb(deleted_count));
  
  -- Feedback
  DELETE FROM feedback_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{feedback}', to_jsonb(deleted_count));
  
  -- Chat participants
  DELETE FROM chat_room_participants_pet WHERE user_id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{chat_participants}', to_jsonb(deleted_count));
  
  -- Profile (último)
  DELETE FROM profiles_pet WHERE id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{profile}', to_jsonb(deleted_count));
  
  -- Adicionar informações do usuário
  result := jsonb_set(result, '{user_id}', to_jsonb(user_id));
  result := jsonb_set(result, '{user_email}', to_jsonb(user_email));
  result := jsonb_set(result, '{success}', to_jsonb(true));
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'user_email', user_email,
      'success', false
    );
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION delete_complete_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_complete_user(TEXT) TO service_role;

-- Verificar se as funções foram criadas
SELECT 
  'Função criada: ' || proname as status
FROM pg_proc 
WHERE proname IN ('delete_user_data', 'delete_complete_user')
ORDER BY proname;