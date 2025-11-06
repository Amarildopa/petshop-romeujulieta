# Documento de Requisitos do Produto - Integração Banhos Semanais → Jornada do Pet

## 1. Visão Geral do Produto

Esta funcionalidade implementa uma integração unidirecional que permite aos administradores enviar fotos aprovadas de banhos semanais diretamente para a linha do tempo da jornada de crescimento do pet correspondente.

- **Objetivo Principal**: Automatizar o processo de adição de eventos de "Banho e Tosa" na jornada do pet a partir das fotos de banhos semanais aprovadas pelos administradores.
- **Valor de Negócio**: Enriquece automaticamente a jornada do pet com momentos especiais de cuidado, aumentando o engajamento dos tutores e o valor percebido dos serviços.

## 2. Funcionalidades Principais

### 2.1 Papéis de Usuário

| Papel | Método de Acesso | Permissões Principais |
|-------|------------------|----------------------|
| Administrador | Login administrativo | Pode aprovar banhos semanais e marcar para envio à jornada do pet |
| Tutor | Login regular | Pode visualizar eventos adicionados automaticamente na jornada do pet |

### 2.2 Módulos de Funcionalidade

Nossa integração consiste nas seguintes páginas principais:
1. **Curadoria de Banhos Semanais**: interface administrativa aprimorada com opção de envio para jornada.
2. **Jornada de Crescimento do Pet**: visualização dos eventos de banho adicionados automaticamente.

### 2.3 Detalhes das Páginas

| Nome da Página | Nome do Módulo | Descrição da Funcionalidade |
|----------------|----------------|------------------------------|
| Curadoria de Banhos Semanais | Aprovação com Integração | Adicionar checkbox "Adicionar à Jornada do Pet" na interface de aprovação de fotos de banhos semanais |
| Curadoria de Banhos Semanais | Processamento Automático | Criar automaticamente evento "Banho e Tosa" na jornada quando administrador aprovar foto E marcar a opção |
| Curadoria de Banhos Semanais | Rastreabilidade | Registrar origem do evento (weekly_bath_id) para manter vínculo com banho semanal original |
| Jornada de Crescimento do Pet | Visualização de Eventos | Exibir eventos de "Banho e Tosa" criados automaticamente com indicador visual de origem |
| Jornada de Crescimento do Pet | Metadados do Evento | Mostrar data do banho, foto aprovada e informações do serviço realizado |

## 3. Processo Principal

### Fluxo do Administrador:
1. Administrador acessa a curadoria de banhos semanais
2. Visualiza fotos pendentes de aprovação
3. Para cada foto que deseja aprovar:
   - Marca checkbox "Aprovar"
   - Opcionalmente marca checkbox "Adicionar à Jornada do Pet"
4. Confirma a aprovação
5. Sistema processa automaticamente:
   - Aprova a foto no sistema de banhos semanais
   - Se marcado, cria evento "Banho e Tosa" na jornada do pet correspondente
   - Vincula a foto aprovada ao novo evento
   - Registra a origem (weekly_bath_id) para rastreabilidade

### Fluxo do Tutor:
1. Tutor acessa a jornada de crescimento do seu pet
2. Visualiza novos eventos de "Banho e Tosa" adicionados automaticamente
3. Pode interagir com o evento (visualizar foto, compartilhar, etc.)

```mermaid
graph TD
    A[Administrador acessa Curadoria] --> B[Visualiza fotos pendentes]
    B --> C[Seleciona foto para aprovar]
    C --> D[Marca 'Aprovar']
    D --> E{Marcar 'Adicionar à Jornada'?}
    E -->|Sim| F[Sistema cria evento na