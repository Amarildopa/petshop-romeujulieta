# 🚨 Plano de Correções Críticas - PetShop Romeo & Julieta
## Baseado no Relatório de Testes TestSprite

**Data**: 10 de Setembro de 2025  
**Prioridade**: CRÍTICA  
**Tempo Estimado**: 2-3 dias  
**Impacto**: 25 testes falhando (54.3% de falha)

---

## 📊 Resumo dos Problemas Críticos

| Categoria | Problemas | Testes Afetados | Prioridade |
|-----------|-----------|-----------------|------------|
| **Mocks Supabase** | API incompleta | 9 testes | 🔴 CRÍTICA |
| **Framer Motion** | Export ausente | 7 testes | 🔴 CRÍTICA |
| **Componentes** | Import/Export | 10 testes | 🔴 CRÍTICA |
| **AuthContext** | Seletor de texto | 1 teste | 🟡 MÉDIA |

---

## 🎯 CORREÇÃO 1: Mock do Supabase (CRÍTICA)

### Problema
```typescript
TypeError: supabase.from(...).select(...).order is not a function
```

### Impacto
- 9 testes de serviços falhando
- Funcionalidades principais não testáveis

### Solução
Criar mock completo do Supabase em `src/test/setup.ts`:

```typescript
// src/test/setup.ts
import { vi } from 'vitest'

// Mock completo do Supabase
const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        }),
        eq: vi.fn().mockReturnThis()
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
  }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@test.com' } } 
    }),
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signUp: vi.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signOut: vi.fn().mockResolvedValue({ error: null })
  }
}

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}))
```

### Arquivos a Modificar
- `src/test/setup.ts` (criar/atualizar)
- `src/services/__tests__/petsService.test.ts`
- `src/contexts/__tests__/AuthContext.test.tsx`

---

## 🎯 CORREÇÃO 2: Mock do Framer Motion (CRÍTICA)

### Problema
```typescript
Error: No "AnimatePresence" export is defined on the "framer-motion" mock
```

### Impacto
- 7 testes do Header falhando
- Componentes com animações não testáveis

### Solução
Atualizar mock do Framer Motion em `src/test/setup.ts`:

```typescript
// src/test/setup.ts
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    img: 'img',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    section: 'section',
    article: 'article',
    header: 'header',
    main: 'main',
    footer: 'footer',
    nav: 'nav',
    ul: 'ul',
    li: 'li',
    a: 'a',
    form: 'form',
    input: 'input',
    label: 'label',
    select: 'select',
    option: 'option',
    textarea: 'textarea'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    finish: vi.fn(),
    cancel: vi.fn()
  }),
  useMotionValue: (value: any) => ({ get: () => value, set: vi.fn() }),
  useTransform: (value: any, transform: any) => ({ get: () => transform(value.get()) })
}))
```

### Arquivos a Modificar
- `src/test/setup.ts`
- `src/components/__tests__/Header.test.tsx`

---

## 🎯 CORREÇÃO 3: Problemas de Import/Export (CRÍTICA)

### Problema
```typescript
Element type is invalid: expected a string but got: undefined
```

### Impacto
- 10 testes de Login falhando
- Componentes não renderizando nos testes

### Solução
Verificar e corrigir exports em:

#### 3.1 Verificar Login.tsx
```typescript
// src/pages/Login.tsx - Verificar se tem:
export default Login; // Export default
```

#### 3.2 Atualizar imports nos testes
```typescript
// src/pages/__tests__/Login.test.tsx
import Login from '../Login'; // Import default correto
```

#### 3.3 Verificar outros componentes
- `src/components/Header.tsx`
- `src/pages/Register.tsx`
- `src/contexts/AuthContext.tsx`

### Arquivos a Modificar
- `src/pages/Login.tsx`
- `src/pages/__tests__/Login.test.tsx`
- `src/components/__tests__/Header.test.tsx`

---

## 🎯 CORREÇÃO 4: AuthContext Loading State (MÉDIA)

### Problema
```typescript
Unable to find an element with the text: Loading...
```

### Impacto
- 1 teste de contexto falhando
- Estado de loading não detectado

### Solução
Ajustar seletor de texto no teste:

```typescript
// src/contexts/__tests__/AuthContext.test.tsx
// Trocar:
expect(screen.getByText('Loading...')).toBeInTheDocument()

// Por:
expect(screen.getByText(/loading/i)).toBeInTheDocument()
// ou
expect(screen.getByTestId('loading')).toBeInTheDocument()
```

### Arquivos a Modificar
- `src/contexts/__tests__/AuthContext.test.tsx`
- `src/contexts/AuthContext.tsx` (adicionar data-testid se necessário)

---

## 🎯 CORREÇÃO 5: Mensagens de Erro Padronizadas (MÉDIA)

### Problema
Inconsistência entre mensagens esperadas e recebidas

### Solução
Padronizar mensagens de erro em português:

```typescript
// src/services/petsService.ts
// Trocar todas as mensagens para português:
throw new Error(`Erro ao buscar pets: ${error.message}`)
throw new Error(`Erro ao criar pet: ${error.message}`)
throw new Error(`Erro ao atualizar pet: ${error.message}`)
throw new Error(`Erro ao deletar pet: ${error.message}`)
```

### Arquivos a Modificar
- `src/services/petsService.ts`
- `src/services/appointmentsService.ts`
- `src/services/servicesService.ts`
- Todos os arquivos de serviço

---

## 📋 Cronograma de Execução

### Dia 1 (4-6 horas)
- [ ] **Manhã**: Correção 1 - Mock do Supabase
- [ ] **Tarde**: Correção 2 - Mock do Framer Motion

### Dia 2 (4-6 horas)
- [ ] **Manhã**: Correção 3 - Import/Export
- [ ] **Tarde**: Correção 4 - AuthContext Loading

### Dia 3 (2-4 horas)
- [ ] **Manhã**: Correção 5 - Mensagens de Erro
- [ ] **Tarde**: Validação e testes finais

---

## 🧪 Validação das Correções

### Testes de Verificação
```bash
# Executar testes após cada correção
npm run test:run

# Verificar cobertura
npm run test:coverage

# Executar testes específicos
npm run test src/services/__tests__/petsService.test.ts
npm run test src/components/__tests__/Header.test.tsx
npm run test src/pages/__tests__/Login.test.tsx
```

### Métricas de Sucesso
- **Taxa de Sucesso**: > 90% (atualmente 45.7%)
- **Testes Críticos**: 100% passando
- **Tempo de Execução**: < 15 segundos

---

## 🚀 Implementação Imediata

### Passo 1: Criar/Atualizar setup.ts
```bash
# Criar arquivo de setup se não existir
touch src/test/setup.ts
```

### Passo 2: Aplicar correções sequencialmente
1. Mock do Supabase
2. Mock do Framer Motion
3. Verificar exports
4. Ajustar seletores
5. Padronizar mensagens

### Passo 3: Validar resultados
```bash
npm run test:run
```

---

## 📈 Resultados Esperados

Após implementar todas as correções:

- ✅ **25 testes** que estavam falhando devem passar
- ✅ **Taxa de sucesso** deve subir de 45.7% para >90%
- ✅ **Cobertura** deve melhorar significativamente
- ✅ **Base sólida** para novos testes

---

## 🔧 Comandos Úteis

```bash
# Executar apenas testes que falharam
npm run test:run -- --reporter=verbose

# Executar testes em modo watch
npm run test:watch

# Limpar cache e executar
npm run test:run -- --no-cache

# Executar testes específicos
npm run test src/services/__tests__/petsService.test.ts
```

---

**⚠️ IMPORTANTE**: Execute as correções na ordem especificada para evitar conflitos e garantir que cada correção seja validada antes da próxima.
