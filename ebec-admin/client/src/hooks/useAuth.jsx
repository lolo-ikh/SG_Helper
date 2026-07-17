import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(p => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const VP_EMAIL = 'leena.ikhlef@ensia.edu.dz';
  const APPROVED_EMAILS = [
    'leena.ikhlef@ensia.edu.dz',
    'oussama.bouzaine@ensia.edu.dz',
    'ileena1618@gmail.com',
    'aya.hoggas@ensia.edu.dz',
    'dorsaf.messaoudi@ensia.edu.dz',
  ];

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const role = email.toLowerCase() === VP_EMAIL ? 'vp' : 'manager';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isVP = profile?.role === 'vp' || profile?.role === 'admin' || user?.email?.toLowerCase() === VP_EMAIL;
  const isManager = profile?.role === 'manager' || isVP;
  const isApproved = isVP || APPROVED_EMAILS.includes(user?.email?.toLowerCase());
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, profile, loading, signIn, signUp, signOut,
      isVP, isManager, isApproved, isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
