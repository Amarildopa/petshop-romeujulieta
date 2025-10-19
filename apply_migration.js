import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODA0NiwiZXhwIjoyMDcxMjM0MDQ2fQ.hmHKBn3yFcnxM_Hn79j6yLpTRW5mRCCcq2zkjnwo8LU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migration reorganize-theme-sections.sql...');
    
    // Ler o arquivo de migration
    const migrationSQL = fs.readFileSync('./supabase/migrations/reorganize-theme-sections.sql', 'utf8');
    
    // Dividir em comandos individuais (separados por ;)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error);
          // Continuar com os próximos comandos mesmo se houver erro
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }
    
    console.log('🎉 Migration aplicada! Verificando dados...');
    
    // Verificar se os dados foram inseridos
    const { count, error: countError } = await supabase
      .from('theme_colors_pet')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao verificar dados:', countError);
    } else {
      console.log(`📊 Total de registros após migration: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyMigration();