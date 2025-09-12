# Como Alterar o Nome da Aplicação

Este documento explica como alterar o nome "PetShop Romeu & Julieta" para qualquer outro nome desejado.

## 🚀 Método Rápido (Recomendado)

### 1. Editar Configuração
Abra o arquivo `src/config/app-name.ts` e altere os valores:

```typescript
export const APP_NAME = 'Seu Novo Nome';
export const APP_SHORT_NAME = 'Nome Curto';
export const APP_DESCRIPTION = 'Sua Descrição';
```

### 2. Executar Script Automático
```bash
npm run update-app-name
```

### 3. Verificar Alterações
```bash
npm run dev
```

## 📁 Arquivos que Serão Atualizados

O script automaticamente atualiza os seguintes arquivos:

- ✅ `src/components/Header.tsx` - Logo e título no cabeçalho
- ✅ `src/pages/Home.tsx` - Página inicial
- ✅ `src/pages/Register.tsx` - Página de cadastro
- ✅ `src/pages/AdminDashboard.tsx` - Dashboard administrativo
- ✅ `src/components/AdminSidebar.tsx` - Menu lateral do admin
- ✅ `index.html` - Título da página e meta tags
- ✅ `package.json` - Nome do projeto

## 🔧 Método Manual

Se preferir alterar manualmente, procure por estas ocorrências:

### Textos a Substituir:
- `PetShop Romeu & Julieta` → `Seu Novo Nome`
- `Romeu & Julieta` → `Nome Curto`
- `Junte-se ao PetShop Romeu & Julieta` → `Junte-se ao Seu Novo Nome`
- `A Experiência Romeu & Julieta` → `A Experiência Nome Curto`
- `família Romeu & Julieta` → `família Nome Curto`

### Arquivos Principais:
1. **Header** (`src/components/Header.tsx`)
2. **Home** (`src/pages/Home.tsx`)
3. **Register** (`src/pages/Register.tsx`)
4. **Admin** (`src/pages/AdminDashboard.tsx`)
5. **HTML** (`index.html`)

## 🎯 Exemplo Prático

Para alterar para "PetShop Amigo Fiel":

1. **Edite** `src/config/app-name.ts`:
   ```typescript
   export const APP_NAME = 'PetShop Amigo Fiel';
   export const APP_SHORT_NAME = 'Amigo Fiel';
   export const APP_DESCRIPTION = 'Cuidado e Carinho para seu Pet';
   ```

2. **Execute**:
   ```bash
   npm run update-app-name
   ```

3. **Resultado**: Todos os textos serão atualizados automaticamente!

## ⚠️ Importante

- Sempre teste a aplicação após alterar o nome
- Verifique se não há textos hardcoded que o script não detectou
- Considere atualizar também os arquivos de documentação se necessário

## 🆘 Problemas Comuns

### Script não funciona
- Verifique se o Node.js está instalado
- Execute: `node --version`

### Alguns textos não foram alterados
- Verifique se o texto está exatamente como esperado
- Adicione novos padrões no arquivo `scripts/update-app-name.js`

### Aplicação não carrega após alteração
- Verifique se não há erros de sintaxe
- Execute: `npm run build` para verificar erros
