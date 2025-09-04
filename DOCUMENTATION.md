# Documentação do Projeto: PetShop Romeu & Julieta (v2.0)

## 1. Visão Geral do Projeto

Este documento detalha a arquitetura e as funcionalidades da aplicação web "PetShop Romeu & Julieta". O projeto evoluiu de uma simples interface estática para uma plataforma dinâmica e interativa (Single Page Application - SPA) que serve tanto aos clientes quanto aos administradores do pet shop.

### Tecnologias Principais

*   **Frontend:** React com TypeScript
*   **Backend (BaaS):** Google Firebase (Firestore Database, Authentication)
*   **Estilização:** Tailwind CSS
*   **Build Tool:** Vite
*   **Animações:** Framer Motion

## 2. Arquitetura da Aplicação

A aplicação utiliza uma arquitetura baseada em componentes com uma separação clara de responsabilidades, conectada a um backend serverless (Firebase) para dados e autenticação.

*   **React:** Constrói a interface do usuário de forma reativa e componentizada.
*   **Firebase Authentication:** Gerencia todo o ciclo de vida da autenticação do usuário (registro, login, logout) e o controle de acesso baseado em regras.
*   **Firestore Database:** Atua como nosso banco de dados NoSQL em tempo real para armazenar todos os dados da aplicação, incluindo perfis de usuários, informações de pets, agendamentos e notificações.
*   **Tailwind CSS:** Fornece uma estrutura de estilização utility-first para um desenvolvimento rápido e consistente da UI.

## 3. Estrutura de Pastas e Arquivos

A organização dos arquivos foi pensada para escalar e facilitar a manutenção:

```
/src
|-- /assets         # Imagens, SVGs e outros ativos estáticos
|-- /components     # Componentes React reutilizáveis (Header, PrivateRoute, etc.)
|-- /contexts       # Contextos React (Ex: AuthContext para gerenciamento de sessão)
|-- /data           # Dados estáticos (Ex: listas de raças de pets em breeds.ts)
|-- /pages          # Componentes que representam as páginas da aplicação
|-- App.tsx         # Componente raiz que gerencia o roteamento
|-- firebaseConfig.ts # Configuração e inicialização do Firebase SDK
|-- main.tsx        # Ponto de entrada da aplicação
|-- index.css       # Estilos globais e configuração do Tailwind
```

## 4. Funcionalidades Implementadas

### 4.1. Funcionalidades do Cliente

*   **Autenticação:** Cadastro e login de usuários.
*   **Dashboard do Cliente (`/dashboard`):** Visão geral dos pets cadastrados e próximos agendamentos.
*   **Gerenciamento de Pets (`/pet-profile`):
    *   Adição e edição de perfis de pets.
    *   Campo de **autocomplete para raças**, alimentado por uma lista pré-definida (`/data/breeds.ts`) e filtrado por espécie.
*   **Agendamento de Serviços (`/booking`):
    *   Seleção de serviço, pet, data e hora.
    *   Gera uma notificação para o cliente após a conclusão.
*   **Notificações em Tempo Real (`<Notifications />`):
    *   Ícone de sino no cabeçalho com indicador de mensagens não lidas.
    *   Painel que exibe as notificações em tempo real, como confirmações de agendamento e atualizações de status de serviço.
*   **Check-in do Serviço (`/check-in/:id`):** Página onde o cliente acompanha o progresso do serviço do seu pet (placeholder para futuras melhorias).

### 4.2. Funcionalidades Administrativas

*   **Controle de Acesso:** Rotas de administração (`/admin/*`) são protegidas pelo componente `<AdminRoute>`, que verifica se o usuário logado possui a permissão de `admin` no Firestore.
*   **Dashboard Administrativo (`/admin/dashboard`):
    *   Exibe estatísticas vitais: total de clientes, total de pets e número de agendamentos para o dia.
    *   Lista todos os agendamentos do dia, ordenados por hora, com acesso rápido aos detalhes.
*   **Gerenciamento de Serviço (`/admin/servico/:id`):
    *   Página de controle para um serviço específico.
    *   Exibe informações completas do pet (incluindo alergias e notas) e do tutor.
    *   Permite que o administrador **atualize o status do serviço** (Confirmado, Em Andamento, Concluído).
    *   **A atualização de status envia automaticamente uma notificação em tempo real para o cliente**.

## 5. Modelo de Dados (Firestore)

Nossa base de dados no Firestore está estruturada nas seguintes coleções principais:

*   `usuarios`
    *   Documento por usuário (ID do Firebase Auth).
    *   Campos: `uid`, `email`, `fullName`, `role` ('cliente' ou 'admin').
    *   Subcoleção: `pets`
        *   Documento por pet.
        *   Campos: `name`, `species`, `breed`, `birthDate`, `allergies`, `notes`.

*   `agendamentos`
    *   Documento por agendamento.
    *   Campos: `userId`, `petId`, `serviceId`, `date`, `time`, `status` ('confirmado', 'em-andamento', 'concluido').

*   `notificacoes`
    *   Documento por notificação.
    *   Campos: `userId`, `title`, `message`, `createdAt`, `isRead`, `link`.

## 6. Como Executar o Projeto

1.  **Clone o repositório.**
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure o Firebase:**
    *   Crie um projeto no [console do Firebase](https://console.firebase.google.com/).
    *   Crie o arquivo `src/firebaseConfig.ts` com as suas credenciais do Firebase.
4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Este documento agora reflete o estado atual e robusto da aplicação. A base está sólida para futuras expansões e para a integração de novos desenvolvedores.
