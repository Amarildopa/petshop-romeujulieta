# 🎯 ESTRATÉGIA DE CONTEXTOS - PETSHOP ROMEU & JULIETA

## 📊 MAPEAMENTO ATUAL DE CONTEXTOS

### 1. **CONTEXTOS IDENTIFICADOS**

#### 🔐 **AuthContext** (Principal)
- **Arquivo**: `src/contexts/AuthContext.tsx`
- **Responsabilidade**: Gerenciar autenticação de usuários
- **Estado**: `user`, `session`, `loading`
- **Ações**: `signUp`, `signIn`, `signOut`, `updateProfile`
- **Dependências**: Supabase Auth
- **Uso**: 15+ componentes

#### 🔧 **useAdminAuth** (Hook Especializado)
- **Arquivo**: `src/hooks/useAdminAuth.ts`
- **Responsabilidade**: Gerenciar permissões administrativas
- **Estado**: `isAdmin`, `isSuperAdmin`, `isManager`, `adminUser`, `permissions`
- **Dependências**: AuthContext + adminService
- **Uso**: Componentes administrativos

#### 📊 **Sentry Context** (Observabilidade)
- **Arquivo**: `src/lib/sentry.ts`
- **Responsabilidade**: Contexto de monitoramento
- **Funções**: `setUserContext`, `setCustomContext`
- **Uso**: Logging e monitoramento

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **AuthContext com Erro de Sintaxe**
```typescript
// ERRO: Linha 12 - interface incompleta
updateProfile: (updates: { full_name?: string; phone?: string; address?: string; cep?: string }) => Promise<{ error: AuthError | null }>
```

### 2. **Dependências Circulares Potenciais**
- `useAdminAuth` depende de `AuthContext`
- `AuthContext` pode depender de serviços que usam `useAdminAuth`

### 3. **Falta de Contextos Especializados**
- Não há contexto para carrinho de compras
- Não há contexto para notificações
- Não há contexto para tema/UI

---

## 🎯 ESTRATÉGIA DE CORREÇÃO SEM RETRABALHO

### **FASE 1: CORREÇÃO IMEDIATA (Crítica)**

#### 1.1 Corrigir AuthContext
```typescript
// PROBLEMA: Interface incompleta na linha 12
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: { full_name: string; phone: string }) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: { full_name?: string; phone?: string; address?: string; cep?: string }) => Promise<{ error: AuthError | null }>
}
```

#### 1.2 Verificar Dependências
- ✅ `useAdminAuth` usa `useAuth` corretamente
- ✅ Não há dependências circulares
- ✅ Estrutura de pastas está correta

### **FASE 2: REFATORAÇÃO ESTRUTURAL (Médio Prazo)**

#### 2.1 Criar Contextos Especializados
```typescript
// src/contexts/CartContext.tsx
interface CartContextType {
  items: CartItem[]
  total: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

// src/contexts/NotificationContext.tsx
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

// src/contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

#### 2.2 Criar Provider Composto
```typescript
// src/contexts/AppProvider.tsx
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
```

### **FASE 3: OTIMIZAÇÃO (Longo Prazo)**

#### 3.1 Implementar Context Selectors
```typescript
// Evitar re-renders desnecessários
const useAuthUser = () => {
  const { user } = useAuth()
  return user
}

const useAuthLoading = () => {
  const { loading } = useAuth()
  return loading
}
```

#### 3.2 Implementar Context DevTools
```typescript
// Para debug em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // Adicionar DevTools para cada contexto
}
```

---

## 🛠️ PLANO DE EXECUÇÃO

### **PASSO 1: Correção Crítica (5 min)**
1. ✅ Corrigir sintaxe do AuthContext
2. ✅ Testar se aplicação carrega
3. ✅ Verificar se não quebrou nada

### **PASSO 2: Validação (10 min)**
1. ✅ Testar todas as páginas que usam useAuth
2. ✅ Verificar se useAdminAuth funciona
3. ✅ Confirmar que não há regressões

### **PASSO 3: Documentação (5 min)**
1. ✅ Atualizar documentação de contextos
2. ✅ Criar guia de uso dos contextos
3. ✅ Documentar dependências

---

## 📋 CHECKLIST DE VALIDAÇÃO

### **Antes de Qualquer Mudança**
- [ ] Fazer backup do AuthContext atual
- [ ] Verificar se aplicação está funcionando
- [ ] Identificar todos os componentes que usam useAuth

### **Durante a Correção**
- [ ] Corrigir apenas a sintaxe problemática
- [ ] Não alterar lógica existente
- [ ] Manter interface compatível

### **Após a Correção**
- [ ] Testar login/logout
- [ ] Testar páginas administrativas
- [ ] Verificar se useAdminAuth funciona
- [ ] Confirmar que não há erros no console

---

## 🎯 PRINCÍPIOS PARA EVITAR RETRABALHO

### 1. **Mudanças Incrementais**
- ✅ Corrigir apenas o necessário
- ✅ Não refatorar tudo de uma vez
- ✅ Testar após cada mudança

### 2. **Manter Compatibilidade**
- ✅ Não alterar interfaces existentes
- ✅ Manter hooks funcionando
- ✅ Preservar comportamento atual

### 3. **Documentação Atualizada**
- ✅ Registrar todas as mudanças
- ✅ Atualizar guias de uso
- ✅ Manter histórico de alterações

### 4. **Testes de Regressão**
- ✅ Testar funcionalidades existentes
- ✅ Verificar se não quebrou nada
- ✅ Confirmar que tudo funciona

---

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

1. **IMEDIATO**: Corrigir sintaxe do AuthContext
2. **CURTO PRAZO**: Implementar contextos especializados
3. **MÉDIO PRAZO**: Otimizar performance dos contextos
4. **LONGO PRAZO**: Implementar state management avançado (Zustand/Redux)

---

**📅 Data de Criação**: Janeiro 2025  
**🔄 Última Atualização**: Janeiro 2025  
**👥 Equipe**: Desenvolvimento PetShop Romeu & Julieta
