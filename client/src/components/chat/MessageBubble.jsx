export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
          isOwn
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
        }`}
      >
        <p>{message.text}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOwn && message.readAt ? ' · Read' : ''}
        </p>
      </div>
    </div>
  );
}
