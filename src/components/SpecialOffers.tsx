import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Percent, Gift, Star } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
  category: string;
  featured?: boolean;
}

const SpecialOffers: React.FC = () => {
  const offers: Offer[] = [
    {
      id: '1',
      title: 'Sachês Golden e Premier',
      description: 'Leve mais e pague menos pra uma rotina mais suculenta!',
      discount: 'Leve 6 Pague 5',
      image: '/images/offers/golden-premier.jpg',
      category: 'Alimentação',
      featured: true
    },
    {
      id: '2',
      title: 'Areias até 50% OFF*',
      description: 'Um ambiente mais limpo e agradável para o seu pet.',
      discount: 'até 50% OFF',
      image: '/images/offers/areias.jpg',
      category: 'Higiene'
    },
    {
      id: '3',
      title: 'Ração Biofresh até 10% OFF',
      description: 'Super Premium Natural',
      discount: 'até 10% OFF',
      image: '/images/offers/biofresh.jpg',
      category: 'Alimentação'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl p-8 h-full"
    >
      <div className="text-center mb-6">
        <div className="inline-block bg-accent-light p-3 rounded-full mb-4">
          <Percent className="h-6 w-6 text-accent-dark" />
        </div>
        <h2 className="text-4xl font-bold text-text-color-dark mb-2">
          Super Ofertas
        </h2>
        <p className="text-text-color">
          Aproveite nossas promoções especiais para seu pet
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {offers.slice(0, 3).map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-primary-light rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-5 w-5 text-primary-dark" />
                  <span className="text-xs text-primary-dark font-medium uppercase">{offer.category}</span>
                  {offer.featured && (
                    <div className="bg-accent text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Destaque
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-text-color-dark mb-1 group-hover:text-primary transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-text-color line-clamp-2">
                  {offer.description}
                </p>
              </div>
              <div className="ml-4 text-center">
                <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold mb-2">
                  {offer.discount}
                </div>
                <button className="inline-flex items-center justify-center gap-1 border-2 border-primary text-primary-dark px-3 py-1 rounded-lg text-xs font-semibold hover:bg-primary/5 transition-all duration-300">
                  <ShoppingBag className="h-3 w-3" />
                  Comprar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/offers"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
          style={{
            backgroundColor: '#e05389',
            color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
        >
          Ver Todas as Ofertas
          <ShoppingBag className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default SpecialOffers;
