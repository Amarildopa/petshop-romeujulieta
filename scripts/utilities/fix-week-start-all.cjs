#!/usr/bin/env node
/**
 * Corrige o campo week_start em toda a tabela weekly_baths com base em bath_date.
 * Regra: semana é de segunda a domingo; week_start sempre a segunda-feira da semana da bath_date.
 * O cálculo é feito em fuso LOCAL para evitar deslocamentos por UTC.
 *
 * Uso:
 *   node scripts/utilities/fix-week-start-all.cjs            # dry-run (não atualiza)
 *   node scripts/utilities/fix-week-start-all.cjs --apply    # aplica correções
 *   node scripts/utilities/fix-week-start-all.cjs --apply --start=2025-09-01 --end=2025-11-30
 *
 * Requisitos:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY  (recomendado; bypass de RLS)
 *   Fallback (não recomendado): VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 */

const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} catch (_) {}

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[ERRO] Variáveis de ambiente ausentes. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function pad2(n) { return String(n).padStart(2, '0'); }

/**
 * Calcula a segunda-feira da semana (local) para uma data YYYY-MM-DD.
 */
function getWeekStartLocal(dateStr) {
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const base = new Date(y, (m || 1) - 1, d || 1); // data local
  const day = base.getDay(); // 0=domingo,1=segunda,...6=sábado
  const diff = day === 0 ? -6 : 1 - day; // deslocamento até segunda
  const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
  return `${monday.getFullYear()}-${pad2(monday.getMonth() + 1)}-${pad2(monday.getDate())}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { apply: false, start: null, end: null };
  for (const a of args) {
    if (a === '--apply') opts.apply = true;
    else if (a.startsWith('--start=')) opts.start = a.split('=')[1];
    else if (a.startsWith('--end=')) opts.end = a.split('=')[1];
  }
  return opts;
}

async function fetchAllBaths({ start, end }) {
  let query = supabase
    .from('weekly_baths')
    .select('id, pet_name, bath_date, week_start')
    .order('bath_date', { ascending: true });

  if (start) query = query.gte('bath_date', start);
  if (end) query = query.lte('bath_date', end);

  const { data, error } = await query;
  if (error) throw new Error('Erro ao buscar registros: ' + error.message);
  return data || [];
}

async function applyUpdate(id, newWeekStart) {
  const { data, error } = await supabase
    .from('weekly_baths')
    .update({ week_start: newWeekStart, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, pet_name, bath_date, week_start')
    .single();
  if (error) throw new Error('Erro ao atualizar registro ' + id + ': ' + error.message);
  return data;
}

async function main() {
  const opts = parseArgs();
  console.log(`[INFO] Iniciando ${opts.apply ? 'aplicação de correções' : 'dry-run'} de week_start`);
  if (opts.start || opts.end) {
    console.log(`[INFO] Filtro por intervalo de bath_date: start=${opts.start || '-'} end=${opts.end || '-'}`);
  }

  const rows = await fetchAllBaths(opts);
  console.log(`[INFO] Registros carregados: ${rows.length}`);

  let scanned = 0, updated = 0, unchanged = 0, skipped = 0, errors = 0;
  const summary = [];

  for (const row of rows) {
    scanned++;
    const expected = getWeekStartLocal(row.bath_date);

    if (!expected) {
      skipped++;
      summary.push({ id: row.id, pet_name: row.pet_name, bath_date: row.bath_date, week_start_before: row.week_start, week_start_after: null, status: 'skipped_no_bath_date' });
      continue;
    }

    if (row.week_start === expected) {
      unchanged++;
      summary.push({ id: row.id, pet_name: row.pet_name, bath_date: row.bath_date, week_start_before: row.week_start, week_start_after: row.week_start, status: 'unchanged' });
      continue;
    }

    if (!opts.apply) {
      updated++; // contará como potencial atualização
      summary.push({ id: row.id, pet_name: row.pet_name, bath_date: row.bath_date, week_start_before: row.week_start, week_start_after: expected, status: 'would_update' });
      continue;
    }

    try {
      const updatedRow = await applyUpdate(row.id, expected);
      updated++;
      summary.push({ id: row.id, pet_name: row.pet_name, bath_date: row.bath_date, week_start_before: row.week_start, week_start_after: updatedRow.week_start, status: 'updated' });
    } catch (e) {
      errors++;
      summary.push({ id: row.id, pet_name: row.pet_name, bath_date: row.bath_date, week_start_before: row.week_start, week_start_after: null, status: 'update_error', error: e.message });
    }
  }

  console.log('\nResumo:');
  console.log(`- Escaneados: ${scanned}`);
  console.log(`- Sem alteração: ${unchanged}`);
  console.log(`- ${opts.apply ? 'Atualizados' : 'Necessitam atualização'}: ${updated}`);
  console.log(`- Ignorados (sem bath_date): ${skipped}`);
  console.log(`- Erros: ${errors}`);

  console.log('\nDetalhes:');
  for (const s of summary) {
    const base = `id=${s.id} pet=${s.pet_name} bath_date=${s.bath_date} before=${s.week_start_before} after=${s.week_start_after}`;
    console.log(`- ${s.status}: ${base}${s.error ? ' | error=' + s.error : ''}`);
  }

  if (!opts.apply) {
    console.log('\n[INFO] Dry-run concluído. Reexecute com --apply para aplicar as correções.');
  } else {
    console.log('\n[INFO] Correções aplicadas.');
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error('[FALHA] ', err);
  process.exit(1);
});