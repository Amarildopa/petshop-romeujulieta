# Roteiro de Testes Manual - Integração Banhos Semanais × Jornada de Crescimento

## 📋 Preparação do Ambiente

### 1. Verificar Servidores
- [ ] Confirmar que o servidor está rodando: `npm run dev` (porta 5173)
- [ ] Confirmar servidor admin está rodando: `npm run dev -- --port 5174` (porta 5174)
- [ ] Acessar interfaces:
  - [ ] Interface Admin: http://localhost:5174/admin/weekly-baths
  - [ ] Interface Cliente: http://localhost:5173/

### 2. Preparar Dados de Teste
- [ ] Criar/verificar pet cadastrado (anotar ID do pet)
- [ ] Verificar usuário admin logado
- [ ] Verificar usuário tutor logado (dono do pet)

---

## 🖼️ Testes de Upload de Foto de Banho Semanal

### Teste 1.1: Upload de Foto com Pet Selecionado
1. [ ] Acessar interface de curadoria: http://localhost:5174/admin/weekly-baths
2. [ ] Clicar em "Adicionar Novo Banho"
3. [ ] Preencher formulário:
   - [ ] Selecionar pet existente no dropdown
   - [ ] Upload de foto (arrastar ou selecionar arquivo)
   - [ ] Preencher "Nome do Pet" (auto-completa ao selecionar)
   - [ ] Preencher "Data do Banho" (data atual ou recente)
   - [ ] Marcar checkbox "Adicionar à Jornada do Pet"
4. [ ] Clicar "Salvar"
5. [ ] **Resultado Esperado**: Foto aparece na lista com status "Pendente"

### Teste 1.2: Upload de Foto sem Adicionar à Jornada
1. [ ] Repetir passos 1-3 acima
2. [ ] **Desmarcar** checkbox "Adicionar à Jornada do Pet"
3. [ ] Clicar "Salvar"
4. [ ] **Resultado Esperado**: Foto aparece na lista com status "Pendente" (mas sem vinculação com jornada)

---

## ✅ Testes de Curadoria (Aprovação/Rejeição)

### Teste 2.1: Aprovar Banho COM Adição à Jornada
**Pré-requisito**: Banho criado no Teste 1.1 (com checkbox marcado)

1. [ ] Localizar banho na lista (status "Pendente")
2. [ ] Verificar que:
   - [ ] Nome do pet está correto
   - [ ] Foto está visível
   - [ ] Checkbox "Adicionar à Jornada" aparece marcado
3. [ ] Clicar botão "Aprovar" (✓)
4. [ ] **Resultados Esperados**:
   - [ ] Status muda para "Aprovado"
   - [ ] Badge "🛁 Banho Semanal" aparece no banho
   - [ ] Evento é criado na Jornada de Crescimento

### Teste 2.2: Aprovar Banho SEM Adição à Jornada
**Pré-requisito**: Banho criado no Teste 1.2 (sem checkbox)

1. [ ] Localizar banho na lista (status "Pendente")
2. [ ] Verificar que checkbox "Adicionar à Jornada" está **desmarcado**
3. [ ] Clicar botão "Aprovar" (✓)
4. [ ] **Resultados Esperados**:
   - [ ] Status muda para "Aprovado"
   - [ ] Badge "🛁 Banho Semanal" aparece no banho
   - [ ] **NENHUM** evento é criado na jornada

### Teste 2.3: Rejeitar Banho
1. [ ] Criar novo banho (pode ser com ou sem checkbox)
2. [ ] Clicar botão "Rejeitar" (✗)
3. [ ] **Resultado Esperado**: Status muda para "Rejeitado"

---

## 👀 Testes de Visualização na Jornada de Crescimento

### Teste 3.1: Verificar Evento de Banho na Jornada
**Pré-requisito**: Banho aprovado no Teste 2.1

1. [ ] Logar como tutor do pet (usuário comum)
2. [ ] Acessar: http://localhost:5173/growth-journey
3. [ ] Selecionar o pet que recebeu o banho
4. [ ] Localizar evento de banho na linha do tempo
5. [ ] **Verificações**:
   - [ ] Evento aparece com badge "🛁 Banho Semanal"
   - [ ] Data do evento corresponde à data do banho
   - [ ] Foto do banho está visível no evento
   - [ ] Tipo do evento é "Banho e Tosa"

### Teste 3.2: Verificar Ausência de Evento (Banho sem checkbox)
**Pré-requisito**: Banho aprovado no Teste 2.2

1. [ ] Acessar jornada do pet correspondente
2. [ ] **Resultado Esperado**: **NENHUM** evento de banho aparece para este pet

---

## 🔍 Testes de Validação de Dados

### Teste 4.1: Verificar Vinculação Bidirecional
1. [ ] Executar query SQL no Supabase:
```sql
-- Verificar vinculação do banho
SELECT 
  wb.id, 
  wb.pet_name, 
  wb.add_to_journey,
  wb.journey_event_id,
  wb.approved
FROM weekly_baths wb 
WHERE wb.pet_name = '[NOME_DO_PET_TESTE]'
ORDER BY wb.created_at DESC;
```
2. [ ] **Verificações**:
   - [ ] `add_to_journey` = true para banhos com checkbox
   - [ ] `journey_event_id` está preenchido (UUID válido)
   - [ ] `approved` = true

### Teste 4.2: Verificar Evento na Tabela pet_events
1. [ ] Executar query SQL:
```sql
-- Verificar evento criado
SELECT 
  pe.id,
  pe.pet_id,
  pe.event_type,
  pe.event_date,
  pe.description,
  pe.weekly_bath_source_id
FROM pet_events_pet pe
WHERE pe.weekly_bath_source_id = '[ID_DO_BANHO]'
ORDER BY pe.created_at DESC;
```
2. [ ] **Verificações**:
   - [ ] Evento existe com `weekly_bath_source_id` correto
   - [ ] `event_type` = 'Banho e Tosa'
   - [ ] `event_date` corresponde à data do banho

---

## ⚠️ Testes de Casos de Erro e Edge Cases

### Teste 5.1: Tentar Aprovar Banho sem Pet Selecionado
1. [ ] Criar banho **sem** selecionar pet no dropdown
2. [ ] Tentar aprovar
3. [ ] **Resultado Esperado**: Sistema deve impedir ou mostrar erro

### Teste 5.2: Upload com Foto Inválida
1. [ ] Tentar upload de arquivo não-imagem (ex: .txt)
2. [ ] **Resultado Esperado**: Sistema deve rejeitar e mostrar mensagem de erro

### Teste 5.3: Múltiplos Banhos para Mesmo Pet
1. [ ] Criar 2-3 banhos para o mesmo pet
2. [ ] Aprovar todos com checkbox marcado
3. [ ] **Verificações**:
   - [ ] Todos os eventos aparecem na jornada
   - [ ] Cada banho tem seu próprio evento
   - [ ] Ordem cronológica está correta

---

## ✅ Checklist Final de Funcionalidades

### Interface de Curadoria
- [ ] Dropdown de seleção de pet funciona
- [ ] Checkbox "Adicionar à Jornada do Pet" aparece e funciona
- [ ] Preview de foto funciona antes do upload
- [ ] Validações de formulário funcionam
- [ ] Botões aprovar/rejeição funcionam
- [ ] Status é atualizado em tempo real

### Integração com Jornada
- [ ] Eventos são criados automaticamente ao aprovar
- [ ] Badge "🛁 Banho Semanal" aparece nos eventos
- [ ] Foto do banho é exibida no evento da jornada
- [ ] Data do evento corresponde à data do banho
- [ ] Vinculação bidirecional funciona (IDs cruzados)

### Banco de Dados
- [ ] Campos `add_to_journey` e `journey_event_id` populados corretamente
- [ ] Campo `weekly_bath_source_id` populado em `pet_events_pet`
- [ ] Constraints e índices funcionando
- [ ] RLS (Row Level Security) não bloqueia funcionalidade

### Performance e UX
- [ ] Interface responde rapidamente
- [ ] Sem erros no console do navegador
- [ ] Feedback visual adequado (loading states, mensagens)
- [ ] Fluxo intuitivo para administradores

---

## 📝 Registro de Resultados

**Data do Teste**: ___/___/_______

**Testador**: ________________________

**Pets Utilizados**:
- Pet 1: ____________________ (ID: _________)
- Pet 2: ____________________ (ID: _________)

**Banhos Criados**:
- Banho 1: ID _________ | Pet: _____________ | Status: _________
- Banho 2: ID _________ | Pet: _____________ | Status: _________
- Banho 3: ID _________ | Pet: _____________ | Status: _________

**Eventos na Jornada**:
- Evento 1: ID _________ | Banho Source: _________ | Badge: ☐
- Evento 2: ID _________ | Banho Source: _________ | Badge: ☐
- Evento 3: ID _________ | Banho Source: _________ | Badge: ☐

**Problemas Encontrados**:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

**Status Final**: ☐ Todos os testes passaram ☐ Falhas encontradas

**Observações**: 
_________________________________________________
_________________________________________________
_________________________________________________