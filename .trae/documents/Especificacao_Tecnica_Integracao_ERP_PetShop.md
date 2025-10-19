# Especificação Técnica - Integração ERP PetShop Romeo & Julieta

**Data:** Janeiro 2025  
**Versão:** 1.0  
**Destinatário:** Fornecedor do Sistema ERP  
**Projeto:** Integração Sistema de Gestão com Aplicativo do Cliente

---

## 1. RESUMO EXECUTIVO

Necessitamos integrar nosso **aplicativo mobile/web do cliente** com o **sistema ERP de gestão do PetShop**. O ERP será responsável pela gestão operacional completa, enquanto nosso app focará na experiência do cliente e notificações em tempo real.

### 1.1 Objetivos da Integração
- ✅ Sincronização de agendamentos em tempo real
- ✅ Acompanhamento de status dos serviços pelos tutores
- ✅ Notificações automáticas via WhatsApp/Push/SMS
- ✅ Gestão de clientes e pets unificada
- ✅ Histórico completo de atendimentos
- ✅ Controle de faturamento e pagamentos

---

## 2. ARQUITETURA DE INTEGRAÇÃO REQUERIDA

### 2.1 Modelo de Comunicação
**OBRIGATÓRIO:** O ERP deve fornecer:

#### **Opção A: Webhooks (RECOMENDADO)**
```
POST https://nosso-app.com/api/webhooks/erp-events
Content-Type: application/json
Authorization: Bearer {token}

{
  "event": "appointment.status_changed",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "appointment_id": "ERP-12345",
    "external_appointment_id": "APP-67890",
    "status": "in_progress",
    "details": {...}
  }
}
```

#### **Opção B: API REST para Polling**
```
GET /api/v1/appointments/{id}/status
GET /api/v1/appointments/changes-since/{timestamp}
GET /api/v1/customers/{id}/appointments
```

### 2.2 Autenticação e Segurança
**OBRIGATÓRIOS:**
- ✅ **API Key** ou **OAuth 2.0**
- ✅ **HTTPS** obrigatório em todas as comunicações
- ✅ **Rate Limiting** (mínimo 1000 req/min)
- ✅ **Webhook Signature** para validação
- ✅ **IP Whitelist** para segurança adicional

---

## 3. ESPECIFICAÇÕES DE DADOS

### 3.1 Estrutura de Cliente/Tutor
```json
{
  "customer": {
    "id": "string (UUID ou ID único)",
    "external_id": "string (ID do nosso sistema)",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip_code": "string"
    },
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

### 3.2 Estrutura de Pet
```json
{
  "pet": {
    "id": "string (UUID ou ID único)",
    "external_id": "string (ID do nosso sistema)",
    "customer_id": "string",
    "name": "string",
    "species": "string (dog, cat, bird, etc.)",
    "breed": "string",
    "birth_date": "ISO 8601 date",
    "weight": "number (kg)",
    "gender": "string (male, female)",
    "notes": "string (observações médicas/comportamentais)",
    "last_service_date": "ISO 8601 datetime",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

### 3.3 Estrutura de Serviços
```json
{
  "service": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string (grooming, veterinary, boarding, etc.)",
    "duration_minutes": "number",
    "price": "number",
    "is_active": "boolean",
    "requirements": ["string"] // Ex: ["vaccination_required", "fasting_required"]
  }
}
```

### 3.4 Estrutura de Agendamento
```json
{
  "appointment": {
    "id": "string (ID único do ERP)",
    "external_id": "string (ID do nosso sistema)",
    "customer_id": "string",
    "pet_id": "string",
    "service_id": "string",
    "scheduled_date": "ISO 8601 datetime",
    "estimated_duration": "number (minutes)",
    "status": "string", // Ver seção 3.5
    "current_step": "string", // Ver seção 3.6
    "notes": "string",
    "special_instructions": "string",
    "price": "number",
    "payment_status": "string (pending, paid, cancelled)",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime",
    "completed_at": "ISO 8601 datetime",
    "staff_assigned": {
      "id": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

### 3.5 Status de Agendamento (OBRIGATÓRIO)
```json
{
  "status_options": [
    "scheduled",      // Agendado
    "confirmed",      // Confirmado pelo cliente
    "checked_in",     // Pet chegou e foi recebido
    "in_progress",    // Serviço em andamento
    "completed",      // Serviço finalizado
    "ready_pickup",   // Pronto para buscar
    "picked_up",      // Pet foi retirado
    "cancelled",      // Cancelado
    "no_show"         // Cliente não compareceu
  ]
}
```

### 3.6 Etapas do Serviço (DESEJÁVEL)
```json
{
  "service_steps": [
    "reception",      // Recepção do pet
    "preparation",    // Preparação (escovação, etc.)
    "bathing",        // Banho
    "drying",         // Secagem
    "grooming",       // Tosa/corte
    "finishing",      // Finalização (perfume, laço, etc.)
    "quality_check",  // Verificação final
    "ready"           // Pronto para entrega
  ]
}
```

---

## 4. ENDPOINTS DE API OBRIGATÓRIOS

### 4.1 Gestão de Clientes
```
GET    /api/v1/customers                    # Listar clientes
GET    /api/v1/customers/{id}               # Buscar cliente específico
POST   /api/v1/customers                    # Criar cliente
PUT    /api/v1/customers/{id}               # Atualizar cliente
GET    /api/v1/customers/search?email={email} # Buscar por email/telefone
```

### 4.2 Gestão de Pets
```
GET    /api/v1/pets                         # Listar pets
GET    /api/v1/pets/{id}                    # Buscar pet específico
GET    /api/v1/customers/{id}/pets          # Pets de um cliente
POST   /api/v1/pets                         # Criar pet
PUT    /api/v1/pets/{id}                    # Atualizar pet
```

### 4.3 Gestão de Serviços
```
GET    /api/v1/services                     # Listar serviços disponíveis
GET    /api/v1/services/{id}                # Detalhes do serviço
GET    /api/v1/services/categories          # Categorias de serviços
```

### 4.4 Gestão de Agendamentos
```
GET    /api/v1/appointments                 # Listar agendamentos
GET    /api/v1/appointments/{id}            # Buscar agendamento específico
POST   /api/v1/appointments                 # Criar agendamento
PUT    /api/v1/appointments/{id}            # Atualizar agendamento
DELETE /api/v1/appointments/{id}            # Cancelar agendamento
GET    /api/v1/appointments/{id}/status     # Status atual do agendamento
PUT    /api/v1/appointments/{id}/status     # Atualizar status
GET    /api/v1/customers/{id}/appointments  # Agendamentos de um cliente
```

### 4.5 Disponibilidade de Horários
```
GET    /api/v1/availability?service_id={id}&date={date}  # Horários disponíveis
GET    /api/v1/availability/calendar?month={YYYY-MM}     # Calendário do mês
POST   /api/v1/availability/check                        # Verificar disponibilidade específica
```

### 4.6 Histórico e Relatórios
```
GET    /api/v1/pets/{id}/history            # Histórico de serviços do pet
GET    /api/v1/customers/{id}/history       # Histórico do cliente
GET    /api/v1/appointments/changes-since/{timestamp}  # Mudanças desde timestamp
```

---

## 5. EVENTOS DE WEBHOOK OBRIGATÓRIOS

### 5.1 Eventos de Agendamento
```json
{
  "events_required": [
    "appointment.created",        // Novo agendamento criado
    "appointment.updated",        // Agendamento modificado
    "appointment.cancelled",      // Agendamento cancelado
    "appointment.confirmed",      // Cliente confirmou presença
    "appointment.checked_in",     // Pet chegou e foi recebido
    "appointment.status_changed", // Mudança de status
    "appointment.step_changed",   // Mudança de etapa do serviço
    "appointment.completed",      // Serviço finalizado
    "appointment.ready_pickup",   // Pronto para buscar
    "appointment.picked_up"       // Pet foi retirado
  ]
}
```

### 5.2 Eventos de Cliente/Pet
```json
{
  "events_optional": [
    "customer.created",           // Novo cliente cadastrado
    "customer.updated",           // Dados do cliente alterados
    "pet.created",                // Novo pet cadastrado
    "pet.updated"                 // Dados do pet alterados
  ]
}
```

### 5.3 Estrutura do Webhook
```json
{
  "webhook_payload": {
    "event": "string",
    "timestamp": "ISO 8601 datetime",
    "signature": "string (HMAC-SHA256)",
    "data": {
      "appointment": {...},
      "previous_status": "string",
      "new_status": "string",
      "changed_by": {
        "id": "string",
        "name": "string",
        "role": "string"
      },
      "estimated_completion": "ISO 8601 datetime",
      "notes": "string"
    }
  }
}
```

---

## 6. REQUISITOS TÉCNICOS

### 6.1 Performance
- ✅ **Tempo de resposta:** Máximo 2 segundos para consultas
- ✅ **Disponibilidade:** 99.5% uptime mínimo
- ✅ **Webhooks:** Entrega em até 30 segundos
- ✅ **Rate Limiting:** Suporte a 1000+ requests/minuto

### 6.2 Dados e Sincronização
- ✅ **Formato:** JSON obrigatório
- ✅ **Encoding:** UTF-8
- ✅ **Timezone:** UTC com conversão local
- ✅ **Paginação:** Suporte a limit/offset ou cursor
- ✅ **Filtros:** Por data, status, cliente, pet

### 6.3 Tratamento de Erros
```json
{
  "error_response": {
    "error": {
      "code": "string",
      "message": "string",
      "details": "string",
      "timestamp": "ISO 8601 datetime",
      "request_id": "string"
    }
  }
}
```

### 6.4 Códigos de Status HTTP
```
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
409 - Conflict
422 - Unprocessable Entity
429 - Too Many Requests
500 - Internal Server Error
503 - Service Unavailable
```

---

## 7. FLUXOS DE INTEGRAÇÃO

### 7.1 Fluxo de Criação de Agendamento
```
1. Cliente cria agendamento no APP
2. APP envia POST /api/v1/appointments para ERP
3. ERP valida disponibilidade e cria agendamento
4. ERP retorna ID do agendamento
5. APP salva mapeamento (APP_ID <-> ERP_ID)
6. ERP envia webhook "appointment.created"
```

### 7.2 Fluxo de Atualização de Status
```
1. Funcionário atualiza status no ERP
2. ERP envia webhook "appointment.status_changed"
3. APP recebe webhook e atualiza status local
4. APP envia notificação para o cliente
5. APP confirma recebimento do webhook
```

### 7.3 Fluxo de Sincronização Inicial
```
1. APP solicita GET /api/v1/customers para sincronizar clientes
2. APP solicita GET /api/v1/pets para sincronizar pets
3. APP solicita GET /api/v1/appointments para sincronizar agendamentos
4. APP cria mapeamento de IDs
5. Sincronização incremental via webhooks
```

---

## 8. MONITORAMENTO E LOGS

### 8.1 Logs Obrigatórios
- ✅ **Request/Response logs** com timestamps
- ✅ **Webhook delivery logs** com status de entrega
- ✅ **Error logs** com stack traces
- ✅ **Performance metrics** (tempo de resposta)

### 8.2 Métricas de Monitoramento
- ✅ **API Response Time**
- ✅ **Webhook Success Rate**
- ✅ **Error Rate por endpoint**
- ✅ **Uptime/Downtime**

### 8.3 Alertas Necessários
- ✅ **API indisponível** por mais de 5 minutos
- ✅ **Webhook failures** acima de 5%
- ✅ **Response time** acima de 5 segundos
- ✅ **Error rate** acima de 1%

---

## 9. AMBIENTE DE DESENVOLVIMENTO

### 9.1 Ambientes Necessários
- ✅ **Desenvolvimento:** Para testes iniciais
- ✅ **Homologação:** Para testes de integração
- ✅ **Produção:** Ambiente final

### 9.2 Dados de Teste
- ✅ **Clientes fictícios** (mínimo 10)
- ✅ **Pets fictícios** (mínimo 20)
- ✅ **Agendamentos de exemplo** (mínimo 50)
- ✅ **Cenários de teste** para todos os status

---

## 10. DOCUMENTAÇÃO OBRIGATÓRIA

### 10.1 Documentação Técnica
- ✅ **API Documentation** (OpenAPI/Swagger)
- ✅ **Webhook Documentation** com exemplos
- ✅ **Authentication Guide**
- ✅ **Error Handling Guide**
- ✅ **Rate Limiting Documentation**

### 10.2 Guias de Integração
- ✅ **Quick Start Guide**
- ✅ **Integration Examples** em diferentes linguagens
- ✅ **Troubleshooting Guide**
- ✅ **FAQ técnico**

### 10.3 Suporte Técnico
- ✅ **Canal de comunicação** (Slack, Teams, etc.)
- ✅ **SLA de resposta** para dúvidas técnicas
- ✅ **Contato de emergência** para problemas críticos
- ✅ **Horário de suporte** técnico

---

## 11. CRONOGRAMA DE IMPLEMENTAÇÃO

### 11.1 Fase 1: Preparação (1-2 semanas)
- ✅ Documentação da API
- ✅ Ambiente de desenvolvimento
- ✅ Credenciais de acesso
- ✅ Dados de teste

### 11.2 Fase 2: Integração Básica (2-3 semanas)
- ✅ Autenticação
- ✅ CRUD de clientes e pets
- ✅ Consulta de serviços
- ✅ Testes básicos

### 11.3 Fase 3: Agendamentos (2-3 semanas)
- ✅ Criação de agendamentos
- ✅ Consulta de disponibilidade
- ✅ Atualização de status
- ✅ Testes de fluxo completo

### 11.4 Fase 4: Webhooks (1-2 semanas)
- ✅ Configuração de webhooks
- ✅ Tratamento de eventos
- ✅ Sistema de notificações
- ✅ Testes de tempo real

### 11.5 Fase 5: Homologação (1-2 semanas)
- ✅ Testes de carga
- ✅ Testes de falha
- ✅ Validação completa
- ✅ Go-live

---

## 12. CRITÉRIOS DE ACEITAÇÃO

### 12.1 Funcionalidades Obrigatórias
- ✅ Sincronização de clientes e pets
- ✅ Criação e atualização de agendamentos
- ✅ Recebimento de webhooks em tempo real
- ✅ Notificações automáticas para clientes
- ✅ Tratamento de erros e fallbacks

### 12.2 Performance Mínima
- ✅ 99.5% de uptime
- ✅ Tempo de resposta < 2 segundos
- ✅ Webhooks entregues em < 30 segundos
- ✅ Suporte a 1000+ requests/minuto

### 12.3 Segurança
- ✅ HTTPS obrigatório
- ✅ Autenticação robusta
- ✅ Validação de webhooks
- ✅ Logs de auditoria

---

## 13. CONTATOS E PRÓXIMOS PASSOS

### 13.1 Equipe Técnica
- **Desenvolvedor Principal:** [Seu Nome]
- **Email:** [seu-email@petshop.com]
- **Telefone:** [seu-telefone]

### 13.2 Próximos Passos
1. **Análise desta especificação** pelo fornecedor
2. **Reunião técnica** para esclarecimentos
3. **Cronograma detalhado** de implementação
4. **Assinatura do contrato** técnico
5. **Início do desenvolvimento**

---

**Este documento deve ser usado como base para negociação e desenvolvimento da integração. Todos os itens marcados como "OBRIGATÓRIO" são requisitos não-negociáveis para o sucesso do projeto.**