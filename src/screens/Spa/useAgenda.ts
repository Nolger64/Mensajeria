import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { spaApi, type Appointment, type SpaOptions } from '../../services/spaApi';

export function useAgenda(token: string, includeOptions = false) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [options, setOptions] = useState<SpaOptions>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now);

  const reload = useCallback(async () => {
    setLoading(true);
    const api = spaApi(token);
    try {
      const [list, nextOptions] = await Promise.all([
        api.appointments(), includeOptions ? api.options() : undefined,
      ]);
      setAppointments(list);
      if (nextOptions) setOptions(nextOptions);
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setLoading(false);
    }
  }, [includeOptions, token]);

  useFocusEffect(useCallback(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    void reload();
    return () => clearInterval(timer);
  }, [reload]));
  return { appointments, options, error, loading, reload, now };
}
