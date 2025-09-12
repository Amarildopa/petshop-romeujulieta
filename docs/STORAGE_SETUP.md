# Configuração do Storage (Bucket) no Supabase

## 🚨 Problema Identificado

O erro "Erro no sistema de armazenamento" ocorre porque **não existe um bucket 'avatars' criado no Supabase Storage**.

## 📋 Solução: Criar o Bucket 'avatars'

### Método 1: Via SQL (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione o projeto PetShop Romeo & Julieta

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `scripts/setup-storage-bucket.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

### Método 2: Via Interface (Alternativo)

1. **Acesse Storage**
   - No Supabase Dashboard, clique em "Storage" no menu lateral

2. **Criar Novo Bucket**
   - Clique em "New bucket"
   - Nome: `avatars`
   - Marque "Public bucket" como ✅ (habilitado)
   - File size limit: `5 MB`
   - Allowed MIME types: `image/*`

3. **Configurar Políticas RLS**
   - Vá para "Policies" na aba Storage
   - Adicione as políticas do arquivo SQL

## 🔧 Como Funciona o Sistema Após a Configuração

### Fluxo de Upload:
```
1. Usuário seleciona foto
2. Sistema valida tipo/tamanho
3. Cria nome único: user-id-timestamp.ext
4. Faz upload para bucket 'avatars'
5. Obtém URL pública do Supabase
6. Salva URL no perfil do usuário
```

### Estrutura de Arquivos no Bucket:
```
avatars/
├── user-123-1640995200000.jpg
├── user-456-1640995300000.png
└── user-789-1640995400000.webp
```

### URLs Geradas:
- **Supabase**: `https://[project].supabase.co/storage/v1/object/public/avatars/user-123-1640995200000.jpg`
- **Fallback Local**: `blob:http://localhost:5173/uuid-here`

## ✅ Verificação da Configuração

Após executar o script, verifique:

1. **Bucket Criado**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'avatars';
   ```

2. **Políticas Ativas**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
   ```

3. **Teste de Upload**:
   - Vá para a página de Perfil
   - Clique no botão da câmera
   - Selecione uma imagem
   - Verifique se não há erros no console

## 🛡️ Segurança Implementada

- **RLS (Row Level Security)**: Usuários só podem gerenciar suas próprias fotos
- **Validação de Tipo**: Apenas imagens são aceitas
- **Limite de Tamanho**: Máximo 5MB por arquivo
- **Nomenclatura Segura**: IDs únicos previnem conflitos

## 🔄 Sistema de Fallback

Mesmo após criar o bucket, o sistema mantém fallback local para:
- Problemas temporários de conexão
- Manutenção do Supabase
- Desenvolvimento offline

## 📞 Suporte

Se ainda houver problemas após seguir este guia:
1. Verifique as credenciais do Supabase no arquivo `.env`
2. Confirme que o projeto está ativo no Supabase
3. Verifique os logs do console do navegador
4. Execute novamente o script SQL