-- Inserir um pet de teste para debug
-- Primeiro, vamos verificar se há usuários na tabela profiles_pet
SELECT id, email FROM profiles_pet LIMIT 5;

-- Inserir um pet de teste usando o primeiro usuário encontrado
INSERT INTO pets_pet (
    name,
    species,
    breed,
    owner_id,
    birth_date,
    gender,
    color,
    weight,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    'Rex - Pet de Teste',
    'Cachorro',
    'Golden Retriever',
    id,
    '2020-01-15',
    'Macho',
    'Dourado',
    25.5,
    true,
    NOW(),
    NOW()
FROM profiles_pet 
LIMIT 1;

-- Verificar se o pet foi inserido
SELECT 
    p.id,
    p.name,
    p.species,
    p.breed,
    p.owner_id,
    pr.email as owner_email
FROM pets_pet p
JOIN profiles_pet pr ON p.owner_id = pr.id
WHERE p.name LIKE '%Teste%'
ORDER BY p.created_at DESC;