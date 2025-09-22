import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para ícones do Leaflet no React
delete (L.Icon.Default.prototype as L.Icon.Default)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OpenStreetMapExample: React.FC = () => {
  // Coordenadas do Pet Shop (exemplo: Moema, São Paulo)
  const position: [number, number] = [-23.6024, -46.6634];

  return (
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
                Alameda dos Tupiniquins, 232<br />
                Moema - São Paulo, SP
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Clique para ver no Google Maps
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default OpenStreetMapExample;