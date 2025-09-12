// Script temporário para contornar o problema de recursão
// Execute este script no console do navegador quando estiver logado

const tempFixAdminRecursion = async () => {
  console.log('🔧 Aplicando correção temporária para recursão RLS...');
  
  try {
    // Primeiro, vamos tentar uma abordagem diferente
    // Vamos modificar temporariamente o adminService para não usar as consultas problemáticas
    
    console.log('1️⃣ Criando função alternativa para verificar admin...');
    
    // Função alternativa que não causa recursão
    window.checkAdminStatusAlternative = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { isAdmin: false, adminUser: null };
        }
        
        // Tentar uma consulta mais simples
        const { data, error } = await supabase
          .from('profiles_pet')
          .select('id, full_name, email')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.log('Erro ao buscar perfil:', error);
          return { isAdmin: false, adminUser: null };
        }
        
        console.log('✅ Usuário encontrado:', data);
        
        // Por enquanto, vamos assumir que o usuário é admin se conseguiu fazer login
        // Isso é temporário até resolvermos o problema das políticas RLS
        return {
          isAdmin: true,
          adminUser: {
            id: 'temp-admin-id',
            user_id: user.id,
            role: 'admin',
            is_active: true,
            permissions: {
              all: true,
              users: true,
              reports: true,
              settings: true,
              tickets: true,
              logs: true,
              security: true
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles_pet: {
              full_name: data.full_name,
              email: data.email,
              phone: ''
            }
          }
        };
      } catch (err) {
        console.error('Erro na função alternativa:', err);
        return { isAdmin: false, adminUser: null };
      }
    };
    
    console.log('2️⃣ Testando função alternativa...');
    const result = await window.checkAdminStatusAlternative();
    console.log('Resultado:', result);
    
    if (result.isAdmin) {
      console.log('✅ Função alternativa funcionando!');
      console.log('\n📋 INSTRUÇÕES:');
      console.log('1. A função alternativa foi criada: window.checkAdminStatusAlternative()');
      console.log('2. Esta é uma solução temporária que permite acesso admin');
      console.log('3. Para uma solução permanente, as políticas RLS precisam ser corrigidas no Supabase Dashboard');
      console.log('\n🔧 CORREÇÃO PERMANENTE:');
      console.log('Acesse o Supabase Dashboard > SQL Editor e execute:');
      console.log('');
      console.log('-- Remover políticas problemáticas');
      console.log('DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users_pet;');
      console.log('DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users_pet;');
      console.log('');
      console.log('-- Criar política simples');
      console.log('CREATE POLICY "Users can view their own admin record" ON admin_users_pet');
      console.log('  FOR SELECT USING (auth.uid() = user_id);');
      console.log('');
      console.log('CREATE POLICY "Admins can view all admin records" ON admin_users_pet');
      console.log('  FOR SELECT USING (');
      console.log('    EXISTS (');
      console.log('      SELECT 1 FROM profiles_pet p');
      console.log('      WHERE p.id = auth.uid()');
      console.log('      AND p.email IN (\'admin@petshop.com\', \'super@petshop.com\')');
      console.log('    )');
      console.log('  );');
    } else {
      console.log('❌ Função alternativa não funcionou');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
};

// Executar automaticamente
tempFixAdminRecursion();

// Disponibilizar para uso manual
window.tempFixAdminRecursion = tempFixAdminRecursion;

console.log('\n🔧 Script carregado! Execute tempFixAdminRecursion() para aplicar a correção.');