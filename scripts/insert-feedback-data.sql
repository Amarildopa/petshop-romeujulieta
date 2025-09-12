-- =============================================
-- INSERTS DE DADOS DE EXEMPLO PARA FEEDBACK_PET
-- =============================================

-- Primeiro, vamos buscar alguns user_ids existentes para usar nos feedbacks
-- (assumindo que já existem usuários cadastrados)

-- Inserir feedbacks de exemplo para depoimentos na home
INSERT INTO feedback_pet (
  user_id, 
  type, 
  rating, 
  title, 
  comment, 
  category, 
  status, 
  priority,
  resolved_at,
  resolution
) VALUES 
-- Depoimento 1 - Serviço de banho e tosa
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 0),
  'service',
  5,
  'Excelente atendimento no banho e tosa',
  'Minha cachorrinha Luna ficou linda depois do banho e tosa! A equipe foi super cuidadosa e carinhosa com ela. Recomendo muito!',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '2 days',
  'Agradecemos o feedback positivo!'
),

-- Depoimento 2 - Consulta veterinária
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 1),
  'service',
  5,
  'Veterinário muito competente',
  'O Dr. Carlos foi excepcional no atendimento do meu gato Max. Diagnóstico preciso e tratamento eficaz. Muito obrigada!',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '5 days',
  'Ficamos felizes em ajudar!'
),

-- Depoimento 3 - Produtos
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 2),
  'product',
  4,
  'Ração de qualidade excelente',
  'Comprei a ração premium para meu cachorro Rex e ele adorou! Notei melhora no pelo e na disposição dele.',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '1 week',
  'Obrigado pela confiança em nossos produtos!'
),

-- Depoimento 4 - Hospedagem
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 3),
  'service',
  5,
  'Hospedagem perfeita para minha viagem',
  'Deixei minha Bella na hospedagem por uma semana e ela foi muito bem cuidada. Recebi fotos todos os dias!',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '10 days',
  'Cuidamos com muito carinho!'
),

-- Depoimento 5 - Atendimento geral
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 4),
  'app',
  5,
  'Aplicativo muito prático',
  'Consegui agendar facilmente pelo app e o atendimento foi pontual. Parabéns pela organização!',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '3 days',
  'Obrigado pelo elogio!'
),

-- Depoimento 6 - Adestramento
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 5),
  'service',
  4,
  'Adestramento transformou meu pet',
  'O Bobby estava muito agitado e após as sessões de adestramento ficou muito mais obediente. Recomendo!',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '2 weeks',
  'Ficamos felizes com o progresso!'
),

-- Depoimento 7 - Produtos de higiene
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 6),
  'product',
  5,
  'Shampoo deixou o pelo sedoso',
  'O shampoo que comprei deixou o pelo da minha gata Mimi super macio e cheiroso. Produto de qualidade!',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '4 days',
  'Agradecemos a preferência!'
),

-- Depoimento 8 - Vacinação
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 7),
  'service',
  5,
  'Vacinação sem estresse',
  'Meu filhote Toby nem sentiu a vacina! A veterinária foi muito gentil e explicou tudo direitinho.',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '6 days',
  'Cuidamos com carinho dos pequenos!'
),

-- Depoimento 9 - Brinquedos
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 8),
  'product',
  4,
  'Brinquedos resistentes e divertidos',
  'Comprei vários brinquedos para meu labrador Thor e ele adora todos! São bem resistentes às mordidas.',
  'compliment',
  'resolved',
  'medium',
  NOW() - INTERVAL '8 days',
  'Thor tem bom gosto!'
),

-- Depoimento 10 - Atendimento de emergência
(
  (SELECT id FROM profiles_pet LIMIT 1 OFFSET 9),
  'service',
  5,
  'Salvaram minha gatinha',
  'Minha Mia teve uma emergência à noite e vocês atenderam prontamente. Muito obrigada por salvarem ela!',
  'compliment',
  'resolved',
  'high',
  NOW() - INTERVAL '12 days',
  'Estamos sempre aqui para ajudar!'
);

-- Verificar os dados inseridos
SELECT 
  f.id,
  p.full_name as tutor_name,
  f.type,
  f.rating,
  f.title,
  f.comment,
  f.created_at
FROM feedback_pet f
JOIN profiles_pet p ON f.user_id = p.id
WHERE f.category = 'compliment'
ORDER BY f.created_at DESC;