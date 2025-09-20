# 🚀 GitHub Actions - Página "Em Breve" Automatizada

## 📋 Resumo
Agora você pode ativar/desativar a página "Em Breve" **diretamente pelo GitHub** sem precisar acessar a Hostinger manualmente!

## 🎯 Como funciona

### ✅ Workflow criado:
- **Arquivo**: `.github/workflows/toggle-coming-soon.yml`
- **Trigger**: Manual (workflow_dispatch)
- **Ações**: Enable/Disable página "Em Breve"
- **Deploy**: Automático via FTP para Hostinger

## 🚀 Como usar

### Passo 1: Acessar GitHub Actions
1. Vá para seu repositório no GitHub
2. Clique na aba **"Actions"**
3. Procure por **"🚧 Toggle Coming Soon Page"**
4. Clique em **"Run workflow"**

### Passo 2: Configurar a ação
**Para ATIVAR página "Em Breve":**
- **Action**: `enable`
- **Message**: Sua mensagem personalizada (opcional)
  - Exemplo: `"Voltamos em Janeiro de 2025! 🐾"`
  - Padrão: `"Estamos chegando em breve! 🐾"`

**Para DESATIVAR página "Em Breve":**
- **Action**: `disable`
- **Message**: (ignorado)

### Passo 3: Executar
1. Clique em **"Run workflow"**
2. Aguarde a execução (2-3 minutos)
3. ✅ Pronto! Seu site foi atualizado automaticamente

## 🛡️ Segurança e Funcionalidades

### ✅ O que o workflow faz automaticamente:

**Modo ENABLE (Ativar):**
- 🔄 Copia `.htaccess-coming-soon` para produção
- 🎨 Aplica mensagem personalizada (se fornecida)
- 📁 Faz upload da página `coming-soon.html`
- 💾 Cria backup do `.htaccess` atual
- 🚀 Deploy automático via FTP

**Modo DISABLE (Desativar):**
- 🏗️ Faz build completo da aplicação
- 🔄 Restaura `.htaccess` original
- 🗑️ Remove arquivos da página "Em Breve"
- 🚀 Deploy da aplicação normal

### 🛡️ Proteções incluídas:
- ✅ Backup automático de arquivos importantes
- ✅ Rotas administrativas sempre funcionais
- ✅ Logs detalhados de cada ação
- ✅ Status tracking da operação

## 📊 Vantagens do GitHub Actions

### 🆚 Comparação com método manual:

| Aspecto | Manual (Hostinger) | GitHub Actions |
|---------|-------------------|----------------|
| **Tempo** | 10-15 minutos | 2-3 minutos |
| **Complexidade** | Alta | Baixa |
| **Erros** | Possíveis | Automatizado |
| **Backup** | Manual | Automático |
| **Logs** | Nenhum | Completos |
| **Reversão** | Manual | Um clique |
| **Equipe** | Precisa acesso FTP | Acesso GitHub |

### ✅ Benefícios:
- 🚀 **Rapidez**: Deploy em 2-3 minutos
- 🔒 **Segurança**: Sem exposição de credenciais FTP
- 👥 **Colaboração**: Qualquer membro da equipe pode usar
- 📝 **Rastreabilidade**: Histórico completo no GitHub
- 🔄 **Reversibilidade**: Fácil ativar/desativar
- 🎨 **Personalização**: Mensagem customizável

## 🔧 Configuração necessária

### Secrets do GitHub (já configurados):
```
FTP_HOST=seu-servidor-hostinger
FTP_USERNAME=seu-usuario-ftp
FTP_PASSWORD=sua-senha-ftp
FTP_PATH=caminho-para-public_html
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-supabase
VITE_SENTRY_DSN=seu-dsn-sentry
```

## 📱 Exemplos de uso

### Cenário 1: Manutenção programada
```
Action: enable
Message: "Manutenção programada. Voltamos às 14h! ⚙️"
```

### Cenário 2: Lançamento em breve
```
Action: enable
Message: "Grande novidade chegando em 48h! 🎉"
```

### Cenário 3: Volta ao normal
```
Action: disable
Message: (qualquer coisa, será ignorado)
```

## 🆘 Solução de problemas

### Problema: Workflow falha
**Possíveis causas:**
- Secrets do GitHub incorretos
- Problemas de conexão FTP
- Arquivos necessários não encontrados

**Soluções:**
1. Verifique os logs do workflow no GitHub
2. Confirme se todos os secrets estão configurados
3. Teste conexão FTP manualmente

### Problema: Página não atualiza
**Possíveis causas:**
- Cache do navegador/CDN
- Deploy não completou

**Soluções:**
1. Aguarde 2-3 minutos após o deploy
2. Limpe cache do navegador (Ctrl+F5)
3. Verifique logs do workflow

### Problema: Site quebrou
**Solução rápida:**
1. Execute workflow com `action: disable`
2. Isso restaurará a aplicação normal
3. Investigue o problema nos logs

## 📈 Monitoramento

### Como verificar status:
1. **GitHub Actions**: Veja histórico de execuções
2. **Logs detalhados**: Cada step é logado
3. **Notificações**: GitHub notifica sucesso/falha
4. **Site**: Teste acessando seu domínio

### Informações nos logs:
- ✅ Ação executada (enable/disable)
- 👤 Usuário que executou
- 📅 Data e hora
- 🔗 Commit relacionado
- 📁 Arquivos processados
- 🌐 Status final

## 🎯 Resumo para uso rápido

### Para ATIVAR página "Em Breve":
1. GitHub → Actions → "Toggle Coming Soon Page"
2. Run workflow → Action: `enable`
3. Message: Sua mensagem personalizada
4. Run workflow → Aguardar 2-3 min ✅

### Para DESATIVAR:
1. GitHub → Actions → "Toggle Coming Soon Page"  
2. Run workflow → Action: `disable`
3. Run workflow → Aguardar 2-3 min ✅

---

## 🏆 Resultado Final

**🎯 Agora você tem controle total da página "Em Breve" direto do GitHub!**

- ⚡ **Ativação**: 1 clique, 2-3 minutos
- 🔄 **Desativação**: 1 clique, 2-3 minutos  
- 🎨 **Personalização**: Mensagem customizável
- 🛡️ **Segurança**: Backups automáticos
- 👥 **Colaboração**: Toda equipe pode usar

**Time infalível strikes again! 🐾🚀**