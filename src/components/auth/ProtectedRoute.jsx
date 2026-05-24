import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider.jsx';
import LoginPage from './LoginPage.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-slate-400 text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return children;
}
