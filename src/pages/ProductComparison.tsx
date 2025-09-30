import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ShoppingCart, Heart, ArrowLeft, ArrowRight, Download, Share2, Plus } from 'lucide-react';
import { comparisonService, ComparisonData } from '../services/comparisonService';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { authService } from '../services/authService';
import { toast } from 'sonner';

const ProductComparison: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{id: string; email: string} | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadComparison();
    
    // Escutar mudanças na comparação
    const handleComparisonUpdate = () => {
      const loadComparisonData = async () => {
        try {
          setLoading(true);
          const data = await comparisonService.getComparisonData();
          setComparisonData(data);
        } catch {
          toast.error('Erro ao carregar comparação');
        } finally {
          setLoading(false);
        }
      };
      
      loadComparisonData();
    };
    
    window.addEventListener('comparisonUpdated', handleComparisonUpdate);
    
    return () => {
      window.removeEventListener('comparisonUpdated', handleComparisonUpdate);
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadComparison = async () => {
    try {
      setLoading(true);
      const data = await comparisonService.getComparisonData();
      setComparisonData(data);
      
      // Se há produtos na URL, adicionar à comparação
      const productIds = searchParams.get('products')?.split(',').filter(Boolean) || [];
      for (const productId of productIds) {
        if (!data.items.some(item => item.product_id === productId)) {
          await comparisonService.addToComparison(productId);
        }
      }
      
      if (productIds.length > 0) {
        const updatedData = await comparisonService.getComparisonData();
        setComparisonData(updatedData);
      }
    } catch (error) {
      console.error('Erro ao carregar comparação:', error);
      toast.error('Erro ao carregar comparação');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromComparison = async (productId: string) => {
    try {
      await comparisonService.removeFromComparison(productId);
      const updatedData = await comparisonService.getComparisonData();
      setComparisonData(updatedData);
      toast.success('Produto removido da comparação');
    } catch {
      toast.error('Erro ao remover produto');
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      await cartService.addToCart(currentUser.id, productId, 1);
      toast.success('Produto adicionado ao carrinho');
    } catch {
      toast.error('Erro ao adicionar ao carrinho');
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      const isInWishlist = await wishlistService.isInWishlist(currentUser.id, productId);
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(currentUser.id, productId);
        toast.success('Produto removido da lista de desejos');
      } else {
        await wishlistService.addToWishlist(currentUser.id, productId);
        toast.success('Produto adicionado à lista de desejos');
      }
    } catch {
      toast.error('Erro ao atualizar lista de desejos');
    }
  };

  const handleClearComparison = async () => {
    if (!confirm('Tem certeza que deseja limpar toda a comparação?')) return;
    
    try {
      await comparisonService.clearComparison();
      setComparisonData({ items: [], features: [] });
      toast.success('Comparação limpa');
    } catch {
      toast.error('Erro ao limpar comparação');
    }
  };

  const handleExportComparison = async () => {
    try {
      const exportData = await comparisonService.exportComparison();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparacao-produtos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Comparação exportada');
    } catch {
      toast.error('Erro ao exportar comparação');
    }
  };

  const handleShareComparison = async () => {
    if (!comparisonData || comparisonData.items.length === 0) return;
    
    try {
      const productIds = comparisonData.items.map(item => item.product_id).join(',');
      const url = `${window.location.origin}/comparison?products=${productIds}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link da comparação copiado para a área de transferência');
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const toggleFeatureFilter = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const filteredFeatures = comparisonData?.features.filter(feature => 
    selectedFeatures.length === 0 || selectedFeatures.includes(feature)
  ) || [];

  const displayFeatures = showAllFeatures ? filteredFeatures : filteredFeatures.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando comparação...</p>
        </div>
      </div>
    );
  }

  if (!comparisonData || comparisonData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowLeft className="w-12 h-12 text-gray-400" />
              <ArrowRight className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhum produto para comparar
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Adicione produtos à comparação para ver suas diferenças lado a lado.
            </p>
            <button
              onClick={() => navigate('/store')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Explorar Produtos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <ArrowLeft className="w-6 h-6 text-blue-600" />
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Comparação de Produtos</h1>
                <p className="text-gray-600">
                  {comparisonData.items.length} {comparisonData.items.length === 1 ? 'produto' : 'produtos'} em comparação
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/store')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Produtos</span>
              </button>
              
              <button
                onClick={handleShareComparison}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <Share2 className="w-5 h-5" />
                <span>Compartilhar</span>
              </button>
              
              <button
                onClick={handleExportComparison}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>
              
              <button
                onClick={handleClearComparison}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
                <span>Limpar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros de características */}
        {comparisonData.features.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Características</h3>
            <div className="flex flex-wrap gap-2">
              {comparisonData.features.map(feature => (
                <button
                  key={feature}
                  onClick={() => toggleFeatureFilter(feature)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedFeatures.includes(feature)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
            {selectedFeatures.length > 0 && (
              <button
                onClick={() => setSelectedFeatures([])}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Tabela de Comparação */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-6 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10">
                    Produto
                  </th>
                  {comparisonData.items.map((item) => (
                    <th key={item.product_id} className="p-6 min-w-80">
                      <div className="relative">
                        <button
                          onClick={() => handleRemoveFromComparison(item.product_id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="text-center">
                          <img
                            src={item.product?.image_url}
                            alt={item.product?.name}
                            className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                          />
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.product?.name}
                          </h3>
                          <p className="text-2xl font-bold text-blue-600 mb-4">
                            R$ {item.product?.price.toFixed(2)}
                          </p>
                          
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleAddToCart(item.product_id)}
                              disabled={item.product?.stock_quantity === 0}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center space-x-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>{item.product?.stock_quantity === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}</span>
                            </button>
                            
                            {currentUser && (
                              <button
                                onClick={() => handleAddToWishlist(item.product_id)}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center space-x-2"
                              >
                                <Heart className="w-4 h-4" />
                                <span>Lista de Desejos</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => navigate(`/products/${item.product_id}`)}
                              className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Informações básicas */}
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-semibold text-gray-900 bg-gray-50 sticky left-0">
                    Categoria
                  </td>
                  {comparisonData.items.map((item) => (
                    <td key={item.product_id} className="p-6 text-center">
                      {item.product?.category}
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-semibold text-gray-900 bg-gray-50 sticky left-0">
                    Estoque
                  </td>
                  {comparisonData.items.map((item) => (
                    <td key={item.product_id} className="p-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (item.product?.stock_quantity || 0) > 10
                          ? 'bg-green-100 text-green-800'
                          : (item.product?.stock_quantity || 0) > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(item.product?.stock_quantity || 0) > 10
                          ? 'Em estoque'
                          : (item.product?.stock_quantity || 0) > 0
                          ? `Últimas ${item.product?.stock_quantity} unidades`
                          : 'Indisponível'
                        }
                      </span>
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b border-gray-100">
                  <td className="p-6 font-semibold text-gray-900 bg-gray-50 sticky left-0">
                    Descrição
                  </td>
                  {comparisonData.items.map((item) => (
                    <td key={item.product_id} className="p-6">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.product?.description}
                      </p>
                    </td>
                  ))}
                </tr>
                
                {/* Características específicas */}
                {displayFeatures.map((feature) => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="p-6 font-semibold text-gray-900 bg-gray-50 sticky left-0">
                      {feature}
                    </td>
                    {comparisonData.items.map((item) => {
                      const featureValue = item.features?.[feature];
                      return (
                        <td key={item.product_id} className="p-6 text-center">
                          {featureValue !== undefined ? (
                            typeof featureValue === 'boolean' ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                featureValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {featureValue ? 'Sim' : 'Não'}
                              </span>
                            ) : (
                              <span className="text-gray-900">{featureValue}</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* Botão para mostrar mais características */}
                {filteredFeatures.length > 10 && (
                  <tr>
                    <td colSpan={comparisonData.items.length + 1} className="p-6 text-center">
                      <button
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showAllFeatures 
                          ? 'Mostrar menos características'
                          : `Mostrar mais ${filteredFeatures.length - 10} características`
                        }
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Produtos similares */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Similares</h3>
            <p className="text-gray-600 mb-4">
              Baseado nos produtos que você está comparando, estes produtos também podem interessar:
            </p>
            <button
              onClick={() => navigate('/store')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver produtos similares →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;