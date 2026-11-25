import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { api, getError } from '../services/api';
import { useAuth } from '../store/authStore';

const tariffs = [
  { id: 'STANDARD', name: 'Oddiy', icon: '🚕' },
  { id: 'COMFORT', name: 'Komfort', icon: '🚗' },
  { id: 'NIGHT', name: 'Tungi', icon: '🌙' },
];

export default function TaxiPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [tariff, setTariff] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(true);

  // Joriy joylashuv
  useEffect(() => {
    if (!navigator.geolocation) {
      // G'uzor markaziga fallback
      setFrom({ lat: 38.6235, lng: 66.2475 });
      setFromAddress("G'uzor markazi");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFrom({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFromAddress('Joriy joylashuv');
        setLocating(false);
      },
      () => {
        setFrom({ lat: 38.6235, lng: 66.2475 });
        setFromAddress("G'uzor markazi");
        setLocating(false);
      }
    );
  }, []);

  // Narx hisoblash
  useEffect(() => {
    if (from && to) {
      api.post('/rides/estimate', { fromLat: from.lat, fromLng: from.lng, toLat: to.lat, toLng: to.lng, tariff })
        .then(r => setEstimate(r.data))
        .catch(() => setEstimate(null));
    }
  }, [from, to, tariff]);

  const handleMapClick = async (lat, lng) => {
    // Oddiy reverse geocoding (nominatim)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`);
      const data = await res.json();
      const addr = data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      if (!to) { setTo({ lat, lng }); setToAddress(addr); }
      else { setTo({ lat, lng }); setToAddress(addr); }
    } catch {
      setTo({ lat, lng }); setToAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleOrder = async () => {
    if (!user) return nav('/kirish');
    if (!from || !to) return setError('Iltimos, olib ketish va borish manzillarini belgilang');
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/rides', {
        fromAddress, fromLat: from.lat, fromLng: from.lng,
        toAddress, toLat: to.lat, toLng: to.lng,
        tariff, paymentMethod,
      });
      nav(`/safar/${data.ride.id}`);
    } catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setFrom({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFromAddress('Joriy joylashuv');
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-6">Taksi chaqirish</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapView
            height="600px" from={from} to={to}
            onMapClick={handleMapClick}
          />
          <p className="text-sm text-gray-400 mt-2">🗺️ Xaritani bosib borish manzilini tanlang</p>
        </div>

        <div className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center justify-between">
              <span>🟢 Qayerdan?</span>
              <button onClick={handleMyLocation} className="text-xs text-brand-yellow">Joriy joylashuv</button>
            </label>
            <input className="input-field" value={fromAddress} onChange={e => setFromAddress(e.target.value)} placeholder="Olib ketish manzili" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">🔴 Qayerga?</label>
            <input className="input-field" value={toAddress} onChange={e => setToAddress(e.target.value)} placeholder="Borish manzili" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avtomobil turi</label>
            <div className="grid grid-cols-3 gap-2">
              {tariffs.map(t => (
                <button key={t.id} type="button" onClick={() => setTariff(t.id)}
                  className={`p-3 rounded-xl border-2 transition text-center ${tariff === t.id ? 'border-brand-yellow bg-brand-yellow/10' : 'border-gray-700'}`}>
                  <div className="text-2xl">{t.icon}</div>
                  <div className="text-xs font-semibold mt-1">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To'lov usuli</label>
            <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="CASH">💵 Naqd pul</option>
              <option value="CLICK">💳 Click</option>
              <option value="PAYME">💳 Payme</option>
            </select>
          </div>

          {estimate && (
            <div className="bg-brand-darker rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Masofa:</span><span className="font-semibold">{estimate.distance} km</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Vaqt:</span><span className="font-semibold">{estimate.duration} daqiqa</span></div>
              <div className="flex justify-between text-lg pt-2 border-t border-gray-800">
                <span className="text-gray-300">Taxminiy narx:</span>
                <span className="font-black text-brand-yellow">{estimate.price.toLocaleString()} so'm</span>
              </div>
            </div>
          )}

          <button onClick={handleOrder} disabled={loading || !estimate} className="btn-primary w-full">
            {loading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
          </button>
        </div>
      </div>
    </div>
  );
}