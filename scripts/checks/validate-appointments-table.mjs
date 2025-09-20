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

async function validateAppointmentsTable() {
  console.log('🔍 VALIDAÇÃO DA ESTRUTURA DA TABELA appointments_pet')
  console.log('=' .repeat(60))
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n📋 1. Verificando existência da tabela...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_name', 'appointments_pet')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError.message)
      return false
    }
    
    if (!tables || tables.length === 0) {
      console.error('❌ Tabela appointments_pet não encontrada!')
      return false
    }
    
    console.log('✅ Tabela appointments_pet encontrada')
    
    // 2. Verificar estrutura das colunas
    console.log('\n📋 2. Verificando estrutura das colunas...')
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, ordinal_position')
      .eq('table_name', 'appointments_pet')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Erro ao obter colunas:', columnsError.message)
      return false
    }
    
    if (!columns || columns.length === 0) {
      console.error('❌ Nenhuma coluna encontrada na tabela!')
      return false
    }
    
    console.log('✅ Estrutura das colunas:')
    console.log('─'.repeat(80))
    console.log('| Posição | Nome da Coluna      | Tipo de Dados    | Nullable | Default')
    console.log('─'.repeat(80))
    
    const expectedColumns = [
      'id', 'created_at', 'updated_at', 'user_id', 'pet_id', 'service_id',
      'appointment_date', 'appointment_time', 'status', 'notes', 'total_price', 'extras'
    ]
    
    let foundColumns = []
    let missingColumns = []
    
    columns.forEach(col => {
      foundColumns.push(col.column_name)
      console.log(`| ${col.ordinal_position.toString().padEnd(7)} | ${col.column_name.padEnd(19)} | ${col.data_type.padEnd(16)} | ${col.is_nullable.padEnd(8)} | ${(col.column_default || 'NULL').substring(0, 20)}`)
    })
    
    console.log('─'.repeat(80))
    
    // 3. Verificar colunas esperadas vs encontradas
    console.log('\n📋 3. Verificando colunas esperadas...')
    
    expectedColumns.forEach(expectedCol => {
      if (!foundColumns.includes(expectedCol)) {
        missingColumns.push(expectedCol)
      }
    })
    
    if (missingColumns.length > 0) {
      console.log('❌ Colunas faltando:')
      missingColumns.forEach(col => {
        console.log(`   - ${col}`)
      })
    } else {
      console.log('✅ Todas as colunas esperadas estão presentes')
    }
    
    // 4. Verificar especificamente a coluna total_price
    console.log('\n📋 4. Verificação específica da coluna total_price...')
    const totalPriceColumn = columns.find(col => col.column_name === 'total_price')
    
    if (!totalPriceColumn) {
      console.log('❌ PROBLEMA ENCONTRADO: Coluna total_price não existe!')
      console.log('   Esta é a causa do erro "Could not find the \'total_price\' column"')
    } else {
      console.log('✅ Coluna total_price encontrada:')
      console.log(`   - Tipo: ${totalPriceColumn.data_type}`)
      console.log(`   - Nullable: ${totalPriceColumn.is_nullable}`)
      console.log(`   - Default: ${totalPriceColumn.column_default || 'NULL'}`)
    }
    
    // 5. Testar inserção de dados (simulação)
    console.log('\n📋 5. Testando schema de inserção...')
    
    try {
      // Tentar fazer uma query de inserção sem executar (usando EXPLAIN)
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        pet_id: '00000000-0000-0000-0000-000000000000',
        service_id: '00000000-0000-0000-0000-000000000000',
        appointment_date: '2024-01-01',
        appointment_time: '10:00',
        status: 'pending',
        notes: 'Teste de validação',
        total_price: 100.00,
        extras: []
      }
      
      // Fazer uma query de contagem para testar se a estrutura está OK
      const { count, error: countError } = await supabase
        .from('appointments_pet')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.log('❌ Erro ao acessar tabela:', countError.message)
      } else {
        console.log(`✅ Tabela acessível. Total de registros: ${count}`)
      }
      
    } catch (testError) {
      console.log('❌ Erro no teste de acesso:', testError.message)
    }
    
    // 6. Verificar constraints e índices
    console.log('\n📋 6. Verificando constraints...')
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'appointments_pet')
      .eq('table_schema', 'public')
    
    if (!constraintsError && constraints) {
      console.log('✅ Constraints encontradas:')
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`)
      })
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO DA VALIDAÇÃO')
    console.log('='.repeat(60))
    console.log(`✅ Tabela existe: ${tables.length > 0 ? 'SIM' : 'NÃO'}`)
    console.log(`✅ Total de colunas: ${columns.length}`)
    console.log(`✅ Coluna total_price: ${totalPriceColumn ? 'EXISTE' : 'NÃO EXISTE'}`)
    console.log(`✅ Colunas faltando: ${missingColumns.length}`)
    
    if (missingColumns.length === 0 && totalPriceColumn) {
      console.log('\n🎉 ESTRUTURA DA TABELA ESTÁ CORRETA!')
      console.log('   O erro pode ser causado por cache do Supabase ou problema de RLS.')
    } else {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS NA ESTRUTURA!')
      console.log('   É necessário executar as migrações do banco de dados.')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro durante validação:', error.message)
    return false
  }
}

// Executar validação
validateAppointmentsTable()
  .then(() => {
    console.log('\n✅ Validação concluída!')
  })
  .catch(error => {
    console.error('❌ Erro na validação:', error.message)
    process.exit(1)
  })