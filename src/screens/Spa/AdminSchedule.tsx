import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { spaApi, spaDayLabel, spaTime, spaTimeInput, type SessionInput, type SpaOptions, type SpaSession, type WindowInput } from '../../services/spaApi';
import { useOperationStyles } from '../../theme/operationStyles';
import { Action, Choice, Feedback, Field, rowStyle } from './shared';

interface ScheduleDraft extends Omit<SessionInput, 'assignments'> {
  specialistIds: string[];
  serviceIds: string[];
}

const emptySchedule: ScheduleDraft = {
  branchId: '', name: '', startDate: '', endDate: '', start: '', end: '', specialistIds: [], serviceIds: [],
};
const presets = [
  { name: 'Mañana', start: '08:00', end: '12:00' },
  { name: 'Tarde', start: '14:00', end: '18:00' },
];

function wallClockMinutes(value: string) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function workingMinutes(start: string, end: string) {
  const first = wallClockMinutes(start);
  const last = wallClockMinutes(end);
  return first == null || last == null ? 0 : Math.max(0, last - first);
}

type BookingType = NonNullable<SpaOptions>['services'][number] | NonNullable<SpaOptions>['firstVisit'];

function BookingTypes({ items, selected, onSelect, minutes, disabled }: {
  items: BookingType[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  minutes: number;
  disabled: boolean;
}) {
  const styles = useOperationStyles();
  return (
    <>
      <Text style={styles.heading}>Tratamientos del horario</Text>
      <View style={rowStyle}>
        {items.map((item) => {
          const chosen = selected.includes(item.id);
          return (
            <Choice key={item.id} selected={chosen}
              disabled={disabled || (!chosen && minutes > 0 && item.durationMinutes > minutes)}
              onPress={() => onSelect(chosen ? selected.filter((id) => id !== item.id) : [...selected, item.id])}>
              {item.name} · {item.durationMinutes} min
            </Choice>
          );
        })}
      </View>
    </>
  );
}

interface Props {
  token: string;
  options?: SpaOptions;
  saving: boolean;
  error?: string;
  run: (action: () => Promise<unknown>, message: string, after?: () => void) => Promise<void>;
}

export function AdminSchedule({ token, options, saving, error, run }: Props) {
  const styles = useOperationStyles();
  const [branchFilter, setBranchFilter] = useState('');
  const [draft, setDraft] = useState<ScheduleDraft>();
  const [selectedId, setSelectedId] = useState('');
  const [allocation, setAllocation] = useState<WindowInput>();
  const [removal, setRemoval] = useState<{ id: string; kind: 'session' | 'window' }>();

  const { branches = [], sessions = [], services = [], specialists = [], windows = [], firstVisit } = options ?? {};
  const treatments = services.filter((service) => service.active);
  const bookingTypes = firstVisit ? [...treatments, firstVisit] : treatments;
  const consultationFallback = treatments.length === 0 && firstVisit ? [firstVisit.id] : [];
  const visibleSessions = sessions.filter((entry) => !branchFilter || entry.branchId === branchFilter);
  const selected = visibleSessions.find((entry) => entry.id === selectedId);
  const assigned = windows.filter((window) => window.sessionId === selected?.id);
  const api = spaApi(token);

  function select(session: SpaSession) {
    setSelectedId(session.id);
    setAllocation(undefined);
    setRemoval(undefined);
  }

  function addSpecialist(session: SpaSession) {
    setAllocation({
      sessionId: session.id, specialistId: '', serviceIds: consultationFallback,
      start: spaTimeInput(session.startsAt), end: spaTimeInput(session.endsAt),
    });
    setRemoval(undefined);
  }

  const minutes = draft ? workingMinutes(draft.start, draft.end) : 0;
  const selectedTypes = bookingTypes.filter((item) => draft?.serviceIds.includes(item.id));
  const validTypes = selectedTypes.length > 0 && selectedTypes.every((item) => item.durationMinutes <= minutes);

  return (
    <>
      <Text style={styles.title}>Horarios de especialistas</Text>
      <Text style={styles.text}>Publica un intervalo de trabajo. La agenda genera las horas de cita según la duración de cada tratamiento.</Text>
      <View style={rowStyle}>
        <Choice selected={!branchFilter} disabled={saving} onPress={() => setBranchFilter('')}>Todas las sedes</Choice>
        {branches.map((branch) => <Choice key={branch.id} selected={branchFilter === branch.id}
          disabled={saving} onPress={() => setBranchFilter(branch.id)}>{branch.name}</Choice>)}
      </View>
      {!draft && <Action label="Nuevo horario" disabled={saving} onPress={() => setDraft({
        ...emptySchedule, serviceIds: consultationFallback,
        branchId: branches.find((branch) => branch.id === branchFilter && branch.active)?.id ?? '',
      })} />}
      {draft && (
        <View style={styles.card}>
          <Text style={styles.heading}>Nuevo horario</Text>
          <View style={rowStyle}>
            {branches.filter((branch) => branch.active).map((branch) => (
              <Choice key={branch.id} selected={draft.branchId === branch.id} disabled={saving}
                onPress={() => setDraft({ ...draft, branchId: branch.id })}>{branch.name}</Choice>
            ))}
          </View>
          <BookingTypes items={bookingTypes} selected={draft.serviceIds} minutes={minutes} disabled={saving}
            onSelect={(serviceIds) => setDraft({ ...draft, serviceIds })} />
          <Text style={styles.heading}>Especialistas que atienden este horario</Text>
          {!specialists.length && <Text style={styles.text}>Agrega un especialista desde Equipo.</Text>}
          <View style={rowStyle}>
            {specialists.map((member) => {
              const checked = draft.specialistIds.includes(member.id);
              return <Choice key={member.id} selected={checked} disabled={saving} onPress={() => setDraft({
                ...draft, specialistIds: checked ? draft.specialistIds.filter((id) => id !== member.id) : [...draft.specialistIds, member.id],
              })}>{member.name}</Choice>;
            })}
          </View>
          <View style={rowStyle}>
            {presets.map((preset) => <Choice key={preset.name} selected={draft.name === preset.name} disabled={saving}
              onPress={() => setDraft({ ...draft, ...preset })}>{preset.name}</Choice>)}
          </View>
          <Field label="Nombre del horario" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })}
            editable={!saving} maxLength={80} />
          <Field label="Fecha de inicio (AAAA-MM-DD)" placeholder="AAAA-MM-DD" value={draft.startDate} autoCapitalize="none"
            onChangeText={(startDate) => setDraft({
              ...draft, startDate, endDate: !draft.endDate || draft.endDate === draft.startDate ? startDate : draft.endDate,
            })} editable={!saving} />
          <Field label="Fecha final (AAAA-MM-DD)" placeholder="AAAA-MM-DD" value={draft.endDate} autoCapitalize="none"
            onChangeText={(endDate) => setDraft({ ...draft, endDate })} editable={!saving} />
          <Field label="Hora de inicio (HH:MM)" value={draft.start} placeholder="08:00" autoCapitalize="none"
            onChangeText={(start) => setDraft({ ...draft, start })} editable={!saving} />
          <Field label="Hora de fin (HH:MM)" value={draft.end} placeholder="12:00" autoCapitalize="none"
            onChangeText={(end) => setDraft({ ...draft, end })} editable={!saving} />
          <Text style={styles.text}>Las horas son de Bogotá y se aplican a cada fecha del intervalo, incluida la fecha final.</Text>
          {minutes > 0 && !validTypes && selectedTypes.length > 0 && (
            <Text style={styles.error}>Amplía el horario o elige tratamientos que quepan en el intervalo.</Text>
          )}
          {validTypes && selectedTypes.map((item) => {
            const count = Math.floor(minutes / item.durationMinutes);
            return <Text key={item.id} style={styles.text}>{item.name} · hasta {count} {count === 1 ? 'cita' : 'citas'} por especialista al día</Text>;
          })}
          <Feedback error={error} />
          <View style={rowStyle}>
            <Action label="Publicar horario" disabled={saving || !validTypes || !draft.specialistIds.length ||
              !draft.branchId || !draft.startDate || !draft.endDate || !draft.name.trim()}
              onPress={() => run(async () => {
                const { specialistIds, serviceIds, ...fields } = draft;
                const created = await api.createSession({
                  ...fields,
                  assignments: specialistIds.map((specialistId) => ({ specialistId, serviceIds })),
                });
                select(created);
                setBranchFilter(created.branchId);
                setDraft(undefined);
              }, 'Horario publicado para los especialistas y las fechas seleccionadas.')} />
            <Action label="Volver" secondary onPress={() => setDraft(undefined)} disabled={saving} />
          </View>
        </View>
      )}
      {options && !visibleSessions.length && <Text style={styles.text}>Aún no hay horarios publicados.</Text>}
      {visibleSessions.map((entry) => {
        const specialistsInSession = new Set(windows.filter((window) => window.sessionId === entry.id).map((window) => window.specialistId)).size;
        return (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.heading}>{entry.name} · {spaDayLabel(entry.date)}</Text>
            <Text style={styles.text}>{branches.find((branch) => branch.id === entry.branchId)?.name} · {spaTime(entry.startsAt)} a {spaTime(entry.endsAt)}</Text>
            <Text style={styles.text}>{specialistsInSession
              ? `${specialistsInSession} especialista${specialistsInSession === 1 ? '' : 's'} asignado${specialistsInSession === 1 ? '' : 's'}`
              : 'Sin especialistas asignados'}</Text>
            {selected?.id !== entry.id && <Action label="Gestionar horario" secondary disabled={saving} onPress={() => select(entry)} />}
            {selected?.id === entry.id && (
              <>
                {assigned.map((window) => (
                  <View key={window.id} style={styles.card}>
                    <Text style={styles.heading}>{specialists.find((member) => member.id === window.specialistId)?.name}</Text>
                    <Text style={styles.text}>{spaTime(window.startsAt)} a {spaTime(window.endsAt)}</Text>
                    <Text style={styles.text}>
                      {bookingTypes.filter((item) => window.serviceIds.includes(item.id) ||
                        (item.id === firstVisit?.id && window.consultations !== false))
                        .map((item) => `${item.name} (${item.durationMinutes} min)`).join(' · ')}
                    </Text>
                    {removal?.kind === 'window' && removal.id === window.id ? (
                      <View style={rowStyle}>
                        <Action label="Confirmar retiro" disabled={saving} onPress={() => run(() => api.removeWindow(window.id),
                          'Disponibilidad retirada.', () => setRemoval(undefined))} />
                        <Action label="Conservar disponibilidad" secondary disabled={saving} onPress={() => setRemoval(undefined)} />
                      </View>
                    ) : <Action label="Retirar disponibilidad" secondary disabled={saving}
                      onPress={() => setRemoval({ kind: 'window', id: window.id })} />}
                  </View>
                ))}
                {allocation?.sessionId === entry.id ? (
                  <View style={styles.card}>
                    <Text style={styles.heading}>Asignar especialista</Text>
                    <View style={rowStyle}>
                      {specialists.map((member) => <Choice key={member.id} selected={allocation.specialistId === member.id}
                        disabled={saving} onPress={() => setAllocation({ ...allocation, specialistId: member.id })}>{member.name}</Choice>)}
                    </View>
                    <BookingTypes items={bookingTypes} selected={allocation.serviceIds}
                      minutes={(entry.endsAt - entry.startsAt) / 60000} disabled={saving}
                      onSelect={(serviceIds) => setAllocation({ ...allocation, serviceIds })} />
                    <Field label="Inicio disponible (HH:MM)" value={allocation.start} autoCapitalize="none"
                      onChangeText={(start) => setAllocation({ ...allocation, start })} editable={!saving} />
                    <Field label="Fin disponible (HH:MM)" value={allocation.end} autoCapitalize="none"
                      onChangeText={(end) => setAllocation({ ...allocation, end })} editable={!saving} />
                    <View style={rowStyle}>
                      <Action label="Guardar disponibilidad" disabled={saving || !allocation.specialistId || !allocation.serviceIds.length}
                        onPress={() => run(() => api.createWindow(allocation), 'Disponibilidad publicada.', () => setAllocation(undefined))} />
                      <Action label="Volver" secondary disabled={saving} onPress={() => setAllocation(undefined)} />
                    </View>
                  </View>
                ) : (
                  <View style={rowStyle}>
                    <Action label="Asignar especialista" onPress={() => addSpecialist(entry)} disabled={saving} />
                    <Action label="Cerrar detalles" secondary disabled={saving} onPress={() => setSelectedId('')} />
                  </View>
                )}
                {removal?.kind === 'session' && removal.id === entry.id ? (
                  <View style={rowStyle}>
                    <Action label="Confirmar retiro del horario" disabled={saving}
                      onPress={() => run(() => api.removeSession(entry.id), 'Horario retirado.', () => {
                        setRemoval(undefined);
                        setSelectedId('');
                      })} />
                    <Action label="Conservar horario" secondary disabled={saving} onPress={() => setRemoval(undefined)} />
                  </View>
                ) : <Action label="Retirar horario" secondary disabled={saving}
                  onPress={() => setRemoval({ kind: 'session', id: entry.id })} />}
              </>
            )}
          </View>
        );
      })}
    </>
  );
}
