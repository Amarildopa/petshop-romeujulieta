# 🗺️ Mapa Mental - Rotas do Sistema PetShop Romeu e Julieta

## 🏠 **ROTAS PRINCIPAIS**

### 📱 **Páginas Públicas**
- **/** → Home (Página inicial)
- **/login** → Login (Autenticação)
- **/register** → Register (Cadastro de usuários)

### 🔐 **Páginas Autenticadas**
- **/dashboard** → Dashboard (Painel do usuário)
- **/profile** → Profile (Perfil do usuário)
- **/pet-profile** → PetProfile (Perfil do pet)

### 🛍️ **Serviços e Compras**
- **/services** → Services (Catálogo de serviços)
- **/booking** → Booking (Agendamento de serviços)
- **/store** → Store (Loja de produtos)
- **/offers** → Offers (Ofertas especiais)
- **/subscription** → Subscription (Planos de assinatura)

### 📊 **Monitoramento e Acompanhamento**
- **/check-in/:appointmentId** → CheckIn (Check-in de agendamento)
- **/journey/:petId** → GrowthJourney (Jornada de crescimento do pet)
- **/monitoring** → Monitoring (Monitoramento em tempo real)

### 👑 **Área Administrativa**
- **/admin** → AdminLayout (Layout administrativo)
  - **/admin/** → AdminDashboard (Dashboard admin)
  - **/admin/users** → AdminUsers (Gerenciar usuários) 🔒
  - **/admin/reports** → AdminReports (Relatórios) 🔒

### 🧪 **Páginas de Teste/Desenvolvimento**
- **/test-supabase** → TestSupabase (Teste de conexão)
- **/test-simple** → TestSimple (Testes simples)
- **/photo-test** → PhotoTest (Teste de upload de fotos)
- **/theme-customizer** → ThemeCustomizer (Customizador de tema)

---

## 🔄 **FLUXO DE NAVEGAÇÃO**

```
Home (/) 
├── Login (/login)
├── Register (/register)
└── Após Login:
    ├── Dashboard (/dashboard)
    ├── Services (/services) → Booking (/booking)
    ├── Store (/store)
    ├── Profile (/profile)
    ├── Pet Profile (/pet-profile)
    └── Admin (/admin) [se for admin]
        ├── Users (/admin/users)
        └── Reports (/admin/reports)
```

---

## 🛡️ **PROTEÇÃO DE ROTAS**

### 🟢 **Públicas** (Sem autenticação)
- Home, Login, Register

### 🟡 **Autenticadas** (Requer login)
- Dashboard, Profile, Pet Profile, Services, Booking, Store, Offers, Subscription, Check-in, Journey, Monitoring

### 🔴 **Administrativas** (Requer permissões especiais)
- Admin Dashboard, Admin Users, Admin Reports

### 🔵 **Desenvolvimento** (Apenas em dev)
- Test pages, Theme Customizer

---

## 📋 **COMO IMPORTAR NO MIRO**

### **Opção 1: Importação Direta**
1. Copie todo o conteúdo deste arquivo
2. No Miro, vá em **"Import"** → **"From text"**
3. Cole o conteúdo e selecione **"Mind Map"**

### **Opção 2: Criação Manual**
1. Crie um **Mind Map** no Miro
2. Use a estrutura hierárquica acima
3. Adicione cores:
   - 🟢 Verde: Rotas públicas
   - 🟡 Amarelo: Rotas autenticadas
   - 🔴 Vermelho: Rotas administrativas
   - 🔵 Azul: Rotas de desenvolvimento

### **Opção 3: Formato JSON para Miro**
```json
{
  "type": "mindmap",
  "root": "PetShop Rotas",
  "children": [
    {
      "name": "Públicas",
      "children": [
        {"name": "/ (Home)"},
        {"name": "/login"},
        {"name": "/register"}
      ]
    },
    {
      "name": "Autenticadas",
      "children": [
        {"name": "/dashboard"},
        {"name": "/profile"},
        {"name": "/pet-profile"},
        {"name": "/services"},
        {"name": "/booking"},
        {"name": "/store"}
      ]
    },
    {
      "name": "Admin",
      "children": [
        {"name": "/admin"},
        {"name": "/admin/users"},
        {"name": "/admin/reports"}
      ]
    }
  ]
}
```

---

## 🎨 **SUGESTÕES DE VISUALIZAÇÃO**

- **Nó Central**: "PetShop Romeu e Julieta - Rotas"
- **Cores por Categoria**: Verde (público), Amarelo (autenticado), Vermelho (admin)
- **Ícones**: 🏠 Home, 🔐 Login, 👤 Profile, 🛍️ Store, 👑 Admin
- **Conexões**: Setas indicando fluxo de navegação
- **Anotações**: Adicionar parâmetros de rota (ex: :appointmentId, :petId)