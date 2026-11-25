import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { getError } from '../services/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(phone, password);
      const role = data.user.role;
      nav(role === 'ADMIN' ? '/admin' : role === 'DRIVER' ? '/haydovchi' : '/kabinet');
    } catch (e) {
      setError(getError(e));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Xush kelibsiz!</h1>
          <p className="text-gray-400">GUZOR GO'ga kirish</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-2">Telefon raqami</label>
            <input type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998901234567" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Parol</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Hisobingiz yo'qmi? <Link to="/royxatdan-otish" className="text-brand-yellow font-semibold">Ro'yxatdan o'tish</Link>
          </p>
          <div className="border-t border-gray-800 pt-4 mt-4">
            <p className="text-xs text-gray-500 mb-2">Demo hisoblar:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button type="button" onClick={() => { setPhone('+998900000002'); setPassword('user123'); }} className="bg-brand-darker p-2 rounded-lg hover:bg-gray-800">Yo'lovchi</button>
              <button type="button" onClick={() => { setPhone('+998900000003'); setPassword('driver123'); }} className="bg-brand-darker p-2 rounded-lg hover:bg-gray-800">Haydovchi</button>
              <button type="button" onClick={() => { setPhone('+998900000001'); setPassword('admin123'); }} className="bg-brand-darker p-2 rounded-lg hover:bg-gray-800">Admin</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}