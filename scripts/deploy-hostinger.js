#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

console.log('🚀 Iniciando deploy para Hostinger...');

try {
  // 1. Verificar se está no branch correto
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Branch atual: ${branch}`);
  
  if (branch !== 'main' && branch !== 'master') {
    console.log('⚠️  Aviso: Você não está no branch main/master');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Deseja continuar mesmo assim? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Deploy cancelado pelo usuário');
      process.exit(0);
    }
  }
  
  // 2. Verificar se há mudanças não commitadas
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status) {
    console.log('⚠️  Há mudanças não commitadas:');
    console.log(status);
    console.log('\n💡 Commit suas mudanças antes do deploy:');
    console.log('git add .');
    console.log('git commit -m "Suas alterações"');
    process.exit(1);
  }
  
  // 3. Verificar se Node.js está na versão correta
  const nodeVersion = process.version;
  console.log(`🟢 Node.js version: ${nodeVersion}`);
  
  // 4. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm ci', { stdio: 'inherit' });
  
  // 5. Executar testes
  console.log('🧪 Executando testes...');
  try {
    execSync('npm run test:run', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Testes falharam! Corrija os erros antes do deploy.');
    process.exit(1);
  }
  
  // 6. Verificar lint
  console.log('🔍 Verificando código (lint)...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Lint falhou! Corrija os problemas de código.');
    process.exit(1);
  }
  
  // 7. Build da aplicação
  console.log('🏗️  Fazendo build da aplicação...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 8. Verificar se o build foi criado
  if (!fs.existsSync('dist')) {
    throw new Error('❌ Pasta dist não foi criada!');
  }
  
  // 9. Gerar .htaccess
  console.log('🔧 Gerando arquivo .htaccess...');
  const htaccessContent = `# PetShop Romeo & Julieta - Hostinger Configuration

# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle React Router (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
`;
  
  fs.writeFileSync(path.join('dist', '.htaccess'), htaccessContent);
  
  console.log('✅ Build concluído com sucesso!');
  console.log('📊 Informações do build:');
  
  // Mostrar tamanho do build
  try {
    execSync('du -sh dist/', { stdio: 'inherit' });
  } catch {
    // Fallback para Windows
    const stats = fs.statSync('dist');
    console.log(`📦 Tamanho aproximado: ${Math.round(stats.size / 1024)}KB`);
  }
  
  // Listar arquivos principais
  console.log('\n📁 Arquivos principais:');
  const files = fs.readdirSync('dist');
  files.forEach(file => {
    const filePath = path.join('dist', file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
    }
  });
  
  console.log('\n🎉 Deploy local pronto!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Verifique os arquivos em dist/');
  console.log('2. Faça o push para GitHub para deploy automático:');
  console.log('   git push origin main');
  console.log('3. Ou faça upload manual via FTP para Hostinger');
  console.log('\n🌐 Após o deploy, acesse: https://seu-dominio.com');
  
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  console.log('\n🔧 Possíveis soluções:');
  console.log('- Verifique se todas as dependências estão instaladas');
  console.log('- Corrija erros de lint e testes');
  console.log('- Verifique as variáveis de ambiente');
  console.log('- Execute: npm install && npm run build');
  process.exit(1);
}