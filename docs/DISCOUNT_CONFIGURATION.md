# Configuração de Descontos

Este documento explica como configurar e alterar os valores de desconto no sistema PetShop Romeu & Julieta.

## 📁 Arquivo de Configuração

O arquivo principal de configuração de descontos está localizado em:
```
src/config/discounts.ts
```

## ⚙️ Configurações Disponíveis

### 1. Desconto no Primeiro Serviço

```typescript
firstService: {
  percentage: 20,           // Porcentagem de desconto (alterar aqui)
  description: 'Ganhe 20% de desconto no primeiro serviço',
  validFor: 'primeiro serviço',
  isActive: true,          // Ativar/desativar o desconto
  minValue: 0,             // Valor mínimo para aplicar o desconto
  maxDiscount: 50          // Valor máximo de desconto em reais
}
```

### 2. Frete Grátis na Primeira Compra

```typescript
firstPurchase: {
  freeShipping: true,      // Ativar/desativar frete grátis
  description: 'Frete grátis na primeira compra na loja',
  validFor: 'primeira compra',
  isActive: true,          // Ativar/desativar o benefício
  minValue: 0              // Valor mínimo da compra para frete grátis
}
```

### 3. Desconto Adicional (Opcional)

```typescript
additionalDiscount: {
  percentage: 5,           // Desconto adicional
  description: '5% de desconto extra para cadastros completos',
  validFor: 'todos os serviços',
  isActive: false,         // Desativado por padrão
  requiresCompleteProfile: true // Requer perfil completo
}
```

## 🔧 Como Alterar os Valores

### Para alterar a porcentagem de desconto:

1. Abra o arquivo `src/config/discounts.ts`
2. Localize a seção `firstService`
3. Altere o valor de `percentage`:
   ```typescript
   percentage: 25, // Mudou de 20% para 25%
   ```
4. Atualize a descrição se necessário:
   ```typescript
   description: 'Ganhe 25% de desconto no primeiro serviço',
   ```

### Para ativar/desativar descontos:

```typescript
firstService: {
  // ... outras configurações
  isActive: false, // Desativa o desconto
}
```

### Para alterar o valor máximo de desconto:

```typescript
firstService: {
  // ... outras configurações
  maxDiscount: 100, // Máximo de R$ 100 de desconto
}
```

## 📱 Onde Aparece

Os descontos são exibidos em:

1. **Página de Cadastro (Etapa 1)**:
   - Desktop: Seção lateral direita
   - Mobile: Banner no topo da página

2. **Textos Dinâmicos**:
   - Títulos e descrições são atualizados automaticamente
   - Porcentagens são calculadas dinamicamente

## 🎨 Personalização Visual

### Cores e Estilos

Os estilos visuais estão definidos em:
- `src/pages/Register.tsx` (seção de ofertas)
- Classes Tailwind CSS para cores e animações

### Ícones e Emojis

- 🎉 - Ícone principal da oferta
- % - Ícone de desconto
- 🚚 - Ícone de frete grátis
- 💡 - Ícone de dica

## 🔄 Atualizações Automáticas

Após alterar os valores no arquivo `discounts.ts`:

1. Os valores são atualizados automaticamente na interface
2. Não é necessário reiniciar o servidor
3. As alterações são refletidas imediatamente

## 📊 Exemplos de Configuração

### Desconto de 30% no primeiro serviço:

```typescript
firstService: {
  percentage: 30,
  description: 'Ganhe 30% de desconto no primeiro serviço',
  validFor: 'primeiro serviço',
  isActive: true,
  minValue: 0,
  maxDiscount: 80
}
```

### Frete grátis para compras acima de R$ 50:

```typescript
firstPurchase: {
  freeShipping: true,
  description: 'Frete grátis para compras acima de R$ 50',
  validFor: 'primeira compra',
  isActive: true,
  minValue: 50
}
```

## ⚠️ Observações Importantes

1. **Valores em Reais**: O `maxDiscount` é sempre em reais
2. **Validação**: O sistema valida se o desconto não excede o valor máximo
3. **Ativação**: Sempre verifique se `isActive: true` para ativar os descontos
4. **Backup**: Faça backup do arquivo antes de fazer alterações significativas

## 🚀 Próximos Passos

Para implementar novos tipos de desconto:

1. Adicione a nova configuração em `discounts.ts`
2. Atualize a interface em `Register.tsx`
3. Implemente a lógica de cálculo se necessário
4. Teste a funcionalidade

---

**Arquivo de configuração**: `src/config/discounts.ts`  
**Última atualização**: Janeiro 2025
