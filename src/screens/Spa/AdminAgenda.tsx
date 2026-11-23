import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatOrderAmount } from '../../services/orderDisplay';
import { spaApi, type AppointmentStatus, type Treatment } from '../../services/spaApi';
import { useOperationStyles } from '../../theme/operationStyles';
import { Action, AppointmentCard, Choice, Feedback, Field, rowStyle, SpaPage } from './shared';
import { useAgenda } from './useAgenda';
import { AdminSchedule } from './AdminSchedule';
import { AdminTeam } from './AdminTeam';

const sections = ['Citas', 'Horarios', 'Tratamientos', 'Equipo'] as const;
const emptyTreatment = { name: '', description: '', minutes: '60', price: '' };

export function AdminAgenda({ token }: { token: string }) {
  const styles = useOperationStyles();
  const agenda = useAgenda(token, true);
  const { seccion } = useLocalSearchParams<{ seccion?: string }>();
  const section = sections.find((entry) => entry === seccion) ?? 'Citas';
  const [onlyActive, setOnlyActive] = useState(true);
  const [treatment, setTreatment] = useState(emptyTreatment);
  const [editing, setEditing] = useState<Treatment>();
  const [pendingAction, setPendingAction] = useState<{ id: string; status: Exclude<AppointmentStatus, 'confirmada'> }>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const api = spaApi(token);
  const { services = [] } = agenda.options ?? {};
  const appointments = onlyActive ? agenda.appointments.filter((entry) => entry.status === 'confirmada') : agenda.appointments;

  async function run(action: () => Promise<unknown>, message: string, after?: () => void) {
    if (saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action();
      after?.();
      setNotice(message);
      await agenda.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function saveTreatment() {
    if (!/^\d+$/.test(treatment.minutes) || !/^\d+$/.test(treatment.price)) {
      setError('Ingresa una duración y un precio en pesos, sin puntos ni comas.');
      return;
    }
    void run(() => api.saveTreatment({
      name: treatment.name,
      description: treatment.description,
      durationMinutes: Number(treatment.minutes),
      price: Number(treatment.price),
      active: editing?.active ?? true,
    }, editing?.id), 'Tratamiento guardado.', () => {
      setEditing(undefined);
      setTreatment(emptyTreatment);
    });
  }

  return (
    <SpaPage>
      <View style={rowStyle}>
        {sections.map((item) => <Choice key={item} selected={section === item} disabled={saving}
          onPress={() => { router.setParams({ seccion: item }); setError(''); setNotice(''); }}>{item}</Choice>)}
      </View>
      <Feedback error={agenda.error || error} notice={notice} loading={agenda.loading} />
      {section === 'Citas' && (
        <>
          <Text style={styles.title}>Agenda de la cadena</Text>
          <View style={rowStyle}>
            <Choice selected={onlyActive} onPress={() => setOnlyActive(true)}>Confirmadas</Choice>
            <Choice selected={!onlyActive} onPress={() => setOnlyActive(false)}>Todas</Choice>
            <Action label="Actualizar" secondary onPress={agenda.reload} />
          </View>
          {!agenda.loading && !appointments.length && <Text style={styles.text}>No hay citas en esta vista.</Text>}
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment}>
              {appointment.status === 'confirmada' && (
                <View style={rowStyle}>
                  {pendingAction?.id === appointment.id ? (
                    <>
                      <Action label="Confirmar cambio" disabled={saving} onPress={() => {
                        const { id, status } = pendingAction;
                        void run(() => status === 'cancelada' ? api.cancel(id) : api.outcome(id, status),
                          'Cita actualizada.', () => setPendingAction(undefined));
                      }} />
                      <Action label="Conservar estado" onPress={() => setPendingAction(undefined)} secondary />
                    </>
                  ) : appointment.startsAt > agenda.now ? (
                    <Action label="Cancelar cita" onPress={() => setPendingAction({ id: appointment.id, status: 'cancelada' })} secondary />
                  ) : (
                    <>
                      <Action label="Marcar atendida" onPress={() => setPendingAction({ id: appointment.id, status: 'atendida' })} secondary />
                      <Action label="Registrar ausencia" onPress={() => setPendingAction({ id: appointment.id, status: 'no_asistio' })} secondary />
                    </>
                  )}
                </View>
              )}
            </AppointmentCard>
          ))}
        </>
      )}
      {section === 'Tratamientos' && (
        <>
          <View style={styles.card}>
            <Text style={styles.heading}>{editing ? 'Editar tratamiento' : 'Nuevo tratamiento'}</Text>
            <Field label="Nombre del tratamiento" value={treatment.name} onChangeText={(name) => setTreatment({ ...treatment, name })} />
            <Field label="Descripción" value={treatment.description} onChangeText={(description) => setTreatment({ ...treatment, description })} multiline />
            <Field label="Duración en minutos, en intervalos de 15" keyboardType="number-pad"
              value={treatment.minutes} onChangeText={(minutes) => setTreatment({ ...treatment, minutes })} />
            <Field label="Precio en COP" keyboardType="number-pad" value={treatment.price}
              onChangeText={(price) => setTreatment({ ...treatment, price })} />
            <View style={rowStyle}>
              <Action label="Guardar tratamiento" disabled={saving} onPress={saveTreatment} />
              {editing && <Action label="Salir de edición" secondary onPress={() => {
                setEditing(undefined);
                setTreatment(emptyTreatment);
              }} />}
            </View>
          </View>
          {services.map((service) => (
            <View key={service.id} style={styles.card}>
              <Text style={styles.heading}>{service.name} · {service.active ? 'Publicado' : 'Oculto'}</Text>
              <Text style={styles.text}>{service.durationMinutes} min · {formatOrderAmount(service.price)}</Text>
              <View style={rowStyle}>
                <Action label="Editar" secondary disabled={saving} onPress={() => {
                  setEditing(service);
                  setTreatment({
                    name: service.name, description: service.description,
                    minutes: String(service.durationMinutes), price: String(service.price),
                  });
                }} />
                <Action label={service.active ? 'Ocultar' : 'Publicar'} secondary disabled={saving}
                  onPress={() => run(() => api.saveTreatment({ ...service, active: !service.active }, service.id),
                    'Disponibilidad del tratamiento actualizada.', () => {
                      if (editing?.id === service.id) setEditing({ ...service, active: !service.active });
                    })} />
              </View>
            </View>
          ))}
        </>
      )}
      {section === 'Horarios' && (
        <AdminSchedule token={token} options={agenda.options} saving={saving} error={error} run={run} />
      )}
      {section === 'Equipo' && <AdminTeam token={token} onChanged={agenda.reload} />}
    </SpaPage>
  );
}
