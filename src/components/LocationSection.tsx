import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { settingsService, type LocationData } from '../services/settingsService';

// Fix para ícones do Leaflet no React
delete (L.Icon.Default.prototype as L.Icon.Default)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationSection: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Coordenadas específicas da Alameda dos Tupiniquis, 232 - Moema - São Paulo/SP
  const position: [number, number] = [-23.60696648888121, -46.655078669310555]; // Coordenadas exatas do endereço

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getLocationData();
        setLocationData(data);
      } catch (err) {
        console.error('Erro ao carregar dados de localização:', err);
        setError('Erro ao carregar informações de contato');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  const formatBusinessHours = (businessHours: LocationData['businessHours']) => {
    const dayNames = {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    const formatTime = (time: string) => {
      return time.replace(':', 'h');
    };

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
    const weekend = ['saturday', 'sunday'] as const;

    // Verificar se todos os dias da semana têm o mesmo horário
    const weekdayHours = weekdays.map(day => businessHours[day]);
    const sameWeekdayHours = weekdayHours.every(hours => 
      hours && hours.open === weekdayHours[0]?.open && hours.close === weekdayHours[0]?.close
    );

    const result = [];

    if (sameWeekdayHours && weekdayHours[0]) {
      result.push(`Segunda a Sexta: ${formatTime(weekdayHours[0].open)} às ${formatTime(weekdayHours[0].close)}`);
    } else {
      weekdays.forEach(day => {
        const hours = businessHours[day];
        if (hours) {
          result.push(`${dayNames[day]}: ${formatTime(hours.open)} às ${formatTime(hours.close)}`);
        }
      });
    }

    weekend.forEach(day => {
      const hours = businessHours[day];
      if (hours) {
        result.push(`${dayNames[day]}: ${formatTime(hours.open)} às ${formatTime(hours.close)}`);
      }
    });

    return result;
  };

  if (loading) {
    return (
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-color">Carregando informações...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !locationData) {
    return (
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'Erro ao carregar informações'}</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="location" className="py-20 bg-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text-color-dark">Onde Estamos</h2>
          <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
            Venha nos visitar! Estamos te esperando!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-primary-light p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-color-dark">Endereço</h3>
                  <p className="text-text-color mt-1">
                    {locationData.contact.contact_address}<br />
                    CEP: {locationData.contact.contact_cep}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-secondary-light p-3 rounded-full">
                  <Clock className="h-6 w-6 text-secondary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-color-dark">Horário de Funcionamento</h3>
                  <div className="text-text-color mt-1 space-y-1">
                    {formatBusinessHours(locationData.businessHours).map((schedule, index) => (
                      <p key={index}>{schedule}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-light p-2 rounded-full">
                    <Phone className="h-5 w-5 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-color-dark">Telefone</h4>
                    <p className="text-text-color">{locationData.contact.contact_phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-light p-2 rounded-full">
                    <Mail className="h-5 w-5 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-color-dark">E-mail</h4>
                    <p className="text-text-color break-all text-sm">{locationData.contact.contact_email}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mapa OpenStreetMap */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
              <MapContainer
                center={position}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                {/* Tiles do OpenStreetMap */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Marcador do Pet Shop */}
                <Marker position={position}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Romeu e Julieta Pet Spa</h3>
                      <p className="text-sm text-gray-600">
                        {locationData.contact.contact_address}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Clique no botão abaixo para ver no Google Maps
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="mt-4 text-center">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(locationData.contact.contact_address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                style={{
                  color: 'white',
                  backgroundColor: '#e05389'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
              >
                <MapPin className="w-4 h-4" />
                Ver no Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
