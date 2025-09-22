const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  serviceRoleKey
);

async function fixRLS() {
  try {
    console.log('🔧 Executando correção das políticas RLS...');
    
    // Primeiro, vamos verificar se a tabela tem RLS habilitado
    console.log('1. Verificando status RLS da tabela...');
    
    // Testar acesso atual com ANON KEY
    console.log('2. Testando acesso atual com ANON KEY...');
    
    const supabaseAnon = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data: testData, error: testError } = await supabaseAnon
      .from('system_settings_pet')
      .select('*')
      .eq('key', 'contact_phone')
      .eq('is_public', true);
    
    if (testError) {
      console.log('❌ Erro no acesso anônimo:', testError.message);
      console.log('📋 Detalhes do erro:', testError);
    } else {
      console.log('✅ Sucesso! Dados encontrados:', testData?.length || 0);
      if (testData && testData.length > 0) {
        console.log('📱 Contact Phone encontrado:', testData[0]);
        return; // Se já funciona, não precisa fazer nada
      }
    }
    
    // Se chegou aqui, precisa corrigir as políticas
    console.log('3. Aplicando correção RLS...');
    
    // Vamos tentar usar uma função SQL personalizada se existir
    try {
      const { data, error } = await supabase.rpc('apply_rls_fix', {
        table_name: 'system_settings_pet'
      });
      
      if (error) {
        console.log('⚠️ Função apply_rls_fix não encontrada, tentando abordagem manual...');
        
        // Abordagem manual - vamos criar as políticas via SQL direto
        console.log('4. Tentando abordagem manual...');
        
        // Como não conseguimos executar SQL direto, vamos sugerir execução manual
        console.log('📝 Execute os seguintes comandos SQL no painel do Supabase:');
        console.log('');
        console.log('-- 1. Remover políticas existentes');
        console.log('DROP POLICY IF EXISTS "Allow anonymous read public settings" ON system_settings_pet;');
        console.log('DROP POLICY IF EXISTS "Allow authenticated read all settings" ON system_settings_pet;');
        console.log('');
        console.log('-- 2. Criar nova política para usuários anônimos');
        console.log('CREATE POLICY "Allow anonymous read public settings"');
        console.log('ON system_settings_pet');
        console.log('FOR SELECT');
        console.log('TO anon');
        console.log('USING (is_public = true);');
        console.log('');
        console.log('-- 3. Criar política para usuários autenticados');
        console.log('CREATE POLICY "Allow authenticated read all settings"');
        console.log('ON system_settings_pet');
        console.log('FOR SELECT');
        console.log('TO authenticated');
        console.log('USING (true);');
        console.log('');
        console.log('-- 4. Garantir que RLS está habilitado');
        console.log('ALTER TABLE system_settings_pet ENABLE ROW LEVEL SECURITY;');
        
      } else {
        console.log('✅ Função RLS aplicada com sucesso:', data);
      }
      
    } catch (e) {
      console.log('❌ Erro ao aplicar correção:', e.message);
    }
    
    // Teste final
    console.log('5. Teste final...');
    const { data: finalTest, error: finalError } = await supabaseAnon
      .from('system_settings_pet')
      .select('*')
      .eq('key', 'contact_phone');
    
    if (finalError) {
      console.log('❌ Ainda com erro:', finalError.message);
    } else {
      console.log('✅ Sucesso final! Dados:', finalTest?.length || 0);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

fixRLS();