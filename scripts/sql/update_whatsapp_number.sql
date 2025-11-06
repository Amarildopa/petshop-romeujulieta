-- Atualização do número de WhatsApp no Supabase
-- Novo número (formato somente dígitos para WhatsApp): 5511988181826

BEGIN;

-- Antes da atualização: mostrar valor atual
SELECT key, value, is_public
FROM system_settings_pet
WHERE key = 'contact_phone';

-- Atualizar se existir
UPDATE system_settings_pet
SET value = '5511988181826',
    is_public = TRUE
WHERE key = 'contact_phone';

-- Inserir se não existir
INSERT INTO system_settings_pet (key, value, is_public)
SELECT 'contact_phone', '5511988181826', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'contact_phone'
);

-- Depois da atualização: confirmar novo valor
SELECT key, value, is_public
FROM system_settings_pet
WHERE key = 'contact_phone';

COMMIT;