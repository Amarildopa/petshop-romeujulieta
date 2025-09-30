-- Verificar se o pet existe e qual é o owner_id
SELECT id, name, owner_id, species, breed 
FROM pets_pet 
WHERE id = '61edc9d6-3767-4d8d-b789-77b634b949e0';

-- Verificar todos os pets do usuário atual
SELECT id, name, owner_id, species, breed 
FROM pets_pet 
WHERE owner_id = 'fa323991-019c-4f72-b144-27304cc396ae';

-- Verificar se há algum pet ativo no sistema
SELECT id, name, owner_id, species, breed, is_active 
FROM pets_pet 
WHERE is_active = true
LIMIT 5;