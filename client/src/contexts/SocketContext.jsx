import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io as ioClient } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

    const newSocket = ioClient(baseUrl, {
      auth: { token },
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

export default SocketContext;
