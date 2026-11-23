import { apiRequest } from './apiRequest';

export interface SpaBranch {
  id: string;
  name: string;
  address: string;
  active: boolean;
}

export interface TreatmentInput {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface Treatment extends TreatmentInput {
  id: string;
}

interface GeneralConsultation {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: null;
}

export interface Specialist {
  id: string;
  name: string;
}

export interface SpaWindow {
  id: string;
  sessionId: string;
  branchId: string;
  specialistId: string;
  serviceIds: string[];
  consultations?: boolean;
  date: string;
  startsAt: number;
  endsAt: number;
}

export interface SpaSession {
  id: string;
  name: string;
  branchId: string;
  date: string;
  startsAt: number;
  endsAt: number;
}

export interface ScheduledSession extends SpaSession {
  slots: AppointmentSlot[];
}

export interface SpaOptions {
  branches: SpaBranch[];
  services: Treatment[];
  firstVisit: GeneralConsultation;
  sessions?: SpaSession[];
  specialists?: Specialist[];
  windows?: SpaWindow[];
}

export interface AppointmentSlot {
  windowId: string;
  sessionId: string;
  startsAt: number;
  endsAt: number;
  specialistName: string;
}

export type AppointmentStatus = 'confirmada' | 'cancelada' | 'atendida' | 'no_asistio';

export interface Appointment extends Omit<AppointmentSlot, 'sessionId'> {
  sessionId?: string;
  sessionName?: string;
  id: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  serviceId: string | null;
  serviceName: string;
  price: number | null;
  durationMinutes: number;
  customerName?: string;
  status: AppointmentStatus;
}

export interface SessionInput {
  branchId: string;
  name: string;
  startDate: string;
  endDate: string;
  start: string;
  end: string;
  assignments: Pick<WindowInput, 'specialistId' | 'serviceIds'>[];
}

export interface WindowInput {
  sessionId: string;
  specialistId: string;
  serviceIds: string[];
  start: string;
  end: string;
}

export interface SlotQuery {
  branchId: string;
  serviceId: string;
  rebookingId?: string;
}

interface ReservationInput extends Omit<SlotQuery, 'rebookingId'> {
  date: string;
  windowId: string;
  startsAt: number;
}

type AppointmentOutcome = 'atendida' | 'no_asistio';

function spaRequest<T>(token: string, path: string, method = 'GET', body?: object) {
  return apiRequest<T>(`/api/spa${path}`, token, { method, body: body && JSON.stringify(body) });
}

export function spaApi(token: string) {
  return {
    options: () => spaRequest<SpaOptions>(token, '/options'),
    appointments: () => spaRequest<Appointment[]>(token, '/appointments'),
    dates: ({ branchId, serviceId, rebookingId }: SlotQuery) => spaRequest<string[]>(
      token, `/dates?${new URLSearchParams({ branchId, serviceId, rebookingId: rebookingId || '' })}`
    ),
    schedule: ({ branchId, serviceId, date, rebookingId }: SlotQuery & { date: string }) => spaRequest<ScheduledSession[]>(
      token, `/schedule?${new URLSearchParams({ branchId, serviceId, date, rebookingId: rebookingId || '' })}`
    ),
    reserve: (reservation: ReservationInput, id?: string) => spaRequest<Appointment>(
      token, id ? `/appointments/${id}/reschedule` : '/appointments', id ? 'PATCH' : 'POST', reservation
    ),
    cancel: (id: string) => spaRequest<Appointment>(token, `/appointments/${id}/cancel`, 'PATCH'),
    outcome: (id: string, status: AppointmentOutcome) => spaRequest<Appointment>(
      token, `/appointments/${id}/outcome`, 'PATCH', { status }
    ),
    saveTreatment: (input: TreatmentInput, id?: string) => spaRequest<Treatment>(
      token, id ? `/services/${id}` : '/services', id ? 'PATCH' : 'POST', input
    ),
    createSession: (input: SessionInput) => spaRequest<SpaSession & { daysPublished: number }>(token, '/sessions', 'POST', input),
    removeSession: (id: string) => spaRequest<void>(token, `/sessions/${id}`, 'DELETE'),
    createWindow: (input: WindowInput) => spaRequest<SpaWindow>(token, '/windows', 'POST', input),
    removeWindow: (id: string) => spaRequest<void>(token, `/windows/${id}`, 'DELETE'),
  };
}

const bogota = 'America/Bogota';
export const spaDate = new Intl.DateTimeFormat('es-CO', {
  timeZone: bogota, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
}).format;
export const spaTime = new Intl.DateTimeFormat('es-CO', {
  timeZone: bogota, hour: 'numeric', minute: '2-digit',
}).format;
export const spaDayLabel = (date: string) => spaDate(new Date(`${date}T12:00:00-05:00`));

export const spaTimeInput = new Intl.DateTimeFormat('en-GB', {
  timeZone: bogota, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format;
