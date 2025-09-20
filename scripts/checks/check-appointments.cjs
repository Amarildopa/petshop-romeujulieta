const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointments() {
  try {
    console.log('🔍 Verificando dados de agendamento...\n');
    
    // Verificar total de agendamentos
    const { data: totalData, error: totalError } = await supabase
      .from('appointments_pet')
      .select('*', { count: 'exact' });
    
    if (totalError) {
      console.error('❌ Erro ao buscar agendamentos:', totalError);
      return;
    }
    
    console.log('📊 TOTAL DE AGENDAMENTOS:', totalData?.length || 0);
    
    if (totalData && totalData.length > 0) {
      // Buscar último agendamento com detalhes
      const { data: lastAppointment, error: lastError } = await supabase
        .from('appointments_pet')
        .select(`
          *,
          profiles_pet!user_id(full_name, email, phone),
          pets_pet!pet_id(name, species, breed),
          services_pet!service_id(name, description, price, duration)
        `)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!lastError && lastAppointment?.[0]) {
        const apt = lastAppointment[0];
        console.log('\n🆕 ÚLTIMO AGENDAMENTO CRIADO:');
        console.log('ID:', apt.id);
        console.log('Criado em:', apt.created_at);
        console.log('Data/Hora:', apt.appointment_date, apt.appointment_time);
        console.log('Status:', apt.status);
        console.log('Preço Total:', apt.total_price);
        console.log('Extras:', apt.extras);
        console.log('Observações:', apt.notes);
        console.log('Cliente:', apt.profiles_pet?.full_name);
        console.log('Email:', apt.profiles_pet?.email);
        console.log('Pet:', apt.pets_pet?.name, '(' + apt.pets_pet?.species + ')');
        console.log('Raça:', apt.pets_pet?.breed);
        console.log('Serviço:', apt.services_pet?.name);
        console.log('Preço Base do Serviço:', apt.services_pet?.price);
        console.log('Duração:', apt.services_pet?.duration);
      }
      
      // Verificar agendamentos por status
      const { data: statusData } = await supabase
        .from('appointments_pet')
        .select('status')
        .order('status');
      
      if (statusData) {
        const statusCount = statusData.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\n📈 AGENDAMENTOS POR STATUS:');
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`- ${status}: ${count}`);
        });
      }
      
      // Verificar agendamentos de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('appointments_pet')
        .select('*')
        .eq('appointment_date', today);
      
      console.log('\n📅 AGENDAMENTOS DE HOJE:', todayData?.length || 0);
      
      // Verificar integridade dos dados
      const appointmentsWithPrice = totalData.filter(apt => apt.total_price && apt.total_price > 0);
      const appointmentsWithExtras = totalData.filter(apt => apt.extras && apt.extras.length > 0);
      
      console.log('\n💰 VERIFICAÇÃO DE PREÇOS E EXTRAS:');
      console.log('- Total de agendamentos:', totalData.length);
      console.log('- Com preço definido:', appointmentsWithPrice.length);
      console.log('- Com extras:', appointmentsWithExtras.length);
      
      if (appointmentsWithPrice.length > 0) {
        const avgPrice = appointmentsWithPrice.reduce((sum, apt) => sum + parseFloat(apt.total_price), 0) / appointmentsWithPrice.length;
        console.log('- Preço médio: R$', avgPrice.toFixed(2));
      }
      
    } else {
      console.log('⚠️ Nenhum agendamento encontrado no banco de dados');
    }
    
    console.log('\n✅ Verificação concluída!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

checkAppointments();