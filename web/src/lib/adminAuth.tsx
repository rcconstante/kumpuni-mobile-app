import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AdminAuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

async function checkIsAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[admin] isAdmin check failed:', error.message);
    return false;
  }
  return !!data;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setIsAdmin(await checkIsAdmin(data.session?.user.id));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setIsAdmin(await checkIsAdmin(nextSession?.user.id));
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const ok = await checkIsAdmin(data.user?.id);
    if (!ok) {
      await supabase.auth.signOut();
      throw new Error(
        'This account is not authorized to access the admin panel.'
      );
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAdmin,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}

/**
 * Convenience hook for admin pages: redirects to /admin if the user is not
 * authenticated or not in the admins table. Returns `loading` so pages can
 * render a spinner while the session is resolved.
 */
export function useRequireAdmin(): { ready: boolean; isAdmin: boolean } {
  const { loading, isAdmin } = useAdminAuth();
  useEffect(() => {
    if (!loading && !isAdmin) {
      window.location.replace('/admin');
    }
  }, [loading, isAdmin]);
  return { ready: !loading && isAdmin, isAdmin };
}
