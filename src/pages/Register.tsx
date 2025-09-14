import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Chrome, Apple, Dog, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../constants/app';
import { DISCOUNT_CONFIG } from '../config/discounts';
import { profileService } from '../services/profileService';
import { petsService } from '../services/petsService';

interface Pet {
  name: string;
  species: string;
  breed: string;
  birthDate?: string;
  weight?: string;
  notes?: string;
}

const Register: React.FC = () => {
  const { signUp, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const [pets, setPets] = useState<Pet[]>([]);
  const [showPetForm, setShowPetForm] = useState(true);
  const [currentPet, setCurrentPet] = useState<Pet>({ name: '', species: '', breed: '' });

  // Função para calcular idade baseada na data de nascimento
  const calculateAge = (birthDate: string): string => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  // Limpar campos quando o componente monta
  useEffect(() => {
    // Força limpeza completa dos campos
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setError(null);
    setFormKey(Date.now());
    
    // Limpar cache do navegador e autofill
    if (typeof window !== 'undefined') {
      // Aguardar um pouco para garantir que o DOM está pronto
      setTimeout(() => {
        // Força limpeza dos inputs
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]') as NodeListOf<HTMLInputElement>;
        
        inputs.forEach((input) => {
          input.value = '';
          input.setAttribute('autocomplete', 'off');
          input.setAttribute('data-form-type', 'other');
          input.setAttribute('data-lpignore', 'true');
          // Força o navegador a não usar autofill
          input.setAttribute('name', input.name + '-' + Date.now());
        });
      }, 100);
    }
  }, []);

  // Limpar campos quando a rota muda
  useEffect(() => {
    if (location.pathname === '/register') {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setError(null);
      setFormKey(Date.now());
      
      // Limpar cache do navegador e autofill
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]') as NodeListOf<HTMLInputElement>;
          
          inputs.forEach((input) => {
            input.value = '';
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('data-form-type', 'other');
            input.setAttribute('data-lpignore', 'true');
            input.setAttribute('name', input.name + '-' + Date.now());
          });
        }, 100);
      }
    }
  }, [location.pathname]);

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.password && formData.confirmPassword;
      case 2:
        return true; // Pets são opcionais
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar usuário
      const { data: authData, error: authError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Aguardar o usuário estar disponível no contexto
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts && !user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      // Salvar perfil do usuário
      try {
        await profileService.updateProfile({
          full_name: formData.fullName,
          phone: formData.phone,
          address: '',
          cep: ''
        });
      } catch (profileError) {
        console.warn('Error saving profile:', profileError);
        // Continuar mesmo se o perfil falhar
      }

      // Salvar pets se houver
      if (pets.length > 0) {
        try {
          for (const pet of pets) {
            await petsService.createPet({
              name: pet.name,
              species: pet.species,
              breed: pet.breed,
              age: pet.birthDate ? calculateAge(pet.birthDate) : '',
              weight: pet.weight || '',
              height: '',
              color: '',
              gender: '',
              image_url: null,
              personality: [],
              allergies: [],
              medications: []
            });
          }
        } catch (petError) {
          console.warn('Error saving pets:', petError);
          // Continuar mesmo se os pets falharem
        }
      }

      // Redirecionar para dashboard
      console.log('Registration successful, redirecting to dashboard...');
      console.log('User from context:', user);
      console.log('User from authData:', authData?.user);
      
      // Forçar redirecionamento
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Dados Pessoais', description: 'Informações básicas' },
    { number: 2, title: 'Seus Pets', description: 'Adicione seus pets' },
    { number: 3, title: 'Confirmação', description: 'Revise e finalize' }
  ];

  const handleNextStep = () => {
    if (canProceedToNext()) {
      setCompletedSteps([...completedSteps, step]);
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddPet = () => {
    if (currentPet.name && currentPet.species) {
      setPets([...pets, { ...currentPet }]);
      setCurrentPet({ name: '', species: '', breed: '' });
    }
  };

  const handleRemovePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };



  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Mobile Special Offer */}
        <div className="lg:hidden mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl shadow-lg p-6 border border-primary/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-3">
                <span className="text-xl font-bold text-white">🎉</span>
              </div>
              <h3 className="text-lg font-bold text-text-color-dark mb-2">
                Oferta especial para novos clientes
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-text-color-dark">
                  <span className="font-semibold text-primary">{DISCOUNT_CONFIG.firstService.percentage}% de desconto</span> no primeiro serviço
                </p>
                <p className="text-text-color-dark">
                  <span className="font-semibold text-secondary">Frete grátis</span> na primeira compra
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-color-dark mb-2">
            Criar Conta
          </h2>
          <p className="text-text-color mb-6">
            {APP_CONFIG.texts.joinUs}
          </p>
          
          <div className="flex justify-center space-x-4">
            {steps.map((stepItem) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepItem.number
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepItem.number}
                </div>
                <div className="ml-2 text-left">
                  <div className={`text-sm font-medium ${
                    step >= stepItem.number ? 'text-text-color-dark' : 'text-gray-500'
                  }`}>
                    {stepItem.title}
                  </div>
                  <div className="text-xs text-text-color">
                    {stepItem.description}
                  </div>
                </div>
                {stepItem.number < steps.length && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    step > stepItem.number ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Special Offer Section */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl shadow-xl p-8 border border-primary/20">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">🎉</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-color-dark mb-2">
                    Oferta especial para novos clientes
                  </h3>
                  <p className="text-text-color">
                    Aproveite nossos benefícios exclusivos!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-primary/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">%</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-color-dark">
                          {DISCOUNT_CONFIG.firstService.description}
                        </h4>
                        <p className="text-sm text-text-color">
                          Válido para o {DISCOUNT_CONFIG.firstService.validFor}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-primary/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                          <span className="text-secondary font-bold text-lg">🚚</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-color-dark">
                          {DISCOUNT_CONFIG.firstPurchase.description}
                        </h4>
                        <p className="text-sm text-text-color">
                          Válido para a {DISCOUNT_CONFIG.firstPurchase.validFor}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 border border-primary/30"
                  >
                    <div className="text-center">
                      <p className="text-sm text-text-color-dark font-medium">
                        💡 <strong>Dica:</strong> Complete seu cadastro e comece a economizar hoje mesmo!
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent/20">
              <form key={formKey} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                    name={`fullName-${formKey}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                    name={`email-${formKey}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                    name={`phone-${formKey}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12"
                      autoComplete="new-password"
                      data-form-type="other"
                      data-lpignore="true"
                      name={`password-${formKey}`}
                      required
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

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirme sua senha"
                    className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    autoComplete="new-password"
                    data-form-type="other"
                    data-lpignore="true"
                    name={`confirmPassword-${formKey}`}
                    required
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-accent rounded mt-1"
                    required
                  />
                  <label htmlFor="terms-checkbox" className="text-sm text-text-color">
                    Aceito os{' '}
                    <Link to="/terms" className="text-primary hover:text-primary-dark">
                      Termos de Uso
                    </Link>{' '}
                    e{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-dark">
                      Política de Privacidade
                    </Link>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading || !canProceedToNext()}
                  className={`w-full py-3 px-4 rounded-lg transition-all font-medium ${
                    loading || !canProceedToNext()
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Criando conta...' : 'Continuar'}
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
        )}

        {/* Step 2: Pet Information */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
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
                      <button 
                        onClick={() => handleRemovePet(index)} 
                        className="text-status-danger hover:text-red-700"
                        title={`Remover ${pet.name}`}
                      >
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
                      value={currentPet.name}
                      onChange={(e) => setCurrentPet({ ...currentPet, name: e.target.value })}
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Luna"
                      autoComplete="off"
                      data-form-type="other"
                      data-lpignore="true"
                      name={`petName-${formKey}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Espécie
                    </label>
                    <select
                      value={currentPet.species}
                      onChange={(e) => setCurrentPet({ ...currentPet, species: e.target.value })}
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Espécie do pet"
                      title="Selecione a espécie do pet"
                    >
                      <option value="">Selecione</option>
                      <option value="Cachorro">Cachorro</option>
                      <option value="Gato">Gato</option>
                      <option value="Pássaro">Pássaro</option>
                      <option value="Peixe">Peixe</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Raça
                    </label>
                    <input
                      type="text"
                      value={currentPet.breed}
                      onChange={(e) => setCurrentPet({ ...currentPet, breed: e.target.value })}
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Golden Retriever"
                      autoComplete="off"
                      data-form-type="other"
                      data-lpignore="true"
                      name={`petBreed-${formKey}`}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleAddPet}
                      disabled={!currentPet.name || !currentPet.species}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Pet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPetForm(false)}
                      className="px-4 py-2 bg-gray-100 text-text-color-dark rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.form>
              ) : (
                <button
                  onClick={() => setShowPetForm(true)}
                  className="w-full py-3 px-4 border-2 border-dashed border-accent rounded-lg text-text-color hover:border-primary hover:text-primary transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Adicionar Pet</span>
                </button>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handlePrevStep}
                  className="flex-1 bg-gray-100 text-text-color-dark py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!canProceedToNext()}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !canProceedToNext()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-text-color-dark mb-2">
                Confirmação
              </h3>
              <p className="text-text-color">
                Revise seus dados antes de finalizar o cadastro.
              </p>
            </div>

            <div className="space-y-6">
              {/* Personal Data */}
              <div className="bg-surface-dark rounded-lg p-4">
                <h4 className="font-semibold text-text-color-dark mb-3">Dados Pessoais</h4>
                <div className="space-y-2">
                  <div><span className="font-medium">Nome:</span> {formData.fullName}</div>
                  <div><span className="font-medium">Email:</span> {formData.email}</div>
                  <div><span className="font-medium">Telefone:</span> {formData.phone}</div>
                </div>
              </div>

              {/* Pets Data */}
              <div className="bg-surface-dark rounded-lg p-4">
                <h4 className="font-semibold text-text-color-dark mb-3">Seus Pets</h4>
                {pets.length > 0 ? (
                  <div className="space-y-2">
                    {pets.map((pet, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Dog className="h-5 w-5 text-primary" />
                        <span>{pet.name} - {pet.species} - {pet.breed}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-color">Nenhum pet adicionado</p>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-gray-100 text-text-color-dark py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Voltar
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;