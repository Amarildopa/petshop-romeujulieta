import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PawPrint, MessageSquare } from 'lucide-react';

const CheckIn: React.FC = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para salvar a observação
    // Redireciona para o dashboard com um parâmetro para iniciar a simulação
    navigate('/dashboard?checked_in=true');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-8"
      >
        <div className="text-center">
          <PawPrint className="h-12 w-12 text-primary mx-auto" />
          <h2 className="mt-4 text-3xl font-bold text-text-color-dark">
            Check-in do Serviço
          </h2>
          <p className="mt-2 text-text-color">
            Agendamento #{appointmentId}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent/20">
          <form onSubmit={handleCheckIn}>
            <div className="space-y-6">
              <div>
                <label htmlFor="observation" className="block text-lg font-medium text-text-color-dark mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Quer contar alguma coisa sobre seu Pet hoje?
                </label>
                <textarea
                  id="observation"
                  rows={4}
                  className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: Ele está um pouco assustado hoje, comeu menos ração pela manhã, etc."
                ></textarea>
              </div>

              <div className="bg-secondary-light/50 rounded-xl p-4">
                <h4 className="font-semibold text-secondary-dark mb-2">
                  O que acontece agora?
                </h4>
                <p className="text-text-color text-sm">
                  Após o check-in, você poderá acompanhar cada etapa do serviço do seu pet diretamente pelo dashboard!
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all font-medium"
              >
                Confirmar Check-in
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckIn;