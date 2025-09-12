#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
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
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Error Pages (opcional)
# ErrorDocument 404 /index.html
# ErrorDocument 500 /index.html

# Prevent access to sensitive files
<Files ".env*">
    Order allow,deny
    Deny from all
</Files>

<Files "*.config.js">
    Order allow,deny
    Deny from all
</Files>

# Block access to source maps in production
<Files "*.map">
    Order allow,deny
    Deny from all
</Files>
`;

// Criar arquivo .htaccess na pasta dist
const distPath = path.join(process.cwd(), 'dist');
const htaccessPath = path.join(distPath, '.htaccess');

if (!fs.existsSync(distPath)) {
  console.log('❌ Pasta dist não encontrada. Execute npm run build primeiro.');
  console.log('\n💡 Para criar o build:');
  console.log('npm run build');
  process.exit(1);
}

try {
  fs.writeFileSync(htaccessPath, htaccessContent);
  console.log('✅ Arquivo .htaccess criado em dist/.htaccess');
  console.log('\n🔧 Configurações incluídas:');
  console.log('   ✅ Redirect HTTPS automático');
  console.log('   ✅ Suporte React Router (SPA)');
  console.log('   ✅ Headers de segurança');
  console.log('   ✅ Compressão GZIP');
  console.log('   ✅ Cache de assets (1 ano)');
  console.log('   ✅ Proteção de arquivos sensíveis');
  console.log('   ✅ Bloqueio de source maps');
  
  // Verificar tamanho do arquivo
  const stats = fs.statSync(htaccessPath);
  console.log(`\n📊 Tamanho do .htaccess: ${stats.size} bytes`);
  
  console.log('\n🚀 Pronto para deploy na Hostinger!');
  
} catch (error) {
  console.error('❌ Erro ao criar .htaccess:', error.message);
  console.log('\n🔧 Possíveis soluções:');
  console.log('- Verifique se você tem permissão de escrita na pasta dist/');
  console.log('- Execute como administrador se necessário');
  console.log('- Verifique se a pasta dist/ existe');
  process.exit(1);
}