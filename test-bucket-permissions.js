import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

console.log('🔧 Testando permissões do bucket avatars_novo...')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NÃO ENCONTRADA')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBucketPermissions() {
  try {
    console.log('\n1️⃣ Testando listagem de buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError.message)
      console.log('💡 Detalhes do erro:', JSON.stringify(listError, null, 2))
      return
    }
    
    console.log('✅ Buckets encontrados:', buckets?.length || 0)
    buckets?.forEach(bucket => {
      console.log(`   📦 ${bucket.name} (público: ${bucket.public})`) 
    })
    
    const avatarsNovo = buckets?.find(b => b.name === 'avatars_novo')
    const avatars = buckets?.find(b => b.name === 'avatars')
    
    if (avatarsNovo) {
      console.log('\n✅ Bucket "avatars_novo" encontrado!')
      await testBucketAccess('avatars_novo')
    } else if (avatars) {
      console.log('\n✅ Bucket "avatars" encontrado!')
      await testBucketAccess('avatars')
    } else {
      console.log('\n❌ Nenhum bucket de avatars encontrado!')
      console.log('💡 Possíveis causas:')
      console.log('   - Políticas RLS muito restritivas')
      console.log('   - Chave de API sem permissões adequadas')
      console.log('   - Buckets não existem realmente')
      console.log('   - Problema de conectividade')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.log('💡 Stack trace:', error.stack)
  }
}

async function testBucketAccess(bucketName) {
  console.log(`\n2️⃣ Testando acesso ao bucket '${bucketName}'...`)
  
  try {
    // Testar listagem de arquivos
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 })
    
    if (filesError) {
      console.error('❌ Erro ao listar arquivos:', filesError.message)
      console.log('💡 Detalhes:', JSON.stringify(filesError, null, 2))
    } else {
      console.log('✅ Conseguiu listar arquivos:', files?.length || 0)
    }
    
    console.log(`\n3️⃣ Testando upload no bucket '${bucketName}'...`)
    
    // Criar arquivo de teste simples
    const testContent = 'test-file-content-' + Date.now()
    const testBlob = new Blob([testContent], { type: 'text/plain' })
    const testPath = `test-${Date.now()}.txt`
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testBlob)
    
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError.message)
      console.log('💡 Detalhes:', JSON.stringify(uploadError, null, 2))
    } else {
      console.log('✅ Upload realizado com sucesso!')
      
      // Testar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(testPath)
      
      console.log('🔗 URL pública:', publicUrl)
      
      // Limpar arquivo de teste
      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([testPath])
      
      if (removeError) {
        console.warn('⚠️ Erro ao remover arquivo de teste:', removeError.message)
      } else {
        console.log('🧹 Arquivo de teste removido')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de acesso:', error.message)
  }
}

testBucketPermissions()
  .then(() => {
    console.log('\n✅ Teste de permissões concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })