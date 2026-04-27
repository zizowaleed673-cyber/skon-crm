import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase.js';

/**
 * Loads all leads and keeps them live-synced via Supabase realtime.
 * Any insert / update / delete made by you or your partner shows up
 * everywhere within ~200ms — no refresh needed.
 */
export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('date_received', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setLeads(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          setLeads((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.find((l) => l.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((l) => (l.id === payload.new.id ? payload.new : l));
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((l) => l.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const createLead = async (lead) => {
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) throw error;
    return data;
  };

  const updateLead = async (id, patch) => {
    const { data, error } = await supabase
      .from('leads')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const deleteLead = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  };

  return { leads, loading, error, refetch: fetchAll, createLead, updateLead, deleteLead };
}
