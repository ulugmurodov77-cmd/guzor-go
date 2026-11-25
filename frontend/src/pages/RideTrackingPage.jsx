import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { api, getError } from '../services/api';
import { getSocket } from '../services/socket';
import Loading from '../components/Loading';

const statusLabels = {
  SEARCHING: { text: 'Haydovchi qidirilmoqda...', color: 'text-yellow-400', icon: '🔍' },
  ACCEPTED: { text: 'Haydovchi buyurtmani qabul qildi', color: 'text-blue-400', icon: '✅' },
  DRIVER_ARRIVING: { text: 'Haydovchi yo\'lda', color: 'text-blue-400', icon: '🚗' },
  DRIVER_ARRIVED: { text: 'Haydovchi yetib keldi', color: 'text-green-400', icon: '📍' },
  IN_PROGRESS: { text: 'Safar boshlandi', color: 'text-green-400', icon: '🛣️' },
  COMPLETED: { text: 'Safar yakunlandi', color: 'text-green-500', icon: '🏁' },
  CANCELLED: { text: 'Bekor qilindi', color: 'text-red-400', icon: '❌' },
};

export default function RideTrackingPage() {
  const { rideId } = useParams();
  const nav = useNavigate();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/rides/${rideId}`);
      setRide(data.ride);
    } catch (e) { setError(getError(e)); }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    if (!socket) return;
    socket.emit('subscribe_ride', rideId);
    socket.on('ride_accepted', load);
    socket.on('ride_status', load);
    return () => { socket.off('ride_accepted', load); socket.off('ride_status', load); };
  }, [rideId]);

  const handleCancel = async () => {
    if (!confirm('Buyurtmani bekor qilmoqchimisiz?')) return;
    try {
      await api.patch(`/rides/${rideId}/status`, { status: 'CANCELLED' });
      nav('/kabinet');
    } catch (e) { alert(getError(e)); }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/rides/${rideId}/status`, { status: 'COMPLETED' });
      load();
    } catch (e) { alert(getError(e)); }
  };

  if (error) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-red-400">{error}</div>;
  if (!ride) return <Loading text="Buyurtma yuklanmoqda..." />;

  const status = statusLabels[ride.status] || statusLabels.SEARCHING;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="card mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-gray-400 text-sm">Buyurtma #{ride.id.slice(-8)}</p>
            <h1 className={`text-2xl font-black ${status.color}`}>{status.icon} {status.text}</h1>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Narx</p>
            <p className="text-2xl font-black text-brand-yellow">{ride.estimatedPrice.toLocaleString()} so'm</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MapView
          height="400px"
          from={{ lat: ride.fromLat, lng: ride.fromLng }}
          to={{ lat: ride.toLat, lng: ride.toLng }}
          drivers={ride.driver ? [{ id: 1, lat: ride.fromLat, lng: ride.fromLng, name: `${ride.driver.user.firstName} ${ride.driver.user.lastName}` }] : []}
        />

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold mb-3">Marshrut</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2"><span className="text-green-400">●</span><span>{ride.fromAddress}</span></div>
              <div className="flex gap-2"><span className="text-red-400">●</span><span>{ride.toAddress}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800">
              <div><p className="text-xs text-gray-400">Masofa</p><p className="font-bold">{ride.distance} km</p></div>
              <div><p className="text-xs text-gray-400">Vaqt</p><p className="font-bold">{ride.duration} daqiqa</p></div>
            </div>
          </div>

          {ride.driver && (
            <div className="card">
              <h3 className="font-bold mb-3">Haydovchi</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center font-bold text-brand-darker text-xl">
                  {ride.driver.user.firstName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{ride.driver.user.firstName} {ride.driver.user.lastName}</p>
                  <p className="text-sm text-gray-400">⭐ {ride.driver.rating.toFixed(1)}</p>
                </div>
                <a href={`tel:${ride.driver.user.phone}`} className="btn-primary !px-4 !py-2">📞 Qo'ng'iroq</a>
              </div>
              {ride.driver.vehicle && (
                <div className="mt-3 pt-3 border-t border-gray-800 text-sm">
                  <p className="text-gray-400">Avtomobil</p>
                  <p className="font-semibold">{ride.driver.vehicle.brand} {ride.driver.vehicle.model} · {ride.driver.vehicle.color}</p>
                  <p className="font-mono bg-brand-darker inline-block px-3 py-1 rounded mt-1">{ride.driver.vehicle.plateNumber}</p>
                </div>
              )}
            </div>
          )}

          {ride.status === 'SEARCHING' && (
            <div className="card text-center">
              <div className="text-5xl mb-3 animate-pulse">🔍</div>
              <p className="text-gray-400">Yaqin atrofdagi haydovchilarga buyurtma yuborilmoqda...</p>
            </div>
          )}

          <div className="flex gap-2">
            {(ride.status === 'SEARCHING' || ride.status === 'ACCEPTED') && (
              <button onClick={handleCancel} className="btn-secondary flex-1 text-red-400">Bekor qilish</button>
            )}
            {ride.status === 'IN_PROGRESS' && (
              <button onClick={handleComplete} className="btn-primary flex-1">Safarni yakunlash</button>
            )}
          </div>

          <button className="w-full bg-red-500/20 border border-red-500/50 text-red-400 font-bold py-3 rounded-xl hover:bg-red-500/30">
            🆘 SOS — Yordam chaqirish
          </button>
        </div>
      </div>
    </div>
  );
}