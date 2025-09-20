# 🚀 **AUTOMAÇÃO DA ESTEIRA DE DEPLOY - HOSTINGER**

## **📋 VISÃO GERAL**

Este guia mostra como automatizar completamente a esteira de deploy do PetShop Romeo & Julieta para a Hostinger usando GitHub Actions, FTP automático e scripts de build.

## **🏗️ ARQUITETURA DA ESTEIRA**

```
Código → GitHub → GitHub Actions → Build → Deploy FTP → Hostinger
   ↓         ↓           ↓            ↓         ↓          ↓
 Commit   Trigger    npm build    dist/   Upload   Produção
```

## **🔧 CONFIGURAÇÃO INICIAL**

### **1. Preparação do Repositório GitHub**

#### **Secrets Necessários (GitHub Repository Settings > Secrets)**
```
FTP_HOST=ftp.hostinger.com
FTP_USERNAME=seu-usuario-ftp
FTP_PASSWORD=sua-senha-ftp
FTP_PATH=/public_html
VITE_SUPABASE_URL=https://hudiuukaoxxzxdcydgky.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-supabase
VITE_SENTRY_DSN=sua-dsn-sentry (opcional)
```

### **2. Estrutura de Arquivos para Automação**

```
.github/
├── workflows/
│   ├── deploy-production.yml    # Deploy automático para produção
│   ├── deploy-staging.yml       # Deploy para ambiente de teste
│   └── quality-check.yml        # Testes e validações
├── scripts/
│   ├── deploy.sh               # Script de deploy
│   ├── build-check.sh          # Verificação de build
│   └── ftp-upload.js           # Upload FTP automatizado
```

## **📝 ARQUIVOS DE CONFIGURAÇÃO**

### **1. GitHub Action - Deploy Produção**
**Arquivo: `.github/workflows/deploy-production.yml`**

```yaml
name: 🚀 Deploy to Hostinger Production

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    name: 🏗️ Build and Deploy
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 📦 Install Dependencies
      run: npm ci
      
    - name: 🧪 Run Tests
      run: npm run test:run
      
    - name: 🔍 Lint Code
      run: npm run lint
      
    - name: 🏗️ Build Application
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
      run: npm run build
      
    - name: 📊 Build Size Check
      run: |
        echo "📦 Build completed successfully!"
        du -sh dist/
        ls -la dist/
        
    - name: 🚀 Deploy to Hostinger via FTP
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_HOST }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: ${{ secrets.FTP_PATH }}/
        exclude: |
          **/.git*
          **/.git*/**
          **/node_modules/**
          **/.env*
          
    - name: 🎉 Deploy Success Notification
      run: |
        echo "✅ Deploy completed successfully!"
        echo "🌐 Site available at: https://seu-dominio.com"
        echo "📅 Deploy time: $(date)"
```

### **2. GitHub Action - Deploy Staging**
**Arquivo: `.github/workflows/deploy-staging.yml`**

```yaml
name: 🧪 Deploy to Hostinger Staging

on:
  push:
    branches: [ develop, staging ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy-staging:
    name: 🏗️ Build and Deploy to Staging
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 📦 Install Dependencies
      run: npm ci
      
    - name: 🧪 Run Tests
      run: npm run test:run
      
    - name: 🏗️ Build Application
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      run: npm run build
      
    - name: 🚀 Deploy to Staging
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_HOST }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: /public_html/staging/
```

### **3. GitHub Action - Quality Check**
**Arquivo: `.github/workflows/quality-check.yml`**

```yaml
name: 🔍 Quality Check

on:
  pull_request:
    branches: [ main, master, develop ]

jobs:
  quality-check:
    name: 🧪 Run Quality Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 📦 Install Dependencies
      run: npm ci
      
    - name: 🔍 Lint Check
      run: npm run lint
      
    - name: 🧪 Run Tests
      run: npm run test:run
      
    - name: 📊 Test Coverage
      run: npm run test:coverage
      
    - name: 🏗️ Build Check
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      run: npm run build
```

## **🛠️ SCRIPTS AUXILIARES**

### **1. Script de Deploy Local**
**Arquivo: `scripts/deploy-hostinger.js`**

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy para Hostinger...');

try {
  // 1. Verificar se está no branch correto
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Branch atual: ${branch}`);
  
  if (branch !== 'main' && branch !== 'master') {
    console.log('⚠️  Aviso: Você não está no branch main/master');
  }
  
  // 2. Verificar se há mudanças não commitadas
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status) {
    console.log('⚠️  Há mudanças não commitadas:');
    console.log(status);
    process.exit(1);
  }
  
  // 3. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm ci', { stdio: 'inherit' });
  
  // 4. Executar testes
  console.log('🧪 Executando testes...');
  execSync('npm run test:run', { stdio: 'inherit' });
  
  // 5. Build da aplicação
  console.log('🏗️  Fazendo build da aplicação...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 6. Verificar se o build foi criado
  if (!fs.existsSync('dist')) {
    throw new Error('❌ Pasta dist não foi criada!');
  }
  
  console.log('✅ Build concluído com sucesso!');
  console.log('📊 Tamanho do build:');
  execSync('du -sh dist/', { stdio: 'inherit' });
  
  console.log('\n🎉 Deploy pronto! Agora faça o push para o GitHub:');
  console.log('git add .');
  console.log('git commit -m "Deploy: $(date)"');
  console.log('git push origin main');
  
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
}
```

### **2. Script de Configuração do .htaccess**
**Arquivo: `scripts/generate-htaccess.js`**

```javascript
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
</IfModule>
`;

// Criar arquivo .htaccess na pasta dist
const distPath = path.join(process.cwd(), 'dist');
const htaccessPath = path.join(distPath, '.htaccess');

if (!fs.existsSync(distPath)) {
  console.log('❌ Pasta dist não encontrada. Execute npm run build primeiro.');
  process.exit(1);
}

fs.writeFileSync(htaccessPath, htaccessContent);
console.log('✅ Arquivo .htaccess criado em dist/.htaccess');
console.log('🔧 Configurações incluídas:');
console.log('   - Redirect HTTPS');
console.log('   - Suporte React Router (SPA)');
console.log('   - Headers de segurança');
console.log('   - Compressão GZIP');
console.log('   - Cache de assets');
`;

## **⚙️ CONFIGURAÇÃO DO PACKAGE.JSON**

### **Adicionar Scripts de Deploy**

```json
{
  "scripts": {
    "deploy:local": "node scripts/deploy-hostinger.js",
    "deploy:htaccess": "node scripts/generate-htaccess.js",
    "deploy:build": "npm run build && npm run deploy:htaccess",
    "deploy:check": "npm run lint && npm run test:run && npm run build"
  }
}
```

## **🚀 PROCESSO DE DEPLOY AUTOMATIZADO**

### **1. Deploy Automático (Recomendado)**

```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"

# 2. Push para GitHub (dispara deploy automático)
git push origin main

# 3. Acompanhar deploy no GitHub Actions
# https://github.com/seu-usuario/seu-repo/actions
```

### **2. Deploy Manual (Backup)**

```bash
# 1. Verificar qualidade do código
npm run deploy:check

# 2. Deploy local
npm run deploy:local

# 3. Push para GitHub
git push origin main
```

## **📊 MONITORAMENTO E LOGS**

### **1. GitHub Actions Logs**
- Acesse: `https://github.com/seu-usuario/seu-repo/actions`
- Monitore builds em tempo real
- Receba notificações de falhas

### **2. Hostinger Logs**
- Painel Hostinger > Arquivos > Logs de Erro
- Monitore erros 404, 500, etc.

### **3. Sentry (Opcional)**
- Monitoramento de erros em produção
- Alertas automáticos
- Performance monitoring

## **🔧 CONFIGURAÇÕES HOSTINGER**

### **1. Configurações PHP (se necessário)**
```ini
# .htaccess ou painel Hostinger
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value memory_limit 256M
```

### **2. Configurações de Domínio**
- Apontar domínio para pasta `/public_html`
- Configurar SSL/HTTPS
- Configurar redirects www/non-www

## **🚨 TROUBLESHOOTING**

### **Problemas Comuns**

1. **Deploy falha no GitHub Actions**
   ```bash
   # Verificar secrets configurados
   # Verificar permissões FTP
   # Verificar path do servidor
   ```

2. **Erro 404 em rotas React**
   ```bash
   # Verificar se .htaccess foi criado
   # Verificar configuração SPA
   ```

3. **Assets não carregam**
   ```bash
   # Verificar paths relativos
   # Verificar configuração Vite
   ```

## **📈 PRÓXIMOS PASSOS**

1. **✅ Configurar GitHub Actions**
2. **✅ Testar deploy em staging**
3. **✅ Configurar monitoramento**
4. **✅ Documentar processo para equipe**
5. **✅ Configurar backups automáticos**

---

**🎉 Com essa configuração, sua esteira estará 100% automatizada!**

**Fluxo:** `Código → GitHub → Build → Deploy → Produção` ✨