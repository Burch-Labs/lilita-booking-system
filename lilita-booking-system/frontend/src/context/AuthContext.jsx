import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getSession } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
          // Fetch agent data
          const { data } = await supabase
            .from('agents')
            .select('*, properties(*)')
            .eq('id', session.user.id)
            .single();
          setAgent(data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from('agents')
            .select('*, properties(*)')
            .eq('id', session.user.id)
            .single();
          setAgent(data);
        } else {
          setUser(null);
          setAgent(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, agent, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
