import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAvatarsNovo() {
  console.log('🔍 Testando bucket "avatars_novo"...')
  console.log('📍 URL:', supabaseUrl)
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // 1. Listar todos os buckets
    console.log('\n📂 Listando todos os buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError)
      return
    }
    
    console.log('✅ Total de buckets encontrados:', buckets?.length || 0)
    
    if (buckets && buckets.length > 0) {
      console.log('\n📋 Lista completa de buckets:')
      buckets.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.name}`)
        console.log(`     - ID: ${bucket.id}`)
        console.log(`     - Público: ${bucket.public}`)
        console.log(`     - Criado: ${bucket.created_at}`)
        console.log(`     - Atualizado: ${bucket.updated_at}`)
        console.log('')
      })
    }
    
    // 2. Verificar especificamente o bucket 'avatars_novo'
    const avatarsNovoBucket = buckets?.find(bucket => bucket.name === 'avatars_novo')
    
    if (avatarsNovoBucket) {
      console.log('🎉 BUCKET "avatars_novo" ENCONTRADO!')
      console.log('📊 Detalhes do bucket:')
      console.log(`   - Nome: ${avatarsNovoBucket.name}`)
      console.log(`   - ID: ${avatarsNovoBucket.id}`)
      console.log(`   - Público: ${avatarsNovoBucket.public}`)
      console.log(`   - Tamanho máximo: ${avatarsNovoBucket.file_size_limit || 'Não definido'}`)
      console.log(`   - Tipos permitidos: ${avatarsNovoBucket.allowed_mime_types || 'Todos'}`)
      console.log(`   - Criado em: ${avatarsNovoBucket.created_at}`)
      
      // 3. Testar permissões no bucket avatars_novo
      console.log('\n🔐 Testando permissões do bucket "avatars_novo"...')
      try {
        const { data: files, error: listFilesError } = await supabase.storage
          .from('avatars_novo')
          .list('', { limit: 10 })
        
        if (listFilesError) {
          console.error('❌ Erro ao listar arquivos:', listFilesError.message)
          console.error('   Código:', listFilesError.statusCode)
        } else {
          console.log('✅ Permissões OK!')
          console.log(`📁 Arquivos encontrados: ${files?.length || 0}`)
          
          if (files && files.length > 0) {
            console.log('\n📄 Lista de arquivos:')
            files.forEach((file, index) => {
              console.log(`  ${index + 1}. ${file.name}`)
              console.log(`     - Tamanho: ${file.metadata?.size || 'N/A'} bytes`)
              console.log(`     - Modificado: ${file.updated_at}`)
            })
          }
        }
      } catch (permError) {
        console.error('❌ Erro de permissão:', permError.message)
      }
      
      // 4. Testar upload de arquivo de teste
      console.log('\n📤 Testando upload no bucket "avatars_novo"...')
      
      try {
        const testContent = 'test-file-content-' + Date.now()
        const testFile = new Blob([testContent], { type: 'text/plain' })
        const testFileName = `test-${Date.now()}.txt`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars_novo')
          .upload(testFileName, testFile, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError.message)
          console.error('   Código:', uploadError.statusCode)
        } else {
          console.log('✅ Upload realizado com sucesso!')
          console.log('📁 Caminho:', uploadData.path)
          
          // 5. Testar URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('avatars_novo')
            .getPublicUrl(testFileName)
          
          console.log('🔗 URL pública:', publicUrl)
          
          // 6. Limpar arquivo de teste
          const { error: removeError } = await supabase.storage
            .from('avatars_novo')
            .remove([testFileName])
          
          if (removeError) {
            console.warn('⚠️ Erro ao remover arquivo de teste:', removeError.message)
          } else {
            console.log('🗑️ Arquivo de teste removido com sucesso!')
          }
        }
      } catch (uploadTestError) {
        console.error('❌ Erro no teste de upload:', uploadTestError.message)
      }
      
    } else {
      console.log('❌ BUCKET "avatars_novo" NÃO ENCONTRADO!')
      console.log('\n🔍 Buckets disponíveis:')
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name}`)
        })
      } else {
        console.log('   Nenhum bucket encontrado.')
      }
    }
    
    // 7. Verificar também o bucket 'avatars' original
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars')
    
    if (avatarsBucket) {
      console.log('\n✅ Bucket "avatars" (original) também existe!')
    } else {
      console.log('\n❌ Bucket "avatars" (original) não encontrado.')
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

// Executar teste
testAvatarsNovo()
  .then(() => {
    console.log('\n🏁 Teste finalizado!')
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
  })