import { Link } from 'react-router-dom';
import MapView from '../components/MapView';

const services = [
  { icon: '🚕', title: 'Shahar ichida taksi', desc: "G'uzor bo'ylab tez va qulay" },
  { icon: '🚐', title: 'Tumanlararo taksi', desc: 'Qarshi, Shahrisabz, Qamashi...' },
  { icon: '👥', title: 'Sheriklik taksi', desc: "Bir yo'nalishda hamkorlikda" },
  { icon: '⏰', title: 'Oldindan buyurtma', desc: "Vaqtni oldindan belgilang" },
  { icon: '📦', title: 'Kuryer xizmati', desc: 'Hujjat va posilka yetkazish' },
  { icon: '🏪', title: 'Mahalliy xizmatlar', desc: "Do'kon, dorixona, kafe" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 grid lg:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-in">
            <div className="badge bg-brand-yellow/10 text-brand-yellow mb-4">
              <span>✨</span> G'uzor uchun yangi platforma
            </div>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
              G'uzorda taksi chaqirish <br />
              <span className="text-brand-yellow">endi juda oson!</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg">
              Manzilingizni tanlang, narxni biling va yaqin haydovchini chaqiring. 
              GUZOR GO — shahar bo'ylab harakatlanish uchun ishonchli hamkoringiz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/taksi" className="btn-primary text-lg !px-8 !py-4">🚕 Taksi chaqirish</Link>
              <Link to="/haydovchi-bolish" className="btn-secondary text-lg !px-8 !py-4">Haydovchi bo'lish</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-md">
              <Stat value="1+" label="Tuman" />
              <Stat value="24/7" label="Xizmat" />
              <Stat value="100%" label="Ishonch" />
            </div>
          </div>
          <div className="animate-slide-up">
            <MapView height="450px" />
          </div>
        </div>
      </section>

      {/* Xizmatlar */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black mb-2">Xizmatlarimiz</h2>
        <p className="text-gray-400 mb-8">GUZOR GO'da barcha kerakli xizmatlar bir joyda</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div key={i} className="card hover:border-brand-yellow transition-all cursor-pointer hover:-translate-y-1">
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-lg mb-1">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-brand-yellow to-yellow-500 rounded-3xl p-8 lg:p-12 text-brand-darker">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Hoziroq boshlang!</h2>
          <p className="text-lg mb-6 opacity-90">Ro'yxatdan o'ting va birinchi safaringizni biz bilan qiling.</p>
          <Link to="/royxatdan-otish" className="inline-block bg-brand-darker text-brand-yellow font-bold px-8 py-4 rounded-xl hover:bg-brand-dark transition">Ro'yxatdan o'tish →</Link>
        </div>
      </section>
    </div>
  );
}

const Stat = ({ value, label }) => (
  <div>
    <div className="text-2xl font-black text-brand-yellow">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);