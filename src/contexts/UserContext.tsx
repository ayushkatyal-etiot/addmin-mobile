import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Organisation, Branch, CurrentContext, UserState } from '../types/user';

const USER_KEY = 'user_data';
const CURRENT_CONTEXT_KEY = 'current_context';

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

  useEffect(() => {
    initializeUser();
  }, []);

  const restoreUser = async () => {
    try {
      const userData = memoryStorage[USER_KEY];
      if (userData) {
        const user = JSON.parse(userData) as User;

        try {
          const savedContext = await AsyncStorage.getItem(CURRENT_CONTEXT_KEY);
          if (savedContext) {
            const context = JSON.parse(savedContext) as CurrentContext;
            user.current_context = context;
            console.log('[UserContext] Restored saved context:', context);
          }
        } catch (storageError) {
          console.warn('AsyncStorage unavailable, using context from memory:', storageError);
        }

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

  const initializeUser = async () => {
    try {
      await restoreUser();
    } catch (error) {
      console.error('[UserContext] Init error:', error);
    }
  };

  const setUser = async (user: User) => {
    try {
      console.log('[UserContext.setUser] Called with:', { email: user.email, orgs: user.organisations.length, context: user.current_context });
      memoryStorage[USER_KEY] = JSON.stringify(user);
      try {
        await AsyncStorage.setItem(CURRENT_CONTEXT_KEY, JSON.stringify(user.current_context));
        console.log('[UserContext.setUser] Saved context to AsyncStorage:', user.current_context);
      } catch (storageError) {
        console.warn('AsyncStorage unavailable, using memory storage only:', storageError);
      }
      setState({
        user,
        isLoading: false,
      });
      console.log('[UserContext.setUser] State updated successfully');
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  };

  const clearUser = async () => {
    try {
      delete memoryStorage[USER_KEY];
      try {
        await AsyncStorage.removeItem(CURRENT_CONTEXT_KEY);
      } catch (storageError) {
        console.warn('AsyncStorage unavailable during logout:', storageError);
      }
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
    if (!state.user) {
      console.log('[UserContext.getCurrentOrganisation] No user');
      return null;
    }
    const result = state.user.organisations.find((org) => org.id === state.user!.current_context.organisation_id) || null;
    console.log('[UserContext.getCurrentOrganisation] Looking for:', state.user.current_context.organisation_id, 'Found:', result?.name);
    return result;
  };

  const getCurrentBranch = (): Branch | null => {
    const currentOrg = getCurrentOrganisation();
    if (!currentOrg) {
      console.log('[UserContext.getCurrentBranch] No current org');
      return null;
    }
    const result = currentOrg.branches.find((branch) => branch.id === state.user!.current_context.branch_id) || null;
    console.log('[UserContext.getCurrentBranch] Looking for:', state.user!.current_context.branch_id, 'Found:', result?.name);
    return result;
  };

  const setCurrentContext = async (context: CurrentContext) => {
    if (!state.user) return;
    try {
      const updatedUser = {
        ...state.user,
        current_context: context,
      };
      memoryStorage[USER_KEY] = JSON.stringify(updatedUser);
      try {
        await AsyncStorage.setItem(CURRENT_CONTEXT_KEY, JSON.stringify(context));
        console.log('[UserContext] Saved context to AsyncStorage:', context);
      } catch (storageError) {
        console.warn('AsyncStorage unavailable, using memory storage only:', storageError);
      }
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
