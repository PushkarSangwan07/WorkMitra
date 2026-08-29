import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import chatService from '../../services/chat.service';

const toStr = (id) => id?.toString?.() ?? '';

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByDate(messages) {
  return messages.reduce((acc, m) => {
    const key = new Date(m.createdAt).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});
}

function Avatar({ user, size = 32 }) {
  if (user?.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt={user?.name}
        style={{ height: size, width: size, borderRadius: Math.round(size * 0.28), objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      height: size, width: size, borderRadius: Math.round(size * 0.28), flexShrink: 0,
      background: 'linear-gradient(135deg,#e8673a,#c94d1a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 800, color: '#fff',
    }}>
      {user?.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function ChatWindow({ otherUser, currentUser }) {
  const { socket } = useSocket();
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [sending, setSending]     = useState(false);
  const [isTyping, setIsTyping]   = useState(false);
  const typingTimer               = useRef(null);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const isMine = useCallback((msg) => {
    const senderId = toStr(msg.sender?._id ?? msg.sender?.id ?? msg.sender);
    const myId     = toStr(currentUser?._id ?? currentUser?.id); // <--- Fix applied here
    return !!myId && senderId === myId;
  }, [currentUser]);

  useEffect(() => {
    if (!otherUser?._id) return;
    setLoading(true);
    setMessages([]);
    chatService.getMessages(otherUser._id)
      .then((data) => {
        setMessages(data.messages ?? []);
        setTimeout(() => scrollToBottom(false), 50);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [otherUser?._id, scrollToBottom]);

  useEffect(() => {
    if (!socket || !otherUser?._id) return;
    const otherId = toStr(otherUser._id);

    const onMessageNew = (msg) => {
      const senderId = toStr(msg.sender?._id ?? msg.sender);
      if (senderId !== otherId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => toStr(m._id) === toStr(msg._id));
        if (exists) return prev;
        return [...prev, msg];
      });
      setTimeout(() => scrollToBottom(), 60);
      socket.emit('message:read', { otherUserId: otherUser._id });
    };

    const onTypingStart = ({ userId }) => {
      if (toStr(userId) === otherId) setIsTyping(true);
    };

    const onTypingStop = ({ userId }) => {
      if (toStr(userId) === otherId) setIsTyping(false);
    };

    socket.on('message:new',    onMessageNew);
    socket.on('typing:start',   onTypingStart);
    socket.on('typing:stop',    onTypingStop);

    return () => {
      socket.off('message:new',  onMessageNew);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop',  onTypingStop);
    };
  }, [socket, otherUser?._id, scrollToBottom]);

  const handleInput = (e) => {
    setText(e.target.value);
    if (!socket || !otherUser?._id) return;

    socket.emit('typing:start', { receiverId: toStr(otherUser._id) });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { receiverId: toStr(otherUser._id) });
    }, 1500);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socket?.emit('typing:stop', { receiverId: toStr(otherUser._id) });

    const tempId = `tmp_${Date.now()}`;
    const optimistic = {
      _id:       tempId,
      sender:    currentUser,
      receiver:  otherUser,
      text:      trimmed,
      createdAt: new Date().toISOString(),
      _pending:  true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(), 60);

    try {
      if (socket) {
        socket.emit('message:send', { receiverId: toStr(otherUser._id), text: trimmed },
          (ack) => {
            if (ack?.success && ack.message) {
              setMessages((prev) => prev.map((m) => m._id === tempId ? ack.message : m));
            } else if (ack?.error) {
              setMessages((prev) => prev.filter((m) => m._id !== tempId));
              setText(trimmed);
            }
          }
        );
      } else {
        const saved = await chatService.sendMessage(toStr(otherUser._id), trimmed);
        setMessages((prev) => prev.map((m) => m._id === tempId ? saved : m));
      }
    } catch (err) {
      console.error('[ChatWindow] send error', err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const grouped = groupByDate(messages);

 return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0d0d0d] transition-colors duration-300">
      {/* Header */}
      <div className="px-4 md:px-5 py-3.5 shrink-0 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#0a0a0a] flex items-center gap-3 transition-colors duration-300">
        <div className="relative">
          <Avatar user={otherUser} size={40} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a0a0a]" />
        </div>
        <div>
          <p className="m-0 text-sm font-bold text-zinc-900 dark:text-white">{otherUser?.name ?? 'Unknown'}</p>
          <p className={`m-0 text-[11px] mt-0.5 transition-colors duration-200 ${isTyping ? 'text-emerald-500 font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}>
            {isTyping ? 'typing…' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 pt-4 pb-2 flex flex-col">
        {loading && (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-[cw-spin_.8s_linear_infinite]" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white m-0">Say hello to {otherUser?.name?.split(' ')[0]}!</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 m-0">No messages yet</p>
          </div>
        )}

        {!loading && Object.entries(grouped).map(([dateKey, msgs]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-2.5 my-3.5">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-white/[0.06]" />
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold">{formatDate(msgs[0].createdAt)}</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-white/[0.06]" />
            </div>

            {msgs.map((msg, i) => {
              const mine   = isMine(msg);
              const prevMine = i > 0 ? isMine(msgs[i - 1]) : null;
              const isGrouped  = i > 0 && prevMine === mine;

              return (
                <div key={msg._id} className={`flex ${mine ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 ${isGrouped ? 'mt-1' : 'mt-3.5'}`}>
                  <div className="w-8 shrink-0">
                    {!mine && !isGrouped && <Avatar user={otherUser} size={32} />}
                  </div>

                  <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} max-w-[65%]`}>
                    {!mine && !isGrouped && (
                      <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 m-[0_0_4px_2px]">
                        {otherUser?.name}
                      </p>
                    )}
                    <div className={`p-[10px_14px] transition-opacity duration-200 ${
                      mine 
                        ? 'rounded-[14px_4px_14px_14px] bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
                        : 'rounded-[4px_14px_14px_14px] bg-zinc-100 dark:bg-[#1c1c1c] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.07]'
                    } ${msg._pending ? 'opacity-65' : 'opacity-100'}`}>
                      <p className="text-sm leading-relaxed m-0 break-words">
                        {msg.text}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 mt-0.5 px-0.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{formatTime(msg.createdAt)}</span>
                      {mine && (
                        <svg className={`w-3 h-3 ${msg._pending ? 'text-zinc-400 dark:text-zinc-600' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 mt-3">
            <Avatar user={otherUser} size={32} />
            <div className="p-[12px_16px] bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-white/[0.07] rounded-[4px_14px_14px_4px] flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-[cw-dot_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-2.5 md:p-[10px_14px] shrink-0 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300">
        <div
          className="flex gap-2 items-end bg-white dark:bg-[#141414] border border-zinc-300 dark:border-white/[0.08] rounded-2xl p-1 pl-3.5 transition-colors duration-200 focus-within:border-orange-500/60 shadow-sm"
        >
          <textarea
            ref={inputRef} value={text} onChange={handleInput} onKeyDown={onKeyDown}
            placeholder={`Message ${otherUser?.name?.split(' ')[0] ?? ''}…`} rows={1}
            className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-white text-sm leading-normal resize-none py-2.5 max-h-[120px] overflow-y-auto font-inherit placeholder:text-zinc-400"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={send} disabled={!text.trim() || sending}
            className={`w-10 h-10 rounded-xl shrink-0 border-none flex items-center justify-center transition-all ${
              text.trim() && !sending 
                ? 'cursor-pointer bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 hover:scale-105 active:scale-95' 
                : 'cursor-not-allowed bg-zinc-200 dark:bg-white/[0.06] text-zinc-400 dark:text-zinc-600'
            }`}
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-[cw-spin_.8s_linear_infinite]" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center m-[6px_0_0]">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes cw-spin { to { transform: rotate(360deg); } }
        @keyframes cw-dot {
          0%,60%,100% { transform: translateY(0); opacity:.4; }
          30%         { transform: translateY(-4px); opacity:1; }
        }
      `}</style>
    </div>
  );
}

