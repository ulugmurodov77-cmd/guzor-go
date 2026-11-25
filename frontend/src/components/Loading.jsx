export default function Loading({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-brand-card border-t-brand-yellow rounded-full animate-spin"></div>
      <p className="text-gray-400 mt-4">{text}</p>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && <p className="text-gray-400">{description}</p>}
    </div>
  );
}