import React from 'react';

const Wishlist: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lista de Desejos</h1>
      <p className="text-gray-600">Sua lista de desejos está vazia.</p>
    </div>
  );
};

export default Wishlist;