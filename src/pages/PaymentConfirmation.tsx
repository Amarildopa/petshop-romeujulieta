import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, ArrowLeft } from 'lucide-react';

interface PaymentConfirmationState {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  shippingOption: {
    id: string;
    name: string;
    price: number;
    carrier: string;
    estimatedDays: string;
  };
}

const PaymentConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentConfirmationState;

  // Se não há dados do pedido, redirecionar
  if (!state) {
    navigate('/');
    return null;
  }

  const { orderNumber, total, paymentMethod, shippingOption } = state;

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit_card':
        return 'Cartão de Débito';
      case 'pix':
        return 'PIX';
      case 'bank_slip':
        return 'Boleto Bancário';
      default:
        return method;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Sucesso */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-lg text-gray-600">
            Obrigado pela sua compra. Seu pedido foi processado com sucesso.
          </p>
        </div>

        {/* Informações do Pedido */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Detalhes do Pedido</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Número do Pedido</p>
              <p className="font-semibold text-gray-900">#{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pago</p>
              <p className="font-semibold text-gray-900 text-lg">R$ {total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Informações de Pagamento */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Pagamento</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Pagamento Aprovado</span>
          </div>
          <p className="text-gray-600 mt-1">
            Método: {getPaymentMethodName(paymentMethod)}
          </p>
        </div>

        {/* Informações de Entrega */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Entrega</h2>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Modalidade</p>
              <p className="font-medium text-gray-900">{shippingOption.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Transportadora</p>
              <p className="text-gray-900">{shippingOption.carrier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prazo de Entrega</p>
              <p className="text-gray-900">{shippingOption.estimatedDays}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo do Frete</p>
              <p className="text-gray-900">
                {shippingOption.price === 0 ? 'Grátis' : `R$ ${shippingOption.price.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Próximos Passos</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Você receberá um e-mail de confirmação em breve</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Seu pedido será preparado e enviado dentro de 1-2 dias úteis</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Você receberá o código de rastreamento quando o pedido for despachado</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Acompanhe o status do seu pedido na área "Meus Pedidos"</span>
            </li>
          </ul>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" />
            Ver Meus Pedidos
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </button>
        </div>

        {/* Informações de Contato */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">Precisa de ajuda com seu pedido?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href="mailto:contato@petshopromeoejulieta.com" className="text-blue-600 hover:text-blue-700">
              contato@petshopromeoejulieta.com
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="tel:+5511999999999" className="text-blue-600 hover:text-blue-700">
              (11) 99999-9999
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;