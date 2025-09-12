# Configuração do Supabase para PetShop Romeo Julieta

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite o nome do projeto: "PetShop Romeo Julieta"
6. Crie uma senha forte para o banco de dados
7. Escolha a região mais próxima (ex: South America - São Paulo)
8. Clique em "Create new project"

## 2. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá para Settings > API
2. Copie a URL do projeto e a chave anônima (anon key)
3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_projeto_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 3. Configurar o Banco de Dados

1. No painel do Supabase, vá para SQL Editor
2. Copie e cole o conteúdo do arquivo `database-schema.sql`
3. Execute o script para criar todas as tabelas e dados iniciais

## 4. Configurar Storage (Opcional)

Para upload de imagens de pets e avatares:

1. Vá para Storage no painel do Supabase
2. Crie um bucket chamado "avatars" com visibilidade pública
3. Crie um bucket chamado "pet-images" com visibilidade pública
4. Configure as políticas RLS conforme necessário

## 5. Configurar Autenticação

1. Vá para Authentication > Settings
2. Configure as URLs permitidas:
   - Site URL: `http://localhost:5173` (desenvolvimento)
   - Redirect URLs: `http://localhost:5173/**`
3. Habilite os provedores desejados (Email, Google, etc.)

## 6. Testar a Configuração

1. Execute o projeto: `npm run dev`
2. Tente criar uma conta na página de registro
3. Faça login com a conta criada
4. Verifique se os dados estão sendo salvos no banco

## 7. Estrutura das Tabelas

### profiles_pet
- Dados pessoais dos usuários
- Vinculado ao auth.users do Supabase

### pets_pet
- Informações dos pets dos usuários
- Inclui dados de saúde, personalidade, etc.

### services_pet
- Catálogo de serviços oferecidos
- Preços, descrições, categorias

### appointments_pet
- Agendamentos de serviços
- Status, datas, preços

### products_pet
- Produtos da loja
- Preços, categorias, avaliações

### subscriptions_pet
- Planos de assinatura dos usuários
- Status, cobrança, benefícios

### service_progress_pet
- Acompanhamento do progresso dos serviços
- Etapas, status, notas

### notifications_pet
- Notificações dos usuários
- Tipos, status de leitura, dados extras

## 8. Políticas de Segurança (RLS)

O projeto já inclui políticas RLS configuradas:
- Usuários só podem ver/modificar seus próprios dados
- Dados públicos (serviços, produtos) são acessíveis a todos
- Políticas de segurança para upload de arquivos

## 9. Próximos Passos

Após a configuração básica, você pode:
1. Personalizar as políticas RLS conforme necessário
2. Configurar webhooks para notificações
3. Implementar funcionalidades de pagamento
4. Configurar backup automático
5. Monitorar performance e uso

## 10. Troubleshooting

### Erro de CORS
- Verifique se as URLs estão configuradas corretamente
- Adicione o domínio de produção quando necessário

### Erro de autenticação
- Verifique se as chaves estão corretas
- Confirme se o usuário está sendo criado no auth.users

### Erro de permissão
- Verifique as políticas RLS
- Confirme se o usuário está autenticado

### Problemas de upload
- Verifique se os buckets de storage existem
- Confirme as políticas de acesso aos buckets
