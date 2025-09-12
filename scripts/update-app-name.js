#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar configuração do nome da aplicação
import { APP_NAME, APP_SHORT_NAME, APP_DESCRIPTION } from '../src/config/app-name.js';

console.log('🔄 Atualizando nome da aplicação...');
console.log(`📝 Nome: ${APP_NAME}`);
console.log(`📝 Nome curto: ${APP_SHORT_NAME}`);
console.log(`📝 Descrição: ${APP_DESCRIPTION}`);

// Lista de arquivos para atualizar
const filesToUpdate = [
  'src/components/Header.tsx',
  'src/pages/Home.tsx',
  'src/pages/Register.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/components/AdminSidebar.tsx',
  'index.html',
  'package.json'
];

// Padrões de busca e substituição
const replacements = [
  // Padrões para PetShop Romeu & Julieta
  { search: /PetShop Romeu & Julieta/g, replace: APP_NAME },
  { search: /PetShop Romeo & Julieta/g, replace: APP_NAME },
  { search: /Romeu & Julieta/g, replace: APP_SHORT_NAME },
  { search: /Romeo & Julieta/g, replace: APP_SHORT_NAME },
  
  // Padrões específicos
  { search: /Junte-se ao PetShop Romeu & Julieta/g, replace: `Junte-se ao ${APP_NAME}` },
  { search: /A Experiência Romeu & Julieta/g, replace: `A Experiência ${APP_SHORT_NAME}` },
  { search: /família Romeu & Julieta/g, replace: `família ${APP_SHORT_NAME}` },
  { search: /Visão geral do sistema PetShop Romeo & Julieta/g, replace: `Visão geral do sistema ${APP_NAME}` },
];

// Função para atualizar um arquivo
function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Aplicar todas as substituições
    replacements.forEach(({ search, replace }) => {
      const newContent = content.replace(search, replace);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
    } else {
      console.log(`ℹ️  Sem alterações: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
  }
}

// Atualizar todos os arquivos
console.log('\n📁 Atualizando arquivos...');
filesToUpdate.forEach(updateFile);

console.log('\n🎉 Atualização concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Verifique se todas as alterações estão corretas');
console.log('2. Execute: npm run dev');
console.log('3. Teste a aplicação');
