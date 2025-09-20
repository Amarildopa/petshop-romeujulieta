# 🚀 Implementação "Em Breve" na Hostinger

## 📋 Resumo
Este guia explica como implementar uma página "Em Breve" **apenas em produção** na Hostinger, mantendo o desenvolvimento local funcionando normalmente.

## 🎯 O que foi criado automaticamente

### ✅ Arquivos criados pelo sistema:
- `public/coming-soon.html` - Página "Em Breve" com design moderno
- `.htaccess-coming-soon` - Regras de redirecionamento
- `scripts/setup-coming-soon.js` - Script automatizado de gerenciamento

## 🔧 O que você precisa fazer na Hostinger

### Passo 1: Preparar os arquivos localmente
```bash
# Execute na raiz do projeto
node scripts/setup-coming-soon.js enable
```

Este comando irá:
- ✅ Verificar se todos os arquivos necessários existem
- ✅ Fazer backup do .htaccess atual (se existir)
- ✅ Ativar o modo "Em Breve" localmente
- ✅ Mostrar instruções do que fazer na Hostinger

### Passo 2: Acessar o painel da Hostinger
1. Faça login em [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Vá em **"Websites"**
3. Clique no seu domínio do PetShop
4. Clique em **"Gerenciador de Arquivos"**

### Passo 3: Fazer upload dos arquivos
1. **Navegue até a pasta raiz do seu domínio** (geralmente `public_html/`)
2. **Faça upload do arquivo `.htaccess`**:
   - Clique em "Upload"
   - Selecione o arquivo `.htaccess` da raiz do seu projeto
   - ⚠️ **IMPORTANTE**: Se já existir um `.htaccess`, faça backup antes!

3. **Crie a estrutura de pastas** (se não existir):
   - Crie a pasta `public/` dentro da raiz
   
4. **Faça upload da página**:
   - Entre na pasta `public/`
   - Faça upload do arquivo `coming-soon.html`

### Passo 4: Testar
1. Acesse seu domínio principal
2. Você deve ver a página "Em Breve"
3. Teste as rotas administrativas (devem funcionar normalmente):
   - `seudominio.com/admin`
   - `seudominio.com/api`

## 🛡️ Segurança e Funcionalidades

### ✅ O que a página "Em Breve" permite:
- Acesso normal a rotas administrativas (`/admin`, `/api`)
- Funcionamento de arquivos CSS, JS e imagens
- Acesso a arquivos essenciais (robots.txt, sitemap.xml)

### 🚫 O que é redirecionado:
- Página inicial (`/`)
- Todas as páginas públicas
- Rotas de produtos, categorias, etc.

## 🔄 Como desativar depois

### Opção 1: Via script (recomendado)
```bash
# Execute na raiz do projeto
node scripts/setup-coming-soon.js disable
```

Depois faça upload do `.htaccess` atualizado para a Hostinger.

### Opção 2: Manual na Hostinger
1. Acesse o Gerenciador de Arquivos
2. Delete o arquivo `.htaccess` da raiz
3. Ou substitua pelo `.htaccess` original (se tiver backup)

## 📊 Verificar status atual
```bash
# Mostra o status dos arquivos
node scripts/setup-coming-soon.js status
```

## 🆘 Solução de problemas

### Problema: Página não aparece
**Possíveis causas:**
- Arquivo `.htaccess` não foi enviado corretamente
- Cache do navegador/CDN
- Arquivo `coming-soon.html` não está no local correto

**Soluções:**
1. Verifique se o `.htaccess` está na pasta raiz do domínio
2. Limpe o cache do navegador (Ctrl+F5)
3. Verifique se `public/coming-soon.html` existe no servidor

### Problema: Rotas administrativas não funcionam
**Causa:** Regras do `.htaccess` muito restritivas

**Solução:**
1. Edite o arquivo `.htaccess-coming-soon` localmente
2. Adicione suas rotas específicas na seção de exceções:
```apache
# Adicione suas rotas aqui
RewriteCond %{REQUEST_URI} !^/sua-rota-especial
```
3. Execute `node scripts/setup-coming-soon.js enable` novamente
4. Faça upload do novo `.htaccess`

### Problema: Erro 500
**Causa:** Sintaxe incorreta no `.htaccess`

**Solução:**
1. Acesse o Gerenciador de Arquivos da Hostinger
2. Delete o arquivo `.htaccess` temporariamente
3. Verifique os logs de erro no painel da Hostinger
4. Corrija a sintaxe e tente novamente

## 📞 Suporte

### Comandos úteis do script:
```bash
# Ajuda completa
node scripts/setup-coming-soon.js help

# Ativar modo "Em Breve"
node scripts/setup-coming-soon.js enable

# Desativar modo "Em Breve"  
node scripts/setup-coming-soon.js disable

# Ver status atual
node scripts/setup-coming-soon.js status
```

### Estrutura final na Hostinger:
```
public_html/                    (pasta raiz do domínio)
├── .htaccess                  (regras de redirecionamento)
├── public/
│   └── coming-soon.html       (página "Em Breve")
├── admin/                     (suas rotas administrativas)
├── api/                       (suas APIs)
└── ... (outros arquivos do projeto)
```

## 🎨 Personalização

### Modificar a página "Em Breve":
1. Edite `public/coming-soon.html` localmente
2. Faça upload da versão atualizada para `public_html/public/`

### Modificar as regras de redirecionamento:
1. Edite `.htaccess-coming-soon` localmente
2. Execute `node scripts/setup-coming-soon.js enable`
3. Faça upload do novo `.htaccess`

---

## ✨ Resumo para implementação rápida:

1. **Local**: `node scripts/setup-coming-soon.js enable`
2. **Hostinger**: Upload `.htaccess` + `public/coming-soon.html`
3. **Testar**: Acessar o domínio
4. **Desativar**: `node scripts/setup-coming-soon.js disable` + upload

**🎯 Resultado**: Página "Em Breve" apenas em produção, desenvolvimento local inalterado!