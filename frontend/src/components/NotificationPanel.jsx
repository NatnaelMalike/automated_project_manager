export default function NotificationPanel({ notifications, show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed top-16 right-8 w-80 bg-white rounded-xl shadow-lg z-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-100">Notifications</h4>
        <button className="text-xs text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
        ) : notifications.map((n) => (
          <div key={n.id} className={`px-4 py-3 text-sm ${n.read ? 'text-gray-400' : 'text-primary-600 font-semibold'}`}>{n.message}<br /><span className="text-xs text-gray-400">{n.time}</span></div>
        ))}
      </div>
    </div>
  );
}
