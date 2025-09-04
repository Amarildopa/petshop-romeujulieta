import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  // Se não houver usuário logado, redireciona para a página de login.
  // O `replace` evita que a rota privada fique no histórico do navegador.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Se houver um usuário logado, renderiza o componente filho.
  return children;
};
