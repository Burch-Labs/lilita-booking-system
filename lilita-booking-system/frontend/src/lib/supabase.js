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

// Phase 2: Support Tickets
export const createSupportTicket = async (propertyId, agentId, ticketData) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{
      property_id: propertyId,
      agent_id: agentId,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || 'normal',
      status: 'open'
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getAgentTickets = async (agentId) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Phase 2: Block Bookings
export const createBlockBooking = async (propertyId, agentId, blockData) => {
  const nights = Math.floor((new Date(blockData.end_date) - new Date(blockData.start_date)) / (1000 * 60 * 60 * 24));

  const { data, error } = await supabase
    .from('block_bookings')
    .insert([{
      property_id: propertyId,
      agent_id: agentId,
      block_name: blockData.block_name,
      start_date: blockData.start_date,
      end_date: blockData.end_date,
      num_nights: nights,
      rate_id: blockData.rate_id,
      total_value: blockData.total_value || 0,
      status: 'pending'
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getAgentBlockBookings = async (agentId) => {
  const { data, error } = await supabase
    .from('block_bookings')
    .select('*')
    .eq('agent_id', agentId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Phase 2: Confirmation Letters
export const generateConfirmationLetter = async (bookingId) => {
  const ref = `CONF${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('confirmation_letters')
    .insert([{
      booking_id: bookingId,
      reference_number: ref,
      pdf_url: `/confirmations/${ref}.pdf`
    }])
    .select();

  if (error) throw error;
  return data[0];
};
