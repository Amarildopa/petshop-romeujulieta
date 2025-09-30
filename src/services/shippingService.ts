// Shipping service - handles freight calculations

interface CartItem {
  quantity: number;
  products_pet?: {
    weight?: number;
  };
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

export interface ShippingCalculation {
  zipCode: string;
  weight: number;
  subtotal: number;
  options: ShippingOption[];
  freeShippingThreshold: number;
  qualifiesForFreeShipping: boolean;
}

export class ShippingService {
  private readonly FREE_SHIPPING_THRESHOLD = 100;
  private readonly DEFAULT_WEIGHT_PER_ITEM = 0.5; // kg

  /**
   * Calcula as opções de frete disponíveis
   */
  async calculateShipping(
    zipCode: string,
    cartItems: CartItem[],
    subtotal: number
  ): Promise<ShippingCalculation> {
    // Calcular peso total dos itens
    const totalWeight = this.calculateTotalWeight(cartItems);
    
    // Verificar se qualifica para frete grátis
    const qualifiesForFreeShipping = subtotal >= this.FREE_SHIPPING_THRESHOLD;
    
    // Gerar opções de frete baseadas no CEP e peso
    const options = await this.generateShippingOptions(zipCode, totalWeight, qualifiesForFreeShipping);
    
    return {
      zipCode,
      weight: totalWeight,
      subtotal,
      options,
      freeShippingThreshold: this.FREE_SHIPPING_THRESHOLD,
      qualifiesForFreeShipping
    };
  }

  /**
   * Calcula o peso total dos itens do carrinho
   */
  private calculateTotalWeight(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => {
      // Se o produto tem peso definido, usar ele, senão usar peso padrão
      const itemWeight = item.products_pet?.weight || this.DEFAULT_WEIGHT_PER_ITEM;
      return total + (itemWeight * item.quantity);
    }, 0);
  }

  /**
   * Gera opções de frete baseadas no CEP e peso
   */
  private async generateShippingOptions(
    zipCode: string,
    weight: number,
    qualifiesForFreeShipping: boolean
  ): Promise<ShippingOption[]> {
    const options: ShippingOption[] = [];
    
    // Determinar região baseada no CEP (simulação)
    const region = this.getRegionByZipCode(zipCode);
    
    // Frete Padrão (PAC)
    const standardPrice = qualifiesForFreeShipping ? 0 : this.calculateStandardShipping(region, weight);
    options.push({
      id: 'standard',
      name: 'Frete Padrão',
      description: qualifiesForFreeShipping ? 'Frete grátis!' : 'Entrega econômica',
      price: standardPrice,
      estimatedDays: this.getStandardDeliveryDays(region),
      carrier: 'Correios PAC'
    });
    
    // Frete Expresso (SEDEX) - sempre cobrado
    const expressPrice = this.calculateExpressShipping(region, weight);
    options.push({
      id: 'express',
      name: 'Frete Expresso',
      description: 'Entrega rápida',
      price: expressPrice,
      estimatedDays: this.getExpressDeliveryDays(region),
      carrier: 'Correios SEDEX'
    });
    
    // Retirada na loja (sempre grátis)
    options.push({
      id: 'pickup',
      name: 'Retirar na Loja',
      description: 'Retire gratuitamente em nossa loja',
      price: 0,
      estimatedDays: '1-2 dias úteis',
      carrier: 'PetShop Romeo & Julieta'
    });
    
    return options;
  }

  /**
   * Determina a região baseada no CEP
   */
  private getRegionByZipCode(zipCode: string): 'local' | 'regional' | 'national' {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    // CEPs de São Paulo (região local) - exemplo
    if (cleanZipCode.startsWith('01') || cleanZipCode.startsWith('02') || 
        cleanZipCode.startsWith('03') || cleanZipCode.startsWith('04') ||
        cleanZipCode.startsWith('05') || cleanZipCode.startsWith('08')) {
      return 'local';
    }
    
    // CEPs do estado de SP (região regional)
    if (cleanZipCode.startsWith('1') || cleanZipCode.startsWith('2')) {
      return 'regional';
    }
    
    // Outros estados (nacional)
    return 'national';
  }

  /**
   * Calcula o frete padrão baseado na região e peso
   */
  private calculateStandardShipping(region: string, weight: number): number {
    let basePrice = 0;
    
    switch (region) {
      case 'local':
        basePrice = 8;
        break;
      case 'regional':
        basePrice = 12;
        break;
      case 'national':
        basePrice = 18;
        break;
    }
    
    // Adicionar custo por peso (R$ 2 por kg adicional após 1kg)
    const additionalWeight = Math.max(0, weight - 1);
    const weightCost = additionalWeight * 2;
    
    return Math.round((basePrice + weightCost) * 100) / 100;
  }

  /**
   * Calcula o frete expresso baseado na região e peso
   */
  private calculateExpressShipping(region: string, weight: number): number {
    let basePrice = 0;
    
    switch (region) {
      case 'local':
        basePrice = 15;
        break;
      case 'regional':
        basePrice = 22;
        break;
      case 'national':
        basePrice = 35;
        break;
    }
    
    // Adicionar custo por peso (R$ 3 por kg adicional após 1kg)
    const additionalWeight = Math.max(0, weight - 1);
    const weightCost = additionalWeight * 3;
    
    return Math.round((basePrice + weightCost) * 100) / 100;
  }

  /**
   * Retorna os dias de entrega para frete padrão
   */
  private getStandardDeliveryDays(region: string): string {
    switch (region) {
      case 'local':
        return '2-4 dias úteis';
      case 'regional':
        return '3-6 dias úteis';
      case 'national':
        return '5-10 dias úteis';
      default:
        return '3-7 dias úteis';
    }
  }

  /**
   * Retorna os dias de entrega para frete expresso
   */
  private getExpressDeliveryDays(region: string): string {
    switch (region) {
      case 'local':
        return '1-2 dias úteis';
      case 'regional':
        return '2-3 dias úteis';
      case 'national':
        return '3-5 dias úteis';
      default:
        return '2-4 dias úteis';
    }
  }

  /**
   * Valida se um CEP é válido
   */
  validateZipCode(zipCode: string): boolean {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    return cleanZipCode.length === 8;
  }

  /**
   * Formata um CEP
   */
  formatZipCode(zipCode: string): string {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    if (cleanZipCode.length === 8) {
      return `${cleanZipCode.slice(0, 5)}-${cleanZipCode.slice(5)}`;
    }
    return zipCode;
  }

  /**
   * Busca informações de endereço pelo CEP (simulação)
   */
  async getAddressByZipCode(zipCode: string): Promise<{
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    error?: string;
  }> {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    if (!this.validateZipCode(zipCode)) {
      return { error: 'CEP inválido' };
    }
    
    // Simulação de busca de endereço
    // Em um ambiente real, você integraria com uma API como ViaCEP
    const mockAddresses: Record<string, { street: string; neighborhood: string; city: string; state: string; }> = {
      '01310100': {
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      },
      '04038001': {
        street: 'Rua Vergueiro',
        neighborhood: 'Vila Mariana',
        city: 'São Paulo',
        state: 'SP'
      }
    };
    
    const address = mockAddresses[cleanZipCode];
    if (address) {
      return address;
    }
    
    // Retornar dados genéricos baseados na região
    const region = this.getRegionByZipCode(zipCode);
    switch (region) {
      case 'local':
        return {
          city: 'São Paulo',
          state: 'SP'
        };
      case 'regional':
        return {
          state: 'SP'
        };
      default:
        return {};
    }
  }
}

export const shippingService = new ShippingService();