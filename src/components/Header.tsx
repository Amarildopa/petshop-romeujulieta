import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import AdminStatus from './AdminStatus';
import { getAppName } from '../constants/app';
import { getImageUrl } from '../config/images';
import { 
  PawPrint,
  Menu, 
  X, 
  LogOut
} from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/#location', label: 'Onde Estamos' },
    { path: '/#about', label: 'Sobre Nós' },
    { path: '/#services', label: 'Nossos serviços' },
    { path: '/#vip-packages', label: 'Clube' },
    { path: '/store', label: 'E-commerce' }
  ];

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (path.startsWith('/#')) {
      // Se for uma âncora, navegar para home e fazer scroll
      const sectionId = path.substring(2); // Remove '/#'
      
      if (location.pathname !== '/') {
        // Se não estiver na home, navegar primeiro
        navigate('/');
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      } else {
        // Se já estiver na home, fazer scroll direto
        scrollToSection(sectionId);
      }
    } else if (path === '/') {
      // Para o item Home, navegar para home e fazer scroll para o topo
      navigate('/');
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      // Navegação normal para outras páginas
      navigate(path);
    }
    
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Altura aproximada do header fixo
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-surface/80 backdrop-blur-lg shadow-sm border-b border-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-text-color-dark hidden sm:block">
              {getAppName()}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`px-2.5 py-1.5 text-sm rounded-md transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <AdminStatus />
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-text-color-dark hover:text-primary transition-colors"
                >
                  <img
                    src={getImageUrl.userAvatar(profile?.avatar_url, 'small')}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:block text-sm font-medium">
                    {profile?.full_name || user.user_metadata?.full_name || 'Perfil'}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-text-color hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block text-sm">Sair</span>
                </button>
              </div>
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
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`block px-3 py-2 text-sm transition-colors duration-200 cursor-pointer ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              {user ? (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-primary-dark bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors duration-200"
                  >
                    Perfil
                  </Link>
                  {(import.meta as { env: { MODE: string } }).env.MODE === 'development' && (
                    <>
                      <Link
                        to="/monitoring"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                      >
                        Monitoramento
                      </Link>
                      <Link
                        to="/photo-test"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                      >
                        Teste de Fotos
                      </Link>
                    </>
                  )}
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                  >
                    Administração
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-primary-dark bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors duration-200"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors duration-200"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
