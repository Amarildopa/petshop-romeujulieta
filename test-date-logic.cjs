// Teste da lógica de datas do sistema

// Função original getWeekStart (domingo como início)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is 0, so no adjustment needed
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString().split('T')[0];
}

// Função getPreviousWeekStart (domingo da semana anterior)
function getPreviousWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day - 7; // Go back one week from current Sunday
  const previousSunday = new Date(d.setDate(diff));
  previousSunday.setHours(0, 0, 0, 0);
  return previousSunday.toISOString().split('T')[0];
}

// Teste com data atual
const hoje = new Date();
console.log('=== TESTE DA LÓGICA DE DATAS ===');
console.log('Data atual:', hoje.toISOString());
console.log('Data atual (Brasil):', hoje.toLocaleDateString('pt-BR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}));
console.log('Dia da semana (0=domingo, 6=sábado):', hoje.getDay());

console.log('\n=== CÁLCULOS ===');
const semanaAtual = getWeekStart(hoje);
const semanaAnterior = getPreviousWeekStart(hoje);

console.log('Início da semana atual (domingo):', semanaAtual);
console.log('Início da semana anterior (domingo):', semanaAnterior);

// Converter para datas legíveis
const domingoAtual = new Date(semanaAtual);
const domingoAnterior = new Date(semanaAnterior);

console.log('\n=== SEMANA ATUAL ===');
console.log('Domingo:', domingoAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
for (let i = 1; i <= 6; i++) {
  const dia = new Date(domingoAtual);
  dia.setDate(domingoAtual.getDate() + i);
  const nomes = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  console.log(`${nomes[i]}:`, dia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
}

console.log('\n=== SEMANA ANTERIOR ===');
console.log('Domingo:', domingoAnterior.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
for (let i = 1; i <= 6; i++) {
  const dia = new Date(domingoAnterior);
  dia.setDate(domingoAnterior.getDate() + i);
  const nomes = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  console.log(`${nomes[i]}:`, dia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
}

console.log('\n=== LÓGICA DO CARROSSEL ===');
console.log('O carrossel busca registros com week_start =', semanaAnterior);
console.log('Isso significa fotos da semana de', domingoAnterior.toLocaleDateString('pt-BR'), 'a', new Date(domingoAnterior.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'));