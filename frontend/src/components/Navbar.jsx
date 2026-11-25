import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-brand-darker/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center font-black text-brand-darker text-xl">G</div>
          <span className="text-xl font-black">GUZOR <span className="text-brand-yellow">GO</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-brand-yellow transition">Bosh sahifa</Link>
          <Link to="/taksi" className="hover:text-brand-yellow transition">Taksi chaqirish</Link>
          <Link to="/haydovchi-bolish" className="hover:text-brand-yellow transition">Haydovchi bo'lish</Link>
          <Link to="/biz-haqimizda" className="hover:text-brand-yellow transition">Biz haqimizda</Link>
          <Link to="/aloqa" className="hover:text-brand-yellow transition">Aloqa</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/haydovchi' : '/kabinet'} className="btn-secondary !px-4 !py-2 text-sm">
                Kabinet
              </Link>
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 px-3 py-2">Chiqish</button>
            </>
          ) : (
            <>
              <Link to="/kirish" className="text-sm px-4 py-2 hover:text-brand-yellow">Kirish</Link>
              <Link to="/royxatdan-otish" className="btn-primary !px-4 !py-2 text-sm">Ro'yxatdan o'tish</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}