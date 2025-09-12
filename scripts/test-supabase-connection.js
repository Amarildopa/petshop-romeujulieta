#!/usr/bin/env node

/**
 * Script de Teste de Conexão com Supabase
 * PetShop Romeo & Julieta
 * 
 * Este script testa a conectividade e funcionalidades básicas do Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const logSection = (title) => {
  console.log('\n' + '='.repeat(50))
  log(`🔍 ${title}`, 'cyan')
  console.log('='.repeat(50))
}

const logSuccess = (message) => log(`✅ ${message}`, 'green')
const logError = (message) => log(`❌ ${message}`, 'red')
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow')
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue')

// Testes
const tests = {
  async connection() {
    logSection('TESTE DE CONEXÃO')
    
    try {
      const { data, error } = await supabase
        .from('profiles_pet')
        .select('count')
        .limit(1)
      
      if (error) {
        logError(`Erro de conexão: ${error.message}`)
        return false
      }
      
      logSuccess('Conexão com Supabase estabelecida com sucesso!')
      return true
    } catch (err) {
      logError(`Erro inesperado: ${err.message}`)
      return false
    }
  },

  async tables() {
    logSection('TESTE DE TABELAS')
    
    const expectedTables = [
      'profiles_pet',
      'pets_pet',
      'services_pet',
      'appointments_pet',
      'products_pet',
      'admin_users_pet',
      'system_settings_pet'
    ]
    
    const results = []
    
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          logError(`Tabela ${table}: ${error.message}`)
          results.push(false)
        } else {
          logSuccess(`Tabela ${table}: OK`)
          results.push(true)
        }
      } catch (err) {
        logError(`Tabela ${table}: ${err.message}`)
        results.push(false)
      }
    }
    
    const successCount = results.filter(Boolean).length
    const totalCount = results.length
    
    logInfo(`Resultado: ${successCount}/${totalCount} tabelas funcionando`)
    
    return successCount === totalCount
  },

  async rls() {
    logSection('TESTE DE ROW LEVEL SECURITY')
    
    try {
      // Testar acesso sem autenticação
      const { data, error } = await supabase
        .from('profiles_pet')
        .select('*')
        .limit(1)
      
      if (error && error.message.includes('permission denied')) {
        logSuccess('RLS está funcionando corretamente (acesso negado sem auth)')
        return true
      } else if (data) {
        logWarning('RLS pode não estar configurado corretamente')
        return false
      } else {
        logError(`Erro inesperado no RLS: ${error.message}`)
        return false
      }
    } catch (err) {
      logError(`Erro no teste de RLS: ${err.message}`)
      return false
    }
  },

  async auth() {
    logSection('TESTE DE AUTENTICAÇÃO')
    
    try {
      // Testar se o serviço de auth está funcionando
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        logError(`Erro no serviço de auth: ${error.message}`)
        return false
      }
      
      logSuccess('Serviço de autenticação funcionando')
      logInfo(`Sessão atual: ${data.session ? 'Logado' : 'Não logado'}`)
      
      return true
    } catch (err) {
      logError(`Erro inesperado no auth: ${err.message}`)
      return false
    }
  },

  async storage() {
    logSection('TESTE DE STORAGE')
    
    try {
      // Testar se o storage está funcionando
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        logError(`Erro no storage: ${error.message}`)
        return false
      }
      
      logSuccess('Serviço de storage funcionando')
      logInfo(`Buckets disponíveis: ${data.length}`)
      
      return true
    } catch (err) {
      logError(`Erro inesperado no storage: ${err.message}`)
      return false
    }
  },

  async realtime() {
    logSection('TESTE DE REALTIME')
    
    try {
      // Testar se o realtime está funcionando
      const channel = supabase.channel('test-channel')
      
      const promise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          logWarning('Timeout no teste de realtime')
          resolve(false)
        }, 5000)
        
        channel.subscribe((status) => {
          clearTimeout(timeout)
          if (status === 'SUBSCRIBED') {
            logSuccess('Serviço de realtime funcionando')
            channel.unsubscribe()
            resolve(true)
          } else if (status === 'CHANNEL_ERROR') {
            logError('Erro no serviço de realtime')
            resolve(false)
          }
        })
      })
      
      return await promise
    } catch (err) {
      logError(`Erro inesperado no realtime: ${err.message}`)
      return false
    }
  },

  async adminSetup() {
    logSection('TESTE DE CONFIGURAÇÃO ADMINISTRATIVA')
    
    try {
      // Verificar se as tabelas administrativas existem
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users_pet')
        .select('count')
        .limit(1)
      
      if (adminError) {
        logError(`Tabela admin_users_pet não acessível: ${adminError.message}`)
        return false
      }
      
      // Verificar configurações do sistema
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings_pet')
        .select('key, value')
        .limit(5)
      
      if (settingsError) {
        logError(`Tabela system_settings_pet não acessível: ${settingsError.message}`)
        return false
      }
      
      logSuccess('Tabelas administrativas funcionando')
      logInfo(`Configurações encontradas: ${settings.length}`)
      
      return true
    } catch (err) {
      logError(`Erro na configuração administrativa: ${err.message}`)
      return false
    }
  }
}

// Executar todos os testes
async function runTests() {
  log('🚀 INICIANDO TESTES DE CONEXÃO COM SUPABASE', 'bright')
  log(`URL: ${supabaseUrl}`, 'blue')
  log(`Key: ${supabaseKey.substring(0, 20)}...`, 'blue')
  
  const results = {}
  
  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      results[testName] = await testFn()
    } catch (err) {
      logError(`Erro no teste ${testName}: ${err.message}`)
      results[testName] = false
    }
  }
  
  // Relatório final
  logSection('RELATÓRIO FINAL')
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  log(`Testes passou: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow')
  
  console.log('\nDetalhes:')
  for (const [testName, passed] of Object.entries(results)) {
    const status = passed ? '✅' : '❌'
    const color = passed ? 'green' : 'red'
    log(`  ${status} ${testName}`, color)
  }
  
  if (passedTests === totalTests) {
    log('\n🎉 TODOS OS TESTES PASSARAM! Sistema pronto para uso.', 'green')
    process.exit(0)
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM. Verifique a configuração.', 'yellow')
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(err => {
    logError(`Erro fatal: ${err.message}`)
    process.exit(1)
  })
}

export { runTests, tests }
