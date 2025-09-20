import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Chrome, Apple, PawPrint } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userSubscriptionsService } from '../services/userSubscriptionsService';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Obter parâmetro de redirecionamento da URL
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Carregar email salvo e limpar campos quando o componente monta
  useEffect(() => {
    // Verificar se há email salvo no localStorage
    const savedEmail = localStorage.getItem('rememberedEmail');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    } else {
      // Força limpeza completa dos campos
      setEmail('');
      setRememberMe(false);
    }
    
    setPassword('');
    setError(null);
    setLoading(false);
    setFormKey(Date.now());
    
    // Configurar atributos anti-autofill
    if (typeof window !== 'undefined') {
      // Aguardar um pouco para garantir que o DOM está pronto
      setTimeout(() => {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
        
        if (emailInput) {
          emailInput.setAttribute('autocomplete', 'off');
          emailInput.setAttribute('data-form-type', 'other');
          emailInput.setAttribute('data-lpignore', 'true');
          emailInput.setAttribute('name', 'email-' + Date.now());
          // Manter o valor do email se foi salvo
          if (savedEmail && wasRemembered) {
            emailInput.value = savedEmail;
          }
        }
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.setAttribute('autocomplete', 'new-password');
          passwordInput.setAttribute('data-form-type', 'other');
          passwordInput.setAttribute('data-lpignore', 'true');
          passwordInput.setAttribute('name', 'password-' + Date.now());
        }
      }, 100);
    }
  }, []);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação de campos obrigatórios
    if (!email) {
      setError('Email é obrigatório');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Senha é obrigatória');
      setLoading(false);
      return;
    }

    // Validação de email
    if (!email.includes('@')) {
      setError('Email inválido');
      setLoading(false);
      return;
    }

    // Validação de senha
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password, rememberMe);
      
      if (error) {
        setError(error.message);
      } else {
        // Salvar email se "Lembrar de mim" estiver marcado
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        // Verificar se o usuário tem assinatura ativa
        try {
          const activeSubscription = await userSubscriptionsService.getActiveSubscription(
            (await supabase.auth.getUser()).data.user?.id || ''
          );
          
          // Se não tem assinatura ativa e não está indo para a página de planos, redirecionar para planos
          if (!activeSubscription && redirectTo !== '/subscription') {
            navigate('/subscription');
          } else {
            navigate(redirectTo);
          }
        } catch (subscriptionError) {
          // Em caso de erro ao verificar assinatura, redirecionar para o destino padrão
          console.warn('Erro ao verificar assinatura:', subscriptionError);
          navigate(redirectTo);
        }
      }
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-primary mx-auto" />
          <h2 className="mt-4 text-3xl font-bold text-text-color-dark">
            Bem-vindo de volta!
          </h2>
          <p className="mt-2 text-text-color">
            Faça login para cuidar do seu pet
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent/20">


          <form key={formKey} className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-color mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <label htmlFor="password" className="block text-sm font-medium text-text-color mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
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

            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-accent rounded"
                />
                <span className="ml-2 text-sm text-text-color">Lembrar de mim</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg transition-all font-medium ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'
              }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-accent" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-text-color">Ou continue com</span>
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
            <span className="text-text-color">Não tem uma conta? </span>
            <Link
              to="/register"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Crie sua conta aqui
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
