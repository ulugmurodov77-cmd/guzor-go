import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { getError, api } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '+998', password: '', role: 'PASSENGER' });
  const [step, setStep] = useState('form');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await register(form);
      setDemoCode(data.code || '');
      setStep('verify');
    } catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-code', { phone: form.phone, code });
      const role = form.role;
      nav(role === 'DRIVER' ? '/haydovchi' : '/kabinet');
    } catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {step === 'form' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2">Ro'yxatdan o'tish</h1>
              <p className="text-gray-400">GUZOR GO'ga qo'shiling</p>
            </div>
            <form onSubmit={handleRegister} className="card space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="Ism" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                <input className="input-field" placeholder="Familiya" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <input type="tel" className="input-field" placeholder="+998901234567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              <input type="password" className="input-field" placeholder="Parol (kamida 6 belgi)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium mb-2">Kim sifatida?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm({ ...form, role: 'PASSENGER' })} className={`p-3 rounded-xl border-2 transition ${form.role === 'PASSENGER' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-gray-700'}`}>
                    🧑 Yo'lovchi
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, role: 'DRIVER' })} className={`p-3 rounded-xl border-2 transition ${form.role === 'DRIVER' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-gray-700'}`}>
                    🚗 Haydovchi
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
              </button>
              <p className="text-center text-sm text-gray-400">
                Hisobingiz bormi? <Link to="/kirish" className="text-brand-yellow font-semibold">Kirish</Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2">SMS tasdiqlash</h1>
              <p className="text-gray-400">{form.phone} raqamiga yuborilgan 6 xonali kodni kiriting</p>
            </div>
            <form onSubmit={handleVerify} className="card space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
              {demoCode && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-xl text-sm">
                  Demo rejim: kod — <span className="font-mono font-bold">{demoCode}</span>
                </div>
              )}
              <input className="input-field text-center text-2xl font-mono tracking-widest" maxLength="6" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" required />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}