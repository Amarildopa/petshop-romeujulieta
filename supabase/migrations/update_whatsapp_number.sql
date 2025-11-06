-- Migration: Atualização do número de WhatsApp
-- Novo número (somente dígitos): 5511988181826

BEGIN;

-- Antes da atualização
SELECT key, value, is_public
FROM system_settings_pet
WHERE key = 'contact_phone';

-- Atualiza se existir
UPDATE system_settings_pet
SET value = '5511988181826',
    is_public = TRUE
WHERE key = 'contact_phone';

-- Insere se não existir
INSERT INTO system_settings_pet (key, value, is_public)
SELECT 'contact_phone', '5511988181826', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'contact_phone'
);

-- Depois da atualização
SELECT key, value, is_public
FROM system_settings_pet
WHERE key = 'contact_phone';

COMMIT;