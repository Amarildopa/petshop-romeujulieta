-- Verificação: Consultar horário de funcionamento atualizado
-- Este arquivo pode ser usado para verificar se a migração foi aplicada corretamente

SELECT 
    key,
    value,
    description,
    updated_at
FROM system_settings_pet 
WHERE key = 'business_hours';

-- Resultado esperado:
-- key: business_hours
-- value: {"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "17:00"}, "sunday": {"closed": true}}
-- description: Horários de funcionamento
-- updated_at: [timestamp da atualização]