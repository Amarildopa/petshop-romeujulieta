# 🚀 **GUIA DE DEPLOY - PETSHOP ROMEO & JULIETA**

## **📋 VISÃO GERAL**

Este documento fornece instruções completas para fazer o deploy da aplicação PetShop Romeo & Julieta em diferentes ambientes e provedores.

## **🏗️ ARQUITETURA DO SISTEMA**

### **Stack Tecnológica**
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: Tailwind CSS + Framer Motion
- **Deploy**: Vercel/Netlify + Supabase Cloud

### **Estrutura de Ambientes**
```
Desenvolvimento → Staging → Produção
     ↓              ↓         ↓
   Local Dev    Preview    Production
```

## **🔧 PRÉ-REQUISITOS**

### **1. Contas Necessárias**
- [ ] **Supabase** - Banco de dados e autenticação
- [ ] **Vercel/Netlify** - Hospedagem do frontend
- [ ] **GitHub** - Controle de versão
- [ ] **Sentry** (opcional) - Monitoramento de erros

### **2. Ferramentas Locais**
- [ ] **Node.js** 18+ instalado
- [ ] **Git** configurado
- [ ] **Supabase CLI** (opcional)

## **📦 CONFIGURAÇÃO INICIAL**

### **1. Clone do Repositório**
```bash
git clone https://github.com/seu-usuario/petshop-romeo-julieta.git
cd petshop-romeo-julieta
npm install
```

### **2. Configuração do Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env.local

# Editar variáveis de ambiente
nano .env.local
```

### **3. Configuração do Supabase**

#### **3.1 Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha organização e nome do projeto
4. Aguarde a criação (2-3 minutos)

#### **3.2 Configurar Banco de Dados**
```bash
# Executar script de criação do banco
psql -h db.seu-projeto.supabase.co -U postgres -d postgres -f database-schema.sql

# Ou usar o SQL Editor do Supabase
# Copie e cole o conteúdo de database-schema.sql
```

#### **3.3 Configurar Autenticação**
1. Acesse **Authentication > Settings**
2. Configure **Site URL**: `http://localhost:5173` (dev)
3. Configure **Redirect URLs**: 
   - `http://localhost:5173/**` (dev)
   - `https://seu-dominio.com/**` (prod)

#### **3.4 Configurar Storage**
1. Acesse **Storage**
2. Crie bucket `petshop-images`
3. Configure políticas de acesso

### **4. Configurar Variáveis de Ambiente**

#### **4.1 Desenvolvimento (.env.local)**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

#### **4.2 Produção (Vercel/Netlify)**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
VITE_SENTRY_DSN=sua-dsn-sentry
```

## **🚀 DEPLOY NO VERCEL**

### **1. Configuração Inicial**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy inicial
vercel
```

### **2. Configuração do Projeto**
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings > Environment Variables**
4. Adicione todas as variáveis de ambiente

### **3. Configuração de Domínio**
1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### **4. Configuração de Build**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_NODE_ENV": "production"
  }
}
```

## **🌐 DEPLOY NO NETLIFY**

### **1. Configuração Inicial**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login na Netlify
netlify login

# Deploy inicial
netlify deploy --prod
```

### **2. Configuração do Projeto**
1. Acesse [app.netlify.com](https://app.netlify.com)
2. Selecione seu site
3. Vá em **Site settings > Environment variables**
4. Adicione todas as variáveis de ambiente

### **3. Configuração de Build**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## **🗄️ CONFIGURAÇÃO DO BANCO DE DADOS**

### **1. Executar Scripts de Criação**
```bash
# Validar estrutura do banco
psql -h db.seu-projeto.supabase.co -U postgres -d postgres -f scripts/validate-database.sql

# Criar primeiro administrador
psql -h db.seu-projeto.supabase.co -U postgres -d postgres -f scripts/setup-admin-dev.sql
```

### **2. Configurar RLS (Row Level Security)**
```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%_pet';
```

### **3. Configurar Políticas de Acesso**
```sql
-- Exemplo de política para profiles_pet
CREATE POLICY "Users can view own profile" ON profiles_pet
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles_pet
  FOR UPDATE USING (auth.uid() = id);
```

## **🔐 CONFIGURAÇÃO DE SEGURANÇA**

### **1. Configurar CORS**
```sql
-- No Supabase SQL Editor
UPDATE auth.config 
SET site_url = 'https://seu-dominio.com',
    additional_redirect_urls = '["https://seu-dominio.com/**"]';
```

### **2. Configurar Rate Limiting**
```sql
-- Configurar limites de requisição
INSERT INTO system_settings_pet (key, value, description, category) VALUES
('rate_limit_requests', '1000', 'Máximo de requisições por hora', 'security'),
('rate_limit_window', '3600', 'Janela de tempo em segundos', 'security');
```

### **3. Configurar Backup**
```sql
-- Configurar backup automático
INSERT INTO system_settings_pet (key, value, description, category) VALUES
('backup_enabled', 'true', 'Backup automático habilitado', 'system'),
('backup_frequency', 'daily', 'Frequência do backup', 'system');
```

## **📊 MONITORAMENTO E OBSERVABILIDADE**

### **1. Configurar Sentry**
```bash
# Instalar Sentry
npm install @sentry/react @sentry/tracing

# Configurar no código
# src/lib/sentry.ts já está configurado
```

### **2. Configurar Logs**
```typescript
// Exemplo de uso dos logs
import { logger } from './lib/logger'

logger.info('User logged in', { userId: user.id })
logger.error('Database error', error, { query: 'SELECT * FROM users' })
```

### **3. Configurar Métricas**
```typescript
// Exemplo de uso das métricas
import { metrics } from './lib/metrics'

metrics.recordBusinessEvent('user_registered', 1, 'auth')
metrics.measurePerformance('api_call', duration)
```

## **🧪 TESTES E VALIDAÇÃO**

### **1. Testes Locais**
```bash
# Executar testes
npm run test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

### **2. Validação do Banco**
```bash
# Validar estrutura do banco
psql -h db.seu-projeto.supabase.co -U postgres -d postgres -f scripts/validate-database.sql
```

### **3. Validação da Aplicação**
```bash
# Build de produção
npm run build

# Preview local
npm run preview

# Verificar se não há erros
npm run lint
```

## **🔄 CI/CD E AUTOMAÇÃO**

### **1. GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### **2. Deploy Automático**
```bash
# Configurar webhook do Vercel
# 1. Acesse Vercel Dashboard
# 2. Vá em Settings > Git
# 3. Conecte com GitHub
# 4. Configure auto-deploy
```

## **📈 OTIMIZAÇÕES DE PERFORMANCE**

### **1. Configuração do Vite**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

### **2. Configuração do Supabase**
```sql
-- Criar índices para performance
CREATE INDEX CONCURRENTLY idx_appointments_pet_date_status 
ON appointments_pet(appointment_date, status);

CREATE INDEX CONCURRENTLY idx_orders_pet_user_status 
ON orders_pet(user_id, status);
```

### **3. Configuração de CDN**
```typescript
// Configurar CDN para assets estáticos
const cdnUrl = import.meta.env.VITE_CDN_URL || ''

export const getAssetUrl = (path: string) => {
  return `${cdnUrl}${path}`
}
```

## **🔍 TROUBLESHOOTING**

### **1. Problemas Comuns**

#### **Erro de CORS**
```sql
-- Verificar configuração de CORS no Supabase
SELECT * FROM auth.config;
```

#### **Erro de RLS**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### **Erro de Build**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **2. Logs e Debugging**
```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'true')

// Verificar logs no console
console.log('Debug mode enabled')
```

### **3. Monitoramento**
```typescript
// Verificar métricas de performance
import { metrics } from './lib/metrics'
console.log('Collected metrics:', metrics.getCollectedMetrics())
```

## **📋 CHECKLIST DE DEPLOY**

### **Pré-Deploy**
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes passando
- [ ] Build funcionando
- [ ] RLS configurado
- [ ] Políticas de acesso criadas

### **Deploy**
- [ ] Código commitado
- [ ] Deploy executado
- [ ] Domínio configurado
- [ ] SSL funcionando
- [ ] Redirecionamentos configurados

### **Pós-Deploy**
- [ ] Aplicação funcionando
- [ ] Login funcionando
- [ ] Banco de dados acessível
- [ ] Logs funcionando
- [ ] Monitoramento ativo

## **🆘 SUPORTE**

### **Recursos Úteis**
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Tailwind](https://tailwindcss.com/docs)

### **Contato**
- **Email**: suporte@petshop.com
- **GitHub**: [Issues](https://github.com/seu-usuario/petshop-romeo-julieta/issues)
- **Discord**: [Servidor da Comunidade](https://discord.gg/petshop)

---

**✅ Sistema PetShop Romeo & Julieta v1.0 - Pronto para Produção!**
