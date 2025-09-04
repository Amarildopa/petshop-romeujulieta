import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface AdminRouteProps {
    children: React.ReactElement;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { currentUser, userData, loading } = useAuth();

    if (loading) {
        // Exibe um loader enquanto verifica a autenticação e os dados do usuário
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    // Se não há usuário logado, redireciona para o login
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Se o usuário está logado mas não é um admin, redireciona para o dashboard do cliente
    if (userData?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    // Se o usuário está logado E é um admin, renderiza a rota protegida
    return children;
};