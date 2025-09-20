import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSchemaMismatch() {
  console.log('🔍 Identificando discrepância de schema...\n')

  // Teste 1: Inserir com valores numéricos puros
  console.log('1. Testando inserção com valores numéricos:')
  try {
    const { data, error } = await supabase
      .from('pets_pet')
      .insert({
        name: 'Teste Numeric',
        species: 'Cachorro',
        breed: 'Test',
        age: '2 anos',
        weight: 25.5,  // Número puro
        height: 60,    // Número puro
        color: 'Marrom',
        gender: 'Macho'
      })
      .select()

    if (error) {
      console.log('   ❌ Erro com números:', error.message)
      console.log('   ❌ Code:', error.code)
    } else {
      console.log('   ✅ Sucesso com números!')
      // Limpar o registro de teste
      await supabase.from('pets_pet').delete().eq('id', data[0].id)
    }
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
  }

  // Teste 2: Inserir com strings numéricas
  console.log('\n2. Testando inserção com strings numéricas:')
  try {
    const { data, error } = await supabase
      .from('pets_pet')
      .insert({
        name: 'Teste String Numeric',
        species: 'Gato',
        breed: 'Test',
        age: '1 ano',
        weight: '4.5',  // String numérica
        height: '30',   // String numérica
        color: 'Preto',
        gender: 'Fêmea'
      })
      .select()

    if (error) {
      console.log('   ❌ Erro com strings numéricas:', error.message)
      console.log('   ❌ Code:', error.code)
    } else {
      console.log('   ✅ Sucesso com strings numéricas!')
      // Limpar o registro de teste
      await supabase.from('pets_pet').delete().eq('id', data[0].id)
    }
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
  }

  // Teste 3: Inserir com strings com unidades (como o frontend envia)
  console.log('\n3. Testando inserção com strings com unidades:')
  try {
    const { data, error } = await supabase
      .from('pets_pet')
      .insert({
        name: 'Teste String Units',
        species: 'Cachorro',
        breed: 'Test',
        age: '3 anos',
        weight: '15kg',  // String com unidade
        height: '50cm',  // String com unidade
        color: 'Branco',
        gender: 'Macho'
      })
      .select()

    if (error) {
      console.log('   ❌ Erro com strings com unidades:', error.message)
      console.log('   ❌ Code:', error.code)
    } else {
      console.log('   ✅ Sucesso com strings com unidades!')
      // Limpar o registro de teste
      await supabase.from('pets_pet').delete().eq('id', data[0].id)
    }
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
  }

  console.log('\n📋 Análise de Schema:')
  console.log('   • Se apenas números funcionam: campos são NUMERIC/INTEGER')
  console.log('   • Se strings numéricas funcionam: campos são NUMERIC com conversão')
  console.log('   • Se strings com unidades funcionam: campos são TEXT')
  console.log('   • Se nada funciona: problema de RLS/autenticação')

  console.log('\n🔧 Recomendações:')
  console.log('   1. Atualizar interface Pet para usar number em weight/height')
  console.log('   2. Converter strings para números no frontend antes de enviar')
  console.log('   3. Ou alterar schema do banco para TEXT se preferir manter unidades')
}

fixSchemaMismatch()