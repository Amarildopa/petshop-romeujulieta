# 🚀 **DEPLOY RÁPIDO - HOSTINGER**

## **⚡ SETUP INICIAL (APENAS UMA VEZ)**

### **1. Configurar GitHub Secrets**
Vá em: `GitHub Repository > Settings > Secrets and Variables > Actions`

Adicione os seguintes secrets:
```
FTP_HOST=ftp.hostinger.com
FTP_USERNAME=seu-usuario-ftp
FTP_PASSWORD=sua-senha-ftp
FTP_PATH=/public_html
VITE_SUPABASE_URL=https://hudiuukaoxxzxdcydgky.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-supabase
VITE_SENTRY_DSN=sua-dsn-sentry (opcional)
```

### **2. Configurar Branches**
```bash
# Branch principal (produção)
git checkout main

# Branch de desenvolvimento (staging)
git checkout -b develop
git push -u origin develop
```

## **🚀 DEPLOY AUTOMÁTICO (RECOMENDADO)**

### **Deploy para Produção**
```bash
# 1. Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"

# 2. Push para main (dispara deploy automático)
git push origin main

# 3. Acompanhar em: https://github.com/seu-repo/actions
```

### **Deploy para Staging**
```bash
# 1. Fazer alterações no branch develop
git checkout develop
git add .
git commit -m "test: testando funcionalidade"

# 2. Push para develop (dispara staging)
git push origin develop

# 3. Testar em: https://seu-dominio.com/staging
```

## **🛠️ DEPLOY MANUAL (BACKUP)**

### **Opção 1: Script Automatizado**
```bash
# Verificar, testar e buildar
npm run deploy:check

# Deploy local completo
npm run deploy:local

# Push para GitHub
git push origin main
```

### **Opção 2: Passo a Passo**
```bash
# 1. Instalar dependências
npm ci

# 2. Executar testes
npm run test:run

# 3. Verificar código
npm run lint

# 4. Build + .htaccess
npm run deploy:build

# 5. Upload manual via FTP (se necessário)
# Fazer upload da pasta dist/ para /public_html/
```

## **📊 MONITORAMENTO**

### **GitHub Actions**
- **URL**: `https://github.com/seu-usuario/seu-repo/actions`
- **Status**: ✅ Verde = Sucesso | ❌ Vermelho = Falha
- **Logs**: Clique no workflow para ver detalhes

### **Site em Produção**
- **URL**: `https://seu-dominio.com`
- **Staging**: `https://seu-dominio.com/staging`
- **Tempo de deploy**: ~2-5 minutos

## **🚨 TROUBLESHOOTING**

### **Deploy Falha no GitHub Actions**
```bash
# Verificar secrets configurados
# Verificar permissões FTP
# Verificar se branch está correto
```

### **Site não Carrega (404)**
```bash
# Verificar se .htaccess foi criado
# Verificar configuração do domínio
# Verificar pasta de destino no FTP
```

### **Erro de Build**
```bash
# Testar localmente
npm run build

# Verificar variáveis de ambiente
# Verificar dependências
npm ci
```

## **📋 CHECKLIST DE DEPLOY**

### **Antes do Deploy**
- [ ] Código testado localmente
- [ ] Testes passando (`npm run test:run`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Build funcionando (`npm run build`)
- [ ] Secrets configurados no GitHub

### **Após o Deploy**
- [ ] Site carregando corretamente
- [ ] Rotas funcionando (SPA)
- [ ] Funcionalidades principais OK
- [ ] Console sem erros críticos
- [ ] Performance aceitável

## **⚙️ COMANDOS ÚTEIS**

```bash
# Verificar status do repositório
git status

# Ver últimos commits
git log --oneline -5

# Verificar qual branch está ativo
git branch

# Testar build localmente
npm run preview

# Verificar tamanho do build
du -sh dist/

# Limpar cache do npm
npm cache clean --force
```

## **🎯 FLUXO RECOMENDADO**

```
1. Desenvolver em branch feature/nome-da-feature
2. Merge para develop (testa em staging)
3. Testar funcionalidades em staging
4. Merge para main (deploy automático em produção)
5. Monitorar deploy e site em produção
```

---

**🎉 Com essa configuração, seu deploy está 100% automatizado!**

**Dúvidas?** Consulte o arquivo `AUTOMACAO_ESTEIRA_HOSTINGER.md` para detalhes completos.