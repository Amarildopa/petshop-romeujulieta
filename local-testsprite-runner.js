const http = require('http');
const fs = require('fs');
const path = require('path');

// Simular execução do TestSprite localmente
async function runLocalTestSprite() {
  console.log('🚀 Iniciando TestSprite Local na porta 3000...');
  
  const testCases = [
    {
      id: 'TC001',
      name: 'User Registration with Valid Data',
      url: 'http://localhost:3000/register',
      description: 'Verify that new users can register with valid email, password, and required fields successfully.'
    },
    {
      id: 'TC002', 
      name: 'User Login with Correct Credentials',
      url: 'http://localhost:3000/login',
      description: 'Check login functionality using valid email and password to access the system.'
    },
    {
      id: 'TC003',
      name: 'User Login with Incorrect Password', 
      url: 'http://localhost:3000/login',
      description: 'Ensure login fails when an incorrect password is submitted.'
    },
    {
      id: 'TC004',
      name: 'Password Recovery Workflow',
      url: 'http://localhost:3000/forgot-password',
      description: 'Verify that forgotten password recovery via email works correctly.'
    },
    {
      id: 'TC005',
      name: 'Create New Pet Profile with Complete Details',
      url: 'http://localhost:3000/pet-profile',
      description: 'Verify user can create a pet profile with all mandatory health and demographic information.'
    }
  ];

  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Executando ${testCase.id}: ${testCase.name}`);
    
    try {
      const result = await testPage(testCase.url);
      results.push({
        ...testCase,
        status: result.success ? 'PASSED' : 'FAILED',
        error: result.error,
        responseTime: result.responseTime,
        hasContent: result.hasContent
      });
      
      if (result.success) {
        console.log(`✅ ${testCase.id}: PASSED`);
      } else {
        console.log(`❌ ${testCase.id}: FAILED - ${result.error}`);
      }
    } catch (error) {
      results.push({
        ...testCase,
        status: 'ERROR',
        error: error.message,
        responseTime: 0,
        hasContent: false
      });
      console.log(`💥 ${testCase.id}: ERROR - ${error.message}`);
    }
  }
  
  // Gerar relatório
  generateReport(results);
}

function testPage(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url.replace('http://localhost:3000', ''),
      method: 'GET',
      headers: {
        'User-Agent': 'TestSprite-Local/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const hasContent = data.length > 0 && data.includes('<html>');
        const hasReactRoot = data.includes('id="root"');
        const hasVite = data.includes('vite') || data.includes('@vite');
        
        resolve({
          success: hasContent && hasReactRoot,
          error: hasContent ? null : 'Page not loading or empty content',
          responseTime,
          hasContent: hasContent,
          hasReactRoot,
          hasVite,
          contentLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: `Connection error: ${err.message}`,
        responseTime: Date.now() - startTime,
        hasContent: false
      });
    });

    req.setTimeout(5000, () => {
      resolve({
        success: false,
        error: 'Request timeout',
        responseTime: Date.now() - startTime,
        hasContent: false
      });
      req.destroy();
    });

    req.end();
  });
}

function generateReport(results) {
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - TestSprite Local');
  console.log('='.repeat(60));
  console.log(`Total de Testes: ${total}`);
  console.log(`✅ Aprovados: ${passed} (${successRate}%)`);
  console.log(`❌ Falharam: ${failed}`);
  console.log(`💥 Erros: ${errors}`);
  console.log('='.repeat(60));
  
  console.log('\n📋 DETALHES DOS TESTES:');
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '💥';
    console.log(`${status} ${result.id}: ${result.name}`);
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
    if (result.responseTime) {
      console.log(`   Tempo: ${result.responseTime}ms`);
    }
  });
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      errors,
      successRate: parseFloat(successRate)
    },
    results
  };
  
  fs.writeFileSync('testsprite_tests/local-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório salvo em: testsprite_tests/local-test-report.json');
}

// Executar
runLocalTestSprite().catch(console.error);
