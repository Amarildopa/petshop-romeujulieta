-- Script SQL para inserir dados de exemplo na tabela feedback_pet
-- Execute este script diretamente no Supabase SQL Editor

-- Primeiro, vamos verificar a estrutura da tabela
\d feedback_pet;

-- Inserir dados de exemplo (contornando RLS)
INSERT INTO feedback_pet (
  type,
  rating,
  title,
  comment,
  status,
  priority
) VALUES 
(
  'service',
  5,
  'Excelente atendimento no banho e tosa',
  'Minha cachorrinha Luna ficou linda depois do banho e tosa! A equipe foi super cuidadosa e carinhosa com ela. Recomendo muito!',
  'resolved',
  'medium'
),
(
  'service',
  5,
  'Veterinário muito competente',
  'O Dr. Carlos foi excepcional no atendimento do meu gato Max. Diagnóstico preciso e tratamento eficaz. Muito obrigada!',
  'resolved',
  'medium'
),
(
  'product',
  4,
  'Ração de qualidade excelente',
  'Comprei a ração premium para meu cachorro Rex e ele adorou! Notei melhora no pelo e na disposição dele.',
  'resolved',
  'medium'
),
(
  'service',
  5,
  'Hospedagem perfeita para minha viagem',
  'Deixei meu pet no hotel durante as férias e fiquei muito tranquila. Cuidado excepcional e muitas fotos durante a estadia!',
  'resolved',
  'medium'
),
(
  'app',
  4,
  'App muito prático e fácil de usar',
  'O aplicativo facilitou muito o agendamento dos serviços. Interface intuitiva e notificações úteis.',
  'resolved',
  'low'
),
(
  'service',
  5,
  'Adestramento transformou meu cão',
  'O treinamento comportamental foi incrível! Meu cachorro Bobby agora obedece comandos e está muito mais calmo.',
  'resolved',
  'medium'
),
(
  'product',
  5,
  'Brinquedos de ótima qualidade',
  'Os brinquedos que comprei são resistentes e meu gato adora! Entrega rápida e produto conforme descrito.',
  'resolved',
  'low'
),
(
  'service',
  4,
  'Consulta veterinária completa',
  'Atendimento profissional e cuidadoso. O veterinário explicou tudo detalhadamente sobre a saúde da minha pet.',
  'resolved',
  'medium'
),
(
  'app',
  3,
  'Sugestão de melhoria no agendamento',
  'O app é bom, mas seria legal ter mais opções de horário disponíveis, especialmente aos finais de semana.',
  'pending',
  'low'
),
(
  'service',
  5,
  'Serviço de emergência salvou minha pet',
  'Atendimento de emergência foi rápido e eficiente. A equipe foi muito profissional em um momento difícil. Gratidão eterna!',
  'resolved',
  'high'
);

-- Verificar os dados inseridos
SELECT 
  id,
  type,
  rating,
  title,
  LEFT(comment, 50) || '...' as comment_preview,
  status,
  priority,
  created_at
FROM feedback_pet 
ORDER BY created_at DESC;

-- Contar total de registros por tipo
SELECT 
  type,
  COUNT(*) as total,
  AVG(rating) as avg_rating
FROM feedback_pet 
GROUP BY type
ORDER BY total DESC;

-- Contar por status
SELECT 
  status,
  COUNT(*) as total
FROM feedback_pet 
GROUP BY status;