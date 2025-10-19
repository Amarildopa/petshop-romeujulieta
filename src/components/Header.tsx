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
  LogOut,
  ExternalLink
} from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();

  // Menu para usuários não logados (mar aberto)
  const publicNavItems = [
    { path: '/', label: 'Home' },
    { path: '/#location', label: 'Onde Estamos' },
    { path: '/#about', label: 'Sobre Nós' },
    { path: '/#services', label: 'Nossos serviços' },
    { path: '/#vip-packages', label: 'Clube' },
    { path: 'https://www.store.romeuejulietapetspa.com.br/', label: 'E-commerce', external: true }
  ];

  // Menu para usuários logados (área restrita)
  const authenticatedNavItems = [
    { path: '/', label: 'Home' },
    { path: 'https://www.store.romeuejulietapetspa.com.br/', label: 'E-Commerce', external: true },
    { path: '/#vip-packages', label: 'Clube' },
    { path: '/dashboard', label: 'Dashboard' }
  ];

  // Seleciona o menu baseado no status de autenticação
  const navItems = user ? authenticatedNavItems : publicNavItems;

  const handleNavClick = (path: string, e: React.MouseEvent, external?: boolean) => {
    e.preventDefault();
    
    // Se for um link externo, abrir em nova aba
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
      setIsMenuOpen(false);
      return;
    }
    
    if (path.startsWith('/#')) {
      // Se for uma âncora, verificar se já está na home
      const sectionId = path.substring(2); // Remove '/#'
      
      if (location.pathname === '/') {
        // Já está na home, apenas fazer scroll
        scrollToSection(sectionId);
      } else {
        // Não está na home, navegar para home e depois fazer scroll
        navigate('/');
        // Aumentar o timeout para garantir que a página carregue completamente
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 300);
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
      // Fazer scroll para o topo após navegar para qualquer página
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
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
    } else {
      // Se o elemento não for encontrado imediatamente, tentar novamente após um pequeno delay
      setTimeout(() => {
        const retryElement = document.getElementById(sectionId);
        if (retryElement) {
          const headerHeight = 80;
          const elementPosition = retryElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
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
    <header className="backdrop-blur-lg shadow-sm sticky top-0 z-50" style={{
      backgroundColor: 'var(--header-bg)',
      borderBottom: '1px solid var(--header-border)',
      opacity: 'var(--header-bg-opacity)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold hidden sm:block" style={{
              color: 'var(--simple-header-text)',
              fontWeight: 'bold'
            }}>
              {getAppName()}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(item.path, e, item.external)}
                className={`px-2.5 py-1.5 text-sm rounded-md transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center space-x-1 ${
                  isActive(item.path)
                    ? 'shadow-lg'
                    : ''
                }`}
                style={{
                  color: isActive(item.path) ? 'white' : 'var(--simple-header-text)',
                  backgroundColor: isActive(item.path) ? 'var(--color-primary)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'var(--simple-header-hover)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--simple-header-text)';
                  }
                }}
                {...(item.external && {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })}
              >
                <span style={{ fontWeight: 'bold' }}>{item.label}</span>
                {item.external && <ExternalLink className="h-3 w-3" />}
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
                  className="flex items-center space-x-2 transition-colors"
                  style={{
                    color: 'var(--simple-header-text)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--simple-header-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--simple-header-text)'}
                >
                  <img
                    src={getImageUrl.userAvatar(profile?.avatar_url, 'small')}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:block text-sm font-medium" style={{ fontWeight: 'bold' }}>
                    {profile?.full_name || user.user_metadata?.full_name || 'Perfil'}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 transition-colors"
                  style={{
                    color: 'var(--simple-header-text)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--simple-header-text)'}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block text-sm" style={{ fontWeight: 'bold' }}>Sair</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200"
                  style={{
                    color: 'var(--simple-button-login-text)',
                    backgroundColor: 'var(--simple-button-login-bg)',
                    border: '1px solid var(--simple-button-login-text)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--simple-button-login-text)';
                    e.currentTarget.style.color = 'var(--simple-button-login-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--simple-button-login-bg)';
                    e.currentTarget.style.color = 'var(--simple-button-login-text)';
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>Entrar</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200"
                  style={{
                    color: 'var(--simple-button-register-text)',
                    backgroundColor: 'var(--simple-button-register-bg)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>Cadastrar</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors duration-200"
              style={{
                color: 'var(--simple-header-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--simple-header-hover)';
                e.currentTarget.style.backgroundColor = 'var(--surface-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--simple-header-text)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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
            className="md:hidden border-t"
            style={{
              backgroundColor: 'var(--header-bg)',
              borderTopColor: 'var(--header-border)'
            }}
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(item.path, e, item.external)}
                  className={`flex items-center justify-between px-3 py-2 text-sm transition-colors duration-200 cursor-pointer ${
                    isActive(item.path)
                      ? 'border-r-4'
                      : ''
                  }`}
                  style={{
                    color: isActive(item.path) ? 'white' : 'var(--simple-header-text)',
                    backgroundColor: isActive(item.path) ? 'var(--color-primary)' : 'transparent',
                    borderRightColor: isActive(item.path) ? 'var(--color-primary-dark)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'var(--simple-header-hover)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--simple-header-text)';
                    }
                  }}
                  {...(item.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  })}
                >
                  <span style={{ fontWeight: 'bold' }}>{item.label}</span>
                  {item.external && <ExternalLink className="h-3 w-3" />}
                </a>
              ))}
              {user ? (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    style={{
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--surface-light)',
                      border: '1px solid var(--color-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-light)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>Perfil</span>
                  </Link>
                  {(import.meta as { env: { MODE: string } }).env.MODE === 'development' && (
                    <>
                      <Link
                        to="/monitoring"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                      >
                        <span style={{ fontWeight: 'bold' }}>Monitoramento</span>
                      </Link>
                      <Link
                        to="/photo-test"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                      >
                        <span style={{ fontWeight: 'bold' }}>Teste de Fotos</span>
                      </Link>
                    </>
                  )}
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                  >
                    <span style={{ fontWeight: 'bold' }}>Administração</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <span style={{ fontWeight: 'bold' }}>Sair</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    style={{
                      color: 'var(--simple-button-login-text)',
                      backgroundColor: 'var(--simple-button-login-bg)',
                      border: '1px solid var(--simple-button-login-text)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--simple-button-login-text)';
                      e.currentTarget.style.color = 'var(--simple-button-login-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--simple-button-login-bg)';
                      e.currentTarget.style.color = 'var(--simple-button-login-text)';
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>Entrar</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    style={{
                      color: 'var(--simple-button-register-text)',
                      backgroundColor: 'var(--simple-button-register-bg)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>Cadastrar</span>
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

export default Header;
