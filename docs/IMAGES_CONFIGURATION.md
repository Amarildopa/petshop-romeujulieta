# Configuração Dinâmica de Imagens

## 📋 Visão Geral

Este sistema permite trocar facilmente todas as imagens externas da aplicação através de um arquivo de configuração centralizado, eliminando a dependência de URLs do Unsplash e permitindo o uso de imagens próprias.

## 🗂️ Estrutura do Sistema

### Arquivo Principal: `src/config/images.ts`

Este arquivo contém todas as configurações de imagens da aplicação:

```typescript
export const IMAGE_CONFIG = {
  // Imagens da página Home
  home: {
    hero: 'URL_DA_IMAGEM_HERO',
    about: 'URL_DA_IMAGEM_ABOUT'
  },

  // Imagens padrão para fallback
  defaults: {
    userAvatar: 'URL_AVATAR_PADRAO',
    petImage: 'URL_PET_PADRAO',
    productImage: 'URL_PRODUTO_PADRAO',
    serviceImage: 'URL_SERVICO_PADRAO'
  },

  // Avatares em diferentes tamanhos
  avatars: {
    small: 'URL_AVATAR_32x32',
    medium: 'URL_AVATAR_40x40',
    large: 'URL_AVATAR_120x120'
  },

  // Imagens de pets em diferentes tamanhos
  pets: {
    small: 'URL_PET_100x100',
    medium: 'URL_PET_200x200',
    large: 'URL_PET_300x300'
  }
};
```

### Funções Utilitárias: `getImageUrl`

Funções que facilitam o uso das imagens com fallback automático:

```typescript
// Exemplo de uso
getImageUrl.userAvatar(user.avatar_url, 'small')
getImageUrl.petImage(pet.image_url, 'medium')
getImageUrl.productImage(product.image_url)
getImageUrl.serviceImage(service.image_url)
```

## 🔄 Como Trocar as Imagens

### 1. Preparar as Novas Imagens

**Opção A: Upload para Supabase Storage**
```bash
# 1. Acesse o painel do Supabase
# 2. Vá para Storage
# 3. Crie um bucket público chamado 'images'
# 4. Faça upload das suas imagens
# 5. Copie as URLs públicas
```

**Opção B: Usar CDN Próprio**
```bash
# Upload para seu CDN preferido (Cloudinary, AWS S3, etc.)
# Obtenha as URLs públicas das imagens
```

**Opção C: Usar Assets Locais**
```bash
# 1. Coloque as imagens na pasta public/images/
# 2. Use URLs relativas: '/images/hero.jpg'
```

### 2. Atualizar o Arquivo de Configuração

Edite `src/config/images.ts`:

```typescript
export const IMAGE_CONFIG = {
  home: {
    // Substitua pelas suas URLs
    hero: '/images/petshop-hero.jpg',
    about: '/images/veterinaria-cuidando.jpg'
  },

  defaults: {
    userAvatar: '/images/avatar-default.jpg',
    petImage: '/images/pet-default.jpg',
    productImage: '/images/produto-default.jpg',
    serviceImage: '/images/servico-default.jpg'
  },

  avatars: {
    small: '/images/avatar-32.jpg',
    medium: '/images/avatar-40.jpg',
    large: '/images/avatar-120.jpg'
  },

  pets: {
    small: '/images/pet-100.jpg',
    medium: '/images/pet-200.jpg',
    large: '/images/pet-300.jpg'
  }
};
```

### 3. Verificar as Mudanças

Após salvar o arquivo, as mudanças serão aplicadas automaticamente em toda a aplicação.

## 📐 Especificações Técnicas

### Tamanhos Recomendados

| Contexto | Tamanho | Formato | Uso |
|----------|---------|---------|-----|
| Hero Home | 800x600px | JPG/WebP | Imagem principal da página |
| About Home | 800x600px | JPG/WebP | Seção "Sobre nós" |
| Avatar Small | 32x32px | JPG/WebP | Header, navegação |
| Avatar Medium | 40x40px | JPG/WebP | Dashboard, listas |
| Avatar Large | 120x120px | JPG/WebP | Perfil do usuário |
| Pet Small | 100x100px | JPG/WebP | Listas, cards pequenos |
| Pet Medium | 200x200px | JPG/WebP | Perfis, detalhes |
| Pet Large | 300x300px | JPG/WebP | Visualização completa |
| Produtos | 300x300px | JPG/WebP | Catálogo de produtos |
| Serviços | 400x300px | JPG/WebP | Catálogo de serviços |

### Otimização de Performance

1. **Formato WebP**: Use quando possível para melhor compressão
2. **Lazy Loading**: Já implementado nos componentes
3. **Responsive Images**: Considere usar diferentes tamanhos para mobile/desktop
4. **CDN**: Use um CDN para melhor performance global

## 🔧 Arquivos Atualizados

O sistema foi implementado nos seguintes arquivos:

- ✅ `src/pages/Home.tsx` - Imagens hero e about
- ✅ `src/components/Header.tsx` - Avatar do usuário
- ✅ `src/pages/Dashboard.tsx` - Avatares e imagens de pets
- ✅ `src/pages/Profile.tsx` - Avatar do usuário
- ✅ `src/pages/PetProfile.tsx` - Imagens de pets
- ✅ `src/pages/GrowthJourney.tsx` - Imagens de marcos
- ✅ `src/pages/Services.tsx` - Imagens de serviços
- ✅ `src/pages/Store.tsx` - Imagens de produtos
- ✅ `src/pages/Booking.tsx` - Imagens de serviços e pets

## 🚀 Exemplo Prático

### Cenário: Trocar a imagem hero da página inicial

1. **Prepare a nova imagem**:
   - Tamanho: 800x600px
   - Formato: JPG ou WebP
   - Nome: `hero-petshop.jpg`

2. **Faça upload**:
   ```bash
   # Coloque em public/images/hero-petshop.jpg
   # Ou faça upload para seu CDN
   ```

3. **Atualize a configuração**:
   ```typescript
   // src/config/images.ts
   export const IMAGE_CONFIG = {
     home: {
       hero: '/images/hero-petshop.jpg', // Nova URL
       about: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80'
     },
     // ... resto da configuração
   };
   ```

4. **Resultado**: A nova imagem aparecerá automaticamente na página inicial.

## 🔍 Troubleshooting

### Imagem não aparece
- ✅ Verifique se a URL está correta
- ✅ Confirme se a imagem é acessível publicamente
- ✅ Verifique o console do navegador para erros

### Imagem muito lenta para carregar
- ✅ Otimize o tamanho do arquivo
- ✅ Use formato WebP
- ✅ Considere usar um CDN

### Imagem distorcida
- ✅ Verifique se as dimensões estão corretas
- ✅ Use `object-fit: cover` no CSS (já implementado)

## 📚 Próximos Passos

1. **Implementar upload de imagens**: Permitir que usuários façam upload através da interface
2. **Otimização automática**: Redimensionar e otimizar imagens automaticamente
3. **Cache inteligente**: Implementar cache local das imagens
4. **Fallback offline**: Mostrar imagens em cache quando offline

---

**✅ Sistema implementado com sucesso!** 
Agora você pode trocar todas as imagens da aplicação facilmente através do arquivo `src/config/images.ts`.