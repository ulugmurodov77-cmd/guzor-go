import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Loading from '../components/Loading';

const tabs = ['Dashboard', 'Haydovchilar', 'Foydalanuvchilar', 'Buyurtmalar', 'Tariflar', 'Promo-kodlar'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Dashboard');
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-6">🔧 Admin panel</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-semibold transition ${tab === t ? 'bg-brand-yellow text-brand-darker' : 'bg-brand-card text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Dashboard' && <DashboardTab />}
      {tab === 'Haydovchilar' && <DriversTab />}
      {tab === 'Foydalanuvchilar' && <UsersTab />}
      {tab === 'Buyurtmalar' && <RidesTab />}
      {tab === 'Tariflar' && <TariffsTab />}
      {tab === 'Promo-kodlar' && <PromosTab />}
    </div>
  );
}

function DashboardTab() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then(r => setData(r.data)); }, []);
  if (!data) return <Loading />;
  const { stats, chart } = data;
  const max = Math.max(...chart.map(c => c.count), 1);
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-3">
        <Stat title="Foydalanuvchilar" value={stats.totalUsers} />
        <Stat title="Haydovchilar" value={`${stats.onlineDrivers}/${stats.totalDrivers}`} subtitle="onlayn/jami" />
        <Stat title="Bugun buyurtmalar" value={stats.todayOrders} />
        <Stat title="Bugungi tushum" value={`${(stats.todayRevenue || 0).toLocaleString()} so'm`} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Stat title="Yakunlangan" value={stats.completedOrders} />
        <Stat title="Bekor qilingan" value={stats.cancelledOrders} />
        <Stat title="Komissiya" value={`${(stats.totalCommission || 0).toLocaleString()} so'm`} />
      </div>
      <div className="card">
        <h3 className="font-bold mb-4">📊 Oxirgi 7 kun buyurtmalari</h3>
        <div className="flex items-end gap-2 h-48">
          {chart.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-brand-yellow rounded-t transition-all" style={{ height: `${(c.count / max) * 160}px` }}></div>
              <p className="text-xs text-gray-400 mt-2">{c.date.slice(5)}</p>
              <p className="text-xs font-bold">{c.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ title, value, subtitle }) => (
  <div className="card">
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-2xl font-black text-brand-yellow">{value}</p>
    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
  </div>
);

function DriversTab() {
  const [drivers, setDrivers] = useState([]);
  const load = () => api.get('/admin/drivers').then(r => setDrivers(r.data.drivers));
  useEffect(() => { load(); }, []);
  const approve = async (id, status) => {
    await api.patch(`/admin/drivers/${id}/status`, { status });
    load();
  };
  return (
    <div className="card space-y-3">
      {drivers.map(d => (
        <div key={d.id} className="bg-brand-darker p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">{d.user.firstName} {d.user.lastName}</p>
            <p className="text-sm text-gray-400">{d.user.phone}</p>
            {d.vehicle && <p className="text-xs">{d.vehicle.brand} {d.vehicle.model} · {d.vehicle.plateNumber}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${d.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : d.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{d.status}</span>
            {d.status === 'PENDING' && (
              <>
                <button onClick={() => approve(d.id, 'APPROVED')} className="btn-primary !px-3 !py-1 text-xs">Tasdiqlash</button>
                <button onClick={() => approve(d.id, 'REJECTED')} className="btn-secondary !px-3 !py-1 text-xs">Rad etish</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const load = () => api.get('/admin/users').then(r => setUsers(r.data.users));
  useEffect(() => { load(); }, []);
  const block = async (id, isBlocked) => {
    await api.patch(`/admin/users/${id}/block`, { isBlocked });
    load();
  };
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-800 text-left"><th className="p-2">Ism</th><th className="p-2">Telefon</th><th className="p-2">Rol</th><th className="p-2">Holat</th><th className="p-2"></th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-gray-800/50">
              <td className="p-2">{u.firstName} {u.lastName}</td>
              <td className="p-2 font-mono">{u.phone}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.isBlocked ? '🚫' : '✅'}</td>
              <td className="p-2"><button onClick={() => block(u.id, !u.isBlocked)} className="text-xs text-brand-yellow">{u.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RidesTab() {
  const [rides, setRides] = useState([]);
  useEffect(() => { api.get('/admin/rides').then(r => setRides(r.data.rides)); }, []);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-800 text-left"><th className="p-2">Yo'lovchi</th><th className="p-2">Marshrut</th><th className="p-2">Haydovchi</th><th className="p-2">Narx</th><th className="p-2">Holat</th></tr></thead>
        <tbody>
          {rides.map(r => (
            <tr key={r.id} className="border-b border-gray-800/50">
              <td className="p-2">{r.passenger.firstName} {r.passenger.lastName}</td>
              <td className="p-2 text-xs">{r.fromAddress} → {r.toAddress}</td>
              <td className="p-2 text-xs">{r.driver?.user.firstName || '—'}</td>
              <td className="p-2">{(r.finalPrice || r.estimatedPrice).toLocaleString()}</td>
              <td className="p-2"><span className={`badge ${r.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : r.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TariffsTab() {
  const [tariffs, setTariffs] = useState([]);
  const load = () => api.get('/admin/tariffs').then(r => setTariffs(r.data.tariffs));
  useEffect(() => { load(); }, []);
  const update = async (id, data) => {
    await api.patch(`/admin/tariffs/${id}`, data);
    load();
  };
  return (
    <div className="space-y-3">
      {tariffs.map(t => (
        <div key={t.id} className="card">
          <h3 className="font-bold mb-2">{t.name} ({t.type})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><label className="text-xs text-gray-400">Boshlang'ich</label><input type="number" defaultValue={t.basePrice} onChange={e => update(t.id, { ...t, basePrice: +e.target.value })} className="input-field !py-1 text-sm" /></div>
            <div><label className="text-xs text-gray-400">1 km</label><input type="number" defaultValue={t.pricePerKm} onChange={e => update(t.id, { ...t, pricePerKm: +e.target.value })} className="input-field !py-1 text-sm" /></div>
            <div><label className="text-xs text-gray-400">Minimal</label><input type="number" defaultValue={t.minPrice} onChange={e => update(t.id, { ...t, minPrice: +e.target.value })} className="input-field !py-1 text-sm" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromosTab() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({ code: '', discount: 10, type: 'PERCENT', minAmount: 0, maxUses: 100 });
  const load = () => api.get('/admin/promos').then(r => setPromos(r.data.promos));
  useEffect(() => { load(); }, []);
  const create = async () => {
    try { await api.post('/admin/promos', form); setForm({ code: '', discount: 10, type: 'PERCENT', minAmount: 0, maxUses: 100 }); load(); }
    catch (e) { alert(e.response?.data?.message || 'Xatolik'); }
  };
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-bold mb-3">Yangi promo-kod</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <input className="input-field" placeholder="KOD" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input className="input-field" type="number" placeholder="Chegirma %" value={form.discount} onChange={e => setForm({ ...form, discount: +e.target.value })} />
          <input className="input-field" type="number" placeholder="Min summa" value={form.minAmount} onChange={e => setForm({ ...form, minAmount: +e.target.value })} />
          <input className="input-field" type="number" placeholder="Limit" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: +e.target.value })} />
          <button onClick={create} className="btn-primary">Qo'shish</button>
        </div>
      </div>
      <div className="card">
        {promos.map(p => (
          <div key={p.id} className="bg-brand-darker p-3 rounded-xl mb-2 flex justify-between">
            <div><p className="font-bold">{p.code}</p><p className="text-xs text-gray-400">{p.discount}% · {p.usedCount}/{p.maxUses || '∞'}</p></div>
            <span className={`badge ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{p.isActive ? 'Faol' : 'Nofaol'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}