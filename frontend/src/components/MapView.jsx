import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

const GUZOR_CENTER = [38.6235, 66.2475];

const icon = (color = '#fbbf24') => L.divIcon({
  html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px ${color}"></div>`,
  className: '', iconSize: [16, 16], iconAnchor: [8, 8],
});

function ClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick?.(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapView({
  center = GUZOR_CENTER, zoom = 13,
  from, to, drivers = [], route = [],
  height = '500px', onMapClick,
}) {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='© OpenStreetMap, © CARTO'
        />
        {onMapClick && <ClickHandler onClick={onMapClick} />}
        {from && <Marker position={[from.lat, from.lng]} icon={icon('#10b981')}><Popup>Olib ketish</Popup></Marker>}
        {to && <Marker position={[to.lat, to.lng]} icon={icon('#ef4444')}><Popup>Borish</Popup></Marker>}
        {drivers.map(d => d.lat && d.lng && (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={icon('#3b82f6')}>
            <Popup>{d.name || 'Haydovchi'}</Popup>
          </Marker>
        ))}
        {route.length > 1 && <Polyline positions={route} color="#fbbf24" weight={5} />}
      </MapContainer>
    </div>
  );
}