import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCrud(tableName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    let query = supabase.from(tableName).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
    const { data: result, error: err } = await query.order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      console.error(`Fetch ${tableName} failed:`, err.message);
    } else {
      setData(result || []);
    }
    setLoading(false);
    return result || [];
  }, [tableName]);

  const insert = async (record) => {
    setLoading(true);
    setError(null);
    const { data: result, error: err } = await supabase
      .from(tableName)
      .insert([record])
      .select();
    if (err) {
      setError(err.message);
      console.error(`Insert ${tableName} failed:`, err.message);
      setLoading(false);
      return null;
    }
    setData(prev => [result[0], ...prev]);
    setLoading(false);
    return result[0];
  };

  const update = async (id, updates) => {
    setLoading(true);
    setError(null);
    const { data: result, error: err } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();
    if (err) {
      setError(err.message);
      console.error(`Update ${tableName} failed:`, err.message);
      setLoading(false);
      return null;
    }
    setData(prev => prev.map(item => item.id === id ? result[0] : item));
    setLoading(false);
    return result[0];
  };

  const remove = async (id) => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      console.error(`Delete ${tableName} failed:`, err.message);
      setLoading(false);
      return false;
    }
    setData(prev => prev.filter(item => item.id !== id));
    setLoading(false);
    return true;
  };

  return { data, setData, loading, error, fetchAll, insert, update, remove };
}
