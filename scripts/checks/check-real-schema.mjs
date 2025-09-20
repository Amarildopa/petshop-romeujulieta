import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Verificando schema real da tabela pets_pet...\n')

  try {
    // Verificar schema da tabela pets_pet
    const { data, error } = await supabase.rpc('get_table_schema', { 
      table_name: 'pets_pet' 
    })

    if (error) {
      console.log('❌ Erro ao buscar schema via RPC:', error.message)
      
      // Tentar método alternativo - inserir dados de teste para ver o erro
      console.log('\n🔄 Tentando inserção de teste para identificar tipos...')
      
      const testInserts = [
        // Teste 1: weight e height como string
        {
          name: 'Teste String',
          species: 'Cachorro',
          breed: 'Test',
          age: '1 ano',
          weight: '25kg',
          height: '60cm',
          color: 'Marrom',
          gender: 'Macho'
        },
        // Teste 2: weight e height como número
        {
          name: 'Teste Numeric',
          species: 'Gato',
          breed: 'Test',
          age: '2 anos',
          weight: 25,
          height: 60,
          color: 'Preto',
          gender: 'Fêmea'
        },
        // Teste 3: weight e height como string numérica
        {
          name: 'Teste String Numeric',
          species: 'Cachorro',
          breed: 'Test',
          age: '3 anos',
          weight: '25',
          height: '60',
          color: 'Branco',
          gender: 'Macho'
        }
      ]

      for (let i = 0; i < testInserts.length; i++) {
        console.log(`\nTeste ${i + 1}: ${testInserts[i].name}`)
        const { data: insertData, error: insertError } = await supabase
          .from('pets_pet')
          .insert(testInserts[i])
          .select()

        if (insertError) {
          console.log(`   ❌ Erro: ${insertError.message}`)
          console.log(`   ❌ Code: ${insertError.code}`)
          if (insertError.hint) {
            console.log(`   💡 Hint: ${insertError.hint}`)
          }
        } else {
          console.log(`   ✅ Sucesso: Inserção aceita`)
          console.log(`   📊 Dados inseridos:`, insertData)
        }
      }
    } else {
      console.log('✅ Schema encontrado:', data)
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }

  console.log('\n📋 Verificação de schema concluída!')
}

checkSchema()