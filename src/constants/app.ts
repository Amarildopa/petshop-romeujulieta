// Configurações da aplicação
export const APP_CONFIG = {
  name: 'Romeu e Julieta Pet&Spa',
  shortName: 'Romeu e Julieta Pet&Spa',
  description: 'Carinho e Confiança para seu Pet',
  version: '1.0.0',
  author: 'PetShop Romeu & Julieta',
  url: 'https://petshopromeujulieta.com',
  
  // Textos específicos
  texts: {
    welcome: 'Bem-vindo ao Romeu e Julieta Pet&Spa',
    joinUs: 'Junte-se ao Romeu e Julieta Pet&Spa',
    experience: 'A Experiência Romeu e Julieta Pet&Spa',
    family: 'família Romeu e Julieta Pet&Spa',
    systemOverview: 'Visão geral do sistema Romeu e Julieta Pet&Spa'
  },

  // Configurações de desconto (importadas do arquivo de configuração)
  discounts: {
    firstService: {
      percentage: 20,
      description: 'Ganhe 20% de desconto no primeiro serviço',
      validFor: 'primeiro serviço'
    },
    firstPurchase: {
      freeShipping: true,
      description: 'Frete grátis na primeira compra na loja',
      validFor: 'primeira compra'
    }
  }
} as const;

// Função para obter o nome completo da aplicação
export const getAppName = () => APP_CONFIG.name;

// Função para obter o nome curto da aplicação
export const getAppShortName = () => APP_CONFIG.shortName;

// Função para obter a descrição da aplicação
export const getAppDescription = () => APP_CONFIG.description;
