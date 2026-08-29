import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import chatService from '../../services/chat.service';
import ChatWindow from '../../components/chat/ChatWindow';
import Loader from '../../components/common/Loader';

function SidebarAvatar({ user, size = 40 }) {
  if (user?.avatar?.url) {
    return (
      <img src={user.avatar.url} alt={user.name}
        style={{ height: size, width: size, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      height: size, width: size, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg, #e8673a, #c94d1a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff',
    }}>
      {user?.name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function formatPreviewTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Chat() {
  const location = useLocation();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [search, setSearch] = useState('');

  const loadConversations = useCallback(() => {
    chatService.getConversations().then((convs) => {
      const data = convs.conversations || convs || [];
      setConversations(data);

      const incomingId  = location.state?.otherUserId;
      const incomingUser = location.state?.otherUser;

      if (incomingId) {
        const existing = data.find(
          (c) => c.otherUser?._id?.toString() === incomingId?.toString()
        );
        setActiveUser(existing?.otherUser || incomingUser || { _id: incomingId, name: 'User' });
      } else if (data.length > 0) {
        setActiveUser((prev) => prev || data[0].otherUser);
      }
    }).finally(() => setLoading(false));
  }, [location.state]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadConversations();
    socket.on('message:new', handler);
    return () => socket.off('message:new', handler);
  }, [socket, loadConversations]);

  const filtered = conversations.filter((c) =>
    c.otherUser?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#030303] pt-32 flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#030303] pt-24 md:pt-32 pb-8 px-2 sm:px-4 flex justify-center w-full max-w-[100vw] overflow-x-hidden transition-colors duration-300">
      <div className="flex w-full max-w-[1200px] h-[calc(100vh-140px)] min-h-[450px] bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/[0.07] rounded-[20px] overflow-hidden shadow-2xl transition-colors duration-300">
        
        {/* ── Sidebar ── */}
        <div className={`w-full md:w-[280px] flex-shrink-0 border-r border-zinc-200 dark:border-white/[0.06] flex flex-col bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300 ${activeUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 md:p-[20px_16px_14px] border-b border-zinc-200 dark:border-white/[0.05]">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white m-0 mb-1">Messages</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 m-0">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>

            <div className="relative mt-3 bg-zinc-200/60 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/[0.07] rounded-xl overflow-hidden">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent py-2 pl-9 pr-3 text-xs text-zinc-900 dark:text-white border-none outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {search ? 'No results' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const isActive = activeUser?._id?.toString() === c.otherUser?._id?.toString();
                return (
                  <button
                    key={c.conversationId}
                    onClick={() => setActiveUser(c.otherUser)}
                    className={`w-full text-left flex items-center gap-2.5 px-3.5 py-3 transition-all border-b border-zinc-200 dark:border-white/[0.04] ${
                      isActive 
                        ? 'bg-orange-500/10 border-l-2 border-l-orange-500' 
                        : 'hover:bg-zinc-200/50 dark:hover:bg-white/[0.03] bg-transparent border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <SidebarAvatar user={c.otherUser} size={40} />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a0a0a]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-zinc-900 dark:text-white truncate flex-1">
                          {c.otherUser?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0 ml-1.5">
                          {formatPreviewTime(c.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex-1 m-0">
                          {c.lastMessage?.text || 'Start a conversation'}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="text-[10px] font-extrabold bg-orange-500 text-white rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shrink-0 ml-1.5">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className={`flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0d0d0d] transition-colors duration-300 ${activeUser ? 'flex' : 'hidden md:flex'}`}>
          {activeUser ? (
            <div className="flex flex-col h-full w-full relative">
              {/* Mobile Back Button Bar */}
              <div className="md:hidden flex items-center px-4 py-2.5 bg-zinc-100 dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-white/[0.06]">
                <button 
                  onClick={() => setActiveUser(null)} 
                  className="flex items-center gap-2 text-xs font-bold text-orange-500 py-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Messages
                </button>
              </div>
              <div className="flex-1 min-h-0 relative flex flex-col w-full">
                <ChatWindow otherUser={activeUser} currentUser={user} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3.5 p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-zinc-900 dark:text-white m-0">Your messages</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
