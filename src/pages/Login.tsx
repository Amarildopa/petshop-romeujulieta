import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Phone, Mail, Chrome, Apple, PawPrint } from 'lucide-react';
import { auth } from '../firebaseConfig'; // Importando auth
import { signInWithEmailAndPassword } from 'firebase/auth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate('/dashboard');
    } catch (error: any) {
      setError("E-mail ou senha inválidos.");
      console.error("Erro no login:", error);
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
          <div className="flex bg-surface-dark rounded-lg p-1 mb-6">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white text-primary-dark shadow-sm'
                  : 'text-text-color'
              }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              E-mail
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              disabled
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors disabled:opacity-50 ${
                loginMethod === 'phone'
                  ? 'bg-white text-primary-dark shadow-sm'
                  : 'text-text-color'
              }`}
            >
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-text-color mb-2">
                {loginMethod === 'email' ? 'E-mail' : 'WhatsApp'}
              </label>
              <input
                type={loginMethod === 'email' ? 'email' : 'tel'}
                placeholder={
                  loginMethod === 'email' 
                    ? 'seu@email.com' 
                    : '(11) 99999-9999'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {error && (
              <div className="text-status-danger text-sm text-center p-2 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
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
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all font-medium disabled:bg-opacity-50"
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
              <button disabled className="w-full inline-flex justify-center py-3 px-4 border border-accent rounded-lg bg-white text-sm font-medium text-text-color-dark hover:bg-surface-dark transition-colors disabled:opacity-50">
                <Chrome className="h-5 w-5 text-red-500" />
                <span className="ml-2">Google</span>
              </button>
              <button disabled className="w-full inline-flex justify-center py-3 px-4 border border-accent rounded-lg bg-white text-sm font-medium text-text-color-dark hover:bg-surface-dark transition-colors disabled:opacity-50">
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
