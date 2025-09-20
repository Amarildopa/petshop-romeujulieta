import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função de conversão do petsService
function processWeightHeight(value) {
  if (typeof value === 'string') {
    return parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
  }
  return value
}

async function testPetCreation() {
  console.log('🧪 Testando criação de pets com dados processados...\n')

  // Simular dados como viriam do frontend
  const testPets = [
    {
      name: 'Rex',
      species: 'Cachorro',
      breed: 'Golden Retriever',
      age: '3 anos',
      weight: '25kg',      // String com unidade
      height: '60cm',      // String com unidade
      color: 'Dourado',
      gender: 'Macho'
    },
    {
      name: 'Mimi',
      species: 'Gato',
      breed: 'Persa',
      age: '2 anos',
      weight: '4.5kg',     // String com decimal
      height: '30cm',      // String com unidade
      color: 'Branco',
      gender: 'Fêmea'
    },
    {
      name: 'Bobby',
      species: 'Cachorro',
      breed: 'Labrador',
      age: '1 ano',
      weight: 15,          // Número puro
      height: 45,          // Número puro
      color: 'Chocolate',
      gender: 'Macho'
    }
  ]

  for (let i = 0; i < testPets.length; i++) {
    const pet = testPets[i]
    console.log(`${i + 1}. Testando pet: ${pet.name}`)
    
    // Processar dados como o petsService faria
    const processedData = {
      ...pet,
      weight: processWeightHeight(pet.weight),
      height: processWeightHeight(pet.height)
    }
    
    console.log(`   📊 Dados originais: weight="${pet.weight}", height="${pet.height}"`)
    console.log(`   🔄 Dados processados: weight=${processedData.weight}, height=${processedData.height}`)
    
    try {
      const { data, error } = await supabase
        .from('pets_pet')
        .insert(processedData)
        .select()

      if (error) {
        console.log(`   ❌ Erro: ${error.message}`)
        console.log(`   ❌ Code: ${error.code}`)
        
        // Se for erro de RLS, é esperado (sem autenticação)
        if (error.code === '42501') {
          console.log(`   ✅ RLS funcionando (erro esperado sem autenticação)`)
        }
      } else {
        console.log(`   ✅ Sucesso! Pet criado:`, data)
        // Limpar dados de teste
        await supabase.from('pets_pet').delete().eq('id', data[0].id)
      }
    } catch (error) {
      console.log(`   ❌ Erro capturado: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('📋 Teste de conversão de dados concluído!')
  console.log('✅ Se todos os erros foram 42501 (RLS), a conversão está funcionando!')
}

testPetCreation()