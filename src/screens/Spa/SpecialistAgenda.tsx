import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { spaApi } from '../../services/spaApi';
import { useOperationStyles } from '../../theme/operationStyles';
import { Action, AppointmentCard, Feedback, rowStyle, SpaPage } from './shared';
import { useAgenda } from './useAgenda';

export function SpecialistAgenda({ token }: { token: string }) {
  const styles = useOperationStyles();
  const agenda = useAgenda(token);
  const [selected, setSelected] = useState<{ id: string; status: 'atendida' | 'no_asistio' }>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function update() {
    if (!selected || saving) return;
    setSaving(true);
    setError('');
    try {
      await spaApi(token).outcome(selected.id, selected.status);
      setSelected(undefined);
      await agenda.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SpaPage>
      <Feedback error={agenda.error || error} loading={agenda.loading} />
      {!agenda.loading && !agenda.appointments.length && <Text style={styles.text}>No tienes citas asignadas.</Text>}
      {agenda.appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment}>
          {appointment.status === 'confirmada' && appointment.startsAt <= agenda.now && (
            <View style={rowStyle}>
              {selected?.id === appointment.id ? (
                <>
                  <Action label={selected.status === 'atendida' ? 'Confirmar atención' : 'Confirmar ausencia'} onPress={update} disabled={saving} />
                  <Action label="Volver" onPress={() => setSelected(undefined)} secondary disabled={saving} />
                </>
              ) : (
                <>
                  <Action label="Marcar atendida" onPress={() => setSelected({ id: appointment.id, status: 'atendida' })} secondary />
                  <Action label="Registrar ausencia" onPress={() => setSelected({ id: appointment.id, status: 'no_asistio' })} secondary />
                </>
              )}
            </View>
          )}
        </AppointmentCard>
      ))}
    </SpaPage>
  );
}
