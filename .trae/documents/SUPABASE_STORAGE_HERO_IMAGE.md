# Configuração do Supabase Storage para Imagem da Hero

## 1. Visão Geral

Este documento explica como configurar e usar o Supabase Storage para hospedar a imagem da Hero da página inicial do sistema PetShop Romeo & Julieta, substituindo URLs externas por armazenamento próprio.

## 2. Configuração do Bucket no Supabase

### 2.1 Acessar o Painel do Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login
2. Selecione seu projeto PetShop Romeo & Julieta
3. No menu lateral, clique em "Storage"

### 2.2 Criar um Bucket Público
1. Clique em "New bucket"
2. Configure o bucket:
   - **Nome**: `hero-images`
   - **Público**: ✅ Marque como público
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`
   - **File size limit**: `5MB`
3. Clique em "Save"

### 2.3 Configurar Políticas de Segurança (RLS)
```sql
-- Permitir leitura pública para todos
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'hero-images');

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'hero-images' AND 
  auth.role() = 'authenticated'
);

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'hero-images' AND 
  auth.role() = 'authenticated'
);
```

## 3. Upload da Imagem

### 3.1 Via Interface Web
1. No painel Storage, clique no bucket `hero-images`
2. Clique em "Upload file"
3. Selecione sua imagem da Hero
4. Renomeie para um nome descritivo: `hero-main.jpg`
5. Clique em "Upload"

### 3.2 Via Código (Opcional)
```typescript
import { supabase } from '../lib/supabase';

const uploadHeroImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `hero-main.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('hero-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) {
    console.error('Erro no upload:', error);
    return null;
  }
  
  return data;
};
```

## 4. Obter URL Pública da Imagem

### 4.1 Via Interface Web
1. No bucket `hero-images`, clique na imagem enviada
2. Clique em "Copy URL" ou "Get public URL"
3. A URL terá o formato:
   ```
   https://[seu-projeto].supabase.co/storage/v1/object/public/hero-images/hero-main.jpg
   ```

### 4.2 Via Código
```typescript
const getHeroImageUrl = () => {
  const { data } = supabase.storage
    .from('hero-images')
    .getPublicUrl('hero-main.jpg');
    
  return data.publicUrl;
};
```

## 5. Atualizar Configuração da Aplicação

### 5.1 Modificar src/config/images.ts
Substitua a URL externa pela URL do Supabase:

```typescript
// Antes
export const IMAGE_CONFIG = {
  home: {
    hero: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  },
  // ... outras configurações
};

// Depois
export const IMAGE_CONFIG = {
  home: {
    hero: 'https://[seu-projeto].supabase.co/storage/v1/object/public/hero-images/hero-main.jpg'
  },
  // ... outras configurações
};
```

### 5.2 Configuração Dinâmica (Recomendado)
Para maior flexibilidade, crie uma função que gera a URL:

```typescript
import { supabase } from '../lib/supabase';

// Função para obter URL do Supabase Storage
const getStorageUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const IMAGE_CONFIG = {
  home: {
    hero: getStorageUrl('hero-images', 'hero-main.jpg')
  },
  // ... outras configurações
};
```

## 6. Especificações Recomendadas para a Imagem

### 6.1 Dimensões e Formato
- **Resolução**: 1920x1080px (Full HD)
- **Proporção**: 16:9
- **Formato**: JPEG ou WebP
- **Qualidade**: 80-90%
- **Tamanho**: Máximo 2MB

### 6.2 Otimização
- Use ferramentas como TinyPNG ou Squoosh para comprimir
- Considere criar versões responsivas (diferentes tamanhos)
- Para melhor performance, use formato WebP quando possível

## 7. Versionamento de Imagens

### 7.1 Estratégia de Nomes
```
hero-main-v1.jpg     # Versão inicial
hero-main-v2.jpg     # Segunda versão
hero-main-current.jpg # Versão atual (sempre atualizada)
```

### 7.2 Cache Busting
Para forçar atualização do cache do navegador:
```typescript
const getHeroImageWithVersion = (version: string = 'current') => {
  return `${getStorageUrl('hero-images', `hero-main-${version}.jpg`)}?v=${Date.now()}`;
};
```

## 8. Monitoramento e Manutenção

### 8.1 Verificar Uso do Storage
1. No painel Supabase, vá em "Settings" > "Usage"
2. Monitore o uso de Storage
3. Configure alertas se necessário

### 8.2 Backup das Imagens
- Mantenha backup local das imagens originais
- Considere usar múltiplos buckets para redundância
- Documente todas as alterações de imagens

## 9. Exemplo Prático Completo

### 9.1 Implementação no Componente
```typescript
// src/pages/Home.tsx
import { IMAGE_CONFIG } from '../config/images';

const Home = () => {
  return (
    <div className="hero-section">
      <img 
        src={IMAGE_CONFIG.home.hero}
        alt="Cuidado e Amor para seu Pet"
        className="w-full h-96 object-cover rounded-lg shadow-lg"
        loading="lazy"
      />
    </div>
  );
};
```

### 9.2 Fallback para Erro
```typescript
// src/config/images.ts
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1';

export const getImageUrl = (bucket: string, path: string, fallback?: string) => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl || fallback || FALLBACK_HERO;
  } catch (error) {
    console.error('Erro ao obter URL da imagem:', error);
    return fallback || FALLBACK_HERO;
  }
};

export const IMAGE_CONFIG = {
  home: {
    hero: getImageUrl('hero-images', 'hero-main.jpg', FALLBACK_HERO)
  }
};
```

## 10. Troubleshooting

### 10.1 Problemas Comuns
- **Imagem não carrega**: Verifique se o bucket é público
- **Erro 403**: Verifique as políticas RLS
- **Imagem muito lenta**: Otimize o tamanho e formato
- **Cache não atualiza**: Use cache busting

### 10.2 Comandos Úteis
```sql
-- Verificar políticas do bucket
SELECT * FROM storage.policies WHERE bucket_id = 'hero-images';

-- Listar arquivos no bucket
SELECT * FROM storage.objects WHERE bucket_id = 'hero-images';

-- Verificar tamanho dos arquivos
SELECT name, metadata->>'size' as size_bytes 
FROM storage.objects 
WHERE bucket_id = 'hero-images';
```

Com essa configuração, você terá controle total sobre a imagem da Hero, melhor performance e independência de serviços externos.