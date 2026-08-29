import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Toaster richColors position="top-center" expand={true} />
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
