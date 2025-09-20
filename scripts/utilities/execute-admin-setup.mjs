import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://hudiuukaoxxzxdcydgky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'
);

async function executeAdminSetup() {
  console.log('🔧 Executando setup do administrador...\n');
  
  try {
    // Ler o script SQL
    const sqlContent = fs.readFileSync('scripts/setup-admin-dev.sql', 'utf8');
    console.log('📄 Script SQL carregado');
    
    // Dividir o script em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd.length > 10);
    
    console.log(`🔄 Executando ${commands.length} comandos SQL...\n`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`Comando ${i + 1}/${commands.length}:`);
      
      try {
        // Tentar executar usando rpc
        const { data, error } = await supabase.rpc('exec_sql', {
          query: command
        });
        
        if (error) {
          console.log(`❌ Erro no comando ${i + 1}:`, error.message);
          
          // Se for INSERT, tentar método direto
          if (command.toLowerCase().includes('insert into profiles_pet')) {
            console.log('🔄 Tentando inserção direta no profiles_pet...');
            
            const { data: profile, error: profileError } = await supabase
              .from('profiles_pet')
              .upsert({
                full_name: 'Administrador Teste',
                email: 'admin@petshop.com',
                phone: '(11) 99999-9999',
                address: 'Rua Teste, 123',
                cep: '01234-567'
              }, {
                onConflict: 'email'
              })
              .select()
              .single();
            
            if (profileError) {
              console.log('❌ Erro na inserção direta:', profileError.message);
            } else {
              console.log('✅ Perfil criado/atualizado:', profile.email);
            }
          }
          
          if (command.toLowerCase().includes('insert into admin_users_pet')) {
            console.log('🔄 Tentando inserção direta no admin_users_pet...');
            
            // Primeiro buscar o ID do usuário
            const { data: user } = await supabase
              .from('profiles_pet')
              .select('id')
              .eq('email', 'admin@petshop.com')
              .single();
            
            if (user) {
              const { data: admin, error: adminError } = await supabase
                .from('admin_users_pet')
                .upsert({
                  user_id: user.id,
                  role: 'super_admin',
                  permissions: {
                    all: true,
                    users: true,
                    reports: true,
                    settings: true,
                    tickets: true,
                    logs: true,
                    security: true
                  },
                  is_active: true
                }, {
                  onConflict: 'user_id'
                })
                .select()
                .single();
              
              if (adminError) {
                console.log('❌ Erro na inserção de admin:', adminError.message);
              } else {
                console.log('✅ Admin criado/atualizado:', admin.role);
              }
            }
          }
        } else {
          console.log('✅ Comando executado com sucesso');
          if (data) console.log('Resultado:', data);
        }
      } catch (cmdError) {
        console.log(`❌ Erro no comando ${i + 1}:`, cmdError.message);
      }
      
      console.log('---');
    }
    
    // Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    
    const { data: finalCheck, error: checkError } = await supabase
      .from('admin_users_pet')
      .select(`
        id,
        role,
        is_active,
        permissions,
        profiles_pet!inner(email, full_name)
      `)
      .eq('profiles_pet.email', 'admin@petshop.com');
    
    if (checkError) {
      console.log('❌ Erro na verificação:', checkError.message);
    } else if (finalCheck && finalCheck.length > 0) {
      console.log('✅ ADMINISTRADOR CONFIGURADO COM SUCESSO!');
      console.log('📧 Email:', finalCheck[0].profiles_pet.email);
      console.log('👤 Nome:', finalCheck[0].profiles_pet.full_name);
      console.log('🔑 Role:', finalCheck[0].role);
      console.log('✅ Ativo:', finalCheck[0].is_active);
    } else {
      console.log('⚠️ Nenhum administrador encontrado');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

executeAdminSetup();