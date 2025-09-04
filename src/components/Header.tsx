import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, Menu, X, User, Calendar, ShoppingBag, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Notifications } from './Notifications'; // Importando o componente de Notificações

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navItems = [
    { path: '/services', label: 'Serviços', icon: Calendar },
    { path: '/store', label: 'Loja', icon: ShoppingBag },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="bg-surface/80 backdrop-blur-lg shadow-sm border-b border-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-text-color-dark hidden sm:block">
              PetShop Romeu & Julieta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(path)
                    ? 'text-primary-dark bg-primary/10'
                    : 'text-text-color hover:text-primary-dark hover:bg-surface-dark'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
             {currentUser && (
                <Link
                    to="/profile"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive('/profile')
                        ? 'text-primary-dark bg-primary/10'
                        : 'text-text-color hover:text-primary-dark hover:bg-surface-dark'
                    }`}
                >
                    <User className="h-4 w-4" />
                    <span className="font-medium">Meu Perfil</span>
                </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser && (
                <Notifications /> // Componente de notificações adicionado aqui
            )}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-status-danger hover:bg-red-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2"/>
                Sair
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-dark bg-primary/20 hover:bg-primary/30 transition-colors duration-200"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                >
                  Cadastrar
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-color hover:text-primary-dark hover:bg-surface-dark transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-accent/20"
          >
             {/* ... Mobile menu links ... */}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
