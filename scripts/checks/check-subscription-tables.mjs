import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubscriptionTables() {
  console.log('🔍 Verificando tabelas de assinatura...\n');

  // Lista de tabelas para verificar
  const tables = [
    'subscriptions_pet',
    'user_subscriptions_pet', 
    'subscription_plans_pet'
  ];

  for (const tableName of tables) {
    try {
      console.log(`📋 Verificando tabela: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Erro ao acessar ${tableName}:`, error.message);
        console.log(`   Código: ${error.code}\n`);
      } else {
        console.log(`✅ Tabela ${tableName} existe e é acessível`);
        console.log(`   Registros encontrados: ${data?.length || 0}\n`);
      }
    } catch (err) {
      console.log(`❌ Erro geral ao verificar ${tableName}:`, err.message);
    }
  }

  // Verificar schema das tabelas existentes
  console.log('🔍 Verificando schema das tabelas...\n');
  
  try {
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'subscriptions_pet' });
    
    if (schemaError) {
      console.log('❌ Erro ao buscar schema:', schemaError.message);
    } else {
      console.log('📋 Schema da tabela subscriptions_pet:', schemaData);
    }
  } catch (err) {
    console.log('❌ RPC não disponível, tentando método alternativo...');
  }
}

checkSubscriptionTables().catch(console.error);