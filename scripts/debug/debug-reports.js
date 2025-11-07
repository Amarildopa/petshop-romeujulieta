// Script de Debug para Relatórios Administrativos
// PetShop Romeo & Julieta

console.log('🔍 Iniciando diagnóstico dos relatórios administrativos...\n');

// Verificar se estamos no navegador
if (typeof window !== 'undefined') {
  console.log('✅ Executando no navegador');
  
  // Verificar se o Supabase está disponível
  if (window.supabase) {
    console.log('✅ Supabase client disponível');
    
    // Verificar autenticação
    window.supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error('❌ Erro ao verificar usuário:', error.message);
        return;
      }
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        console.log('💡 Solução: Faça login no sistema primeiro');
        return;
      }
      
      console.log('✅ Usuário autenticado:', user.email);
      
      // Verificar se é admin
      window.supabase
        .from('admin_users_pet')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data: adminUser, error: adminError }) => {
          if (adminError) {
            console.error('❌ Erro ao verificar admin:', adminError.message);
            console.log('💡 Possível solução: Usuário não é admin ou tabela admin_users_pet não existe');
            
            // Verificar se a tabela existe
            window.supabase
              .from('admin_users_pet')
              .select('count', { count: 'exact' })
              .then(({ count, error: countError }) => {
                if (countError) {
                  console.error('❌ Tabela admin_users_pet não existe:', countError.message);
                  console.log('💡 Execute o script de setup do banco de dados');
                } else {
                  console.log(`ℹ️ Tabela admin_users_pet existe com ${count} registros`);
                  console.log('💡 Usuário atual não está cadastrado como admin');
                }
              });
            return;
          }
          
          if (!adminUser) {
            console.log('❌ Usuário não é admin');
            console.log('💡 Solução: Cadastre o usuário como admin na tabela admin_users_pet');
            return;
          }
          
          console.log('✅ Usuário é admin:', adminUser);
          
          // Testar geração de relatório
          console.log('\n🧪 Testando geração de relatório...');
          
          const testReportData = {
            name: 'Teste de Relatório - ' + new Date().toLocaleString('pt-BR'),
            type: 'revenue',
            parameters: {
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            }
          };
          
          // Simular chamada do adminService
          if (window.adminService && window.adminService.generateReport) {
            window.adminService.generateReport(
              testReportData.name,
              testReportData.type,
              testReportData.parameters
            ).then((result) => {
              console.log('✅ Relatório gerado com sucesso:', result);
              console.log('💡 Os botões devem estar funcionando normalmente');
            }).catch((error) => {
              console.error('❌ Erro ao gerar relatório:', error.message);
              console.log('💡 Verifique os métodos de geração específicos no adminService');
            });
          } else {
            console.log('❌ adminService.generateReport não disponível');
            console.log('💡 Verifique se o adminService foi importado corretamente');
          }
        });
    });
  } else {
    console.log('❌ Supabase client não disponível');
    console.log('💡 Verifique se as variáveis de ambiente estão configuradas');
  }
} else {
  console.log('❌ Este script deve ser executado no console do navegador');
  console.log('💡 Abra o DevTools (F12) e cole este código no console');
}

// Instruções de uso
console.log('\n📋 INSTRUÇÕES:');
console.log('1. Abra o DevTools (F12)');
console.log('2. Vá para a aba Console');
console.log('3. Cole este código e pressione Enter');
console.log('4. Siga as soluções sugeridas baseadas nos resultados');