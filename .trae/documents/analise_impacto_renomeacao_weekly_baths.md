# Análise de Impacto: Renomeação da Tabela weekly_baths para weekly_baths_pet

## 1. Resumo Executivo

A tabela `weekly_baths` é atualmente a única tabela do sistema Romeu e Julieta Pet Shop que não segue o padrão de nomenclatura com sufixo "_pet". Esta análise avalia o impacto técnico de renomeá-la para `weekly_baths_pet` para manter consistência com as demais tabelas do sistema.

**Situação Atual:**
- A tabela `weekly_baths` armazena fotos de banhos semanais para curadoria
- É a única tabela de negócio sem o sufixo "_pet" (existe apenas `simple_theme_colors` também sem o sufixo)
- A tabela possui integração complexa com a jornada de crescimento dos pets
- Vários arquivos de código, SQL e migrações referenciam o nome atual

**Conclusão Principal:** A mudança é viável tecnicamente, mas envolve alto impacto em múltiplos arquivos e requer cuidadosa execução em ambiente controlado.

## 2. Lista Detalhada de Arquivos Afetados

### 2.1 Arquivos de Banco de Dados/Migrations

**Migrations Principais:**
- `supabase/migrations/integration_weekly_baths_journey.sql` - Integração com jornada
- `supabase/migrations/fix_weekly_baths_image_path.sql` - Correção de caminho de imagem
- `supabase/migrations/fix_weekly_baths_image_path_v2.sql` - Versão 2 da correção
- `scripts/sql/create-weekly-baths-table.sql` - Criação original da tabela
- `scripts/sql/create-weekly-baths-simple.sql` - Versão simplificada

**Scripts de Debug/Correção:**
- `scripts/sql/fix-weekly-baths-dates.sql`
- `scripts/sql/fix-weekly-baths-previous-week.sql`
- `scripts/sql/fix-weekly-baths-current-week.sql`
- `scripts/sql/debug-weekly-baths-30-10-2025.sql`

### 2.2 Arquivos de Código TypeScript

**Services Principais:**
- `src/services/weeklyBathsService.ts` - Service principal (múltiplas chamadas)
- `src/services/integrationService.ts` - Integração com jornada

**Componentes React:**
- `src/components/WeeklyBaths.tsx` - Interface de administração
- `src/components/WeeklyBathsCuration.tsx` - Interface de curadoria

### 2.3 Scripts Node.js

**Scripts de Teste/Dados:**
- `scripts/checks/check-current-data.cjs`
- `create-test-data.cjs`
- `create-test-data-admin.cjs`
- `check-integration-data.cjs`
- `test-integration.cjs`

**Utilitários de Correção:**
- `scripts/tests/run-journey-integration-check.cjs`
- `scripts/utilities/fix-week-start-monday.cjs`
- `scripts/utilities/fix-weekly-baths-data.cjs`
- `scripts/utilities/fix-correct-week-start.cjs`
- `scripts/utilities/fix-week-start-final.cjs`

### 2.4 Documentação

- `.trae/documents/Arquitetura_Tecnica_Integracao_Banhos_Jornada.md`
- `.trae/documents/Roteiro_Teste_Integracao_Banhos_Jornada.md`

## 3. Impacto Técnico Detalhado

### 3.1 Funções SQL Afetadas

**Funções que referenciam diretamente `weekly_baths`:**

1. `create_journey_event_from_bath()`
   - Usa `public.weekly_baths%ROWTYPE`
   - SELECT direto da tabela
   - UPDATE na tabela

2. `get_current_week_baths()`
   - SELECT FROM weekly_baths

3. `archive_old_weekly_baths()`
   - SELECT FROM weekly_baths
   - DELETE FROM weekly_baths

### 3.2 Índices, Triggers e RLS

**Impacto:**
- Índices permanecem funcionais após rename (vinculados ao OID da tabela)
- Triggers permanecem associados automaticamente
- RLS (Row Level Security) permanece vinculada
- Nomes de índices/policies podem manter nome antigo (sem impacto funcional)

### 3.3 Integrações Existentes

**Integração com Jornada de Crescimento:**
- FK `pet_events_pet.weekly_bath_source_id` permanece válida
- A integração via `create_journey_event_from_bath()` precisa atualização
- Fotos em `event_photos_pet` são criadas a partir do path da tabela

## 4. Análise de Riscos e Complexidade

### 4.1 Riscos Identificados

**Risco Alto:**
- Quebra de funcionalidade de curadoria de banhos
- Falha na integração com jornada de crescimento
- Impossibilidade de aprovar banhos (criar eventos)

**Risco Médio:**
- Scripts de manutenção/debug pararem de funcionar
- Dificuldade de troubleshooting em produção
- Documentação desatualizada

**Risco Baixo:**
- Performance impactada (rename é operação rápida em PostgreSQL)
- Perda de dados (rename não apaga dados)
- Integridade referencial (FKs permanecem válidas)

### 4.2 Complexidade da Mudança

**Nível de Complexidade: ALTO**

Justificativas:
- Múltiplos sistemas afetados (SQL, TypeScript, Node.js, Documentação)
- Integração crítica com jornada de pets
- Ambiente com múltiplas instâncias em execução
- Necessidade de sincronização entre código e banco

## 5. Plano de Migração Detalhado

### 5.1 Preparação

1. **Backup Completo**
   - Backup do banco de dados
   - Backup do código atual
   - Criar ponto de restore

2. **Ambiente de Teste**
   - Replicar ambiente de produção
   - Testar todas as funcionalidades antes de produção

### 5.2 Execução da Migração

**Fase 1: Banco de Dados**
```sql
-- Renomear tabela
ALTER TABLE public.weekly_baths RENAME TO weekly_baths_pet;

-- Atualizar funções
CREATE OR REPLACE FUNCTION create_journey_event_from_bath(...)
-- Substituir todas referências para weekly_baths_pet

CREATE OR REPLACE FUNCTION get_current_week_baths(...)
-- Substituir referências

CREATE OR REPLACE FUNCTION archive_old_weekly_baths(...)
-- Substituir referências
```

**Fase 2: Código Backend**
- Atualizar `weeklyBathsService.ts`
- Atualizar `integrationService.ts`
- Atualizar todos scripts Node.js

**Fase 3: Frontend**
- Rebuild e testar componentes React
- Verificar integração completa

**Fase 4: Validação**
- Testar upload de fotos
- Testar aprovação com integração
- Testar visualização na jornada
- Executar scripts de manutenção

### 5.3 Rollback Strategy

Criar view de compatibilidade temporária:
```sql
CREATE VIEW public.weekly_baths AS 
SELECT * FROM public.weekly_baths_pet;
```

Isso permite rollback imediato se necessário.

## 6. Recomendações

### 6.1 Recomendação Principal: **NÃO EXECUTAR AGORA**

**Justificativas:**
1. **Risco vs Benefício:** O benefício de consistência de nomenclatura não justifica o risco de quebra de funcionalidade crítica
2. **Estabilidade do Sistema:** O sistema está funcionando corretamente com o nome atual
3. **Complexidade de Execução:** Requer múltiplas alterações coordenadas
4. **Impacto em Produção:** Pode afetar a operação de curadoria de banhos

### 6.2 Alternativas Recomendadas

1. **Manter Status Quo**
   - Aceitar que `weekly_baths` é uma exceção justificada
   - Documentar a exceção nos padrões do projeto

2. **View de Compatibilidade (Recomendado para Futuro)**
   - Criar view `weekly_baths_pet` apontando para `weekly_baths`
   - Migrar código gradualmente para usar a view
   - Quando tudo estiver usando a view, renomear tabela física

3. **Aguardar Momento Oportuno**
   - Executar durante manutenção programada
   - Com testes completos e rollback preparado
   - Com equipe completa disponível

## 7. Alternativas Consideradas

### 7.1 View de Compatibilidade Temporária
**Vantagens:**
- Migração gradual
- Zero downtime
- Rollback fácil

**Desvantagens:**
- Duplicação de nomenclatura temporária
- Complexidade adicional

### 7.2 Renomeação Imediata
**Vantagens:**
- Consistência imediata
- Menos complexidade total

**Desvantagens:**
- Alto risco
- Requer coordenação perfeita
- Sem margem para erro

### 7.3 Manter Nome Atual
**Vantagens:**
- Zero risco
- Sistema estável

**Desvantagens:**
- Exceção nos padrões
- Possível confusão para novos desenvolvedores

## 8. Conclusão

A renomeação da tabela `weekly_baths` para `weekly_baths_pet` é tecnicamente viável mas envolve riscos significativos. Recomenda-se **manter o nome atual** até que haja uma janela de manutenção adequada com testes completos, ou implementar uma solução de view de compatibilidade para migração gradual.

**Próximos Passos:**
1. Documentar a exceção nos padrões do projeto
2. Implementar view de compatibilidade quando apropriado
3. Planejar migração completa para momento futuro com recursos adequados
4. Manter monitoramento da funcionalidade atual

---

**Data da Análise:** $(date)
**Responsável:** Sistema de Análise de Impacto
**Status:** Documento de Referência - Não Implementar Sem Aprovação