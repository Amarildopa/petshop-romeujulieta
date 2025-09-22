import { supabase } from '../lib/supabase';

export class UploadDebugger {
  static async testBucketConnection() {
    console.log('🔍 Testando conexão com bucket "avatars"...');
    
    try {
      // Testa se o bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Erro ao listar buckets:', bucketsError);
        return false;
      }
      
      console.log('📦 Buckets disponíveis:', buckets?.map(b => b.name));
      
      const avatarsBucket = buckets?.find(b => b.name === 'avatars');
      if (!avatarsBucket) {
        console.error('❌ Bucket "avatars" não encontrado!');
        return false;
      }
      
      console.log('✅ Bucket "avatars" encontrado:', avatarsBucket);
      
      // Testa listagem de arquivos no bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 5 });
        
      if (filesError) {
        console.error('❌ Erro ao listar arquivos:', filesError);
        return false;
      }
      
      console.log('📁 Arquivos no bucket (primeiros 5):', files);
      
      // Testa listagem da pasta pets
      const { data: petsFiles, error: petsError } = await supabase.storage
        .from('avatars')
        .list('pets', { limit: 5 });
        
      if (petsError) {
        console.error('❌ Erro ao listar pasta pets:', petsError);
      } else {
        console.log('🐕 Arquivos na pasta pets:', petsFiles);
      }
      
      return true;
      
    } catch (error) {
      console.error('💥 Erro geral no teste:', error);
      return false;
    }
  }
  
  static async testUploadPermissions() {
    console.log('🔐 Testando permissões de upload...');
    
    try {
      // Cria um arquivo de teste pequeno
      const testContent = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      const testPath = `pets/test_${Date.now()}.txt`;
      
      console.log('📤 Tentando upload de teste para:', testPath);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(testPath, testFile);
        
      if (uploadError) {
        console.error('❌ Erro no upload de teste:', uploadError);
        return false;
      }
      
      console.log('✅ Upload de teste bem-sucedido!');
      
      // Remove o arquivo de teste
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([testPath]);
        
      if (deleteError) {
        console.warn('⚠️ Erro ao remover arquivo de teste:', deleteError);
      } else {
        console.log('🗑️ Arquivo de teste removido');
      }
      
      return true;
      
    } catch (error) {
      console.error('💥 Erro no teste de permissões:', error);
      return false;
    }
  }
  
  static async runFullDiagnostic() {
    console.log('🚀 Iniciando diagnóstico completo do upload...');
    console.log('=====================================');
    
    const bucketTest = await this.testBucketConnection();
    console.log('=====================================');
    
    if (bucketTest) {
      const permissionsTest = await this.testUploadPermissions();
      console.log('=====================================');
      
      if (bucketTest && permissionsTest) {
        console.log('✅ Todos os testes passaram! O problema pode estar no código do upload.');
      } else {
        console.log('❌ Problemas encontrados. Verifique as configurações do Supabase.');
      }
    }
    
    return { bucketTest, permissionsTest: bucketTest ? await this.testUploadPermissions() : false };
  }
}

// Função para usar no console do navegador
(window as Window & { debugUpload: typeof UploadDebugger }).debugUpload = UploadDebugger;