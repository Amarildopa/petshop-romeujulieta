# Sistema Administrativo de Personalização de Cores
## PetShop Romeo & Julieta

**Data:** Janeiro 2025  
**Versão:** 2.0  
**Tipo:** Migração para Sistema Administrativo

---

## 1. Visão Geral da Migração

### 1.1 Situação Atual
- **Frontend**: `ThemeCustomizer.tsx` acessível a todos os usuários
- **Persistência**: `localStorage` do navegador (volátil)
- **Escopo**: Configuração individual por usuário
- **Limitações**: Perda de dados, falta de sincronização, sem controle administrativo

### 1.2 Nova Arquitetura Proposta
- **Acesso**: Restrito apenas a administradores
- **Persistência**: Banco de dados via `system_settings_pet`
- **Escopo**: Configuração global do sistema
- **Benefícios**: Backup automático, auditoria, controle centralizado

---

## 2. Estrutura de Dados no Banco

### 2.1 Configuração de Cores Ativas
```sql
-- Configuração atual das cores do sistema
INSERT INTO system_settings_pet (key, value, description, category, is_public) VALUES
('theme_colors_active', '{
  "primary": "#3B82F6",
  "secondary": "#10B981",
  "accent": "#F59E0B",
  "surface": "#FFFFFF",
  "text": "#1F2937",
  "header": {
    "background": "#1F2937",
    "text": "#FFFFFF",
    "border": "#374151"
  },
  "landing": {
    "hero_bg": "#F3F4F6",
    "hero_text": "#1F2937",
    "section_bg": "#FFFFFF"
  },
  "components": {
    "button_primary": "#3B82F6",
    "button_secondary": "#6B7280",
    "card_bg": "#FFFFFF",
    "card_border": "#E5E7EB"
  }
}', 'Configuração ativa das cores do tema do sistema', 'theme', true);
```

### 2.2 Configuração de Cores Padrão (Backup)
```sql
-- Configuração padrão para restauração
INSERT INTO system_settings_pet (key, value, description, category, is_public) VALUES
('theme_colors_default', '{
  "primary": "#3B82F6",
  "secondary": "#10B981",
  "accent": "#F59E0B",
  "surface": "#FFFFFF",
  "text": "#1F2937",
  "header": {
    "background": "#1F2937",
    "text": "#FFFFFF",
    "border": "#374151"
  },
  "landing": {
    "hero_bg": "#F3F4F6",
    "hero_text": "#1F2937",
    "section_bg": "#FFFFFF"
  },
  "components": {
    "button_primary": "#3B82F6",
    "button_secondary": "#6B7280",
    "card_bg": "#FFFFFF",
    "card_border": "#E5E7EB"
  }
}', 'Configuração padrão das cores (backup para restauração)', 'theme', false);
```

### 2.3 Histórico de Configurações
```sql
-- Configuração para versionamento
INSERT INTO system_settings_pet (key, value, description, category, is_public) VALUES
('theme_colors_history', '{
  "versions": [
    {
      "version": "1.0",
      "date": "2025-01-15T10:00:00Z",
      "admin_id": "uuid-admin",
      "colors": { /* configuração anterior */ },
      "description": "Configuração inicial"
    }
  ],
  "current_version": "1.0"
}', 'Histórico de versões das configurações de cores', 'theme', false);
```

---

## 3. Migração do ThemeCustomizer

### 3.1 Nova Localização no Menu Administrativo

**Estrutura do Menu Admin:**
```
Administração
├── Dashboard
├── Usuários
├── Produtos
├── Pedidos
├── Relatórios
├── Configurações
│   ├── Gerais
│   ├── Pagamentos
│   ├── Notificações
│   └── 🎨 Personalização Visual  ← NOVA LOCALIZAÇÃO
└── Logs
```

### 3.2 Controle de Acesso

**Permissões Necessárias:**
- Usuário deve estar autenticado
- Usuário deve ter registro na tabela `admin_users_pet`
- Role deve ser `admin` ou `super_admin`
- Status `is_active = true`

**Implementação no Frontend:**
```typescript
// Hook para verificar permissão de acesso
const useThemeAdminAccess = () => {
  const { user } = useAuth()
  const { adminUser } = useAdminAuth()
  
  return {
    canAccessThemeCustomizer: adminUser?.is_active && 
      ['admin', 'super_admin'].includes(adminUser?.role)
  }
}
```

---

## 4. Implementação Backend

### 4.1 Novos Métodos no AdminService

```typescript
// src/services/adminService.ts

// Buscar cores ativas
async getActiveThemeColors(): Promise<ThemeColors> {
  const { data, error } = await supabase
    .from('system_settings_pet')
    .select('value')
    .eq('key', 'theme_colors_active')
    .single()
  
  if (error) throw error
  return data.value as ThemeColors
}

// Atualizar cores ativas
async updateThemeColors(colors: ThemeColors): Promise<void> {
  // 1. Salvar versão atual no histórico
  await this.saveColorVersion(colors)
  
  // 2. Atualizar cores ativas
  const { error } = await supabase
    .from('system_settings_pet')
    .update({ value: colors })
    .eq('key', 'theme_colors_active')
  
  if (error) throw error
  
  // 3. Log da ação
  await this.logAdminAction('update_theme_colors', 'theme', 'colors', { colors })
}

// Restaurar cores padrão
async restoreDefaultColors(): Promise<ThemeColors> {
  const { data, error } = await supabase
    .from('system_settings_pet')
    .select('value')
    .eq('key', 'theme_colors_default')
    .single()
  
  if (error) throw error
  
  const defaultColors = data.value as ThemeColors
  await this.updateThemeColors(defaultColors)
  
  return defaultColors
}

// Salvar versão no histórico
private async saveColorVersion(colors: ThemeColors): Promise<void> {
  const { data: historyData } = await supabase
    .from('system_settings_pet')
    .select('value')
    .eq('key', 'theme_colors_history')
    .single()
  
  const history = historyData?.value || { versions: [], current_version: "0.0" }
  const newVersion = this.generateNextVersion(history.current_version)
  
  history.versions.push({
    version: newVersion,
    date: new Date().toISOString(),
    admin_id: await this.getCurrentAdminId(),
    colors,
    description: `Atualização automática v${newVersion}`
  })
  
  history.current_version = newVersion
  
  await supabase
    .from('system_settings_pet')
    .update({ value: history })
    .eq('key', 'theme_colors_history')
}
```

### 4.2 Tipos TypeScript

```typescript
// src/types/theme.ts
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  surface: string
  text: string
  header: {
    background: string
    text: string
    border: string
  }
  landing: {
    hero_bg: string
    hero_text: string
    section_bg: string
  }
  components: {
    button_primary: string
    button_secondary: string
    card_bg: string
    card_border: string
  }
}

export interface ColorVersion {
  version: string
  date: string
  admin_id: string
  colors: ThemeColors
  description: string
}

export interface ColorHistory {
  versions: ColorVersion[]
  current_version: string
}
```

---

## 5. Migração do Hook useTheme

### 5.1 Nova Implementação

```typescript
// src/hooks/useTheme.ts
import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { settingsService } from '../services/settingsService'
import { ThemeColors } from '../types/theme'

const useTheme = () => {
  const [colors, setColors] = useState<ThemeColors | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar cores do banco
  const loadColors = async () => {
    try {
      setLoading(true)
      // Buscar cores públicas via settingsService
      const publicSettings = await settingsService.getPublicSettings()
      const colorSetting = publicSettings.find(s => s.key === 'theme_colors_active')
      
      if (colorSetting) {
        const themeColors = colorSetting.value as ThemeColors
        setColors(themeColors)
        applyColorsToDOM(themeColors)
      }
    } catch (err) {
      setError('Erro ao carregar configurações de cores')
      console.error('Error loading theme colors:', err)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar cores ao DOM
  const applyColorsToDOM = (themeColors: ThemeColors) => {
    const root = document.documentElement
    
    // Cores principais
    root.style.setProperty('--color-primary', themeColors.primary)
    root.style.setProperty('--color-secondary', themeColors.secondary)
    root.style.setProperty('--color-accent', themeColors.accent)
    root.style.setProperty('--color-surface', themeColors.surface)
    root.style.setProperty('--color-text', themeColors.text)
    
    // Header
    root.style.setProperty('--color-header-bg', themeColors.header.background)
    root.style.setProperty('--color-header-text', themeColors.header.text)
    root.style.setProperty('--color-header-border', themeColors.header.border)
    
    // Landing page
    root.style.setProperty('--color-hero-bg', themeColors.landing.hero_bg)
    root.style.setProperty('--color-hero-text', themeColors.landing.hero_text)
    root.style.setProperty('--color-section-bg', themeColors.landing.section_bg)
    
    // Componentes
    root.style.setProperty('--color-button-primary', themeColors.components.button_primary)
    root.style.setProperty('--color-button-secondary', themeColors.components.button_secondary)
    root.style.setProperty('--color-card-bg', themeColors.components.card_bg)
    root.style.setProperty('--color-card-border', themeColors.components.card_border)
  }

  useEffect(() => {
    loadColors()
  }, [])

  return {
    colors,
    loading,
    error,
    reloadColors: loadColors
  }
}

export default useTheme
```

### 5.2 Hook Administrativo

```typescript
// src/hooks/useAdminTheme.ts
import { useState } from 'react'
import { adminService } from '../services/adminService'
import { ThemeColors } from '../types/theme'
import { useAdminAuth } from './useAdminAuth'

const useAdminTheme = () => {
  const { adminUser } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar permissão
  const canManageTheme = adminUser?.is_active && 
    ['admin', 'super_admin'].includes(adminUser?.role)

  // Atualizar cores
  const updateColors = async (colors: ThemeColors) => {
    if (!canManageTheme) {
      throw new Error('Sem permissão para alterar cores do tema')
    }

    try {
      setLoading(true)
      setError(null)
      await adminService.updateThemeColors(colors)
      // Recarregar cores globalmente
      window.dispatchEvent(new CustomEvent('theme-colors-updated'))
    } catch (err) {
      setError('Erro ao atualizar cores do tema')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Restaurar padrão
  const restoreDefault = async () => {
    if (!canManageTheme) {
      throw new Error('Sem permissão para restaurar cores padrão')
    }

    try {
      setLoading(true)
      setError(null)
      const defaultColors = await adminService.restoreDefaultColors()
      window.dispatchEvent(new CustomEvent('theme-colors-updated'))
      return defaultColors
    } catch (err) {
      setError('Erro ao restaurar cores padrão')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    canManageTheme,
    loading,
    error,
    updateColors,
    restoreDefault
  }
}

export default useAdminTheme
```

---

## 6. Atualização do ThemeCustomizer

### 6.1 Nova Localização
**Arquivo:** `src/pages/AdminThemeCustomizer.tsx`

### 6.2 Principais Alterações

```typescript
// src/pages/AdminThemeCustomizer.tsx
import React, { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useAdminTheme'
import { adminService } from '../services/adminService'
import { ThemeColors } from '../types/theme'

const AdminThemeCustomizer: React.FC = () => {
  const { canManageTheme, loading, error, updateColors, restoreDefault } = useAdminTheme()
  const [colors, setColors] = useState<ThemeColors | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Carregar cores atuais
  useEffect(() => {
    const loadCurrentColors = async () => {
      try {
        const currentColors = await adminService.getActiveThemeColors()
        setColors(currentColors)
      } catch (err) {
        console.error('Erro ao carregar cores:', err)
      }
    }
    
    if (canManageTheme) {
      loadCurrentColors()
    }
  }, [canManageTheme])

  // Verificar permissão
  if (!canManageTheme) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Acesso Negado
        </h2>
        <p className="text-gray-600">
          Você não tem permissão para acessar o personalizador de cores.
          Entre em contato com um administrador.
        </p>
      </div>
    )
  }

  // Salvar alterações
  const handleSave = async () => {
    if (!colors) return
    
    try {
      await updateColors(colors)
      setHasChanges(false)
      alert('Cores atualizadas com sucesso!')
    } catch (err) {
      alert('Erro ao salvar cores. Tente novamente.')
    }
  }

  // Restaurar padrão
  const handleRestore = async () => {
    if (confirm('Tem certeza que deseja restaurar as cores padrão? Esta ação não pode ser desfeita.')) {
      try {
        const defaultColors = await restoreDefault()
        setColors(defaultColors)
        setHasChanges(false)
        alert('Cores padrão restauradas com sucesso!')
      } catch (err) {
        alert('Erro ao restaurar cores padrão.')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎨 Personalização Visual</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRestore}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={loading}
          >
            Restaurar Padrão
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !hasChanges}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Interface de personalização de cores */}
      {colors && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seções de cores existentes */}
          {/* ... resto da interface ... */}
        </div>
      )}
    </div>
  )
}

export default AdminThemeCustomizer
```

---

## 7. Atualização do Roteamento

### 7.1 Nova Rota Administrativa

```typescript
// src/App.tsx
const AdminThemeCustomizer = lazy(() => import('./pages/AdminThemeCustomizer'))

// Dentro das rotas administrativas
<Route path="/admin/theme" element={<AdminThemeCustomizer />} />
```

### 7.2 Atualização do Menu Admin

```typescript
// src/components/AdminLayout.tsx
const adminMenuItems = [
  // ... outros itens ...
  {
    name: 'Configurações',
    icon: Settings,
    submenu: [
      { name: 'Gerais', path: '/admin/settings' },
      { name: 'Pagamentos', path: '/admin/payments' },
      { name: 'Notificações', path: '/admin/notifications' },
      { name: '🎨 Personalização Visual', path: '/admin/theme' }, // NOVO
    ]
  },
  // ... outros itens ...
]
```

---

## 8. Script de Migração

### 8.1 Migração de Dados Existentes

```sql
-- scripts/migrations/migrate-theme-colors.sql

-- 1. Inserir configurações padrão se não existirem
INSERT INTO system_settings_pet (key, value, description, category, is_public)
SELECT 'theme_colors_active', '{
  "primary": "#3B82F6",
  "secondary": "#10B981",
  "accent": "#F59E0B",
  "surface": "#FFFFFF",
  "text": "#1F2937",
  "header": {
    "background": "#1F2937",
    "text": "#FFFFFF",
    "border": "#374151"
  },
  "landing": {
    "hero_bg": "#F3F4F6",
    "hero_text": "#1F2937",
    "section_bg": "#FFFFFF"
  },
  "components": {
    "button_primary": "#3B82F6",
    "button_secondary": "#6B7280",
    "card_bg": "#FFFFFF",
    "card_border": "#E5E7EB"
  }
}', 'Configuração ativa das cores do tema', 'theme', true
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'theme_colors_active'
);

-- 2. Inserir backup padrão
INSERT INTO system_settings_pet (key, value, description, category, is_public)
SELECT 'theme_colors_default', '{
  "primary": "#3B82F6",
  "secondary": "#10B981",
  "accent": "#F59E0B",
  "surface": "#FFFFFF",
  "text": "#1F2937",
  "header": {
    "background": "#1F2937",
    "text": "#FFFFFF",
    "border": "#374151"
  },
  "landing": {
    "hero_bg": "#F3F4F6",
    "hero_text": "#1F2937",
    "section_bg": "#FFFFFF"
  },
  "components": {
    "button_primary": "#3B82F6",
    "button_secondary": "#6B7280",
    "card_bg": "#FFFFFF",
    "card_border": "#E5E7EB"
  }
}', 'Configuração padrão das cores (backup)', 'theme', false
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'theme_colors_default'
);

-- 3. Inicializar histórico
INSERT INTO system_settings_pet (key, value, description, category, is_public)
SELECT 'theme_colors_history', '{
  "versions": [
    {
      "version": "1.0",
      "date": "' || NOW() || '",
      "admin_id": "system",
      "colors": {
        "primary": "#3B82F6",
        "secondary": "#10B981",
        "accent": "#F59E0B",
        "surface": "#FFFFFF",
        "text": "#1F2937",
        "header": {
          "background": "#1F2937",
          "text": "#FFFFFF",
          "border": "#374151"
        },
        "landing": {
          "hero_bg": "#F3F4F6",
          "hero_text": "#1F2937",
          "section_bg": "#FFFFFF"
        },
        "components": {
          "button_primary": "#3B82F6",
          "button_secondary": "#6B7280",
          "card_bg": "#FFFFFF",
          "card_border": "#E5E7EB"
        }
      },
      "description": "Configuração inicial do sistema"
    }
  ],
  "current_version": "1.0"
}', 'Histórico de versões das cores', 'theme', false
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings_pet WHERE key = 'theme_colors_history'
);

-- 4. Verificar se as configurações foram inseridas
SELECT 
  key,
  description,
  category,
  is_public,
  created_at
FROM system_settings_pet 
WHERE category = 'theme'
ORDER BY created_at;
```

---

## 9. Plano de Implementação

### 9.1 Fase 1: Preparação do Backend (1-2 dias)
1. ✅ Executar script de migração SQL
2. ✅ Implementar novos métodos no `adminService`
3. ✅ Criar tipos TypeScript para cores
4. ✅ Atualizar `settingsService` para buscar cores públicas

### 9.2 Fase 2: Migração do Frontend (2-3 dias)
1. ✅ Criar `useAdminTheme` hook
2. ✅ Atualizar `useTheme` para buscar do banco
3. ✅ Migrar `ThemeCustomizer` para `AdminThemeCustomizer`
4. ✅ Implementar controle de acesso
5. ✅ Atualizar roteamento e menu admin

### 9.3 Fase 3: Testes e Validação (1 dia)
1. ✅ Testar funcionalidade de salvar cores
2. ✅ Testar restauração padrão
3. ✅ Validar controle de acesso
4. ✅ Verificar sincronização entre usuários
5. ✅ Testar logs administrativos

### 9.4 Fase 4: Limpeza (1 dia)
1. ✅ Remover código antigo do `localStorage`
2. ✅ Atualizar documentação
3. ✅ Deploy em produção

---

## 10. Benefícios da Nova Implementação

### 10.1 Administrativos
- ✅ **Controle Centralizado**: Uma configuração para todo o sistema
- ✅ **Auditoria Completa**: Logs de todas as alterações
- ✅ **Backup Automático**: Integrado ao sistema de backup do banco
- ✅ **Versionamento**: Histórico de todas as configurações
- ✅ **Restauração Fácil**: Botão para voltar ao padrão

### 10.2 Técnicos
- ✅ **Persistência Robusta**: Nunca mais perder configurações
- ✅ **Sincronização**: Todos os usuários veem as mesmas cores
- ✅ **Performance**: Cache automático via Supabase
- ✅ **Escalabilidade**: Preparado para múltiplos temas
- ✅ **Manutenibilidade**: Código mais organizado e profissional

### 10.3 Operacionais
- ✅ **Segurança**: Apenas admins podem alterar
- ✅ **Consistência**: Identidade visual unificada
- ✅ **Flexibilidade**: Fácil alteração quando necessário
- ✅ **Profissionalismo**: Sistema robusto e confiável

---

## 11. Considerações de Segurança

### 11.1 Controle de Acesso
- Verificação dupla: autenticação + autorização admin
- Validação de permissões em cada operação
- Logs detalhados de todas as alterações

### 11.2 Validação de Dados
- Validação de formato de cores (hex, rgb)
- Sanitização de dados de entrada
- Verificação de integridade do JSON

### 11.3 Backup e Recuperação
- Backup automático antes de cada alteração
- Versionamento completo no histórico
- Função de restauração rápida

---

**Conclusão:** Esta migração transforma o sistema de cores de uma funcionalidade individual em uma ferramenta administrativa robusta, com persistência confiável, controle de acesso adequado e capacidades de auditoria completas, adequada para um ambiente profissional.