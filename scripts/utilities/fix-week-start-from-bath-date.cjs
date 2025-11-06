#!/usr/bin/env node
/**
 * Corrige o campo week_start dos registros fornecidos com base em bath_date.
 * Regra: week_start = segunda-feira da semana do bath_date (segunda a domingo),
 * calculado em fuso local para evitar shifts de UTC.
 *
 * Requisitos de ambiente:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (recomendado para bypass de RLS)
 * Fallback (não recomendado): VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (pode falhar em RLS)
 */

const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} catch (e) {
  // Ignorar se dotenv não estiver disponível
}

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[ERRO] Variáveis de ambiente ausentes. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Registros fornecidos pelo usuário (reduzido ao essencial para correção)
const records = [
  {
    id: '09fd3ec0-4f62-4929-b780-2be31a158eca',
    bath_date: '2025-11-05',
    week_start: '2025-11-05',
    pet_name: 'Rex'
  },
  {
    id: '4707a7c7-5159-44f3-b213-2df2cf923af8',
    bath_date: '2025-10-31',
    week_start: '2025-11-03',
    pet_name: 'Julieta'
  },
  {
    id: '39a2adbc-b7c4-464a-8264-3cc9311e677d',
    bath_date: '2025-10-29',
    week_start: '2025-11-03',
    pet_name: 'Maya'
  },
  {
    id: 'fff68af3-717e-4ac2-b69d-26a2901088eb',
    bath_date: '2025-11-01',
    week_start: '2025-10-27',
    pet_name: 'Amora'
  }
];

function pad2(n) { return String(n).padStart(2, '0'); }

/**
 * Calcula a segunda-feira da semana (local) para uma data YYYY-MM-DD.
 */
function getWeekStartLocal(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const base = new Date(y, (m || 1) - 1, d || 1); // local date
  const day = base.getDay(); // 0=domingo,1=segunda,...6=sábado
  const diff = day === 0 ? -6 : 1 - day; // deslocamento até segunda
  const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
  return `${monday.getFullYear()}-${pad2(monday.getMonth() + 1)}-${pad2(monday.getDate())}`;
}

async function fixRecords() {
  console.log('Iniciando correção de week_start com base em bath_date...');

  const summary = [];
  for (const rec of records) {
    const expectedWeekStart = getWeekStartLocal(rec.bath_date);

    // Buscar o atual do banco para log de "antes"
    const { data: current, error: fetchError } = await supabase
      .from('weekly_baths')
      .select('id, pet_name, bath_date, week_start')
      .eq('id', rec.id)
      .single();

    if (fetchError) {
      console.error(`[ERRO] Falha ao buscar registro ${rec.id}:`, fetchError.message);
      summary.push({ id: rec.id, pet_name: rec.pet_name, status: 'fetch_error', error: fetchError.message });
      continue;
    }

    if (current?.week_start === expectedWeekStart) {
      console.log(`OK: ${current.pet_name} (${current.id}) já está correto: ${expectedWeekStart}`);
      summary.push({ id: current.id, pet_name: current.pet_name, before: current.week_start, after: current.week_start, status: 'unchanged' });
      continue;
    }

    console.log(`Atualizando: ${current.pet_name} (${current.id}) week_start ${current.week_start} -> ${expectedWeekStart}`);
    const { data: updated, error: updateError } = await supabase
      .from('weekly_baths')
      .update({ week_start: expectedWeekStart, updated_at: new Date().toISOString() })
      .eq('id', rec.id)
      .select('id, pet_name, bath_date, week_start')
      .single();

    if (updateError) {
      console.error(`[ERRO] Falha ao atualizar ${rec.id}:`, updateError.message);
      summary.push({ id: rec.id, pet_name: rec.pet_name, before: current.week_start, after: null, status: 'update_error', error: updateError.message });
      continue;
    }

    summary.push({ id: rec.id, pet_name: rec.pet_name, before: current.week_start, after: updated.week_start, status: 'updated' });
  }

  console.log('\nResumo:');
  for (const s of summary) {
    console.log(`- ${s.pet_name} (${s.id}): ${s.status} | before=${s.before} | after=${s.after}${s.error ? ' | error=' + s.error : ''}`);
  }
}

fixRecords()
  .then(() => {
    console.log('Correção finalizada.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Falha geral na correção:', err);
    process.exit(1);
  });