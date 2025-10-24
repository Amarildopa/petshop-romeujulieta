#!/usr/bin/env node

/**
 * Script de Restauração de Backup - Landing Page Hero
 * 
 * Este script restaura automaticamente os arquivos da Landing Page
 * a partir do backup criado em 2025-10-24_16-32-38
 * 
 * Uso:
 *   node restore-backup.js
 *   npm run restore-backup
 */

const fs = require('fs');
const path = require('path');

// Configurações do backup
const BACKUP_TIMESTAMP = '2025-10-24_16-32-38';
const BACKUP_DIR = path.join(__dirname);
const PROJECT_ROOT = path.join(__dirname, '../../../');

// Mapeamento dos arquivos de backup para seus destinos originais
const FILES_TO_RESTORE = [
  {
    backup: path.join(BACKUP_DIR, 'Home.tsx.backup'),
    original: path.join(PROJECT_ROOT, 'src/pages/Home.tsx'),
    description: 'Componente principal da Landing Page (Hero Section)'
  },
  {
    backup: path.join(BACKUP_DIR, 'index.css.backup'),
    original: path.join(PROJECT_ROOT, 'src/index.css'),
    description: 'Estilos CSS principais'
  },
  {
    backup: path.join(BACKUP_DIR, 'images.ts.backup'),
    original: path.join(PROJECT_ROOT, 'src/config/images.ts'),
    description: 'Configurações de imagens'
  }
];

/**
 * Função para criar backup dos arquivos atuais antes da restauração
 */
function createPreRestoreBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const preRestoreDir = path.join(__dirname, '../pre-restore-' + timestamp);
  
  console.log('🔄 Criando backup dos arquivos atuais antes da restauração...');
  
  if (!fs.existsSync(preRestoreDir)) {
    fs.mkdirSync(preRestoreDir, { recursive: true });
  }
  
  FILES_TO_RESTORE.forEach(file => {
    if (fs.existsSync(file.original)) {
      const backupName = path.basename(file.original) + '.pre-restore';
      const preRestoreFile = path.join(preRestoreDir, backupName);
      fs.copyFileSync(file.original, preRestoreFile);
      console.log(`   ✅ Backup criado: ${backupName}`);
    }
  });
  
  console.log(`📁 Backup pré-restauração salvo em: ${preRestoreDir}\n`);
}

/**
 * Função para verificar se todos os arquivos de backup existem
 */
function validateBackupFiles() {
  console.log('🔍 Verificando arquivos de backup...');
  
  let allFilesExist = true;
  
  FILES_TO_RESTORE.forEach(file => {
    if (fs.existsSync(file.backup)) {
      console.log(`   ✅ ${path.basename(file.backup)} - OK`);
    } else {
      console.log(`   ❌ ${path.basename(file.backup)} - ARQUIVO NÃO ENCONTRADO`);
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    console.error('\n❌ Erro: Alguns arquivos de backup não foram encontrados!');
    console.error('Verifique se você está executando o script do diretório correto.');
    process.exit(1);
  }
  
  console.log('✅ Todos os arquivos de backup foram encontrados!\n');
}

/**
 * Função principal de restauração
 */
function restoreFiles() {
  console.log('🔄 Iniciando restauração dos arquivos...');
  
  FILES_TO_RESTORE.forEach(file => {
    try {
      // Criar diretório de destino se não existir
      const destDir = path.dirname(file.original);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copiar arquivo de backup para o local original
      fs.copyFileSync(file.backup, file.original);
      
      console.log(`   ✅ ${file.description}`);
      console.log(`      ${path.relative(PROJECT_ROOT, file.original)}`);
      
    } catch (error) {
      console.error(`   ❌ Erro ao restaurar ${file.description}:`);
      console.error(`      ${error.message}`);
      process.exit(1);
    }
  });
  
  console.log('\n🎉 Restauração concluída com sucesso!');
}

/**
 * Função para exibir informações do backup
 */
function showBackupInfo() {
  console.log('📋 INFORMAÇÕES DO BACKUP');
  console.log('========================');
  console.log(`Timestamp: ${BACKUP_TIMESTAMP}`);
  console.log(`Diretório: ${BACKUP_DIR}`);
  console.log('\n📁 Arquivos incluídos no backup:');
  
  FILES_TO_RESTORE.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.description}`);
    console.log(`      Arquivo: ${path.basename(file.backup)}`);
    console.log(`      Destino: ${path.relative(PROJECT_ROOT, file.original)}`);
  });
  
  console.log('\n');
}

/**
 * Função principal
 */
function main() {
  console.log('🚀 SCRIPT DE RESTAURAÇÃO - LANDING PAGE HERO');
  console.log('=============================================\n');
  
  // Mostrar informações do backup
  showBackupInfo();
  
  // Validar arquivos de backup
  validateBackupFiles();
  
  // Criar backup dos arquivos atuais
  createPreRestoreBackup();
  
  // Restaurar arquivos
  restoreFiles();
  
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('==================');
  console.log('1. Verifique se a aplicação está funcionando corretamente');
  console.log('2. Teste a seção Hero da Landing Page');
  console.log('3. Confirme se os 3 CTAs estão funcionando (Agendar, WhatsApp, Instagram)');
  console.log('4. Se houver problemas, verifique o backup pré-restauração criado');
  
  console.log('\n✨ Restauração finalizada!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  restoreFiles,
  validateBackupFiles,
  createPreRestoreBackup,
  FILES_TO_RESTORE,
  BACKUP_TIMESTAMP
};