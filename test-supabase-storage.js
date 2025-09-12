import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseStorage() {
  console.log('🔍 Testando conectividade com Supabase Storage...')
  console.log('📍 URL:', supabaseUrl)
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // 1. Testar listagem de buckets
    console.log('\n📂 Testando listagem de buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError)
      return
    }
    
    console.log('✅ Buckets encontrados:', buckets?.length || 0)
    buckets?.forEach(bucket => {
      console.log(`  - ${bucket.name} (público: ${bucket.public}, criado: ${bucket.created_at})`)
    })
    
    // 2. Verificar se bucket 'avatars' existe
    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars')
    
    if (!avatarBucket) {
      console.log('\n⚠️ Bucket "avatars" não encontrado. Tentando criar...')
      
      const { data: createData, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Erro ao criar bucket "avatars":', createError)
        return
      }
      
      console.log('✅ Bucket "avatars" criado com sucesso!')
    } else {
      console.log('\n✅ Bucket "avatars" já existe!')
      console.log(`  - Público: ${avatarBucket.public}`)
      console.log(`  - Criado em: ${avatarBucket.created_at}`)
    }
    
    // 3. Testar upload de arquivo de teste
    console.log('\n📤 Testando upload de arquivo...')
    
    // Criar um arquivo de teste simples
    const testContent = 'test-file-content-' + Date.now()
    const testFile = new Blob([testContent], { type: 'text/plain' })
    const testFileName = `test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError)
      return
    }
    
    console.log('✅ Upload realizado com sucesso!')
    console.log('📁 Caminho:', uploadData.path)
    
    // 4. Testar obtenção de URL pública
    console.log('\n🔗 Testando URL pública...')
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName)
    
    console.log('✅ URL pública gerada:', publicUrl)
    
    // 5. Testar acesso à URL
    console.log('\n🌐 Testando acesso à URL...')
    
    try {
      const response = await fetch(publicUrl)
      if (response.ok) {
        const content = await response.text()
        console.log('✅ Arquivo acessível via URL pública!')
        console.log('📄 Conteúdo:', content)
      } else {
        console.error('❌ Erro ao acessar URL:', response.status, response.statusText)
      }
    } catch (fetchError) {
      console.error('❌ Erro na requisição:', fetchError)
    }
    
    // 6. Limpar arquivo de teste
    console.log('\n🗑️ Removendo arquivo de teste...')
    
    const { error: removeError } = await supabase.storage
      .from('avatars')
      .remove([testFileName])
    
    if (removeError) {
      console.error('⚠️ Erro ao remover arquivo de teste:', removeError)
    } else {
      console.log('✅ Arquivo de teste removido!')
    }
    
    console.log('\n🎉 Teste completo! Supabase Storage está funcionando corretamente.')
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

// Executar teste
testSupabaseStorage()
  .then(() => {
    console.log('\n✅ Teste finalizado!')
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
  })