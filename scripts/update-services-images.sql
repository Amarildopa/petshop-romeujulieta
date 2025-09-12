-- =============================================
-- SCRIPT PARA ATUALIZAR IMAGENS DOS SERVIÇOS
-- PetShop Romeo & Julieta
-- =============================================

-- Este script atualiza as URLs das imagens para cada serviço
-- com imagens específicas e apropriadas do Unsplash

-- =============================================
-- SERVIÇOS DE GROOMING (Banho e Tosa)
-- =============================================

-- Banho e Tosa / Banho & Tosa
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%banho%tosa%' OR name ILIKE '%banho & tosa%';

-- Banho Simples
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%banho simples%' OR name ILIKE '%banho%' AND name NOT ILIKE '%tosa%';

-- Tosa Completa
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%tosa completa%';

-- Tosa Higiênica
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%tosa higiênica%' OR name ILIKE '%tosa higienica%';

-- =============================================
-- SERVIÇOS VETERINÁRIOS
-- =============================================

-- Consulta Veterinária / Check-up Veterinário
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%consulta%veterinár%' OR name ILIKE '%check-up%veterinár%';

-- Vacinação
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%vacinação%' OR name ILIKE '%vacina%';

-- Exames Laboratoriais
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%exames%laboratoriais%' OR name ILIKE '%exame%';

-- Cirurgia
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%cirurgia%';

-- =============================================
-- SERVIÇOS DE HOSPEDAGEM E CUIDADOS
-- =============================================

-- Hospedagem / Hotelzinho
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%hospedagem%' OR name ILIKE '%hotelzinho%';

-- Day Care / Daycare
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%day care%' OR name ILIKE '%daycare%';

-- =============================================
-- SERVIÇOS DE TREINAMENTO E TERAPIA
-- =============================================

-- Adestramento
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%adestramento%';

-- Fisioterapia
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop&crop=center'
WHERE name ILIKE '%fisioterapia%';

-- =============================================
-- VERIFICAÇÃO DOS RESULTADOS
-- =============================================

-- Consulta para verificar os serviços atualizados
SELECT 
    id,
    name,
    category,
    image_url,
    is_active
FROM services_pet 
ORDER BY category, name;

-- =============================================
-- COMANDOS ALTERNATIVOS POR ID (SE NECESSÁRIO)
-- =============================================

-- Caso você prefira atualizar por ID específico, use os comandos abaixo:
-- Substitua os UUIDs pelos IDs reais dos seus serviços

/*
-- Exemplo de atualização por ID:
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center'
WHERE id = 'seu-uuid-aqui';
*/

-- =============================================
-- IMAGENS DE FALLBACK PARA SERVIÇOS SEM CATEGORIA
-- =============================================

-- Atualiza serviços que ainda não têm imagem
UPDATE services_pet 
SET image_url = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center'
WHERE image_url IS NULL OR image_url = '';