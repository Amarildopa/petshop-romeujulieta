import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Percent, 
  Gift, 
  Star, 
  Search,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice?: string;
  salePrice?: string;
  image: string;
  category: string;
  featured?: boolean;
  validUntil: string;
  brand?: string;
}

const Offers: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', name: 'Todas as Ofertas' },
    { id: 'alimentacao', name: 'Alimentação' },
    { id: 'higiene', name: 'Higiene & Limpeza' },
    { id: 'brinquedos', name: 'Brinquedos' },
    { id: 'acessorios', name: 'Acessórios' },
    { id: 'medicamentos', name: 'Medicamentos' }
  ];

  const offers: Offer[] = [
    {
      id: '1',
      title: 'Sachês Golden e Premier',
      description: 'Leve mais e pague menos pra uma rotina mais suculenta! Sachês premium para cães e gatos.',
      discount: 'Leve 6 Pague 5',
      originalPrice: 'R$ 89,90',
      salePrice: 'R$ 74,92',
      image: '/images/offers/golden-premier.jpg',
      category: 'alimentacao',
      brand: 'Golden/Premier',
      featured: true,
      validUntil: '2024-02-15'
    },
    {
      id: '2',
      title: 'Areias Sanitárias Premium',
      description: 'Um ambiente mais limpo e agradável para o seu pet. Diversas marcas em promoção.',
      discount: 'até 50% OFF',
      originalPrice: 'R$ 45,90',
      salePrice: 'R$ 22,95',
      image: '/images/offers/areias.jpg',
      category: 'higiene',
      brand: 'Pipicat/Chalesco',
      validUntil: '2024-02-20'
    },
    {
      id: '3',
      title: 'Ração Biofresh Super Premium',
      description: 'Super Premium Natural com ingredientes selecionados para uma nutrição completa.',
      discount: 'até 10% OFF',
      originalPrice: 'R$ 159,90',
      salePrice: 'R$ 143,91',
      image: '/images/offers/biofresh.jpg',
      category: 'alimentacao',
      brand: 'Biofresh',
      validUntil: '2024-02-25'
    },
    {
      id: '4',
      title: 'Kit Brinquedos Interativos',
      description: 'Conjunto com 5 brinquedos para estimular a mente e diversão do seu pet.',
      discount: '30% OFF',
      originalPrice: 'R$ 79,90',
      salePrice: 'R$ 55,93',
      image: '/images/offers/brinquedos.jpg',
      category: 'brinquedos',
      brand: 'Pet Games',
      validUntil: '2024-02-18'
    },
    {
      id: '5',
      title: 'Coleiras e Guias Premium',
      description: 'Acessórios resistentes e confortáveis para passeios seguros e estilosos.',
      discount: '25% OFF',
      originalPrice: 'R$ 89,90',
      salePrice: 'R$ 67,43',
      image: '/images/offers/coleiras.jpg',
      category: 'acessorios',
      brand: 'Furacão Pet',
      validUntil: '2024-02-22'
    },
    {
      id: '6',
      title: 'Vermífugos e Antipulgas',
      description: 'Proteção completa contra parasitas. Marcas confiáveis com desconto especial.',
      discount: '15% OFF',
      originalPrice: 'R$ 124,90',
      salePrice: 'R$ 106,17',
      image: '/images/offers/medicamentos.jpg',
      category: 'medicamentos',
      brand: 'Bayer/Elanco',
      validUntil: '2024-02-28'
    }
  ];

  const filteredOffers = offers.filter(offer => {
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (offer.brand && offer.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface text-text-color">
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-white/20 p-3 rounded-full mb-4"
          >
            <Percent className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white font-serif mb-4"
          >
            Super Ofertas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Descontos imperdíveis em produtos premium para seu pet. Aproveite enquanto durarem os estoques!
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-color" />
              <input
                type="text"
                placeholder="Buscar ofertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-color hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative">
                  <div className="h-56 bg-primary-light flex items-center justify-center">
                    <div className="text-center">
                      <Gift className="h-16 w-16 text-primary-dark mx-auto mb-3" />
                      <span className="text-sm text-primary-dark font-medium">{offer.brand}</span>
                    </div>
                  </div>
                  
                  {offer.featured && (
                    <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Destaque
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-2 rounded-full text-sm font-bold">
                    {offer.discount}
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-text-color flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Até {new Date(offer.validUntil).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-color-dark mb-2 group-hover:text-primary transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-text-color text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>
                  
                  {offer.originalPrice && offer.salePrice && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-primary">{offer.salePrice}</span>
                      <span className="text-sm text-text-color line-through">{offer.originalPrice}</span>
                    </div>
                  )}
                  
                  <Link
                    to="/store"
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 group"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Comprar na Loja
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-text-color mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-text-color-dark mb-2">Nenhuma oferta encontrada</h3>
              <p className="text-text-color">Tente ajustar os filtros ou buscar por outros termos.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-color-dark font-serif mb-4">
            Não encontrou o que procurava?
          </h2>
          <p className="text-lg text-text-color mb-8">
            Visite nossa loja completa e descubra milhares de produtos para seu pet.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
          >
            Ir para a Loja Completa
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Offers;
