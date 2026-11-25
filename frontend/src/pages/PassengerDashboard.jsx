import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../store/authStore';
import Loading, { EmptyState } from '../components/Loading';

const menuItems = [
  { icon: '🚕', title: 'Taksi buyurtma qilish', link: '/taksi' },
  { icon: '📋', title: 'Buyurtmalar tarixi', link: '#history' },
  { icon: '⭐', title: 'Sevimli manzillar', link: '#favorites' },
  { icon: '👤', title: 'Profil sozlamalari', link: '#profile' },
  { icon: '💳', title: 'To\'lov usullari', link: '#payment' },
  { icon: '🎁', title: 'Chegirmalar', link: '#promo' },
  { icon: '❓', title: 'Yordam markazi', link: '#help' },
  { icon: '🔔', title: 'Bildirishnomalar', link: '#notifications' },
];

export default function PassengerDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [rides, setRides] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    Promise.all([
      api.get('/rides/my').then(r => setRides(r.data.rides)),
      api.get('/favorites').then(r => setFavorites(r.data.favorites)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="card mb-6 bg-gradient-to-r from-brand-yellow to-yellow-500 text-brand-darker">
        <h1 className="text-2xl font-black">Salom, {user.firstName}! 👋</h1>
        <p className="opacity-90">Bugun qanday xizmat kerak?</p>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        {menuItems.map((m, i) => (
          <Link key={i} to={m.link} className="card hover:border-brand-yellow transition cursor-pointer">
            <div className="text-3xl mb-2">{m.icon}</div>
            <p className="font-semibold text-sm">{m.title}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">📋 Oxirgi buyurtmalar</h2>
        {loading ? <Loading /> : rides.length === 0 ? (
          <EmptyState icon="🚕" title="Buyurtmalar yo'q" description="Birinchi safaringizni boshlang!" />
        ) : (
          <div className="space-y-2">
            {rides.slice(0, 5).map(r => (
              <div key={r.id} className="bg-brand-darker p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{r.fromAddress} → {r.toAddress}</p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-yellow">{(r.finalPrice || r.estimatedPrice).toLocaleString()} so'm</p>
                  <p className="text-xs text-gray-400">{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}