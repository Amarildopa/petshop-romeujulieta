// Teste da lógica CORRETA de semana
// Semana: Segunda a Domingo
// Hoje: 15/09/2025 (Segunda) - primeiro dia da semana atual
// Semana anterior: 08/09 a 14/09/2025

// Função CORRETA para encontrar o início da semana (segunda-feira)
function getCorrectWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=domingo, 1=segunda, 2=terça...
  
  // Calcular quantos dias voltar para chegar na segunda-feira
  let daysToSubtract;
  if (day === 0) {
    // Se é domingo, voltar 6 dias para chegar na segunda anterior
    daysToSubtract = 6;
  } else {
    // Se é segunda a sábado, voltar (day - 1) dias
    daysToSubtract = day - 1;
  }
  
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// Função CORRETA para encontrar o início da semana anterior
function getCorrectPreviousWeekStart(date) {
  const currentWeekStart = getCorrectWeekStart(date);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  return previousWeekStart.toISOString().split('T')[0];
}

// Função para formatar range da semana
function getWeekRangeString(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return `${formatDate(start)} a ${formatDate(end)}`;
}

console.log('=== TESTE DA LÓGICA CORRETA DE SEMANA ===');
console.log('Conceito: Segunda a Domingo');
console.log('');

// Teste com data atual CORRETA
const hoje = new Date('2025-09-15T12:00:00'); // Segunda-feira 15/09/2025
console.log('Data atual:', hoje.toLocaleDateString('pt-BR'));
console.log('Dia da semana:', hoje.toLocaleDateString('pt-BR', { weekday: 'long' }));
console.log('Dia da semana (número):', hoje.getDay(), '(0=domingo, 1=segunda)');
console.log('');

// Calcular semana atual
const semanaAtualInicio = getCorrectWeekStart(hoje);
console.log('Início da semana atual (segunda):', semanaAtualInicio);
console.log('Range da semana atual:', getWeekRangeString(semanaAtualInicio));
console.log('');

// Calcular semana anterior
const semanaAnteriorInicio = getCorrectPreviousWeekStart(hoje);
console.log('Início da semana anterior (segunda):', semanaAnteriorInicio);
console.log('Range da semana anterior:', getWeekRangeString(semanaAnteriorInicio));
console.log('');

console.log('=== LÓGICA DO CARROSSEL ===');
console.log('O carrossel deve buscar fotos da SEMANA ANTERIOR');
console.log('Deve buscar registros com week_start =', semanaAnteriorInicio);
console.log('Que corresponde à semana de', getWeekRangeString(semanaAnteriorInicio));
console.log('');

// Teste com outros dias da semana para validar
console.log('=== VALIDAÇÃO COM OUTROS DIAS ===');
const diasTeste = [
  { data: '2025-09-15T12:00:00', dia: 'Segunda' },
  { data: '2025-09-16T12:00:00', dia: 'Terça' },
  { data: '2025-09-17T12:00:00', dia: 'Quarta' },
  { data: '2025-09-18T12:00:00', dia: 'Quinta' },
  { data: '2025-09-19T12:00:00', dia: 'Sexta' },
  { data: '2025-09-20T12:00:00', dia: 'Sábado' },
  { data: '2025-09-21T12:00:00', dia: 'Domingo' }
];

diasTeste.forEach(teste => {
  const data = new Date(teste.data);
  const inicioSemana = getCorrectWeekStart(data);
  console.log(`${teste.dia} (${teste.data.split('T')[0]}) -> Início da semana: ${inicioSemana}`);
});

console.log('');
console.log('=== COMPARAÇÃO COM LÓGICA ATUAL DO SISTEMA ===');
console.log('LÓGICA ATUAL (ERRADA): Semana começa no domingo');
console.log('LÓGICA CORRETA: Semana começa na segunda-feira');
console.log('');
console.log('Hoje é segunda 15/09/2025:');
console.log('- Semana atual: 15/09 a 21/09 (week_start = 2025-09-15)');
console.log('- Semana anterior: 08/09 a 14/09 (week_start = 2025-09-08)');
console.log('');
console.log('O carrossel deve buscar week_start = 2025-09-08');