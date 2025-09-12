// Configurações de desconto parametrizáveis
export const DISCOUNT_CONFIG = {
  // Desconto no primeiro serviço
  firstService: {
    percentage: 20, // Alterar aqui para mudar a porcentagem
    description: 'Ganhe 20% de desconto no primeiro serviço',
    validFor: 'primeiro serviço',
    isActive: true, // Ativar/desativar o desconto
    minValue: 0, // Valor mínimo para aplicar o desconto
    maxDiscount: 50 // Valor máximo de desconto em reais
  },
  
  // Frete grátis na primeira compra
  firstPurchase: {
    freeShipping: true,
    description: 'Frete grátis na primeira compra na loja',
    validFor: 'primeira compra',
    isActive: true, // Ativar/desativar o frete grátis
    minValue: 0 // Valor mínimo da compra para frete grátis
  },
  
  // Desconto adicional (opcional)
  additionalDiscount: {
    percentage: 5, // Desconto adicional para cadastros completos
    description: '5% de desconto extra para cadastros completos',
    validFor: 'todos os serviços',
    isActive: false, // Desativado por padrão
    requiresCompleteProfile: true // Requer perfil completo
  }
} as const;

// Funções utilitárias para trabalhar com descontos
export const getDiscountPercentage = (type: 'firstService' | 'additionalDiscount') => {
  const config = DISCOUNT_CONFIG[type];
  return config.isActive ? config.percentage : 0;
};

export const isDiscountActive = (type: 'firstService' | 'firstPurchase' | 'additionalDiscount') => {
  return DISCOUNT_CONFIG[type].isActive;
};

export const getDiscountDescription = (type: 'firstService' | 'firstPurchase' | 'additionalDiscount') => {
  return DISCOUNT_CONFIG[type].description;
};

// Função para calcular desconto
export const calculateDiscount = (originalValue: number, discountType: 'firstService' | 'additionalDiscount') => {
  const config = DISCOUNT_CONFIG[discountType];
  
  if (!config.isActive) return 0;
  
  const discountValue = (originalValue * config.percentage) / 100;
  const maxDiscount = config.maxDiscount || discountValue;
  
  return Math.min(discountValue, maxDiscount);
};
