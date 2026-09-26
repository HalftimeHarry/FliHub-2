import { useAuthStore } from './auth-store';

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  return {
    session,
    setSession,
    clearSession,
    isAuthenticated: Boolean(session?.token),
  };
}
