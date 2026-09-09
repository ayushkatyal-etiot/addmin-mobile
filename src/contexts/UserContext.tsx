import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Organisation, Branch, CurrentContext, UserState } from '../types/user';

const USER_KEY = 'user_data';

// Simple in-memory storage fallback for managed Expo
const memoryStorage: Record<string, string> = {};

interface UserContextType extends UserState {
  setUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
  getCurrentOrganisation: () => Organisation | null;
  getCurrentBranch: () => Branch | null;
  setCurrentContext: (context: CurrentContext) => Promise<void>;
  getOrganisations: () => Organisation[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({
    user: null,
    isLoading: true,
  });

  React.useEffect(() => {
    restoreUser();
  }, []);

  const restoreUser = async () => {
    try {
      const userData = memoryStorage[USER_KEY];
      if (userData) {
        const user = JSON.parse(userData) as User;
        setState({
          user,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
      setState({
        user: null,
        isLoading: false,
      });
    }
  };

  const setUser = async (user: User) => {
    try {
      memoryStorage[USER_KEY] = JSON.stringify(user);
      setState({
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  };

  const clearUser = async () => {
    try {
      delete memoryStorage[USER_KEY];
      setState({
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to clear user:', error);
      throw error;
    }
  };

  const getCurrentOrganisation = (): Organisation | null => {
    if (!state.user) return null;
    return (
      state.user.organisations.find((org) => org.id === state.user!.current_context.organisation_id) ||
      null
    );
  };

  const getCurrentBranch = (): Branch | null => {
    const currentOrg = getCurrentOrganisation();
    if (!currentOrg) return null;
    return (
      currentOrg.branches.find((branch) => branch.id === state.user!.current_context.branch_id) ||
      null
    );
  };

  const setCurrentContext = async (context: CurrentContext) => {
    if (!state.user) return;
    try {
      const updatedUser = {
        ...state.user,
        current_context: context,
      };
      memoryStorage[USER_KEY] = JSON.stringify(updatedUser);
      setState({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to set current context:', error);
      throw error;
    }
  };

  const getOrganisations = (): Organisation[] => {
    if (!state.user) return [];
    return state.user.organisations;
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        setUser,
        clearUser,
        getCurrentOrganisation,
        getCurrentBranch,
        setCurrentContext,
        getOrganisations,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
