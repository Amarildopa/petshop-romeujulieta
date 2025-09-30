-- Verificar se há pets na tabela
SELECT COUNT(*) as total_pets FROM pets_pet;

-- Verificar pets por owner_id
SELECT owner_id, COUNT(*) as pet_count FROM pets_pet GROUP BY owner_id;

-- Verificar alguns pets de exemplo
SELECT id, name, owner_id, created_at FROM pets_pet LIMIT 5;