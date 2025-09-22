# Especificação Técnica - API Externa para Sistema de Agendamento
## PetShop Romeo & Julieta

**Data:** Dezembro 2024  
**Versão:** 1.0  
**Destinatário:** Fornecedor da API Externa

---

## 1. RESUMO EXECUTIVO

Precisamos integrar nosso sistema de agendamento online com uma API externa que gerenciará a disponibilidade de horários e agendamentos. A API externa será a **fonte de dados verdadeira** para todos os horários disponíveis e agendamentos confirmados.

### Objetivo
Sincronizar horários disponíveis e validar agendamentos em tempo real entre nosso sistema (Supabase) e a API externa.

### Estratégia de Integração
- **Atualização Periódica**: Sincronização automática a cada hora (8x por dia)
- **Validação em Tempo Real**: Verificação de disponibilidade no momento do agendamento
- **API como Fonte Verdadeira**: Todos os dados críticos vêm da API externa

---

## 2. REQUISITOS TÉCNICOS DA API

### 2.1 Requisitos Funcionais

#### ✅ Obrigatórios
- **Listar horários disponíveis** por data e serviço
- **Verificar disponibilidade** de horário específico
- **Criar/confirmar agendamento** 
- **Buscar mudanças** desde última sincronização
- **Cancelar agendamento** (se aplicável)

#### 🔄 Desejáveis
- Webhook para notificações em tempo real
- Suporte a filtros avançados (profissional, tipo de serviço)
- Histórico de alterações

### 2.2 Requisitos Técnicos

| Requisito | Especificação |
|-----------|---------------|
| **Protocolo** | HTTPS obrigatório |
| **Formato** | JSON |
| **Autenticação** | API Key ou Bearer Token |
| **Rate Limiting** | Mínimo 100 req/min |
| **Timeout** | Máximo 5 segundos |
| **Disponibilidade** | 99.5% uptime |

---

## 3. ENDPOINTS NECESSÁRIOS

### 3.1 GET /api/available-slots
**Descrição:** Lista horários disponíveis

**Parâmetros:**
```json
{
  "date": "2024-12-15",           // Obrigatório: Data no formato YYYY-MM-DD
  "service_type": "banho_tosa",   // Opcional: Tipo de serviço
  "professional_id": "123",       // Opcional: ID do profissional
  "duration_minutes": 60          // Opcional: Duração em minutos
}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-15",
    "available_slots": [
      {
        "slot_id": "slot_001",
        "start_time": "09:00",
        "end_time": "10:00",
        "duration_minutes": 60,
        "service_types": ["banho_tosa", "banho_simples"],
        "professional_id": "prof_001",
        "professional_name": "Maria Silva",
        "price": 45.00,
        "available": true
      }
    ]
  },
  "timestamp": "2024-12-15T08:30:00Z"
}
```

### 3.2 POST /api/check-availability
**Descrição:** Verifica disponibilidade de horário específico

**Payload:**
```json
{
  "slot_id": "slot_001",
  "date": "2024-12-15",
  "start_time": "09:00",
  "service_type": "banho_tosa",
  "duration_minutes": 60
}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "slot_id": "slot_001",
    "expires_at": "2024-12-15T08:35:00Z",  // Reserva temporária por 5min
    "price": 45.00,
    "professional": {
      "id": "prof_001",
      "name": "Maria Silva"
    }
  }
}
```

### 3.3 POST /api/appointments
**Descrição:** Cria/confirma agendamento

**Payload:**
```json
{
  "slot_id": "slot_001",
  "customer": {
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@email.com"
  },
  "pet": {
    "name": "Rex",
    "breed": "Golden Retriever",
    "size": "grande",
    "special_notes": "Cão muito dócil"
  },
  "service": {
    "type": "banho_tosa",
    "duration_minutes": 60,
    "extras": ["corte_unhas", "limpeza_ouvidos"]
  },
  "appointment_date": "2024-12-15",
  "appointment_time": "09:00",
  "total_price": 65.00,
  "payment_method": "cartao",
  "notes": "Cliente preferencial"
}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "appointment_id": "apt_001",
    "confirmation_code": "RJ2024001",
    "status": "confirmed",
    "customer": { /* dados do cliente */ },
    "pet": { /* dados do pet */ },
    "service": { /* dados do serviço */ },
    "professional": {
      "id": "prof_001",
      "name": "Maria Silva"
    },
    "appointment_datetime": "2024-12-15T09:00:00Z",
    "total_price": 65.00,
    "created_at": "2024-12-15T08:30:00Z"
  }
}
```

### 3.4 GET /api/changes
**Descrição:** Busca mudanças desde última sincronização

**Parâmetros:**
```json
{
  "since": "2024-12-15T07:00:00Z",  // Timestamp da última sincronização
  "limit": 100                      // Opcional: Limite de registros
}
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "changes": [
      {
        "type": "slot_created",
        "slot_id": "slot_002",
        "timestamp": "2024-12-15T07:15:00Z",
        "data": { /* dados do slot */ }
      },
      {
        "type": "appointment_cancelled",
        "appointment_id": "apt_001",
        "timestamp": "2024-12-15T07:30:00Z",
        "reason": "Cliente cancelou"
      }
    ],
    "last_sync": "2024-12-15T08:00:00Z",
    "has_more": false
  }
}
```

---

## 4. MAPEAMENTO DE DADOS

### 4.1 Tipos de Serviço (service_type)
```json
{
  "banho_simples": "Banho Simples",
  "banho_tosa": "Banho e Tosa",
  "tosa_higienica": "Tosa Higiênica",
  "corte_unhas": "Corte de Unhas",
  "limpeza_ouvidos": "Limpeza de Ouvidos",
  "escovacao": "Escovação",
  "hidratacao": "Hidratação"
}
```

### 4.2 Tamanhos de Pet (pet_size)
```json
{
  "pequeno": "Pequeno (até 10kg)",
  "medio": "Médio (10-25kg)",
  "grande": "Grande (25kg+)"
}
```

### 4.3 Status de Agendamento
```json
{
  "pending": "Pendente",
  "confirmed": "Confirmado",
  "in_progress": "Em Andamento",
  "completed": "Concluído",
  "cancelled": "Cancelado",
  "no_show": "Não Compareceu"
}
```

---

## 5. TRATAMENTO DE ERROS

### 5.1 Códigos de Erro Esperados

| Código | Descrição | Ação do Sistema |
|--------|-----------|-----------------|
| `400` | Dados inválidos | Mostrar erro ao usuário |
| `401` | Não autorizado | Verificar autenticação |
| `404` | Recurso não encontrado | Atualizar dados locais |
| `409` | Conflito (horário ocupado) | Sugerir outros horários |
| `429` | Rate limit excedido | Retry com backoff |
| `500` | Erro interno | Usar dados locais como fallback |

### 5.2 Formato de Erro
```json
{
  "success": false,
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "O horário selecionado não está mais disponível",
    "details": {
      "slot_id": "slot_001",
      "suggested_slots": ["slot_002", "slot_003"]
    }
  },
  "timestamp": "2024-12-15T08:30:00Z"
}
```

---

## 6. SEGURANÇA E AUTENTICAÇÃO

### 6.1 Autenticação
- **Método Preferido:** Bearer Token
- **Alternativa:** API Key no header
- **Header:** `Authorization: Bearer {token}` ou `X-API-Key: {key}`

### 6.2 Segurança
- **HTTPS obrigatório** em produção
- **Validação de dados** em todos os endpoints
- **Rate limiting** para prevenir abuso
- **Logs de auditoria** para mudanças críticas

---

## 7. PERFORMANCE E DISPONIBILIDADE

### 7.1 Requisitos de Performance
- **Tempo de resposta:** < 2 segundos (média)
- **Timeout máximo:** 5 segundos
- **Rate limit:** Mínimo 100 requests/minuto
- **Disponibilidade:** 99.5% uptime

### 7.2 Monitoramento
- **Health check endpoint:** `GET /api/health`
- **Métricas de performance** disponíveis
- **Alertas** para indisponibilidade

---

## 8. CENÁRIOS DE USO

### 8.1 Fluxo Principal - Agendamento
1. **Cliente acessa** página de agendamento
2. **Sistema busca** horários disponíveis (`GET /api/available-slots`)
3. **Cliente seleciona** horário desejado
4. **Sistema verifica** disponibilidade (`POST /api/check-availability`)
5. **Cliente preenche** dados do agendamento
6. **Sistema confirma** agendamento (`POST /api/appointments`)
7. **Cliente recebe** confirmação

### 8.2 Sincronização Automática
1. **Cron job executa** a cada hora
2. **Sistema busca** mudanças (`GET /api/changes`)
3. **Sistema atualiza** dados locais
4. **Sistema registra** log de sincronização

---

## 9. CONFIGURAÇÕES DE AMBIENTE

### 9.1 Variáveis Necessárias
```env
# API Externa
EXTERNAL_API_BASE_URL=https://api.petshop-sistema.com
EXTERNAL_API_KEY=sua_api_key_aqui
EXTERNAL_API_TIMEOUT=5000

# Sincronização
SYNC_INTERVAL_HOURS=1
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=5000
```

---

## 10. TESTES E VALIDAÇÃO

### 10.1 Cenários de Teste
- ✅ Listar horários disponíveis
- ✅ Verificar disponibilidade específica
- ✅ Criar agendamento com sucesso
- ✅ Tratar conflito de horário
- ✅ Sincronização de mudanças
- ✅ Tratamento de erros da API
- ✅ Fallback para dados locais

### 10.2 Dados de Teste
Forneceremos dados de teste para validação da integração.

---

## 11. CRONOGRAMA SUGERIDO

| Fase | Atividade | Prazo |
|------|-----------|-------|
| 1 | Desenvolvimento da API | 2-3 semanas |
| 2 | Testes internos | 1 semana |
| 3 | Integração com nosso sistema | 1 semana |
| 4 | Testes integrados | 1 semana |
| 5 | Deploy em produção | 1 semana |

---

## 12. CONTATO E SUPORTE

**Equipe Técnica PetShop Romeo & Julieta**
- **Email:** dev@petshopromeoejulieta.com
- **Telefone:** (11) 99999-9999
- **Horário:** Segunda a Sexta, 9h às 18h

---

## 13. OBSERVAÇÕES IMPORTANTES

1. **Flexibilidade:** Estamos abertos a ajustes na especificação conforme suas capacidades técnicas
2. **Prioridades:** Os endpoints de listagem e criação de agendamentos são críticos
3. **Fallback:** Nosso sistema deve funcionar mesmo com a API temporariamente indisponível
4. **Escalabilidade:** Considerar crescimento futuro do volume de agendamentos
5. **Documentação:** Solicitamos documentação técnica completa da API

---

**Esta especificação serve como base para desenvolvimento. Estamos disponíveis para esclarecimentos e ajustes conforme necessário.**