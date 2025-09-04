import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  CreditCard,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface UserData {
  fullName: string;
  email: string;
  whatsapp?: string;
  cep?: string;
  address?: string;
}

export const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
            console.error("Error fetching user data:", error)
        } finally {
            setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleUpdate = async () => {
    if (currentUser && userData) {
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        try {
            await updateDoc(userDocRef, {
                ...userData
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (userData) {
        setUserData({...userData, [name]: value });
    }
  }

  const tabs = [
    { id: 'personal', name: 'Dados Pessoais', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'payment', name: 'Pagamento', icon: CreditCard }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;
  }

  if (!userData) {
    return <div className="text-center py-12">Usuário não encontrado.</div>;
  }


  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <img
              src={`https://ui-avatars.com/api/?name=${userData.fullName.replace(' ', '+')}&background=random`}
              alt="Perfil"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-text-color-dark">{userData.fullName}</h1>
          <p className="text-text-color">Tutor(a)</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-light/50 text-primary-dark border border-primary/20'
                    : 'bg-white text-text-color-dark hover:bg-surface-dark border border-accent/20'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </motion.div>

          <div className="lg:col-span-3">
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Dados Pessoais
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isEditing
                        ? 'bg-gray-100 text-text-color-dark hover:bg-gray-200'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        name="fullName"
                        value={userData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        disabled
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        name="whatsapp"
                        value={userData.whatsapp || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={isEditing ? '(11) 99999-9999' : 'Não informado'}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      CEP
                    </label>
                    <div className="relative">
                      <MapPin className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        name="cep"
                        value={userData.cep || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={isEditing ? '01234-567' : 'Não informado'}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={userData.address || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={isEditing ? 'Rua, Número, Bairro, Cidade - Estado' : 'Não informado'}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        isEditing
                          ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                          : 'border-accent/20 bg-surface-dark'
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-accent text-text-color-dark rounded-lg hover:bg-surface-dark transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            {/* As outras abas (Notificações, Segurança, Pagamento) permanecem iguais por enquanto */}
          </div>
        </div>
      </div>
    </div>
  );
};
