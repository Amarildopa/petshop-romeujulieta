import { Product } from './productsService';

export interface ComparisonItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface ComparisonData {
  products: Product[];
  attributes: {
    name: string;
    values: (string | number)[];
  }[];
}

class ComparisonService {
  private storageKey = 'petshop_comparison';
  private maxItems = 4; // Máximo de produtos para comparar

  // Buscar produtos na comparação
  getComparisonProducts(): ComparisonItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao buscar produtos da comparação:', error);
      return [];
    }
  }

  // Adicionar produto à comparação
  addToComparison(product: Product): boolean {
    try {
      const currentItems = this.getComparisonProducts();
      
      // Verificar se já existe
      if (currentItems.some(item => item.product.id === product.id)) {
        throw new Error('Produto já está na comparação');
      }

      // Verificar limite máximo
      if (currentItems.length >= this.maxItems) {
        throw new Error(`Máximo de ${this.maxItems} produtos para comparação`);
      }

      const newItem: ComparisonItem = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product,
        addedAt: new Date().toISOString()
      };

      const updatedItems = [...currentItems, newItem];
      localStorage.setItem(this.storageKey, JSON.stringify(updatedItems));
      
      // Disparar evento customizado para atualizar UI
      window.dispatchEvent(new CustomEvent('comparisonUpdated', { 
        detail: { items: updatedItems } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar à comparação:', error);
      throw error;
    }
  }

  // Remover produto da comparação
  removeFromComparison(productId: string): boolean {
    try {
      const currentItems = this.getComparisonProducts();
      const updatedItems = currentItems.filter(item => item.product.id !== productId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedItems));
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('comparisonUpdated', { 
        detail: { items: updatedItems } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao remover da comparação:', error);
      return false;
    }
  }

  // Verificar se produto está na comparação
  isInComparison(productId: string): boolean {
    const items = this.getComparisonProducts();
    return items.some(item => item.product.id === productId);
  }

  // Limpar comparação
  clearComparison(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('comparisonUpdated', { 
        detail: { items: [] } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar comparação:', error);
      return false;
    }
  }

  // Contar produtos na comparação
  getComparisonCount(): number {
    return this.getComparisonProducts().length;
  }

  // Obter dados estruturados para comparação
  getComparisonData(): ComparisonData {
    const items = this.getComparisonProducts();
    const products = items.map(item => item.product);

    if (products.length === 0) {
      return { products: [], attributes: [] };
    }

    // Definir atributos para comparação
    const attributes = [
      {
        name: 'Nome',
        values: products.map(p => p.name)
      },
      {
        name: 'Preço',
        values: products.map(p => `R$ ${p.price.toFixed(2)}`)
      },
      {
        name: 'Categoria',
        values: products.map(p => p.category)
      },
      {
        name: 'Estoque',
        values: products.map(p => p.stock_quantity > 0 ? `${p.stock_quantity} unidades` : 'Indisponível')
      },
      {
        name: 'Descrição',
        values: products.map(p => p.description || 'Sem descrição')
      }
    ];

    // Adicionar atributos específicos se existirem
    if (products.some(p => p.brand)) {
      attributes.push({
        name: 'Marca',
        values: products.map(p => p.brand || 'Não informado')
      });
    }

    if (products.some(p => p.weight)) {
      attributes.push({
        name: 'Peso',
        values: products.map(p => p.weight ? `${p.weight}kg` : 'Não informado')
      });
    }

    if (products.some(p => p.dimensions)) {
      attributes.push({
        name: 'Dimensões',
        values: products.map(p => p.dimensions || 'Não informado')
      });
    }

    return { products, attributes };
  }

  // Verificar se pode adicionar mais produtos
  canAddMore(): boolean {
    return this.getComparisonCount() < this.maxItems;
  }

  // Obter limite máximo
  getMaxItems(): number {
    return this.maxItems;
  }

  // Mover produtos da comparação para o carrinho
  moveToCart(productIds: string[]): boolean {
    try {
      // Aqui você pode integrar com o serviço do carrinho
      // Por enquanto, apenas remove da comparação
      productIds.forEach(productId => {
        this.removeFromComparison(productId);
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao mover para o carrinho:', error);
      return false;
    }
  }

  // Obter produtos similares para sugestão
  getSimilarProducts(/* _currentProducts: Product[] */): Product[] {
    // Esta função pode ser expandida para usar um algoritmo de recomendação
    // Por enquanto, retorna uma lista vazia
    return [];
  }

  // Exportar comparação (para compartilhamento)
  exportComparison(): string {
    const data = this.getComparisonData();
    return JSON.stringify(data, null, 2);
  }

  // Importar comparação
  importComparison(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.products && Array.isArray(data.products)) {
        // Limpar comparação atual
        this.clearComparison();
        
        // Adicionar produtos importados
        data.products.forEach((product: Product) => {
          if (this.canAddMore()) {
            this.addToComparison(product);
          }
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar comparação:', error);
      return false;
    }
  }
}

export const comparisonService = new ComparisonService();
export default comparisonService;