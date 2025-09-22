import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, ExternalLink } from 'lucide-react';

const WhatsAppTest: React.FC = () => {
  // Número fixo do Pet Shop Romeo & Julieta
  const petShopNumber = '5511996880540'; // Número fixo do estabelecimento
  const [clientNumber, setClientNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [petName, setPetName] = useState('');
  const [selectedService, setSelectedService] = useState('banho-tosa');
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Função para formatar número de telefone
  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleaned.startsWith('55')) {
      return '55' + cleaned;
    }
    
    return cleaned;
  };

  // Função para gerar mensagem de agendamento
  const generateBookingMessage = () => {
    const serviceNames = {
      'banho-tosa': 'Banho e Tosa',
      'consulta-vet': 'Consulta Veterinária',
      'vacinacao': 'Vacinação',
      'cirurgia': 'Cirurgia',
      'hotel': 'Hotel para Pets',
      'adestramento': 'Adestramento'
    };

    return `🐾 *Agendamento Pet Shop Romeo & Julieta* 🐾

Olá! Gostaria de agendar um serviço para meu pet.

👤 *Cliente:* ${clientName || 'Não informado'}
🐕 *Pet:* ${petName || 'Não informado'}
📱 *Telefone:* ${clientNumber || 'Não informado'}
🛁 *Serviço:* ${serviceNames[selectedService as keyof typeof serviceNames]}

Por favor, me informem a disponibilidade de horários.

Obrigado! 😊`;
  };

  // Função para abrir WhatsApp com agendamento
  const openBookingWhatsApp = () => {
    if (!clientNumber || !clientName || !petName) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome do Cliente, Nome do Pet e Telefone).');
      return;
    }

    const bookingMessage = generateBookingMessage();
    const formattedPhone = formatPhoneNumber(petShopNumber);
    const encodedMessage = encodeURIComponent(bookingMessage);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    // Adiciona resultado ao log
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [
      `[${timestamp}] Agendamento enviado para Pet Shop: ${formattedPhone}`,
      `[${timestamp}] Cliente: ${clientName} | Pet: ${petName} | Serviço: ${selectedService}`,
      ...prev.slice(0, 8) // Mantém apenas os últimos 10 resultados
    ]);
    
    // Abre em nova aba
    window.open(whatsappUrl, '_blank');
  };

  // Função para abrir WhatsApp Web (teste manual)
  const openWhatsAppWeb = (phone: string, msg: string) => {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(msg);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    // Adiciona resultado ao log
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [
      `[${timestamp}] WhatsApp Web aberto para: ${formattedPhone}`,
      ...prev.slice(0, 9) // Mantém apenas os últimos 10 resultados
    ]);
    
    // Abre em nova aba
    window.open(whatsappUrl, '_blank');
  };

  // Função para abrir WhatsApp Mobile
  const openWhatsAppMobile = (phone: string, msg: string) => {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(msg);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    // Adiciona resultado ao log
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [
      `[${timestamp}] WhatsApp Mobile aberto para: ${formattedPhone}`,
      ...prev.slice(0, 9)
    ]);
    
    // Abre em nova aba
    window.open(whatsappUrl, '_blank');
  };

  // Mensagens pré-definidas para teste (removidas as variáveis não utilizadas)

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-color-dark">
                  Teste de Integração WhatsApp
                </h1>
                <p className="text-text-color">
                  Página para testar integração com WhatsApp Web e Mobile
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulário de Agendamento */}
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  📞 Pet Shop Romeo & Julieta
                </h3>
                <p className="text-green-700 text-sm">
                  Número: {petShopNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Nome do Pet *
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Nome do seu pet"
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Seu Telefone (com DDD) *
                </label>
                <input
                  type="text"
                  value={clientNumber}
                  onChange={(e) => setClientNumber(e.target.value)}
                  placeholder="11999999999"
                  className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-text-color mt-1">
                  Formato: DDD + número (ex: 11999999999)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Serviço Desejado
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="banho-tosa">Banho e Tosa</option>
                  <option value="consulta-vet">Consulta Veterinária</option>
                  <option value="vacinacao">Vacinação</option>
                  <option value="cirurgia">Cirurgia</option>
                  <option value="hotel">Hotel para Pets</option>
                  <option value="adestramento">Adestramento</option>
                </select>
              </div>

              {/* Botão Principal de Agendamento */}
              <div className="space-y-3">
                <button
                  onClick={openBookingWhatsApp}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-semibold">🐾 Agende seu Serviço</span>
                </button>
                
                <p className="text-xs text-center text-text-color">
                  Ao clicar, você será redirecionado para o WhatsApp do Pet Shop
                </p>
              </div>

              <hr className="my-6" />

              {/* Seção de Teste Manual */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  🧪 Teste Manual (Desenvolvedor)
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Número de Teste
                    </label>
                    <input
                      type="text"
                      value={petShopNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Mensagem de Teste
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                      placeholder="Digite uma mensagem de teste..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openWhatsAppWeb(petShopNumber, message)}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Teste Web</span>
                    </button>
                    
                    <button
                      onClick={() => openWhatsAppMobile(petShopNumber, message)}
                      className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Teste Mobile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Log de Resultados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-color-dark">
                  Log de Testes
                </h3>
                <button
                  onClick={clearResults}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Limpar Log
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-text-color text-center py-8">
                    Nenhum teste executado ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="text-sm font-mono bg-white p-2 rounded border"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações Técnicas */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Informações Técnicas
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>WhatsApp Web:</strong> https://web.whatsapp.com/send</p>
                  <p><strong>WhatsApp Mobile:</strong> https://api.whatsapp.com/send</p>
                  <p><strong>Parâmetros:</strong> phone, text</p>
                  <p><strong>Formato do telefone:</strong> Código país + DDD + número</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WhatsAppTest;