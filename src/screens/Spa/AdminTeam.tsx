import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { authService, type AuthUser, type StaffMember, type StaffRole } from '../../services/authService';
import { useOperationStyles } from '../../theme/operationStyles';
import { Action, Choice, Feedback, Field, rowStyle } from './shared';

const roles = [
  { id: 'especialista', name: 'Especialistas', singular: 'especialista' },
  { id: 'repartidor', name: 'Repartidores', singular: 'repartidor' },
] as const;
const vehicles = [
  { id: 'moto', label: 'Moto' }, { id: 'bici', label: 'Bicicleta' }, { id: 'auto', label: 'Auto' },
] as const;
const emptyProfile = {
  name: '', email: '', phone: '', password: '', vehicle: 'moto' as NonNullable<AuthUser['vehicle']>, vehicleModel: '', plate: '',
};

export function AdminTeam({ token, onChanged }: { token: string; onChanged: () => Promise<void> }) {
  const styles = useOperationStyles();
  const [role, setRole] = useState<StaffRole>('especialista');
  const [members, setMembers] = useState<{ role: StaffRole; list: StaffMember[] }>();
  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState<'new' | StaffMember>();
  const [deleting, setDeleting] = useState<StaffMember>();
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback((signal: { current: boolean }) =>
    authService.listStaff(role, token)
      .then((list) => { if (signal.current) setMembers({ role, list }); })
      .catch((failure) => {
        if (signal.current) {
          setError((failure as Error).message);
          setMembers({ role, list: [] });
        }
      }), [role, token]);
  useEffect(() => {
    const signal = { current: true };
    void load(signal);
    return () => { signal.current = false; };
  }, [load]);

  function openForm(member?: StaffMember) {
    setError('');
    setNotice('');
    setDeleting(undefined);
    setForm(member ?? 'new');
    setProfile(member ? {
      name: member.name, email: member.email, phone: member.phone ?? '', password: '',
      vehicle: member.vehicle ?? 'moto', vehicleModel: member.vehicleModel ?? '', plate: member.plate ?? '',
    } : emptyProfile);
  }

  async function save(operation: () => Promise<unknown>, message: string) {
    if (saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await operation();
      setForm(undefined);
      setDeleting(undefined);
      setProfile(emptyProfile);
      setNotice(message);
      await Promise.all([load({ current: true }), onChanged()]);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function submit() {
    if (!form) return;
    const { name, email, phone, password, vehicle, vehicleModel, plate } = profile;
    const fields = { name, email, phone, ...(role === 'repartidor' && { vehicle, vehicleModel, plate }) };
    void save(
      () => form === 'new' ? authService.register({ ...fields, password, role }, token) : authService.updateStaff(form.id, fields, token),
      form === 'new' ? 'Cuenta creada.' : 'Datos actualizados.',
    );
  }

  const list = members?.role === role ? members.list : undefined;
  const selectedRole = roles.find((entry) => entry.id === role);
  return (
    <>
      <Text style={styles.title}>Personal de Aura Spa</Text>
      <View style={rowStyle}>
        {roles.map((entry) => (
          <Choice key={entry.id} selected={role === entry.id} disabled={saving || refreshing} onPress={() => {
            setRole(entry.id);
            setForm(undefined);
            setDeleting(undefined);
            setError('');
            setNotice('');
          }}>{entry.name}</Choice>
        ))}
        <Action label="Actualizar lista" secondary disabled={saving || refreshing} onPress={async () => {
          setRefreshing(true);
          setError('');
          await load({ current: true });
          setRefreshing(false);
        }} />
      </View>
      <Feedback error={deleting ? undefined : error} notice={notice} loading={refreshing || !list} />
      {!form && <Action label={`Agregar ${selectedRole?.singular}`} onPress={() => openForm()} disabled={saving} />}
      {form && (
        <View style={styles.card}>
          <Text style={styles.heading}>{form === 'new' ? `Nuevo ${selectedRole?.singular}` : `Editar a ${form.name}`}</Text>
          <Field label="Nombre" value={profile.name} onChangeText={(name) => setProfile({ ...profile, name })} maxLength={100} editable={!saving} />
          <Field label="Correo electrónico" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            value={profile.email} onChangeText={(email) => setProfile({ ...profile, email })} editable={!saving} />
          <Field label="Teléfono" keyboardType="phone-pad" value={profile.phone}
            onChangeText={(phone) => setProfile({ ...profile, phone })} maxLength={32} editable={!saving} />
          {role === 'repartidor' && (
            <>
              <Text style={styles.text}>Vehículo</Text>
              <View style={rowStyle}>
                {vehicles.map((entry) => <Choice key={entry.id} selected={profile.vehicle === entry.id}
                  disabled={saving} onPress={() => setProfile({ ...profile, vehicle: entry.id })}>{entry.label}</Choice>)}
              </View>
              <Field label="Modelo del vehículo" value={profile.vehicleModel} maxLength={80}
                onChangeText={(vehicleModel) => setProfile({ ...profile, vehicleModel })} editable={!saving} />
              <Field label="Placa" value={profile.plate} autoCapitalize="characters" maxLength={16}
                onChangeText={(plate) => setProfile({ ...profile, plate })} editable={!saving} />
            </>
          )}
          {form === 'new' && (
            <Field label="Contraseña" secureTextEntry autoComplete="new-password" value={profile.password}
              onChangeText={(password) => setProfile({ ...profile, password })} editable={!saving} />
          )}
          <View style={rowStyle}>
            <Action label={saving ? 'Guardando…' : form === 'new' ? 'Crear cuenta' : 'Guardar cambios'}
              onPress={submit} disabled={saving} />
            <Action label="Cancelar edición" onPress={() => setForm(undefined)} secondary disabled={saving} />
          </View>
        </View>
      )}
      {list?.length === 0 && <Text style={styles.text}>Aún no hay {selectedRole?.name.toLocaleLowerCase('es')} registrados.</Text>}
      {list?.map((member) => (
        <View key={member.id} style={styles.card}>
          <Text style={styles.heading}>{member.name}</Text>
          <Text style={styles.text}>{member.email}</Text>
          {!!member.phone && <Text style={styles.text}>{member.phone}</Text>}
          {member.role === 'repartidor' && (
            <Text style={styles.text}>{[vehicles.find((entry) => entry.id === member.vehicle)?.label, member.vehicleModel, member.plate]
              .filter(Boolean).join(' · ') || 'Vehículo pendiente de registrar'}</Text>
          )}
          {deleting?.id === member.id ? (
            <>
              <Text style={styles.text}>¿Eliminar la cuenta de {member.name}? Perderá el acceso a Aura Spa.</Text>
              {error && <Feedback error={error} />}
              <View style={rowStyle}>
                <Action label="Confirmar eliminación" disabled={saving} onPress={() =>
                  save(() => authService.removeStaff(member.id, token), 'Cuenta eliminada.')} />
                <Action label="Conservar cuenta" secondary disabled={saving} onPress={() => { setDeleting(undefined); setError(''); }} />
              </View>
            </>
          ) : (
            <View style={rowStyle}>
              <Action label="Editar" onPress={() => openForm(member)} secondary disabled={saving} />
              <Action label="Eliminar" onPress={() => { setDeleting(member); setForm(undefined); setError(''); setNotice(''); }}
                secondary disabled={saving} />
            </View>
          )}
        </View>
      ))}
    </>
  );
}
