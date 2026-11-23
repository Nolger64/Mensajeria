export const ORDER_STATUS_LABELS = {
  pendiente: 'Pendiente de asignación',
  ofertado: 'Asignado',
  rumbo_tienda: 'En camino a la sede',
  en_tienda: 'En la sede',
  rumbo_cliente: 'En camino al destino',
  entregado: 'Entregado',
};

export const formatOrderAmount = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format;
