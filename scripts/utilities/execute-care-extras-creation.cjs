const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCareExtrasTable() {
  console.log('🚀 Iniciando criação da tabela care_extras_pet...');
  
  try {
    // Primeiro, vamos tentar criar a tabela diretamente
    console.log('\n1. Criando tabela care_extras_pet...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS care_extras_pet (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        duration_minutes INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        category VARCHAR(50) DEFAULT 'extra'
      );
    `;
    
    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError.message);
      
      // Tentar método alternativo - inserir dados diretamente
      console.log('\n2. Tentando método alternativo - inserir dados...');
      
      const careExtrasData = [
        {
          name: 'Escovação de Dentes',
          description: 'Limpeza e escovação dos dentes do pet',
          price: 15.00,
          duration_minutes: 15,
          category: 'higiene',
          is_active: true
        },
        {
          name: 'Corte de Unhas',
          description: 'Corte e lixamento das unhas',
          price: 10.00,
          duration_minutes: 10,
          category: 'higiene',
          is_active: true
        },
        {
          name: 'Limpeza de Ouvidos',
          description: 'Limpeza profunda dos ouvidos',
          price: 12.00,
          duration_minutes: 10,
          category: 'higiene',
          is_active: true
        },
        {
          name: 'Perfume Pet',
          description: 'Aplicação de perfume especial para pets',
          price: 8.00,
          duration_minutes: 5,
          category: 'beleza',
          is_active: true
        },
        {
          name: 'Laço Decorativo',
          description: 'Colocação de laço ou acessório decorativo',
          price: 5.00,
          duration_minutes: 5,
          category: 'beleza',
          is_active: true
        }
      ];
      
      const { data: insertResult, error: insertError } = await supabase
        .from('care_extras_pet')
        .insert(careExtrasData);
      
      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError.message);
        console.log('\n📋 A tabela precisa ser criada manualmente no Supabase Dashboard.');
        console.log('📄 Use o arquivo create-care-extras-table.sql no SQL Editor do Supabase.');
        return;
      }
      
      console.log('✅ Dados inseridos com sucesso!');
      
    } else {
      console.log('✅ Tabela criada com sucesso!');
      
      // Inserir dados iniciais
      console.log('\n3. Inserindo dados iniciais...');
      
      const careExtrasData = [
        {
          name: 'Escovação de Dentes',
          description: 'Limpeza e escovação dos dentes do pet',
          price: 15.00,
          duration_minutes: 15,
          category: 'higiene',
          is_active: true
        },
        {
          name: 'Corte de Unhas',
          description: 'Corte e lixamento das unhas',
          price: 10.00,
          duration_minutes: 10,
          category: 'higiene',
          is_active: true
        },
        {
          name: 'Limpeza de Ouvidos',
          description: 'Limpeza profunda dos ouvidos',
          price: 12.00,
          duration_minutes: 10,
          category: 'higiene',
          is_active: true
        },
        {
          name: 'Perfume Pet',
          description: 'Aplicação de perfume especial para pets',
          price: 8.00,
          duration_minutes: 5,
          category: 'beleza',
          is_active: true
        },
        {
          name: 'Laço Decorativo',
          description: 'Colocação de laço ou acessório decorativo',
          price: 5.00,
          duration_minutes: 5,
          category: 'beleza',
          is_active: true
        }
      ];
      
      const { data: insertResult, error: insertError } = await supabase
        .from('care_extras_pet')
        .insert(careExtrasData);
      
      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError.message);
      } else {
        console.log('✅ Dados iniciais inseridos com sucesso!');
      }
    }
    
    // Verificar se a tabela está funcionando
    console.log('\n4. Testando acesso à tabela...');
    const { data: testData, error: testError } = await supabase
      .from('care_extras_pet')
      .select('*')
      .limit(3);
    
    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError.message);
    } else {
      console.log('✅ Tabela funcionando corretamente!');
      console.log('📊 Registros encontrados:', testData.length);
      console.log('📋 Primeiros registros:');
      testData.forEach(item => {
        console.log(`  - ${item.name}: R$ ${item.price} (${item.category})`);
      });
    }
    
  } catch (err) {
    console.error('💥 Erro geral:', err.message);
  }
}

// Executar criação
createCareExtrasTable()
  .then(() => {
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Erro fatal:', err);
    process.exit(1);
  });