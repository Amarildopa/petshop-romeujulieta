import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arquivos a serem corrigidos
const filesToFix = [
  'src/services/affiliateService.ts'
];

// Função para comentar parâmetros não utilizados
function fixUnusedParams(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Substituir parâmetros não utilizados por comentários
  let fixedContent = content;
  
  // Substituir affiliateId
  fixedContent = fixedContent.replace(/affiliateId\s*:\s*string/g, '/* affiliateId: string */');
  
  // Substituir period
  fixedContent = fixedContent.replace(/period\s*:\s*string/g, '/* period: string */');
  
  // Substituir userAgent e referrer
  fixedContent = fixedContent.replace(/userAgent\s*:\s*string/g, '/* userAgent: string */');
  fixedContent = fixedContent.replace(/referrer\s*:\s*string/g, '/* referrer: string */');
  
  // Substituir limit
  fixedContent = fixedContent.replace(/limit\s*=\s*\d+/g, '/* $& */');
  
  fs.writeFileSync(fullPath, fixedContent, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

// Processar cada arquivo
filesToFix.forEach(file => {
  fixUnusedParams(file);
});

console.log('Lint fixes completed!');