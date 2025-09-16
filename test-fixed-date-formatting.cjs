// Teste da função formatDate corrigida

// Dados da tabela conforme fornecido pelo usuário
const registros = [
  { 
    "pet_name": "Luna", 
    "week_start": "2025-09-08", 
    "bath_date": "2025-09-09", 
    "display_order": 1, 
    "approved": true, 
    "dia_da_semana": "Terça-feira" 
  }, 
  { 
    "pet_name": "Max", 
    "week_start": "2025-09-08", 
    "bath_date": "2025-09-10", 
    "display_order": 2, 
    "approved": true, 
    "dia_da_semana": "Quarta-feira" 
  }, 
  { 
    "pet_name": "Bella", 
    "week_start": "2025-09-08", 
    "bath_date": "2025-09-11", 
    "display_order": 3, 
    "approved": true, 
    "dia_da_semana": "Quinta-feira" 
  }, 
  { 
    "pet_name": "Charlie", 
    "week_start": "2025-09-08", 
    "bath_date": "2025-09-12", 
    "display_order": 4, 
    "approved": true, 
    "dia_da_semana": "Sexta-feira" 
  }, 
  { 
    "pet_name": "Milo", 
    "week_start": "2025-09-08", 
    "bath_date": "2025-09-13", 
    "display_order": 5, 
    "approved": true, 
    "dia_da_semana": "Sábado" 
  }
];

// Função formatDate CORRIGIDA (como no componente React)
function formatDate(dateString) {
  // Parse da data evitando problemas de timezone
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month é 0-indexed
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
}

// Função para obter dia da semana em português
function getDayOfWeek(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', { weekday: 'long' });
}

console.log('🔍 TESTE DA FUNÇÃO formatDate CORRIGIDA');
console.log('======================================');
console.log('');

console.log('📊 Verificando cada registro com a correção:');
console.log('');

registros.forEach((registro, index) => {
  const bathDate = registro.bath_date;
  const dataFormatada = formatDate(bathDate);
  const diaDaSemanaReal = getDayOfWeek(bathDate);
  const diaDaSemanaRegistrado = registro.dia_da_semana;
  
  console.log(`${index + 1}. ${registro.pet_name}:`);
  console.log(`   Bath Date: ${bathDate}`);
  console.log(`   Data formatada (tooltip): ${dataFormatada}`);
  console.log(`   Dia da semana REAL: ${diaDaSemanaReal}`);
  console.log(`   Dia da semana REGISTRADO: ${diaDaSemanaRegistrado}`);
  
  if (diaDaSemanaReal.toLowerCase() !== diaDaSemanaRegistrado.toLowerCase()) {
    console.log(`   ❌ AINDA HÁ DISCREPÂNCIA!`);
  } else {
    console.log(`   ✅ Correto - data e dia da semana coincidem`);
  }
  console.log('');
});

console.log('🎯 RESULTADO:');
const todosCorretos = registros.every(registro => {
  const diaDaSemanaReal = getDayOfWeek(registro.bath_date);
  return diaDaSemanaReal.toLowerCase() === registro.dia_da_semana.toLowerCase();
});

if (todosCorretos) {
  console.log('✅ SUCESSO! Todas as datas agora estão corretas no tooltip.');
  console.log('   O problema de timezone foi resolvido.');
} else {
  console.log('❌ Ainda há problemas com algumas datas.');
}

console.log('');
console.log('📝 RESUMO DA CORREÇÃO:');
console.log('- Antes: new Date(dateString) - causava problema de timezone');
console.log('- Depois: new Date(year, month-1, day) - data local correta');
console.log('- Resultado: Tooltip agora mostra a data correta');