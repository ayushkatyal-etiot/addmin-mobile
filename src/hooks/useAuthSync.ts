import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

export function useAuthSync() {
  const { isAuthenticated } = useAuth();
  const { clearUser } = useUser();

  useEffect(() => {
    // Clear user data when user becomes unauthenticated
    if (!isAuthenticated) {
      clearUser().catch((error) => {
        console.error('Failed to clear user on auth change:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
}
