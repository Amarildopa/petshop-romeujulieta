#!/usr/bin/env node
/**
 * Auditoria de banhos aprovados por semana (weekly_baths)
 * - Busca registros com week_start especificado e approved=true
 * - Mostra total e lista detalhes (id, pet_name, bath_date, display_order, image_url)
 * - Verifica acessibilidade das imagens (HTTP status, content-type, tamanho)
 * - Verifica problemas comuns nos dados:
 *    - bath_date fora da semana (week_start .. week_start+6)
 *    - image_url ausente ou inválido
 *    - display_order duplicado
 *    - semana divergente do cálculo local a partir de bath_date
 *
 * Uso:
 *   node scripts/utilities/audit-week-photos.cjs --week=2025-10-27
 *
 * Requisitos de ambiente:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (recomendado; bypass de RLS)
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

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) opts[m[1]] = m[2];
    else if (a.startsWith('--')) opts[a.replace(/^--/, '')] = true;
  }
  return opts;
}

function getWeekEnd(weekStartStr) {
  const [y, m, d] = weekStartStr.split('-').map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return end;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCorrectWeekStartFromBathDate(bathDateStr) {
  const [y, m, d] = bathDateStr.split('-').map(Number);
  const base = new Date(y, (m || 1) - 1, d || 1);
  const day = base.getDay(); // 0=Domingo..6=Sábado
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(base.getFullYear(), base.getMonth(), diff);
  return toISO(monday);
}

async function fetchApprovedForWeek(weekStart) {
  const { data, error } = await supabase
    .from('weekly_baths')
    .select('id, pet_name, bath_date, week_start, display_order, image_url, approved, created_at')
    .eq('week_start', weekStart)
    .eq('approved', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error('Erro ao buscar registros: ' + error.message);
  return data || [];
}

async function checkImage(url) {
  if (!url || typeof url !== 'string') {
    return { ok: false, status: 0, error: 'URL ausente ou inválida' };
  }
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) {
      // Alguns provedores não suportam HEAD; tentar GET leve
      const g = await fetch(url, { method: 'GET' });
      return {
        ok: g.ok,
        status: g.status,
        contentType: g.headers.get('content-type') || null,
        contentLength: g.headers.get('content-length') || null
      };
    }
    return {
      ok: true,
      status: res.status,
      contentType: res.headers.get('content-type') || null,
      contentLength: res.headers.get('content-length') || null
    };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function main() {
  const args = parseArgs();
  const weekStart = args.week || '2025-10-27';
  console.log('🔎 Auditando semana:', weekStart, 'até', toISO(getWeekEnd(weekStart)));

  const items = await fetchApprovedForWeek(weekStart);
  console.log(`\n📊 Total aprovados encontrados: ${items.length}`);

  const weekEnd = getWeekEnd(weekStart);
  const problems = [];

  // Duplicatas de display_order
  const orderCount = new Map();
  items.forEach(i => orderCount.set(i.display_order, (orderCount.get(i.display_order) || 0) + 1));
  for (const [order, count] of orderCount.entries()) {
    if (order != null && count > 1) {
      problems.push({ type: 'display_order_duplicado', detail: `display_order ${order} aparece ${count} vezes` });
    }
  }

  for (const item of items) {
    const bathDate = new Date(item.bath_date);
    const bathISO = toISO(bathDate);
    const withinWeek = bathDate >= new Date(weekStart) && bathDate <= weekEnd;
    const correctWeekStart = getCorrectWeekStartFromBathDate(item.bath_date);
    const weekMismatch = correctWeekStart !== item.week_start;
    const imageCheck = await checkImage(item.image_url);

    console.log(`\n🧼 ${item.pet_name}`);
    console.log(`   • id: ${item.id}`);
    console.log(`   • bath_date: ${item.bath_date} (${bathDate.toLocaleDateString('pt-BR', { weekday: 'long' })})`);
    console.log(`   • display_order: ${item.display_order}`);
    console.log(`   • image_url: ${item.image_url}`);
    console.log(`   • imagem: ${imageCheck.ok ? 'OK' : 'FALHA'} (status=${imageCheck.status}${imageCheck.contentType ? ', type='+imageCheck.contentType : ''}${imageCheck.contentLength ? ', size='+imageCheck.contentLength : ''}${imageCheck.error ? ', erro='+imageCheck.error : ''})`);
    console.log(`   • withinWeek(${weekStart}..${toISO(weekEnd)}): ${withinWeek ? 'SIM' : 'NÃO'}`);
    console.log(`   • week_start: ${item.week_start} | correto pelo bath_date: ${correctWeekStart}${weekMismatch ? ' (DIVERGENTE)' : ''}`);

    if (!withinWeek) problems.push({ type: 'bath_date_fora_da_semana', detail: `${item.pet_name} em ${bathISO}` });
    if (!item.image_url) problems.push({ type: 'imagem_ausente', detail: `${item.pet_name} sem image_url` });
    if (!imageCheck.ok) problems.push({ type: 'imagem_inacessivel', detail: `${item.pet_name} status=${imageCheck.status} erro=${imageCheck.error || ''}` });
    if (weekMismatch) problems.push({ type: 'week_start_divergente', detail: `${item.pet_name}: week_start=${item.week_start}, correto=${correctWeekStart}` });
  }

  console.log('\n================ RESUMO ================');
  console.log(`Itens analisados: ${items.length}`);
  if (problems.length === 0) {
    console.log('Nenhum problema encontrado.');
  } else {
    const byType = problems.reduce((acc, p) => {
      acc[p.type] = acc[p.type] || [];
      acc[p.type].push(p.detail);
      return acc;
    }, {});
    for (const [type, list] of Object.entries(byType)) {
      console.log(`\n• ${type}:`);
      for (const d of list) console.log(`  - ${d}`);
    }
  }
}

main().catch(err => {
  console.error('\n[ERRO] Auditoria falhou:', err.message);
  process.exit(1);
});