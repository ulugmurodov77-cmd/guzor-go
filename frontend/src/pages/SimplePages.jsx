export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-6">Biz haqimizda</h1>
      <div className="card space-y-4">
        <p className="text-lg">GUZOR GO — Qashqadaryo viloyati G'uzor tumani uchun yaratilgan zamonaviy raqamli ekotizim.</p>
        <p className="text-gray-400">Bizning maqsad — G'uzor aholisiga taksi, transport, yetkazib berish va mahalliy xizmatlarni bir platformada, oson va qulay tarzda taqdim etish.</p>
        <div className="grid md:grid-cols-3 gap-4 pt-6">
          <div><div className="text-3xl mb-2">🎯</div><h3 className="font-bold">Maqsad</h3><p className="text-sm text-gray-400">G'uzorda raqamli xizmatlarni rivojlantirish</p></div>
          <div><div className="text-3xl mb-2">💡</div><h3 className="font-bold">G'oya</h3><p className="text-sm text-gray-400">Mahalliy aholi uchun qulay platforma</p></div>
          <div><div className="text-3xl mb-2">🚀</div><h3 className="font-bold">Kelajak</h3><p className="text-sm text-gray-400">Butun viloyatga kengayish</p></div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-6">Aloqa</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card"><div className="text-3xl mb-2">📞</div><h3 className="font-bold">Telefon</h3><p className="text-brand-yellow">+998 90 000 00 01</p></div>
        <div className="card"><div className="text-3xl mb-2">✉️</div><h3 className="font-bold">Email</h3><p className="text-brand-yellow">info@guzorgo.uz</p></div>
        <div className="card"><div className="text-3xl mb-2">📍</div><h3 className="font-bold">Manzil</h3><p>G'uzor tumani, Qashqadaryo</p></div>
        <div className="card"><div className="text-3xl mb-2">💬</div><h3 className="font-bold">Telegram</h3><p className="text-brand-yellow">@guzorgo</p></div>
      </div>
    </div>
  );
}

export function BecomeDriverPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-6">Haydovchi bo'lish</h1>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">GUZOR GO'da haydovchi bo'ling!</h2>
        <ul className="space-y-3 text-gray-300">
          <li>✅ Kunlik, haftalik, oylik daromadni kuzating</li>
          <li>✅ O'zingiz vaqtingizni boshqaring</li>
          <li>✅ Qulay onlayn/oflayn tizimi</li>
          <li>✅ Faqat 15% komissiya</li>
          <li>✅ Tez to'lov tizimi</li>
        </ul>
        <div className="mt-6">
          <a href="/royxatdan-otish" className="btn-primary inline-block">Haydovchi bo'lib ro'yxatdan o'tish</a>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🚕</div>
        <h1 className="text-6xl font-black text-brand-yellow mb-2">404</h1>
        <p className="text-xl mb-6">Bu sahifa topilmadi</p>
        <a href="/" className="btn-primary inline-block">Bosh sahifaga qaytish</a>
      </div>
    </div>
  );
}