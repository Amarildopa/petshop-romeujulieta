const fs = require('fs');
const path = require('path');

// Arquivos a serem corrigidos
const filesToFix = [
  'src/services/analyticsService.ts',
  'src/services/loyaltyService.ts',
  'src/services/marketplaceService.ts',
  'src/services/socialService.ts',
  'src/services/subscriptionService.ts',
  'src/services/affiliateService.ts'
];

// Função para comentar parâmetros não utilizados
function fixUnusedParams(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Padrão para encontrar parâmetros não utilizados (começando com _ ou mencionados no erro de lint)
  const unusedParamPattern = /(\w+)\s*:\s*[^,\)]+/g;
  
  // Substituir parâmetros não utilizados por comentários
  const fixedContent = content.replace(/\b(_\w+|period|affiliateId|userAgent|referrer|limit)\s*:\s*[^,\)]+/g, 
    match => `/* ${match} */`);
  
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

// Processar cada arquivo
filesToFix.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixUnusedParams(fullPath);
  } else {
    console.error(`File not found: ${fullPath}`);
  }
});

console.log('Lint fixes completed!');