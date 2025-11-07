# Análise da Jornada de Check-in do Pet - PetShop Romeo & Julieta

## 1. ANÁLISE DO SISTEMA ATUAL (AS-IS)

### 1.1 Estrutura de Banco de Dados Existente

O sistema atual possui uma estrutura robusta com as seguintes tabelas principais:

**Tabelas Core:**
- `profiles_pet`: Dados dos usuários/tutores
- `pets_pet`: Informações dos pets (nome, espécie, raça, idade, peso, etc.)
- `appointments_pet`: Agendamentos de serviços
- `services_pet`: Catálogo de serviços oferecidos
- `service_progress_pet`: Progresso dos serviços (etapas básicas)

**Tabelas de Apoio:**
- `notifications_pet`: Sistema de notificações
- `products_pet`: Catálogo de produtos
- `subscriptions_pet`: Sistema de assinaturas
- `care_extras_pet`: Serviços adicionais

### 1.2 Funcionalidades Atuais

**Sistema de Agendamento:**
- Cadastro de pets com informações detalhadas
- Agendamento de serviços (banho, tosa, consultas, etc.)
- Sistema de progresso básico com 6 etapas padrão
- Notificações para lembretes de agendamento

**Sistema de Progresso Existente:**
```sql
CREATE TABLE service_progress_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments_pet(id),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 6,
  status TEXT DEFAULT 'not_started',
  notes TEXT
);
```

### 1.3 Pontos Fortes do Sistema Atual
- ✅ Estrutura de dados bem definida e normalizada
- ✅ Sistema de autenticação e autorização implementado
- ✅ RLS (Row Level Security) configurado
- ✅ Sistema de notificações base
- ✅ API Supabase estabelecida
- ✅ Interface administrativa para gestão de banhos semanais

### 1.4 Limitações Identificadas
- ❌ Jornada do pet está atrelada à agenda de serviços
- ❌ Não há registro de check-in/check-out físico
- ❌ Falta rastreamento independente do pet na loja
- ❌ Não há etapas customizáveis por tipo de serviço
- ❌ Ausência de localização do pet dentro do estabelecimento
- ❌ Sem integração com câmeras IP
- ❌ Não há histórico completo de permanência do pet

## 2. ANÁLISE DE GAPS PARA JORNADA DE CHECK-IN

### 2.1 Gaps Funcionais
1. **Check-in Físico**: Registro de entrada do pet sem agendamento prévio
2. **Acompanhamento em Tempo Real**: Status atual do pet na loja
3. **Etapas Customizáveis**: Fluxos diferentes por tipo de serviço
4. **Localização Interna**: Área onde o pet está localizado
5. **Check-out com Devolução**: Registro de entrega ao tutor
6. **Histórico Completo**: Registro de todas as visitas do pet

### 2.2 Gaps Técnicos
1. **Tabelas Necessárias**:
   - Tabela de check-in/check-out independente
   - Tabela de etapas da jornada customizáveis
   - Tabela de localização/áreas do pet shop
   - Tabela de registro de câmeras por etapa

2. **APIs Necessárias**:
   - API de check-in/check-out
   - API de atualização de status em tempo real
   - API de localização do pet
   - API de integração com câmeras IP

3. **Interface do Usuário**:
   - Dashboard de acompanhamento para tutores
   - Interface administrativa para staff
   - Sistema de notificações push em tempo real

## 3. PROPOSTA DE SOLUÇÃO (TO-BE)

### 3.1 Nova Estrutura de Tabelas

**Tabela Principal: `pet_stay_journey`**
```sql
CREATE TABLE pet_stay_journey (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pet_id UUID REFERENCES pets_pet(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'checked_in' 
    CHECK (status IN ('checked_in', 'in_progress', 'ready_for_pickup', 'checked_out')),
  total_duration_minutes INTEGER,
  notes TEXT,
  staff_responsible UUID REFERENCES profiles_pet(id),
  service_type TEXT, -- Opcional: pode ser independente de agendamento
  estimated_completion_time TIMESTAMP WITH TIME ZONE
);
```

**Tabela de Etapas: `journey_steps`**
```sql
CREATE TABLE journey_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  journey_id UUID REFERENCES pet_stay_journey(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  location_area TEXT,
  camera_ip TEXT, -- URL da câmera IP para esta etapa
  staff_responsible UUID REFERENCES profiles_pet(id),
  notes TEXT,
  photo_url TEXT, -- Foto do pet nesta etapa
  is_active BOOLEAN DEFAULT true
);
```

**Tabela de Áreas: `pet_shop_areas`**
```sql
CREATE TABLE pet_shop_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  area_name TEXT NOT NULL UNIQUE,
  description TEXT,
  camera_ip TEXT,
  camera_enabled BOOLEAN DEFAULT false,
  max_capacity INTEGER DEFAULT 1,
  current_occupancy INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

**Tabela de Notificações em Tempo Real: `journey_notifications`**
```sql
CREATE TABLE journey_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  journey_id UUID REFERENCES pet_stay_journey(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL 
    CHECK (notification_type IN ('step_started', 'step_completed', 'ready_for_pickup', 'check_out')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP WITH TIME ZONE,
  data JSONB -- Dados adicionais como URL da câmera, foto, etc.
);
```

### 3.2 Etapas da Jornada Proposta

**Fluxo Padrão para Banho e Tosa:**
1. **Check-in** → Pet chega ao estabelecimento
2. **Acomodação** → Pet é levado para área de espera
3. **Avaliação** → Staff avalia condição do pet
4. **Banho** → Processo de higienização
5. **Secagem** → Secagem e preparação para tosa
6. **Tosa** → Corte e modelagem
7. **Finalização** → Detalhes finais e aplicação de produtos
8. **Check-out** → Pet pronto para devolução

**Fluxo para Consulta Veterinária:**
1. **Check-in** → Registro de entrada
2. **Espera** → Aguardando na sala de espera
3. **Consulta** → Atendimento veterinário
4. **Exames** → Se necessário, realização de exames
5. **Tratamento** → Aplicação de medicamentos/procedimentos
6. **Orientações** → Tutor recebe instruções
7. **Check-out** → Finalização e pagamento

### 3.3 Sistema de Câmeras IP (Fase 2)

**Integração Planejada:**
- Cada área terá uma câmera IP associada
- Tutores poderão acessar stream ao vivo durante as etapas
- Gravações poderão ser armazenadas por X dias
- Sistema de privacidade com consentimento do tutor
- Notificações com link direto para a câmera da etapa atual

### 3.4 Interface para Tutores

**Dashboard de Acompanhamento:**
- Visualização em tempo real da etapa atual
- Tempo estimado de permanência
- Fotos de cada etapa concluída
- Acesso à câmera IP da etapa atual (quando disponível)
- Notificações push no celular
- Histórico de visitas anteriores

## 4. IMPLEMENTAÇÃO POR FASEES

### 4.1 Fase 1: Estrutura Base (2-3 semanas)
**Objetivos:**
- Criar tabelas de jornada e etapas
- Implementar APIs de check-in/check-out
- Desenvolver interface administrativa básica
- Sistema de notificações por email

**Entregáveis:**
- ✅ Tabelas no banco de dados
- ✅ APIs REST para jornada
- ✅ Interface de check-in para staff
- ✅ Dashboard básico para tutores

### 4.2 Fase 2: Acompanhamento de Etapas (2 semanas)
**Objetivos:**
- Sistema de progressão de etapas
- Interface de atualização para staff
- Fotos por etapa
- Notificações push básicas

**Entregáveis:**
- ✅ Atualização de etapas em tempo real
- ✅ Sistema de fotos por etapa
- ✅ Notificações para tutores
- ✅ Interface mobile responsiva

### 4.3 Fase 3: Notificações Avançadas (1 semana)
**Objetivos:**
- Notificações push avançadas
- Templates de notificação
- Sistema de preferências de notificação
- Integração com WhatsApp Business API

**Entregáveis:**
- ✅ Notificações personalizadas
- ✅ Preferências por tipo de serviço
- ✅ Integração WhatsApp
- ✅ Templates configuráveis

### 4.4 Fase 4: Integração com Câmeras IP (3-4 semanas)
**Objetivos:**
- Integração com sistema de câmeras
- Stream ao vivo para tutores
- Sistema de privacidade e consentimento
- Gravação e armazenamento

**Entregáveis:**
- ✅ Stream ao vivo por etapa
- ✅ Controle de acesso por tutor
- ✅ Sistema de consentimento
- ✅ Interface de visualização

## 5. REQUISITOS TÉCNICOS

### 5.1 Novas Tabelas Necessárias
1. `pet_stay_journey` - Jornada principal do pet
2. `journey_steps` - Etapas da jornada
3. `pet_shop_areas` - Áreas do estabelecimento
4. `journey_notifications` - Notificações específicas
5. `journey_photos` - Fotos das etapas (separado para performance)
6. `camera_settings` - Configurações de câmeras IP

### 5.2 APIs a Serem Desenvolvidas

**APIs de Jornada:**
```typescript
// Check-in do pet
POST /api/pet-journey/check-in
{
  pet_id: string,
  service_type?: string,
  estimated_duration?: number,
  notes?: string
}

// Atualizar etapa
PUT /api/pet-journey/:journey_id/step/:step_id
{
  status: 'in_progress' | 'completed' | 'skipped',
  notes?: string,
  photo_url?: string
}

// Check-out do pet
POST /api/pet-journey/:journey_id/check-out
{
  final_notes?: string,
  total_duration?: number
}
```

**APIs de Acompanhamento:**
```typescript
// Obter jornada atual do pet
GET /api/pet-journey/current/:pet_id

// Obter etapas da jornada
GET /api/pet-journey/:journey_id/steps

// Obter notificações do tutor
GET /api/journey-notifications

// Acessar câmera da etapa (Fase 4)
GET /api/camera/stream/:area_id
```

### 5.3 Interface do Usuário

**Para Staff:**
- Dashboard de pets atualmente na loja
- Interface de check-in rápido
- Atualização de etapas com fotos
- Gestão de áreas e capacidade

**Para Tutores:**
- Aplicativo/mobile web de acompanhamento
- Notificações push personalizadas
- Galeria de fotos da jornada
- Acesso às câmeras (Fase 4)
- Histórico de visitas

### 5.4 Sistema de Notificações

**Canais de Notificação:**
1. **Push Notifications** - Para atualizações em tempo real
2. **Email** - Para resumo da jornada
3. **WhatsApp** - Para tutores que preferem
4. **SMS** - Para casos críticos ou emergências

**Templates de Notificação:**
- "🐕 [Nome do Pet] acabou de chegar! Acompanhe sua jornada."
- "✅ [Nome do Pet] está pronto para ser buscado!"
- "📸 Nova foto de [Nome do Pet] durante o [etapa]"
- "🎥 [Nome do Pet] está na etapa de [etapa]. Assista ao vivo!"

## 6. CONSIDERAÇÕES DE SEGURANÇA E PRIVACIDADE

### 6.1 Segurança
- Autenticação via Supabase Auth
- RLS configurada para todas as tabelas
- Criptografia de dados sensíveis
- Logs de auditoria para ações críticas
- Rate limiting nas APIs

### 6.2 Privacidade (Fase 4)
- Consentimento explícito do tutor para câmeras
- Opção de desativar acesso às câmeras
- Tempo limitado de armazenamento de gravações
- Acesso apenas ao pet do tutor
- LGPD compliance

## 7. MÉTRICAS E MONITORAMENTO

### 7.1 KPIs a Serem Acompanhados
- Tempo médio de permanência por tipo de serviço
- Taxa de satisfação dos tutores (NPS)
- Tempo de resposta do staff
- Taxa de uso do sistema de acompanhamento
- Performance das APIs

### 7.2 Dashboard Administrativo
- Pets atualmente na loja
- Tempo médio por etapa
- Capacidade das áreas
- Notificações enviadas
- Feedbacks dos tutores

## 8. CONCLUSÃO E PRÓXIMOS PASSOS

A implementação da jornada de check-in do pet representa uma evolução significativa no sistema PetShop Romeo & Julieta, transformando a experiência do tutor e otimizando a operação do pet shop.

**Próximos Passos Imediatos:**
1. Aprovação da proposta e priorização das fases
2. Criação das tabelas no banco de dados (Fase 1)
3. Desenvolvimento das APIs básicas
4. Interface de check-in para staff
5. Testes com grupo piloto de tutores

**Benefícios Esperados:**
- ✅ Maior transparência para os tutores
- ✅ Redução de ansiedade dos tutores
- ✅ Melhoria na comunicação com o staff
- ✅ Diferencial competitivo no mercado
- ✅ Preparação para expansão com câmeras IP

O sistema está pronto para evoluir e oferecer uma experiência completa e moderna de acompanhamento do pet durante toda sua permanência no estabelecimento.