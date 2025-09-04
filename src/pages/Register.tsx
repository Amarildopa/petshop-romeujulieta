import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Phone, Mail, Chrome, Apple, CheckCircle, Dog, Plus, Trash2 } from 'lucide-react';

interface Pet {
  name: string;
  species: string;
  breed: string;
}

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'phone'>('email');
  const [pets, setPets] = useState<Pet[]>([]);
  const [showPetForm, setShowPetForm] = useState(true);
  const [currentPet, setCurrentPet] = useState<Pet>({ name: '', species: '', breed: '' });

  const benefits = [
    'Agendamento rápido em 3 cliques',
    'Acompanhamento em tempo real',
    'Histórico completo do seu pet',
    'Planos de fidelização exclusivos',
    'Suporte 24/7 via WhatsApp'
  ];

  const handleAddPet = () => {
    if (currentPet.name && currentPet.species) {
      setPets([...pets, currentPet]);
      setCurrentPet({ name: '', species: '', breed: '' });
      setShowPetForm(false);
    }
  };

  const handleRemovePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-text-color-dark mb-4">
                  Junte-se ao PetShop Romeu & Julieta
                </h2>
                <p className="text-text-color text-lg">
                  Milhares de tutores já confiam em nós para cuidar dos seus pets. 
                  Faça parte dessa família!
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-secondary-dark flex-shrink-0" />
                    <span className="text-text-color-dark">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-accent/20">
                <h3 className="font-semibold text-text-color-dark mb-2">
                  🎉 Oferta Especial para Novos Clientes
                </h3>
                <p className="text-text-color text-sm">
                  Ganhe <span className="font-semibold text-primary">20% de desconto</span> no primeiro serviço 
                  + frete grátis na primeira compra na loja!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-text-color-dark">
                  Criar Conta
                </h3>
                <p className="text-text-color mt-2">
                  Cadastro rápido e seguro
                </p>
              </div>

              <div className="flex bg-surface-dark rounded-lg p-1 mb-6">
                <button
                  onClick={() => setRegistrationMethod('email')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                    registrationMethod === 'email'
                      ? 'bg-white text-primary-dark shadow-sm'
                      : 'text-text-color'
                  }`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </button>
                <button
                  onClick={() => setRegistrationMethod('phone')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                    registrationMethod === 'phone'
                      ? 'bg-white text-primary-dark shadow-sm'
                      : 'text-text-color'
                  }`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    {registrationMethod === 'email' ? 'E-mail' : 'WhatsApp'}
                  </label>
                  <input
                    type={registrationMethod === 'email' ? 'email' : 'tel'}
                    placeholder={
                      registrationMethod === 'email' 
                        ? 'seu@email.com' 
                        : '(11) 99999-9999'
                    }
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-color hover:text-text-color-dark"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-accent rounded mt-1"
                  />
                  <span className="text-sm text-text-color">
                    Aceito os{' '}
                    <Link to="/terms" className="text-primary hover:text-primary-dark">
                      Termos de Uso
                    </Link>{' '}
                    e{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-dark">
                      Política de Privacidade
                    </Link>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all font-medium"
                >
                  Continuar
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-accent" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-text-color">Ou cadastre-se com</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-accent rounded-lg bg-white text-sm font-medium text-text-color-dark hover:bg-surface-dark transition-colors">
                    <Chrome className="h-5 w-5 text-red-500" />
                    <span className="ml-2">Google</span>
                  </button>
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-accent rounded-lg bg-white text-sm font-medium text-text-color-dark hover:bg-surface-dark transition-colors">
                    <Apple className="h-5 w-5 text-gray-900" />
                    <span className="ml-2">Apple</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-text-color">Já tem uma conta? </span>
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Faça login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-color-dark">
            Conte sobre seus pets
          </h2>
          <p className="mt-2 text-text-color">
            Para oferecermos o melhor cuidado personalizado.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent/20">
          {pets.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold text-text-color-dark">Pets Adicionados:</h3>
              {pets.map((pet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-surface-dark rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Dog className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-text-color-dark">{pet.name}</p>
                      <p className="text-sm text-text-color">{pet.breed || pet.species}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemovePet(index)} className="text-status-danger hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {showPetForm ? (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-text-color mb-2">
                  Nome do Pet
                </label>
                <input
                  type="text"
                  placeholder="Ex: Buddy, Luna..."
                  value={currentPet.name}
                  onChange={(e) => setCurrentPet({ ...currentPet, name: e.target.value })}
                  className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Espécie
                  </label>
                  <select 
                    value={currentPet.species}
                    onChange={(e) => setCurrentPet({ ...currentPet, species: e.target.value })}
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Raça
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Golden, SRD..."
                    value={currentPet.breed}
                    onChange={(e) => setCurrentPet({ ...currentPet, breed: e.target.value })}
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddPet}
                className="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-secondary-dark transition-colors font-medium"
              >
                Adicionar Pet
              </button>
            </motion.form>
          ) : (
            <button
              type="button"
              onClick={() => setShowPetForm(true)}
              className="w-full flex items-center justify-center bg-surface-dark text-text-color-dark py-3 px-4 rounded-lg hover:bg-accent/20 transition-colors font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar outro pet
            </button>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 text-text-color-dark py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Voltar
            </button>
            <Link
              to="/dashboard"
              className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all font-medium text-center"
            >
              Finalizar Cadastro
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
