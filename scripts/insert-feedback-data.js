import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de exemplo para feedbacks/depoimentos (estrutura simplificada)
const feedbackData = [
  {
    type: 'service',
    rating: 5,
    title: 'Excelente atendimento no banho e tosa',
    comment: 'Minha cachorrinha Luna ficou linda depois do banho e tosa! A equipe foi super cuidadosa e carinhosa com ela. Recomendo muito!',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'service',
    rating: 5,
    title: 'Veterinário muito competente',
    comment: 'O Dr. Carlos foi excepcional no atendimento do meu gato Max. Diagnóstico preciso e tratamento eficaz. Muito obrigada!',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'product',
    rating: 4,
    title: 'Ração de qualidade excelente',
    comment: 'Comprei a ração premium para meu cachorro Rex e ele adorou! Notei melhora no pelo e na disposição dele.',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'service',
    rating: 5,
    title: 'Hospedagem perfeita para minha viagem',
    comment: 'Deixei minha Bella na hospedagem por uma semana e ela foi muito bem cuidada. Recebi fotos todos os dias!',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'app',
    rating: 5,
    title: 'Aplicativo muito prático',
    comment: 'Consegui agendar facilmente pelo app e o atendimento foi pontual. Parabéns pela organização!',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'service',
    rating: 4,
    title: 'Adestramento transformou meu pet',
    comment: 'O Bobby estava muito agitado e após as sessões de adestramento ficou muito mais obediente. Recomendo!',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'product',
    rating: 5,
    title: 'Shampoo deixou o pelo sedoso',
    comment: 'O shampoo que comprei deixou o pelo da minha gata Mimi super macio e cheiroso. Produto de qualidade!',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'service',
    rating: 5,
    title: 'Vacinação sem estresse',
    comment: 'Meu filhote Toby nem sentiu a vacina! A veterinária foi muito gentil e explicou tudo direitinho.',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'product',
    rating: 4,
    title: 'Brinquedos resistentes e divertidos',
    comment: 'Comprei vários brinquedos para meu labrador Thor e ele adora todos! São bem resistentes às mordidas.',
    status: 'resolved',
    priority: 'medium'
  },
  {
    type: 'service',
    rating: 5,
    title: 'Salvaram minha gatinha',
    comment: 'Minha Mia teve uma emergência à noite e vocês atenderam prontamente. Muito obrigada por salvarem ela!',
    status: 'resolved',
    priority: 'high'
  }
];

async function insertFeedbackData() {
  try {
    console.log('🚀 Iniciando inserção de dados de feedback...');
    
    // Primeiro, vamos verificar a estrutura da tabela
    console.log('🔍 Verificando estrutura da tabela feedback_pet...');
    
    const { data: testData, error: testError } = await supabase
      .from('feedback_pet')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro ao acessar tabela:', testError.message);
      return;
    }
    
    console.log('✅ Tabela acessível');
    
    // Inserir os feedbacks um por vez
    console.log('📝 Inserindo feedbacks...');
    
    const insertedFeedbacks = [];
    
    for (let i = 0; i < feedbackData.length; i++) {
      const feedback = feedbackData[i];
      
      try {
        const { data, error } = await supabase
          .from('feedback_pet')
          .insert([feedback])
          .select('*');
        
        if (error) {
          console.error(`❌ Erro ao inserir feedback ${i + 1}:`, error.message);
          
          // Tentar inserir apenas os campos básicos
          const basicFeedback = {
            type: feedback.type,
            rating: feedback.rating,
            title: feedback.title,
            comment: feedback.comment
          };
          
          console.log(`🔄 Tentando inserir feedback ${i + 1} com campos básicos...`);
          
          const { data: retryData, error: retryError } = await supabase
            .from('feedback_pet')
            .insert([basicFeedback])
            .select('*');
          
          if (retryError) {
            console.error(`❌ Erro na segunda tentativa para feedback ${i + 1}:`, retryError.message);
          } else {
            insertedFeedbacks.push(...retryData);
            console.log(`✅ Feedback ${i + 1} inserido com campos básicos`);
          }
        } else {
          insertedFeedbacks.push(...data);
          console.log(`✅ Feedback ${i + 1} inserido com sucesso`);
        }
      } catch (err) {
        console.error(`❌ Erro inesperado no feedback ${i + 1}:`, err.message);
      }
    }
    
    console.log(`\n🎉 Processo concluído! ${insertedFeedbacks.length} feedbacks inseridos.`);
    
    if (insertedFeedbacks.length > 0) {
      // Verificar os dados inseridos
      const { data: feedbacks, error: selectError } = await supabase
        .from('feedback_pet')
        .select('id, type, rating, title, comment, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!selectError && feedbacks) {
        console.log('\n📋 Feedbacks inseridos no banco:');
        feedbacks.forEach((feedback, index) => {
          console.log(`${index + 1}. ${feedback.title} (${feedback.rating}⭐)`);
          console.log(`   Tipo: ${feedback.type}`);
          console.log(`   "${feedback.comment.substring(0, 80)}..."`);
          console.log('   ---');
        });
      }
      
      console.log('\n💡 Agora você pode modificar a Home para buscar esses dados do banco!');
      console.log('🔧 Use o método getFeedback() do helpService.ts para buscar os dados.');
    } else {
      console.log('\n⚠️  Nenhum feedback foi inserido. Verifique as permissões do banco.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

insertFeedbackData();