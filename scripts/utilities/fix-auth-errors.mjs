import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthErrors() {
  console.log('🔍 Testando erros de autenticação...\n')

  // 1. Testar getUser() sem sessão ativa
  console.log('1. Testando supabase.auth.getUser() sem sessão:')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('   ✅ Sucesso - User:', user ? 'Logado' : 'Não logado')
    console.log('   ✅ Error:', error ? error.message : 'Nenhum erro')
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
    console.log('   ❌ Status:', error.status || 'N/A')
  }

  // 2. Testar getSession()
  console.log('\n2. Testando supabase.auth.getSession():')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('   ✅ Sucesso - Session:', session ? 'Ativa' : 'Inativa')
    console.log('   ✅ Error:', error ? error.message : 'Nenhum erro')
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
    console.log('   ❌ Status:', error.status || 'N/A')
  }

  // 3. Simular chamada do petsService.createPet()
  console.log('\n3. Simulando petsService.createPet() sem autenticação:')
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('   ⚠️  User not authenticated - Este é o erro esperado')
      console.log('   ⚠️  Deveria retornar erro 400 ou similar')
    } else {
      console.log('   ✅ Usuário autenticado:', user.id)
    }
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
    console.log('   ❌ Status:', error.status || 'N/A')
  }

  // 4. Testar consulta direta à tabela pets_pet
  console.log('\n4. Testando consulta direta à tabela pets_pet:')
  try {
    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .limit(1)

    if (error) {
      console.log('   ❌ Erro na consulta:', error.message)
      console.log('   ❌ Code:', error.code)
      console.log('   ❌ Details:', error.details)
    } else {
      console.log('   ✅ Consulta bem-sucedida, registros:', data?.length || 0)
    }
  } catch (error) {
    console.log('   ❌ Erro capturado:', error.message)
  }

  // 5. Testando inserção na tabela pets_pet sem owner_id (deve falhar por RLS)
  console.log('\n5. Testando inserção na tabela pets_pet sem owner_id:')
  try {
    const { data: insertData, error: insertError } = await supabase
      .from('pets_pet')
      .insert({
        name: 'Teste Pet',
        species: 'Cachorro',
        breed: 'Labrador',
        age: '2 anos',
        weight: '25kg',
        height: '60cm',
        color: 'Dourado',
        gender: 'Macho'
      })
      .select()
    
    if (insertError) {
      console.log('   ❌ Erro na inserção (esperado por RLS):', insertError.message)
      console.log('   ❌ Code:', insertError.code)
    } else {
      console.log('   ⚠️  Inserção bem-sucedida (não deveria acontecer):', insertData)
    }
  } catch (error) {
    console.log('   ❌ Erro na inserção:', error.message)
  }

  // 6. Testando inserção com owner_id válido mas sem autenticação
  console.log('\n6. Testando inserção com owner_id mas sem autenticação:')
  try {
    const { data: insertData2, error: insertError2 } = await supabase
      .from('pets_pet')
      .insert({
        name: 'Teste Pet 2',
        species: 'Gato',
        breed: 'Persa',
        age: '1 ano',
        weight: '4kg',
        height: '30cm',
        color: 'Branco',
        gender: 'Fêmea',
        owner_id: '00000000-0000-0000-0000-000000000000' // UUID fake
      })
      .select()
    
    if (insertError2) {
      console.log('   ❌ Erro na inserção (esperado por RLS):', insertError2.message)
      console.log('   ❌ Code:', insertError2.code)
    } else {
      console.log('   ⚠️  Inserção bem-sucedida (não deveria acontecer):', insertData2)
    }
  } catch (error) {
    console.log('   ❌ Erro na inserção:', error.message)
  }

  console.log('\n📋 Resumo dos testes concluído!')
}

testAuthErrors().catch(console.error)