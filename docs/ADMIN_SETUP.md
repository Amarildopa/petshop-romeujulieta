# 🔐 **CONFIGURAÇÃO DO SISTEMA ADMINISTRATIVO**

## **📋 VISÃO GERAL**

O sistema administrativo do PetShop Romeo & Julieta foi implementado com controle de acesso granular e permissões hierárquicas. Este documento explica como configurar e usar o sistema.

## **🚀 CONFIGURAÇÃO INICIAL**

### **1. Criar o Primeiro Administrador**

#### **Opção A: Script Automático (Desenvolvimento)**
```bash
# Execute o script SQL no Supabase
psql -h your-db-host -U your-username -d your-database -f scripts/setup-admin-dev.sql
```

#### **Opção B: Manual (Produção)**
1. **Crie um usuário normal** através do sistema de registro
2. **Execute o script** `scripts/create-first-admin.sql` no Supabase
3. **Substitua** `admin@petshop.com` pelo email do usuário

### **2. Verificar Configuração**
```sql
-- Verificar se o administrador foi criado
SELECT 
    au.role,
    au.is_active,
    p.email,
    p.full_name
FROM admin_users_pet au
JOIN profiles_pet p ON au.user_id = p.id
WHERE p.email = 'admin@petshop.com';
```

## **👥 SISTEMA DE PERMISSÕES**

### **Hierarquia de Cargos**
1. **Super Admin** - Acesso total ao sistema
2. **Admin** - Acesso administrativo padrão
3. **Manager** - Acesso limitado a relatórios e tickets

### **Permissões Disponíveis**
- `all` - Acesso total (apenas Super Admin)
- `users` - Gerenciar usuários administrativos
- `reports` - Gerar e visualizar relatórios
- `settings` - Configurar sistema
- `tickets` - Gerenciar tickets de suporte
- `logs` - Visualizar logs do sistema
- `security` - Configurações de segurança

## **🔒 CONTROLE DE ACESSO**

### **Proteção de Rotas**
```typescript
// Exemplo de rota protegida
<Route path="/admin/users" element={
  <AdminRouteGuard requiredPermission="users">
    <AdminUsers />
  </AdminRouteGuard>
} />
```

### **Verificação de Permissões**
```typescript
// Hook para verificar permissões
const { isAdmin, isSuperAdmin, permissions } = useAdminAuth()

// Hook para permissão específica
const canManageUsers = useAdminPermission('users')

// Hook para verificar acesso a rota
const canAccessReports = useCanAccessRoute('/admin/reports')
```

## **📱 INTERFACE ADMINISTRATIVA**

### **Acesso ao Painel**
- **URL**: `http://localhost:5173/admin`
- **Requisitos**: Usuário logado + permissões administrativas

### **Páginas Disponíveis**
- **Dashboard** (`/admin`) - Visão geral do sistema
- **Usuários** (`/admin/users`) - Gerenciar administradores
- **Relatórios** (`/admin/reports`) - Analytics e relatórios

### **Navegação**
- **Sidebar** colapsável com todas as funcionalidades
- **Status administrativo** no header principal
- **Proteção automática** de rotas sensíveis

## **🛠️ DESENVOLVIMENTO**

### **Estrutura de Arquivos**
```
src/
├── hooks/
│   └── useAdminAuth.ts          # Hook de autenticação admin
├── components/
│   ├── AdminRouteGuard.tsx      # Proteção de rotas
│   ├── AdminStatus.tsx          # Status no header
│   ├── AdminLayout.tsx          # Layout administrativo
│   └── AdminSidebar.tsx         # Navegação lateral
├── pages/
│   ├── AdminDashboard.tsx       # Dashboard principal
│   ├── AdminUsers.tsx           # Gerenciar usuários
│   └── AdminReports.tsx         # Relatórios
└── services/
    └── adminService.ts          # APIs administrativas
```

### **Adicionando Novas Funcionalidades**
1. **Criar página** administrativa
2. **Adicionar rota** protegida no `App.tsx`
3. **Definir permissão** necessária
4. **Atualizar sidebar** com novo item

## **🔍 MONITORAMENTO E LOGS**

### **Logs Automáticos**
- **Acesso** a páginas administrativas
- **Ações** de criação/edição/exclusão
- **Tentativas** de acesso negado
- **Mudanças** de permissões

### **Visualizar Logs**
```typescript
// Buscar logs de administração
const logs = await adminService.getAdminLogs(100, 0)
```

## **🚨 SEGURANÇA**

### **Medidas Implementadas**
- **Row Level Security** no Supabase
- **Validação** de permissões em tempo real
- **Logs** de todas as ações administrativas
- **Proteção** contra acesso não autorizado

### **Boas Práticas**
- **Nunca** compartilhe credenciais de Super Admin
- **Revise** logs regularmente
- **Monitore** tentativas de acesso suspeitas
- **Mantenha** permissões mínimas necessárias

## **📊 MÉTRICAS E MONITORAMENTO**

### **Métricas Disponíveis**
- **Usuários** ativos e inativos
- **Ações** administrativas por dia
- **Tentativas** de acesso negado
- **Performance** do sistema

### **Dashboard de Monitoramento**
- Acesse `/monitoring` para ver métricas em tempo real
- **Apenas** em modo de desenvolvimento

## **🆘 SOLUÇÃO DE PROBLEMAS**

### **Problemas Comuns**

#### **"Acesso Negado" ao tentar acessar /admin**
- Verifique se o usuário está logado
- Confirme se o usuário tem permissões administrativas
- Execute o script de criação do primeiro admin

#### **"Erro de Verificação" ao carregar páginas admin**
- Verifique a conexão com o Supabase
- Confirme se as tabelas administrativas foram criadas
- Verifique os logs do console

#### **Permissões não funcionam corretamente**
- Verifique se o usuário tem o cargo correto
- Confirme se as permissões estão definidas no banco
- Verifique se o hook `useAdminAuth` está sendo usado

### **Comandos de Diagnóstico**
```sql
-- Verificar usuários administrativos
SELECT * FROM admin_users_pet;

-- Verificar logs recentes
SELECT * FROM admin_logs_pet ORDER BY created_at DESC LIMIT 10;

-- Verificar configurações do sistema
SELECT * FROM system_settings_pet;
```

## **📞 SUPORTE**

Para dúvidas ou problemas:
1. **Verifique** este documento primeiro
2. **Consulte** os logs do sistema
3. **Execute** os comandos de diagnóstico
4. **Entre em contato** com a equipe de desenvolvimento

---

**✅ Sistema Administrativo PetShop Romeo & Julieta v1.0**
