# Estudo de Integração com API Externa de Agendamento

## 📋 Resumo Executivo

Este documento apresenta um estudo completo para integração do sistema PetShop Romeo & Julieta com uma API externa de controle de agendas, mantendo histórico local e sincronização bidirecional.

## 🔍 Análise da Estrutura Atual

### Problema Identificado na Tabela `appointments_pet`

**Status:** ❌ **CRÍTICO - Estrutura Inconsistente**

A validação revelou que a tabela `appointments_pet` no banco de dados **NÃO possui** as seguintes colunas que estão definidas no código:
- `total_price` ❌
- `extras` ❌

**Causa Raiz:**
- O schema local (`src/lib/supabase.ts`) está desatualizado em relação ao banco real
- As migrações não foram executadas corretamente
- Há divergência entre desenvolvimento e produção

### Estrutura Atual vs Esperada

| Coluna | Status no Código | Status no DB | Ação Necessária |
|--------|------------------|--------------|------------------|
| `id` | ✅ Definida | ✅ Existe | OK |
| `created_at` | ✅ Definida | ✅ Existe | OK |
| `updated_at` | ✅ Definida | ✅ Existe | OK |
| `user_id` | ✅ Definida | ✅ Existe | OK |
| `pet_id` | ✅ Definida | ✅ Existe | OK |
| `service_id` | ✅ Definida | ✅ Existe | OK |
| `appointment_date` | ✅ Definida | ✅ Existe | OK |
| `appointment_time` | ✅ Definida | ✅ Existe | OK |
| `status` | ✅ Definida | ✅ Existe | OK |
| `notes` | ✅ Definida | ✅ Existe | OK |
| `total_price` | ✅ Definida | ❌ **FALTA** | **Migração necessária** |
| `extras` | ✅ Definida | ❌ **FALTA** | **Migração necessária** |

## 🌐 Arquitetura de Integração com API Externa

### 1. Visão Geral da Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   API Externa   │
│   (React)       │    │   (Supabase)    │    │   (Agenda)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Solicita slots     │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Consulta API      │
         │                       ├──────────────────────►│
         │                       │ 3. Retorna slots     │
         │                       │◄──────────────────────┤
         │ 4. Exibe slots        │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 5. Cria agendamento   │                       │
         ├──────────────────────►│                       │
         │                       │ 6. Envia para API    │
         │                       ├──────────────────────►│
         │                       │ 7. Confirma criação  │
         │                       │◄──────────────────────┤
         │                       │ 8. Salva histórico   │
         │                       │    local              │
         │ 9. Confirma sucesso   │                       │
         │◄──────────────────────┤                       │
```

### 2. Componentes da Integração

#### 2.1 Serviço de Integração (`externalSchedulingService.ts`)

```typescript
interface ExternalSchedulingAPI {
  // Leitura de slots disponíveis
  getAvailableSlots(serviceId: string, dateRange: DateRange): Promise<ExternalSlot[]>
  
  // Criação de agendamento
  createAppointment(appointmentData: ExternalAppointmentRequest): Promise<ExternalAppointment>
  
  // Cancelamento de agendamento
  cancelAppointment(externalId: string): Promise<boolean>
  
  // Sincronização de status
  syncAppointmentStatus(externalId: string): Promise<ExternalAppointmentStatus>
}

interface ExternalSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  available: boolean
  serviceId: string
  maxCapacity: number
  currentBookings: number
}

interface ExternalAppointment {
  id: string
  slotId: string
  customerData: CustomerData
  serviceId: string
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
  notes?: string
}
```

#### 2.2 Adaptador de Dados (`schedulingAdapter.ts`)

```typescript
class SchedulingAdapter {
  // Converte slots externos para formato interno
  static externalToInternalSlots(externalSlots: ExternalSlot[]): AvailableSlot[] {
    return externalSlots.map(slot => ({
      id: `ext_${slot.id}`,
      service_id: slot.serviceId,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_available: slot.available && slot.currentBookings < slot.maxCapacity,
      max_appointments: slot.maxCapacity,
      current_appointments: slot.currentBookings,
      external_id: slot.id,
      source: 'external'
    }))
  }
  
  // Converte agendamento interno para formato externo
  static internalToExternalAppointment(appointment: Appointment): ExternalAppointmentRequest {
    return {
      slotId: appointment.external_slot_id,
      customerData: {
        name: appointment.customer_name,
        email: appointment.customer_email,
        phone: appointment.customer_phone
      },
      serviceId: appointment.service_id,
      notes: appointment.notes
    }
  }
}
```

### 3. Fluxo de Dados Detalhado

#### 3.1 Leitura de Slots Disponíveis

```typescript
// 1. Frontend solicita slots
const slots = await schedulingService.getAvailableSlots(serviceId, dateRange)

// 2. Backend consulta API externa
const externalSlots = await externalAPI.getAvailableSlots(serviceId, dateRange)

// 3. Adaptação dos dados
const adaptedSlots = SchedulingAdapter.externalToInternalSlots(externalSlots)

// 4. Cache local (opcional)
await cacheService.storeSlots(adaptedSlots, TTL_5_MINUTES)

// 5. Retorno para frontend
return adaptedSlots
```

#### 3.2 Criação de Agendamento

```typescript
// 1. Frontend envia dados do agendamento
const appointmentRequest = {
  pet_id: 'local-pet-id',
  service_id: 'service-id',
  external_slot_id: 'ext_slot_123',
  appointment_date: '2024-01-15',
  appointment_time: '10:00',
  notes: 'Observações especiais'
}

// 2. Backend processa
async function createAppointment(data: AppointmentRequest) {
  try {
    // 2.1 Criar na API externa
    const externalAppointment = await externalAPI.createAppointment(
      SchedulingAdapter.internalToExternalAppointment(data)
    )
    
    // 2.2 Salvar histórico local
    const localAppointment = await supabase
      .from('appointments_pet')
      .insert({
        ...data,
        external_id: externalAppointment.id,
        status: 'confirmed',
        source: 'external'
      })
    
    // 2.3 Registrar log de sincronização
    await syncLogService.log({
      action: 'create',
      external_id: externalAppointment.id,
      local_id: localAppointment.id,
      status: 'success'
    })
    
    return localAppointment
    
  } catch (error) {
    // Rollback se necessário
    await handleSyncError(error, data)
    throw error
  }
}
```

### 4. Estratégias de Sincronização

#### 4.1 Sincronização em Tempo Real

```typescript
class RealtimeSyncService {
  // Webhook para receber atualizações da API externa
  async handleWebhook(payload: ExternalWebhookPayload) {
    switch (payload.event) {
      case 'appointment.created':
        await this.syncAppointmentCreated(payload.data)
        break
      case 'appointment.cancelled':
        await this.syncAppointmentCancelled(payload.data)
        break
      case 'slot.updated':
        await this.syncSlotUpdated(payload.data)
        break
    }
  }
  
  // Polling para verificar mudanças
  async pollForChanges() {
    const lastSync = await this.getLastSyncTimestamp()
    const changes = await externalAPI.getChangesSince(lastSync)
    
    for (const change of changes) {
      await this.processChange(change)
    }
    
    await this.updateLastSyncTimestamp()
  }
}
```

#### 4.2 Sincronização por Lotes

```typescript
class BatchSyncService {
  async syncDailyAppointments(date: string) {
    // 1. Buscar agendamentos do dia na API externa
    const externalAppointments = await externalAPI.getAppointmentsByDate(date)
    
    // 2. Buscar agendamentos locais do mesmo dia
    const localAppointments = await supabase
      .from('appointments_pet')
      .select('*')
      .eq('appointment_date', date)
      .eq('source', 'external')
    
    // 3. Identificar diferenças
    const differences = this.compareAppointments(externalAppointments, localAppointments)
    
    // 4. Aplicar sincronização
    await this.applySyncDifferences(differences)
  }
}
```

### 5. Tratamento de Conflitos

#### 5.1 Estratégias de Resolução

```typescript
enum ConflictResolutionStrategy {
  EXTERNAL_WINS = 'external_wins',    // API externa tem prioridade
  LOCAL_WINS = 'local_wins',          // Sistema local tem prioridade
  MANUAL_REVIEW = 'manual_review',    // Requer intervenção manual
  TIMESTAMP_BASED = 'timestamp_based' // Mais recente vence
}

class ConflictResolver {
  async resolveConflict(
    localData: Appointment,
    externalData: ExternalAppointment,
    strategy: ConflictResolutionStrategy
  ) {
    switch (strategy) {
      case ConflictResolutionStrategy.EXTERNAL_WINS:
        return await this.updateLocalFromExternal(localData, externalData)
      
      case ConflictResolutionStrategy.TIMESTAMP_BASED:
        const localTimestamp = new Date(localData.updated_at)
        const externalTimestamp = new Date(externalData.updatedAt)
        
        if (externalTimestamp > localTimestamp) {
          return await this.updateLocalFromExternal(localData, externalData)
        } else {
          return await this.updateExternalFromLocal(localData, externalData)
        }
      
      case ConflictResolutionStrategy.MANUAL_REVIEW:
        return await this.flagForManualReview(localData, externalData)
    }
  }
}
```

### 6. Monitoramento e Logs

#### 6.1 Sistema de Logs de Sincronização

```typescript
interface SyncLog {
  id: string
  timestamp: string
  action: 'create' | 'update' | 'delete' | 'sync'
  entity_type: 'appointment' | 'slot'
  local_id?: string
  external_id?: string
  status: 'success' | 'error' | 'conflict'
  error_message?: string
  retry_count: number
  data_snapshot: any
}

class SyncMonitoringService {
  async logSyncOperation(operation: SyncLog) {
    await supabase.from('sync_logs_pet').insert(operation)
  }
  
  async getSyncHealth(): Promise<SyncHealthReport> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const { data: logs } = await supabase
      .from('sync_logs_pet')
      .select('*')
      .gte('timestamp', last24h.toISOString())
    
    return {
      totalOperations: logs.length,
      successRate: logs.filter(l => l.status === 'success').length / logs.length,
      errorCount: logs.filter(l => l.status === 'error').length,
      conflictCount: logs.filter(l => l.status === 'conflict').length,
      lastSuccessfulSync: logs
        .filter(l => l.status === 'success')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp
    }
  }
}
```

### 7. Implementação Gradual

#### Fase 1: Leitura de Slots (Somente Leitura)
- ✅ Implementar `externalSchedulingService`
- ✅ Adaptar componente `Booking.tsx` para usar API externa
- ✅ Manter fallback para slots locais

#### Fase 2: Criação de Agendamentos
- ✅ Implementar criação via API externa
- ✅ Salvar histórico local
- ✅ Implementar rollback em caso de erro

#### Fase 3: Sincronização Bidirecional
- ✅ Implementar webhooks
- ✅ Sistema de polling
- ✅ Resolução de conflitos

#### Fase 4: Monitoramento e Otimização
- ✅ Dashboard de sincronização
- ✅ Alertas automáticos
- ✅ Métricas de performance

### 8. Considerações de Segurança

#### 8.1 Autenticação com API Externa
```typescript
class ExternalAPIAuth {
  private apiKey: string
  private apiSecret: string
  
  async getAuthToken(): Promise<string> {
    // Implementar OAuth 2.0 ou JWT
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_secret: this.apiSecret
      })
    })
    
    const { access_token } = await response.json()
    return access_token
  }
}
```

#### 8.2 Validação de Dados
```typescript
class DataValidator {
  static validateExternalSlot(slot: any): ExternalSlot {
    const schema = z.object({
      id: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      available: z.boolean(),
      serviceId: z.string(),
      maxCapacity: z.number().positive(),
      currentBookings: z.number().min(0)
    })
    
    return schema.parse(slot)
  }
}
```

### 9. Estrutura de Tabelas Necessárias

#### 9.1 Tabela de Histórico de Agendamentos
```sql
-- Corrigir tabela appointments_pet
ALTER TABLE appointments_pet 
ADD COLUMN total_price DECIMAL(10,2),
ADD COLUMN extras TEXT[] DEFAULT '{}',
ADD COLUMN external_id TEXT,
ADD COLUMN source TEXT DEFAULT 'local' CHECK (source IN ('local', 'external')),
ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error'));
```

#### 9.2 Tabela de Logs de Sincronização
```sql
CREATE TABLE sync_logs_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'sync')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('appointment', 'slot')),
  local_id UUID,
  external_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'conflict')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  data_snapshot JSONB
);
```

#### 9.3 Tabela de Configuração da API
```sql
CREATE TABLE external_api_config_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  api_base_url TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  webhook_url TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 15,
  conflict_resolution_strategy TEXT DEFAULT 'external_wins',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Conclusões e Recomendações

### Problemas Críticos Identificados
1. **❌ Estrutura de tabela inconsistente** - Colunas `total_price` e `extras` não existem
2. **⚠️ Schema desatualizado** - Diferença entre código e banco de dados
3. **🔄 Necessidade de migração** - Executar scripts de atualização do banco

### Recomendações Imediatas
1. **Corrigir estrutura da tabela** antes de implementar integração externa
2. **Implementar integração em fases** para reduzir riscos
3. **Estabelecer monitoramento robusto** desde o início
4. **Definir estratégia de fallback** para casos de falha da API externa

### Benefícios da Integração
- ✅ **Centralização** do controle de agendas
- ✅ **Histórico local** mantido para relatórios
- ✅ **Flexibilidade** para trocar de provedor
- ✅ **Sincronização** bidirecional automática
- ✅ **Monitoramento** em tempo real

---

**Documento gerado em:** $(date)  
**Versão:** 1.0  
**Status:** Análise Completa - Aguardando Correção de Estrutura