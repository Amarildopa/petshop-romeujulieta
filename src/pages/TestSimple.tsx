import React from 'react';

const TestSimple = () => {
  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-color-dark mb-4">
            Teste Simples
          </h1>
          <p className="text-lg text-text-color mb-8">
            Página de teste para verificar se a aplicação está funcionando
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-text-color-dark mb-4">
              Aplicação Funcionando!
            </h2>
            <p className="text-text-color">
              Se você está vendo esta página, significa que o React está carregando corretamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSimple;