# PRD - PetShop Romeo & Julieta
## Product Requirements Document para Testes com TestSprite

---

## 1. Visão Geral do Produto

### 1.1 Informações Básicas
- **Nome do Produto**: PetShop Romeo & Julieta
- **Versão**: 1.0.0
- **Tipo de Aplicação**: SPA (Single Page Application) Frontend
- **Tecnologias**: React 19, TypeScript, Vite, TailwindCSS, Supabase
- **Plataforma**: Web (Responsive)

### 1.2 Missão
Oferecer uma experiência premium de cuidado para pets, combinando serviços de alta qualidade, acompanhamento em tempo real e um ambiente pensado para o bem-estar dos animais de estimação.

### 1.3 Público-Alvo
- Tutores de pets (cães e gatos)
- Proprietários que buscam serviços premium
- Usuários que valorizam transparência e acompanhamento
- Administradores do sistema

---

## 2. Funcionalidades Principais

### 2.1 Autenticação e Perfil do Usuário

#### 2.1.1 Sistema de Login/Registro
- **Login**: Autenticação via email/senha
- **Registro**: Criação de conta com validação
- **Recuperação de Senha**: Reset via email
- **Integração**: Supabase Auth

#### 2.1.2 Gestão de Perfil
- **Dados Pessoais**:
  - Nome completo
  - Email (somente leitura)
  - Telefone/WhatsApp
  - CPF (com validação)
  - Endereço completo (CEP, rua, bairro, cidade, estado, complemento)
  - Upload de avatar
- **Validações**:
  - CEP com busca automática via API
  - CPF com validação de dígitos
  - Telefone com formatação automática
- **Notificações**: Preferências de notificação (email, WhatsApp, push)
- **Segurança**: Alteração de senha
- **Pagamento**: Gestão de cartões e formas de pagamento

### 2.2 Gestão de Pets

#### 2.2.1 Cadastro de Pets
- **Informações Básicas**:
  - Nome do pet
  - Espécie (cão/gato)
  - Raça
  - Idade
  - Peso e altura
  - Cor
  - Gênero
  - Foto do pet
- **Informações de Saúde**:
  - Personalidade (array de características)
  - Alergias conhecidas
  - Medicamentos em uso
- **Operações**: Criar, editar, visualizar, excluir pets

#### 2.2.2 Perfil Detalhado do Pet
- Visualização completa das informações
- Histórico de serviços
- Jornada de crescimento (fotos e memórias)
- Acompanhamento de saúde

### 2.3 Sistema de Agendamentos

#### 2.3.1 Processo de Agendamento (4 Etapas)
1. **Seleção de Serviço**:
   - Lista de serviços disponíveis
   - Preços e descrições
   - Duração estimada
   - Imagens dos serviços

2. **Seleção do Pet**:
   - Lista de pets do usuário
   - Seleção de cuidados extras
   - Preços adicionais

3. **Data e Horário**:
   - Calendário com datas disponíveis
   - Horários disponíveis por data
   - Restrições (finais de semana)

4. **Confirmação**:
   - Resumo do agendamento
   - Cálculo do preço total
   - Confirmação final

#### 2.3.2 Gestão de Agendamentos
- **Status**: Pendente, Confirmado, Em Andamento, Concluído, Cancelado
- **Operações**: Visualizar, editar, cancelar
- **Notificações**: Lembretes e atualizações
- **Check-in**: Sistema de check-in no dia do serviço

### 2.4 Serviços Oferecidos

#### 2.4.1 Categorias de Serviços
- **Banho & Tosa**: Estética e higiene com produtos premium
- **Consultas Veterinárias**: Cuidado preventivo e especializado
- **Daycare**: Diversão e socialização com segurança
- **Outros Serviços**: Conforme configuração do sistema

#### 2.4.2 Cuidados Extras
- Serviços adicionais disponíveis
- Preços e duração
- Seleção durante o agendamento

### 2.5 Loja Online

#### 2.5.1 Catálogo de Produtos
- **Categorias**: Ração, petiscos, acessórios, brinquedos
- **Filtros**: Por categoria, preço, disponibilidade
- **Busca**: Sistema de busca por nome
- **Ordenação**: Por relevância, preço, mais vendidos

#### 2.5.2 Produtos
- **Informações**:
  - Nome e descrição
  - Preço e preço original (desconto)
  - Avaliações (estrelas)
  - Disponibilidade em estoque
  - Badges (Bestseller, Promoção)
- **Imagens**: Galeria de fotos
- **Operações**: Adicionar ao carrinho, favoritar

#### 2.5.3 Carrinho de Compras
- Gestão de itens
- Cálculo de frete
- Aplicação de cupons
- Processo de checkout

#### 2.5.4 Benefícios da Loja
- Frete grátis acima de R$ 99
- Compra 100% segura
- Produtos premium com qualidade garantida
- Entrega rápida (até 2 dias úteis)

### 2.6 Dashboard do Usuário

#### 2.6.1 Visão Geral
- **Boas-vindas**: Saudação personalizada
- **Notificações**: Centro de notificações
- **Ações Rápidas**: Links para funcionalidades principais

#### 2.6.2 Acompanhamento em Tempo Real
- **Live Feed**: Câmera ao vivo durante serviços
- **Progresso do Serviço**: Barra de progresso com etapas
- **Status**: Indicador visual do status atual

#### 2.6.3 Jornada de Crescimento
- **Álbum de Memórias**: Fotos do pet
- **Histórico**: Evolução ao longo do tempo
- **Fotos**: Galeria de momentos especiais

#### 2.6.4 Próximos Agendamentos
- Lista de agendamentos futuros
- Status e informações
- Ação de check-in quando disponível

#### 2.6.5 Meus Pets
- Lista de pets cadastrados
- Informações resumidas
- Acesso rápido ao perfil

#### 2.6.6 Status da Assinatura
- Plano atual (Premium)
- Serviços restantes
- Cashback acumulado
- Gestão do plano

#### 2.6.7 Estatísticas
- Serviços utilizados no mês
- Avaliação média
- Tempo médio de atendimento

### 2.7 Sistema Administrativo

#### 2.7.1 Dashboard Administrativo
- **Métricas Principais**:
  - Total de usuários
  - Total de pets
  - Total de agendamentos
  - Total de pedidos
  - Receita total
  - Administradores ativos
  - Tickets abertos
  - Notificações não lidas

#### 2.7.2 Gestão de Usuários
- Lista de usuários cadastrados
- Informações detalhadas
- Ações administrativas
- Controle de permissões

#### 2.7.3 Relatórios
- Relatórios de vendas
- Relatórios de agendamentos
- Métricas de performance
- Análise de dados

#### 2.7.4 Notificações Administrativas
- Sistema de notificações internas
- Prioridades (urgente, alta, média, baixa)
- Tipos (erro, aviso, sucesso, info)
- Status de leitura

#### 2.7.5 Tickets de Suporte
- Gestão de tickets de suporte
- Status (aberto, em progresso, resolvido, fechado)
- Prioridades
- Atribuição de responsáveis

#### 2.7.6 Ações Rápidas
- Gerenciar usuários
- Ver relatórios
- Configurações do sistema
- Administradores
- Logs do sistema

#### 2.7.7 Métricas de Performance
- Uptime do sistema
- Tempo de resposta
- Páginas visualizadas
- Performance geral

### 2.8 Sistema de Assinaturas

#### 2.8.1 Planos Disponíveis
- **Plano Premium**: Serviços mensais com benefícios
- **Benefícios**:
  - Número limitado de serviços incluídos
  - Cashback em compras
  - Descontos especiais
  - Prioridade no atendimento

#### 2.8.2 Gestão de Assinatura
- Visualização do plano atual
- Histórico de pagamentos
- Renovação automática
- Cancelamento

### 2.9 Sistema de Notificações

#### 2.9.1 Tipos de Notificação
- **Atualizações de Serviços**: Fotos e vídeos durante serviços
- **Lembretes de Agendamento**: Notificações sobre próximos agendamentos
- **Promoções e Ofertas**: Ofertas especiais e promoções
- **Lembretes de Saúde**: Alertas sobre vacinação e check-ups

#### 2.9.2 Canais de Notificação
- **WhatsApp**: Notificações via WhatsApp
- **Email**: Notificações por email
- **Push Notifications**: Notificações no aplicativo
- **In-app**: Notificações dentro da aplicação

### 2.10 Sistema de Pagamentos

#### 2.10.1 Formas de Pagamento
- **Cartão de Crédito**: Visa, Mastercard
- **PIX**: Pagamento instantâneo
- **Dinheiro**: Pagamento presencial

#### 2.10.2 Gestão de Cartões
- Cadastro de múltiplos cartões
- Cartão principal
- Remoção de cartões
- Atualização de dados

---

## 3. Requisitos Técnicos

### 3.1 Tecnologias Utilizadas
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Backend**: Supabase
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Testes**: Vitest, Testing Library
- **Linting**: ESLint
- **Build**: Vite

### 3.2 Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── lib/                # Bibliotecas e utilitários
├── constants/          # Constantes da aplicação
└── test/               # Configurações de teste
```

### 3.3 Integrações
- **Supabase**: Backend completo
- **API de CEP**: Busca de endereços
- **Sentry**: Monitoramento de erros
- **Faker.js**: Dados de teste

---

## 4. Casos de Uso para Testes

### 4.1 Fluxos de Usuário

#### 4.1.1 Onboarding de Novo Usuário
1. Acesso à página inicial
2. Navegação para registro
3. Preenchimento do formulário de registro
4. Confirmação de email
5. Login inicial
6. Criação do perfil
7. Cadastro do primeiro pet
8. Navegação pelo dashboard

#### 4.1.2 Agendamento de Serviço
1. Login no sistema
2. Navegação para agendamento
3. Seleção de serviço
4. Seleção de pet
5. Escolha de cuidados extras
6. Seleção de data e horário
7. Confirmação do agendamento
8. Visualização no dashboard

#### 4.1.3 Compra na Loja
1. Navegação para a loja
2. Busca/filtro de produtos
3. Visualização de produto
4. Adição ao carrinho
5. Processo de checkout
6. Seleção de forma de pagamento
7. Confirmação da compra

#### 4.1.4 Gestão de Perfil
1. Acesso ao perfil
2. Edição de dados pessoais
3. Upload de avatar
4. Configuração de notificações
5. Gestão de cartões
6. Alteração de senha

### 4.2 Fluxos Administrativos

#### 4.2.1 Acesso Administrativo
1. Login como administrador
2. Acesso ao dashboard administrativo
3. Visualização de métricas
4. Gestão de usuários
5. Visualização de relatórios

#### 4.2.2 Gestão de Conteúdo
1. Acesso às configurações
2. Gestão de serviços
3. Gestão de produtos
4. Configuração de preços
5. Ativação/desativação de itens

### 4.3 Cenários de Teste

#### 4.3.1 Responsividade
- Teste em diferentes resoluções
- Teste em dispositivos móveis
- Teste em tablets
- Teste em desktops

#### 4.3.2 Performance
- Tempo de carregamento das páginas
- Performance de animações
- Otimização de imagens
- Lazy loading de componentes

#### 4.3.3 Acessibilidade
- Navegação por teclado
- Leitores de tela
- Contraste de cores
- Textos alternativos

#### 4.3.4 Segurança
- Validação de formulários
- Sanitização de dados
- Controle de acesso
- Proteção contra XSS

---

## 5. Critérios de Aceitação

### 5.1 Funcionalidades Obrigatórias
- [ ] Sistema de autenticação completo
- [ ] Cadastro e gestão de pets
- [ ] Sistema de agendamentos funcional
- [ ] Loja online operacional
- [ ] Dashboard do usuário
- [ ] Sistema administrativo
- [ ] Responsividade em todos os dispositivos

### 5.2 Performance
- [ ] Tempo de carregamento < 3 segundos
- [ ] Animações suaves (60fps)
- [ ] Otimização de imagens
- [ ] Lazy loading implementado

### 5.3 Usabilidade
- [ ] Interface intuitiva
- [ ] Navegação clara
- [ ] Feedback visual adequado
- [ ] Mensagens de erro claras

### 5.4 Segurança
- [ ] Validação de dados
- [ ] Controle de acesso
- [ ] Sanitização de inputs
- [ ] Proteção contra ataques comuns

---

## 6. Dados de Teste

### 6.1 Usuários de Teste
- **Usuário Comum**: Para testar fluxos de cliente
- **Administrador**: Para testar funcionalidades administrativas
- **Usuário Premium**: Para testar funcionalidades de assinatura

### 6.2 Dados de Pet
- Pets de diferentes espécies
- Dados completos e incompletos
- Fotos válidas e inválidas
- Informações de saúde variadas

### 6.3 Dados de Serviços
- Serviços ativos e inativos
- Diferentes categorias
- Preços variados
- Durações diferentes

### 6.4 Dados de Produtos
- Produtos em estoque e fora de estoque
- Diferentes categorias
- Produtos com desconto
- Produtos com badges especiais

---

## 7. Configuração do Ambiente de Teste

### 7.1 Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- Conta Supabase
- Navegadores modernos

### 7.2 Configuração
1. Clone do repositório
2. Instalação de dependências
3. Configuração de variáveis de ambiente
4. Configuração do Supabase
5. Execução dos testes

### 7.3 Scripts de Teste
- `npm run test`: Execução de testes unitários
- `npm run test:ui`: Interface de testes
- `npm run test:coverage`: Cobertura de testes
- `npm run test:watch`: Modo watch

---

## 8. Métricas de Sucesso

### 8.1 Métricas Técnicas
- Cobertura de testes > 80%
- Tempo de build < 2 minutos
- Performance score > 90
- Acessibilidade score > 95

### 8.2 Métricas de Negócio
- Taxa de conversão de agendamentos
- Tempo médio de agendamento
- Satisfação do usuário
- Taxa de retenção

---

## 9. Cronograma de Testes

### 9.1 Fase 1 - Testes Unitários
- Componentes individuais
- Hooks customizados
- Serviços de API
- Utilitários

### 9.2 Fase 2 - Testes de Integração
- Fluxos completos
- Integração com Supabase
- Validação de dados
- Autenticação

### 9.3 Fase 3 - Testes E2E
- Cenários de usuário completos
- Testes de regressão
- Testes de performance
- Testes de acessibilidade

### 9.4 Fase 4 - Testes de Aceitação
- Validação com stakeholders
- Testes de usabilidade
- Testes de carga
- Testes de segurança

---

## 10. Conclusão

Este PRD fornece uma base sólida para a execução de testes abrangentes no sistema PetShop Romeo & Julieta. O documento detalha todas as funcionalidades, fluxos de usuário e critérios técnicos necessários para garantir a qualidade e confiabilidade da aplicação.

Os testes devem cobrir tanto os aspectos funcionais quanto não-funcionais, garantindo que o sistema atenda às expectativas dos usuários e mantenha os mais altos padrões de qualidade.

---

**Documento gerado em**: $(date)
**Versão**: 1.0
**Status**: Pronto para execução de testes
