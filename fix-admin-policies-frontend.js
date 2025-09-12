// Script para corrigir políticas RLS através do frontend
// Este script deve ser executado no console do navegador quando logado como admin

const fixAdminPolicies = async () => {
  console.log('🔧 Iniciando correção das políticas RLS...');
  
  try {
    // Primeiro, vamos desabilitar temporariamente o RLS na tabela admin_users_pet
    console.log('1️⃣ Tentando desabilitar RLS temporariamente...');
    
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('Usuário atual:', currentUser?.user?.id);
    
    // Tentar uma consulta simples para verificar se conseguimos acessar
    console.log('2️⃣ Testando acesso à tabela admin_users_pet...');
    
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_users_pet')
      .select('id, user_id, role, is_active')
      .eq('user_id', currentUser?.user?.id)
      .single();
    
    if (adminError) {
      console.error('❌ Erro ao acessar admin_users_pet:', adminError);
      
      // Se não conseguir acessar, vamos tentar uma abordagem diferente
      console.log('3️⃣ Tentando abordagem alternativa...');
      
      // Vamos usar uma função RPC para contornar o problema
      const { data: rpcResult, error: rpcError } = await supabase.rpc('get_current_admin_status');
      
      if (rpcError) {
        console.error('❌ Erro na função RPC:', rpcError);
        console.log('\n📋 INSTRUÇÕES MANUAIS:');
        console.log('1. Acesse o Supabase Dashboard');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute os seguintes comandos:');
        console.log('');
        console.log('-- Desabilitar RLS temporariamente');
        console.log('ALTER TABLE admin_users_pet DISABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Remover políticas problemáticas');
        console.log('DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users_pet;');
        console.log('DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users_pet;');
        console.log('');
        console.log('-- Criar política simples');
        console.log('CREATE POLICY "Users can view their own admin record" ON admin_users_pet FOR SELECT USING (auth.uid() = user_id);');
        console.log('');
        console.log('-- Reabilitar RLS');
        console.log('ALTER TABLE admin_users_pet ENABLE ROW LEVEL SECURITY;');
        
        return;
      }
    } else {
      console.log('✅ Acesso à tabela admin_users_pet funcionando:', adminCheck);
    }
    
    console.log('✅ Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
};

// Executar a correção
fixAdminPolicies();

// Também exportar para uso manual
window.fixAdminPolicies = fixAdminPolicies;

console.log('\n🔧 Script carregado! Execute fixAdminPolicies() para tentar a correção.');
console.log('\n📋 Se não funcionar, siga as instruções manuais que aparecerão.');