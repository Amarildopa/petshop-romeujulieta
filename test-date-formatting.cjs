// Teste para verificar formatação de datas no carrossel
// Dados fornecidos pelo usuário mostram discrepância entre bath_date e dia_da_semana

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

// Função formatDate do componente React
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
}

// Função para obter dia da semana em português
function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { weekday: 'long' });
}

console.log('🔍 ANÁLISE DAS DATAS NO CARROSSEL');
console.log('================================');
console.log('');

console.log('📊 Verificando cada registro:');
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
    console.log(`   ❌ DISCREPÂNCIA ENCONTRADA!`);
  } else {
    console.log(`   ✅ Correto`);
  }
  console.log('');
});

console.log('🎯 DIAGNÓSTICO:');
console.log('- O tooltip mostra apenas dia/mês (formatDate)');
console.log('- O problema pode estar na interpretação da data pelo JavaScript');
console.log('- Datas em formato ISO podem ter problemas de timezone');
console.log('');

console.log('🔧 TESTANDO DIFERENTES FORMAS DE CRIAR A DATA:');
console.log('');

const testDate = '2025-09-09';
console.log(`Data de teste: ${testDate}`);
console.log('');

// Teste 1: new Date(string) - pode ter problema de timezone
const date1 = new Date(testDate);
console.log('1. new Date(string):');
console.log(`   Resultado: ${date1}`);
console.log(`   Dia da semana: ${date1.toLocaleDateString('pt-BR', { weekday: 'long' })}`);
console.log(`   Data formatada: ${date1.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`);
console.log('');

// Teste 2: new Date com partes separadas (mais confiável)
const [year, month, day] = testDate.split('-').map(Number);
const date2 = new Date(year, month - 1, day); // month é 0-indexed
console.log('2. new Date(year, month-1, day):');
console.log(`   Resultado: ${date2}`);
console.log(`   Dia da semana: ${date2.toLocaleDateString('pt-BR', { weekday: 'long' })}`);
console.log(`   Data formatada: ${date2.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`);
console.log('');

console.log('💡 SOLUÇÃO RECOMENDADA:');
console.log('Usar new Date(year, month-1, day) para evitar problemas de timezone');