const { createClient } = require('@supabase/supabase-js');

// Credenciais diretas do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  console.log('🔍 Verificando buckets existentes...');
  
  try {
    // Método 1: Listar buckets via API
    console.log('\n1️⃣ Tentando listar buckets via API...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
    } else {
      console.log('✅ Buckets encontrados via API:', buckets?.length || 0);
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.id} (público: ${bucket.public})`);
        });
      }
    }
    
    // Método 2: Verificar bucket específico 'avatars'
    console.log('\n2️⃣ Testando acesso ao bucket "avatars"...');
    const { data: avatarsFiles, error: avatarsError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (avatarsError) {
      console.error('❌ Erro ao acessar bucket avatars:', avatarsError.message);
    } else {
      console.log('✅ Bucket "avatars" acessível! Arquivos:', avatarsFiles?.length || 0);
    }
    
    // Método 3: Verificar bucket específico 'avatars_novo'
    console.log('\n3️⃣ Testando acesso ao bucket "avatars_novo"...');
    const { data: avatarsNovoFiles, error: avatarsNovoError } = await supabase.storage
      .from('avatars_novo')
      .list();
    
    if (avatarsNovoError) {
      console.error('❌ Erro ao acessar bucket avatars_novo:', avatarsNovoError.message);
    } else {
      console.log('✅ Bucket "avatars_novo" acessível! Arquivos:', avatarsNovoFiles?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
  
  console.log('\n🏁 Verificação concluída!');
}

checkBuckets();