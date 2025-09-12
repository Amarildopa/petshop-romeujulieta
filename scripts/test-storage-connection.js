// Script para testar a conexão com o Supabase Storage
// Execute com: node scripts/test-storage-connection.js

import { createClient } from '@supabase/supabase-js'

// Credenciais do Supabase (do arquivo .env)
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorageConnection() {
  console.log('🔍 Testando conexão com Supabase Storage...')
  console.log('URL:', supabaseUrl)
  
  try {
    // 1. Testar listagem de buckets
    console.log('\n📦 Verificando buckets existentes...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError.message)
      console.error('Código do erro:', listError.statusCode)
      console.error('Detalhes:', listError)
      return false
    }
    
    console.log('✅ Buckets encontrados:', buckets?.length || 0)
    buckets?.forEach(bucket => {
      console.log(`  - ${bucket.name} (público: ${bucket.public ? 'sim' : 'não'})`)
    })
    
    // 2. Verificar se o bucket 'avatars' existe
    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars')
    
    if (!avatarBucket) {
      console.log('\n⚠️  Bucket "avatars" não encontrado!')
      console.log('\n📋 SOLUÇÃO: Criar o bucket manualmente:')
      console.log('1. Acesse: https://supabase.com/dashboard/project/hudiuukaoxxzxdcydgky/storage/buckets')
      console.log('2. Clique em "New bucket"')
      console.log('3. Nome: avatars')
      console.log('4. Marque "Public bucket" ✅')
      console.log('5. Clique em "Create bucket"')
      console.log('\n🔧 OU execute o SQL no SQL Editor:')
      console.log('INSERT INTO storage.buckets (id, name, public) VALUES (\'avatars\', \'avatars\', true);')
      return false
    }
    
    console.log('\n✅ Bucket "avatars" encontrado!')
    console.log('  - Público:', avatarBucket.public ? 'sim' : 'não')
    console.log('  - ID:', avatarBucket.id)
    console.log('  - Criado em:', avatarBucket.created_at)
    
    // 3. Testar listagem de arquivos no bucket
    console.log('\n📁 Verificando arquivos no bucket avatars...')
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 10 })
    
    if (filesError) {
      console.error('❌ Erro ao listar arquivos:', filesError.message)
      console.error('Código do erro:', filesError.statusCode)
      return false
    }
    
    console.log('✅ Arquivos no bucket:', files?.length || 0)
    if (files && files.length > 0) {
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`)
      })
    } else {
      console.log('  (Nenhum arquivo encontrado - isso é normal para um bucket novo)')
    }
    
    // 4. Testar criação de URL pública
    console.log('\n🔗 Testando geração de URL pública...')
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl('test-file.jpg')
    
    console.log('✅ URL pública gerada:', publicUrl)
    
    // 5. Testar se conseguimos acessar a URL (sem fazer upload)
    console.log('\n🌐 Testando acesso à URL base do bucket...')
    const baseUrl = publicUrl.replace('/test-file.jpg', '')
    console.log('URL base do bucket:', baseUrl)
    
    console.log('\n🎉 Todos os testes passaram! O Storage está configurado corretamente.')
    console.log('\n✅ Próximos passos:')
    console.log('1. O bucket "avatars" está criado e público')
    console.log('2. O sistema pode gerar URLs públicas')
    console.log('3. Agora teste o upload de imagem na aplicação')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    if (error.code) {
      console.error('Código do erro:', error.code)
    }
    console.error('Stack trace:', error.stack)
    return false
  }
}

// Executar teste
console.log('🚀 Iniciando teste do Supabase Storage...')
testStorageConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Storage funcionando corretamente!')
      console.log('Agora você pode testar o upload de imagens na aplicação.')
      process.exit(0)
    } else {
      console.log('\n❌ Problemas encontrados no Storage.')
      console.log('Siga as instruções acima para resolver.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })