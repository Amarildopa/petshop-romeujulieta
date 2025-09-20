import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function validateTableDirect() {
  console.log('🔍 VALIDAÇÃO DIRETA DA TABELA appointments_pet')
  console.log('=' .repeat(60))
  
  try {
    // 1. Testar acesso direto à tabela
    console.log('\n📋 1. Testando acesso direto à tabela...')
    
    const { data, error, count } = await supabase
      .from('appointments_pet')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ ERRO AO ACESSAR TABELA:', error.message)
      console.log('   Código:', error.code)
      console.log('   Detalhes:', error.details)
      
      // Verificar se é erro de coluna específica
      if (error.message.includes('total_price')) {
        console.log('\n🎯 PROBLEMA IDENTIFICADO: Coluna total_price não existe na tabela real!')
        console.log('   Isso confirma que o schema local está diferente do banco de dados.')
      }
      
      return false
    }
    
    console.log(`✅ Tabela acessível! Total de registros: ${count || 0}`)
    
    // 2. Testar inserção com dados mínimos (sem total_price)
    console.log('\n📋 2. Testando estrutura sem total_price...')
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('appointments_pet')
        .select('id, created_at, user_id, pet_id, service_id, appointment_date, appointment_time, status, notes, extras')
        .limit(1)
      
      if (testError) {
        console.log('❌ Erro na consulta de teste:', testError.message)
      } else {
        console.log('✅ Consulta sem total_price funcionou!')
        if (testData && testData.length > 0) {
          console.log('📋 Estrutura encontrada:')
          Object.keys(testData[0]).forEach(key => {
            console.log(`   - ${key}: ${typeof testData[0][key]}`)
          })
        }
      }
    } catch (selectError) {
      console.log('❌ Erro no teste de seleção:', selectError.message)
    }
    
    // 3. Testar com total_price para confirmar o erro
    console.log('\n📋 3. Testando com total_price para confirmar erro...')
    
    try {
      const { data: testPrice, error: priceError } = await supabase
        .from('appointments_pet')
        .select('total_price')
        .limit(1)
      
      if (priceError) {
        console.log('❌ CONFIRMADO: Erro ao acessar total_price:', priceError.message)
        console.log('   A coluna total_price realmente não existe na tabela!')
      } else {
        console.log('✅ Coluna total_price existe e é acessível')
      }
    } catch (priceTestError) {
      console.log('❌ Erro no teste de total_price:', priceTestError.message)
    }
    
    // 4. Listar todas as colunas disponíveis fazendo uma consulta real
    console.log('\n📋 4. Descobrindo colunas reais da tabela...')
    
    try {
      const { data: sampleData, error: sampleError } = await supabase
        .from('appointments_pet')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.log('❌ Erro ao obter dados de amostra:', sampleError.message)
      } else {
        if (sampleData && sampleData.length > 0) {
          console.log('✅ Colunas reais encontradas na tabela:')
          const realColumns = Object.keys(sampleData[0])
          realColumns.forEach((col, index) => {
            console.log(`   ${index + 1}. ${col}`)
          })
          
          // Verificar colunas esperadas vs reais
          const expectedColumns = [
            'id', 'created_at', 'updated_at', 'user_id', 'pet_id', 'service_id',
            'appointment_date', 'appointment_time', 'status', 'notes', 'total_price', 'extras'
          ]
          
          console.log('\n📊 Comparação de colunas:')
          expectedColumns.forEach(expected => {
            const exists = realColumns.includes(expected)
            console.log(`   ${exists ? '✅' : '❌'} ${expected}`)
          })
          
        } else {
          console.log('⚠️  Tabela existe mas está vazia. Não é possível determinar estrutura.')
        }
      }
    } catch (discoveryError) {
      console.log('❌ Erro na descoberta de colunas:', discoveryError.message)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro geral na validação:', error.message)
    return false
  }
}

// Executar validação
validateTableDirect()
  .then(() => {
    console.log('\n' + '='.repeat(60))
    console.log('📊 CONCLUSÃO DA ANÁLISE')
    console.log('='.repeat(60))
    console.log('Se o erro "total_price column not found" foi confirmado,')
    console.log('isso significa que:')
    console.log('1. O schema local (supabase.ts) está desatualizado')
    console.log('2. A migração da tabela não foi executada corretamente')
    console.log('3. Há diferença entre desenvolvimento e produção')
    console.log('\n✅ Análise concluída!')
  })
  .catch(error => {
    console.error('❌ Erro na análise:', error.message)
    process.exit(1)
  })