import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export function useRealtime<T>({ table, filter, event = '*' }: UseRealtimeOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select('*');
        
        if (filter) {
          // Apply filter if provided
          const [column, operator, value] = filter.split(':');
          query = query.filter(column, operator, value);
        }

        const { data: initialData, error: fetchError } = await query;
        
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(initialData || []);
        }
        
        setLoading(false);

        // Setup realtime subscription
        channel = supabase
          .channel(`realtime:${table}`)
          .on(
            'postgres_changes' as any,
            {
              event,
              schema: 'public',
              table,
              filter: filter ? filter.replace(':', '=') : undefined,
            },
            (payload: any) => {
              console.log(`📡 Realtime ${payload.eventType} on ${table}:`, payload);
              
              switch (payload.eventType) {
                case 'INSERT':
                  setData(prev => [...prev, payload.new as T]);
                  break;
                case 'UPDATE':
                  setData(prev => 
                    prev.map(item => 
                      (item as any).id === (payload.new as any).id 
                        ? payload.new as T 
                        : item
                    )
                  );
                  break;
                case 'DELETE':
                  setData(prev => 
                    prev.filter(item => (item as any).id !== (payload.old as any).id)
                  );
                  break;
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`✅ Realtime subscription active for ${table}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.error(`❌ Realtime subscription error for ${table}`);
              setError('Realtime subscription failed');
            }
          });

      } catch (err) {
        console.error('Realtime setup error:', err);
        setError('Failed to setup realtime connection');
        setLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log(`🔌 Disconnected from ${table} realtime`);
      }
    };
  }, [table, filter, event]);

  const refetch = async () => {
    setLoading(true);
    try {
      let query = supabase.from(table).select('*');
      
      if (filter) {
        const [column, operator, value] = filter.split(':');
        query = query.filter(column, operator, value);
      }

      const { data: newData, error: fetchError } = await query;
      
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setData(newData || []);
      }
    } catch (err) {
      setError('Failed to refetch data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch
  };
}
