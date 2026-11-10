import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';
import { Profile, ShippingAddress } from '../types/database';
import { fetchProfile, saveProfile } from '../lib/dataService';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfileAddress: (address: ShippingAddress) => Promise<void>;
  updateFullName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'atelier_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isLiveSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const mappedUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata,
            };
            setUser(mappedUser);
            const prof = await fetchProfile(mappedUser.id);
            if (prof && mounted) setProfile(prof);
          }
        } catch (e) {
          console.warn('Supabase getSession error:', e);
        }

        // Global onAuthStateChange listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (!mounted) return;
            if (session?.user) {
              const mappedUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                user_metadata: session.user.user_metadata,
              };
              setUser(mappedUser);
              const prof = await fetchProfile(mappedUser.id);
              if (mounted) setProfile(prof);
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        );

        if (mounted) setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Fallback local auth state
        const stored = localStorage.getItem(LOCAL_USER_KEY);
        if (stored) {
          try {
            const u = JSON.parse(stored);
            setUser(u);
            const prof = await fetchProfile(u.id);
            setProfile(prof || {
              id: u.id,
              full_name: u.user_metadata?.full_name || 'Design Studio Member',
              shipping_address: null,
              phone: null,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch (e) {
            console.warn('Error reading stored local user', e);
          }
        }
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password = 'password123') => {
    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const mappedUser: User = {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata,
          };
          setUser(mappedUser);
          const prof = await fetchProfile(mappedUser.id);
          setProfile(prof);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local simulated auth
    const id = 'usr_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
    const fallbackUser: User = {
      id,
      email,
      user_metadata: {
        full_name: email.split('@')[0].toUpperCase(),
      },
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
    setUser(fallbackUser);

    let prof = await fetchProfile(id);
    if (!prof) {
      prof = {
        id,
        full_name: email.split('@')[0],
        shipping_address: null,
        phone: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await saveProfile(prof);
    }
    setProfile(prof);

    return { success: true };
  };

  const signUp = async (email: string, password = 'password123', fullName = 'Design Partner') => {
    if (isLiveSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const mappedUser: User = {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: { full_name: fullName },
          };
          setUser(mappedUser);
          const newProf: Profile = {
            id: data.user.id,
            full_name: fullName,
            shipping_address: null,
            phone: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await saveProfile(newProf);
          setProfile(newProf);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return signIn(email, password);
  };

  const signOut = async () => {
    if (isLiveSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    setProfile(null);
  };

  const updateProfileAddress = async (address: ShippingAddress) => {
    if (!user) return;
    const updated: Profile = {
      ...(profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        phone: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      }),
      shipping_address: address,
      updated_at: new Date().toISOString(),
    };
    await saveProfile(updated);
    setProfile(updated);
  };

  const updateFullName = async (name: string) => {
    if (!user) return;
    const updated: Profile = {
      ...(profile || {
        id: user.id,
        shipping_address: null,
        phone: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      }),
      full_name: name,
      updated_at: new Date().toISOString(),
    };
    await saveProfile(updated);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfileAddress,
        updateFullName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
