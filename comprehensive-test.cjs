const http = require('http');

async function testComprehensive() {
  console.log('🚀 Teste Abrangente - PetShop Romeo & Julieta');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Homepage', url: '/' },
    { name: 'Login Page', url: '/login' },
    { name: 'Register Page', url: '/register' },
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Services', url: '/services' },
    { name: 'Store', url: '/store' },
    { name: 'Profile', url: '/profile' },
    { name: 'Pet Profile', url: '/pet-profile' },
    { name: 'Booking', url: '/booking' },
    { name: 'Admin Dashboard', url: '/admin' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Testando: ${test.name} (${test.url})`);
    
    try {
      const result = await testPage(test.url);
      results.push({
        ...test,
        ...result
      });
      
      if (result.success) {
        console.log(`✅ ${test.name}: SUCESSO`);
        console.log(`   Status: ${result.statusCode}`);
        console.log(`   Tamanho: ${result.contentLength} bytes`);
        console.log(`   Tempo: ${result.responseTime}ms`);
        if (result.hasReact) console.log(`   React: ✅ Detectado`);
        if (result.hasVite) console.log(`   Vite: ✅ Detectado`);
      } else {
        console.log(`❌ ${test.name}: FALHOU`);
        console.log(`   Erro: ${result.error}`);
        console.log(`   Status: ${result.statusCode || 'N/A'}`);
      }
    } catch (error) {
      console.log(`💥 ${test.name}: ERRO - ${error.message}`);
      results.push({
        ...test,
        success: false,
        error: error.message,
        statusCode: 0,
        responseTime: 0
      });
    }
  }
  
  // Relatório final
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const successRate = ((successful / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`Total de Páginas: ${total}`);
  console.log(`✅ Funcionando: ${successful} (${successRate}%)`);
  console.log(`❌ Com Problemas: ${total - successful}`);
  console.log('='.repeat(60));
  
  // Análise detalhada
  console.log('\n📋 ANÁLISE DETALHADA:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.url}`);
    if (result.error) {
      console.log(`   Problema: ${result.error}`);
    }
    if (result.statusCode) {
      console.log(`   Status HTTP: ${result.statusCode}`);
    }
  });
  
  // Verificar se é um problema de SPA
  const homePage = results.find(r => r.url === '/');
  if (homePage && homePage.success) {
    console.log('\n🔍 DIAGNÓSTICO:');
    console.log('✅ Página principal carregando');
    console.log('⚠️  Páginas específicas falhando - Possível problema de SPA routing');
    console.log('💡 Solução: Verificar se o servidor está configurado para SPA');
  }
  
  return results;
}

function testPage(path) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'TestSprite-Comprehensive/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const hasContent = data.length > 0;
        const hasHTML = data.includes('<html>') || data.includes('<!DOCTYPE html>');
        const hasReact = data.includes('React') || data.includes('react');
        const hasVite = data.includes('vite') || data.includes('@vite');
        const hasRoot = data.includes('id="root"');
        
        resolve({
          success: hasContent && hasHTML,
          statusCode: res.statusCode,
          contentLength: data.length,
          responseTime,
          hasReact,
          hasVite,
          hasRoot,
          error: hasContent ? null : 'No content received'
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: `Connection error: ${err.message}`,
        statusCode: 0,
        responseTime: Date.now() - startTime,
        contentLength: 0
      });
    });

    req.setTimeout(10000, () => {
      resolve({
        success: false,
        error: 'Request timeout',
        statusCode: 0,
        responseTime: Date.now() - startTime,
        contentLength: 0
      });
      req.destroy();
    });

    req.end();
  });
}

// Executar teste
testComprehensive().catch(console.error);
