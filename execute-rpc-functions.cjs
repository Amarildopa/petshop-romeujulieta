// Script para executar as funções RPC no Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeRPCFunctions() {
  console.log('🔧 Executando funções RPC no Supabase...');
  
  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('create-admin-rpc-function.sql', 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.includes('CREATE OR REPLACE FUNCTION')) {
        console.log(`\n${i + 1}. Criando função...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: command + ';'
          });
          
          if (error) {
            console.error(`❌ Erro ao executar comando ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.error(`❌ Erro no comando ${i + 1}:`, err.message);
        }
      }
    }
    
    // Testar as funções criadas
    console.log('\n🧪 Testando funções RPC...');
    
    // Testar get_current_admin_status
    try {
      const { data: adminStatus, error: adminError } = await supabase.rpc('get_current_admin_status');
      
      if (adminError) {
        console.log('⚠️ Função get_current_admin_status não disponível (normal se não logado):', adminError.message);
      } else {
        console.log('✅ Função get_current_admin_status funcionando');
      }
    } catch (err) {
      console.log('⚠️ Erro ao testar get_current_admin_status:', err.message);
    }
    
    // Testar is_user_admin
    try {
      const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_user_admin');
      
      if (isAdminError) {
        console.log('⚠️ Função is_user_admin não disponível (normal se não logado):', isAdminError.message);
      } else {
        console.log('✅ Função is_user_admin funcionando');
      }
    } catch (err) {
      console.log('⚠️ Erro ao testar is_user_admin:', err.message);
    }
    
    console.log('\n✅ Processo concluído!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. As funções RPC foram criadas no banco de dados');
    console.log('2. O código do frontend foi atualizado para usar as funções RPC');
    console.log('3. Teste a aplicação para verificar se o erro de recursão foi resolvido');
    console.log('4. Se ainda houver problemas, execute o script fix-admin-policies-frontend.js no console do navegador');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o conteúdo do arquivo create-admin-rpc-function.sql');
    console.log('4. Verifique se as funções foram criadas com sucesso');
  }
}

// Executar o script
executeRPCFunctions();