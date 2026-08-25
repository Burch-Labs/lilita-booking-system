import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhirjmihiuwcibkxhucu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaXJqbWloaXV3Y2lia3hodWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODgwOTcsImV4cCI6MjEwMzE2NDA5N30.fFlJUetgWfpEjblP_QpH3Zw8odsoKvLJ80wm9ISK7-k';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helper functions
export const signUp = async (email, password, propertyId) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Agent data functions
export const getAgentData = async (userId) => {
  const { data, error } = await supabase
    .from('agents')
    .select('*, properties(name, location, brand_color_primary, brand_color_secondary)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getAgentRates = async (propertyId) => {
  const { data, error } = await supabase
    .from('rates')
    .select('*')
    .eq('property_id', propertyId)
    .order('year', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAgentCommissionTiers = async (propertyId) => {
  const { data, error } = await supabase
    .from('commission_tiers')
    .select('*')
    .eq('property_id', propertyId)
    .order('min_nights', { ascending: true });

  if (error) throw error;
  return data;
};

export const getAgentBookings = async (agentId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
