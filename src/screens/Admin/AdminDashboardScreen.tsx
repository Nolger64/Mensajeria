import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { AdminFleetMap } from './AdminFleetMap';

type AdminTab = 'mapa' | 'trabajadores' | 'pedidos' | 'broadcast';

export const AdminDashboardScreen: React.FC = () => {
  const {
    driver,
    coworkers,
    stores,
    allOrders,
    updateCoworkerStatus,
    assignOrderToCoworker,
    sendCommunityMessage,
    simulateCoworkersMovement,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('mapa');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [workerFilter, setWorkerFilter] = useState<'todos' | 'disponible' | 'en_ruta' | 'en_tienda'>('todos');

  // Stats calculation
  const totalCouriers = coworkers.length + 1;
  const availableCouriers = coworkers.filter((c) => c.status === 'disponible').length + (driver.isOnline ? 1 : 0);
  const inRouteCouriers = coworkers.filter((c) => c.status === 'en_ruta').length;
  const activeOrders = allOrders.filter(
    (o) => o.status === 'rumbo_tienda' || o.status === 'en_tienda' || o.status === 'rumbo_cliente'
  );

  const selectedWorker =
    selectedWorkerId === driver.id
      ? {
          id: driver.id,
          name: driver.name,
          nickname: driver.alias,
          vehicle: driver.vehicle,
          vehicleModel: driver.vehicleModel,
          status: driver.isOnline ? ('disponible' as const) : ('descanso' as const),
          rating: driver.rating,
          completedOrdersToday: driver.totalOrdersToday,
          batteryLevel: 96,
          coordinates: driver.coordinates,
          currentZone: 'Centro del Radar',
        }
      : coworkers.find((c) => c.id === selectedWorkerId);

  const filteredWorkers = coworkers.filter((c) => {
    if (workerFilter === 'todos') return true;
    return c.status === workerFilter;
  });

  const handleBroadcast = (textToSend?: string) => {
    const msg = textToSend || broadcastText;
    if (!msg.trim()) return;

    sendCommunityMessage(msg.trim(), 'alerta', 'Torre de Control FHS (Admin)');
    setBroadcastText('');
    Alert.alert('¡Aviso Emitido!', 'El comunicado fue enviado a todos los repartidores activos.');
  };

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  return (
    <View style={styles.container}>
      {/* Admin KPI Header */}
      <View style={styles.topKpiBar}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{totalCouriers}</Text>
          <Text style={styles.kpiLabel}>Flota Total</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#00C853' }]}>{availableCouriers}</Text>
          <Text style={styles.kpiLabel}>Disponibles</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#2979FF' }]}>{inRouteCouriers}</Text>
          <Text style={styles.kpiLabel}>En Ruta</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#FF441F' }]}>{activeOrders.length}</Text>
          <Text style={styles.kpiLabel}>Pedidos Activos</Text>
        </View>
      </View>

      {/* Admin Subnav */}
      <View style={styles.subnav}>
        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'mapa' && styles.subnavItemActive]}
          onPress={() => setActiveTab('mapa')}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={16} color={activeTab === 'mapa' ? '#FF441F' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'mapa' && styles.subnavTextActive]}>
            Mapa Flota
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'trabajadores' && styles.subnavItemActive]}
          onPress={() => setActiveTab('trabajadores')}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={16} color={activeTab === 'trabajadores' ? '#FF441F' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'trabajadores' && styles.subnavTextActive]}>
            Trabajadores ({coworkers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'pedidos' && styles.subnavItemActive]}
          onPress={() => setActiveTab('pedidos')}
          activeOpacity={0.8}
        >
          <Ionicons name="cube" size={16} color={activeTab === 'pedidos' ? '#FF441F' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'pedidos' && styles.subnavTextActive]}>
            Despacho ({allOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'broadcast' && styles.subnavItemActive]}
          onPress={() => setActiveTab('broadcast')}
          activeOpacity={0.8}
        >
          <Ionicons name="megaphone" size={16} color={activeTab === 'broadcast' ? '#FF441F' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'broadcast' && styles.subnavTextActive]}>
            Aviso Flota
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: FLEET MAP */}
      {activeTab === 'mapa' && (
        <View style={styles.mapContainer}>
          <AdminFleetMap
            driver={driver}
            coworkers={coworkers}
            stores={stores}
            activeOrders={activeOrders}
            onSelectWorker={(id) => setSelectedWorkerId(id)}
            onSelectStore={() => {}}
          />

          {/* Quick simulation pill */}
          <TouchableOpacity
            style={styles.simulateJitterBtn}
            onPress={simulateCoworkersMovement}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.simulateJitterText}>Simular Telemetría GPS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TAB 2: WORKERS LIST */}
      {activeTab === 'trabajadores' && (
        <View style={styles.workersContainer}>
          {/* Filter pills */}
          <View style={styles.filterRow}>
            {(['todos', 'disponible', 'en_ruta', 'en_tienda'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, workerFilter === f && styles.filterChipActive]}
                onPress={() => setWorkerFilter(f)}
              >
                <Text style={[styles.filterChipText, workerFilter === f && styles.filterChipTextActive]}>
                  {f === 'todos' ? 'Todos' : f === 'disponible' ? 'Libres' : f === 'en_ruta' ? 'En Ruta' : 'En Tienda'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.workersScroll} showsVerticalScrollIndicator={false}>
            {filteredWorkers.map((cw) => {
              const statusColor =
                cw.status === 'disponible' ? '#00C853' : cw.status === 'en_ruta' ? '#2979FF' : '#FF9100';

              return (
                <View key={cw.id} style={styles.workerCard}>
                  <View style={styles.workerCardTop}>
                    <View style={styles.workerAvatar}>
                      <Text style={{ fontSize: 20 }}>
                        {cw.vehicle === 'moto' ? '🏍️' : cw.vehicle === 'bici' ? '🚲' : '🚗'}
                      </Text>
                    </View>
                    <View style={styles.workerDetails}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.workerNameText}>{cw.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                          <Text style={styles.statusBadgeText}>{cw.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.workerSub}>
                        {cw.vehicleModel} • {cw.currentZone}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.workerCardMetrics}>
                    <View style={styles.metricPair}>
                      <Ionicons name="battery-charging" size={14} color="#00C853" />
                      <Text style={styles.metricValText}>{cw.batteryLevel}%</Text>
                    </View>
                    <View style={styles.metricPair}>
                      <Ionicons name="star" size={14} color="#FFB300" />
                      <Text style={styles.metricValText}>{cw.rating}</Text>
                    </View>
                    <View style={styles.metricPair}>
                      <Ionicons name="checkmark-done" size={14} color="#2979FF" />
                      <Text style={styles.metricValText}>{cw.completedOrdersToday} entregas</Text>
                    </View>
                  </View>

                  {/* Admin Quick Action */}
                  <View style={styles.workerCardActions}>
                    <TouchableOpacity
                      style={styles.workerActionBtn}
                      onPress={() => setSelectedWorkerId(cw.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.workerActionBtnText}>Gestionar / Reasignar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* TAB 3: DISPATCH ORDERS */}
      {activeTab === 'pedidos' && (
        <ScrollView style={styles.ordersScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.tabSectionTitle}>Órdenes en Monitoreo ({allOrders.length})</Text>

          {allOrders.map((ord) => {
            const isFinished = ord.status === 'entregado';
            return (
              <View key={ord.id} style={styles.orderAdminCard}>
                <View style={styles.orderAdminHeader}>
                  <View style={styles.storeEmojiBox}>
                    <Text style={{ fontSize: 18 }}>{ord.store.logo}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderAdminStore}>{ord.store.name}</Text>
                    <Text style={styles.orderAdminCode}>{ord.orderCode} • Para: {ord.customerName}</Text>
                  </View>
                  <Text style={styles.orderAdminEarnings}>{formatCurrency(ord.totalEarnings)}</Text>
                </View>

                <View style={styles.orderAdminBody}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.orderRouteText}>Destino: {ord.customerAddress}</Text>
                    <View style={[styles.orderStatusPill, isFinished ? styles.pillDone : styles.pillLive]}>
                      <Text style={styles.orderStatusPillText}>{ord.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                  </View>

                  {!isFinished && (
                    <View style={styles.reassignRow}>
                      <Text style={styles.reassignLabel}>Reasignar a courier:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                        {coworkers.slice(0, 3).map((cw) => (
                          <TouchableOpacity
                            key={cw.id}
                            style={styles.reassignChip}
                            onPress={() => {
                              assignOrderToCoworker(ord.id, cw.id);
                              Alert.alert('Reasignación', `Pedido ${ord.orderCode} transferido a ${cw.name}`);
                            }}
                          >
                            <Text style={styles.reassignChipText}>Asignar a {cw.nickname}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* TAB 4: FLEET BROADCAST */}
      {activeTab === 'broadcast' && (
        <View style={styles.broadcastContainer}>
          <View style={styles.broadcastCard}>
            <View style={styles.broadcastHeader}>
              <View style={styles.megaphoneCircle}>
                <Ionicons name="megaphone" size={24} color="#FF441F" />
              </View>
              <View>
                <Text style={styles.broadcastTitle}>Emisión Central de Comunicados</Text>
                <Text style={styles.broadcastSub}>
                  Mensaje prioritario instantáneo para {coworkers.length + 1} repartidores conectados.
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.broadcastInput}
              placeholder="Escribe la directriz o aviso para toda la flota..."
              placeholderTextColor="#8B949E"
              multiline
              numberOfLines={4}
              value={broadcastText}
              onChangeText={setBroadcastText}
            />

            <TouchableOpacity
              style={[styles.sendBroadcastBtn, !broadcastText.trim() && styles.sendBroadcastBtnDisabled]}
              onPress={() => handleBroadcast()}
              disabled={!broadcastText.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.sendBroadcastText}>Enviar Comunicado Masivo</Text>
            </TouchableOpacity>

            <Text style={styles.presetsTitle}>Plantillas Rápidas:</Text>
            <View style={styles.presetsGrid}>
              {[
                '🚨 Operativo de tránsito en Calle 85 con Carrera 15. Usar rutas alternas.',
                '🌧️ Alerta climática: Lluvia moderada en sector financiero. Conduzcan con precaución.',
                '⚡ Tarifa dinámica x1.4 activada en Parque 93 por alta afluencia de pedidos.',
                '🍔 Demora en preparación en Crepes Zona T. Priorizar pedidos de Carulla.',
              ].map((template, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.templateBtn}
                  onPress={() => handleBroadcast(template)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.templateText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Worker Telemetry & Management Modal */}
      {selectedWorker && (
        <Modal visible={!!selectedWorker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View style={styles.rowCenter}>
                  <Text style={{ fontSize: 26, marginRight: 8 }}>
                    {selectedWorker.vehicle === 'moto' ? '🏍️' : '🚲'}
                  </Text>
                  <View>
                    <Text style={styles.modalWorkerName}>{selectedWorker.name}</Text>
                    <Text style={styles.modalWorkerSub}>&quot;{selectedWorker.nickname}&quot; • {selectedWorker.vehicleModel}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedWorkerId(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.telemetryGrid}>
                <View style={styles.telemetryBox}>
                  <Text style={styles.telemetryLabel}>Batería GPS</Text>
                  <Text style={styles.telemetryVal}>{selectedWorker.batteryLevel}%</Text>
                </View>
                <View style={styles.telemetryBox}>
                  <Text style={styles.telemetryLabel}>Calificación</Text>
                  <Text style={styles.telemetryVal}>⭐ {selectedWorker.rating}</Text>
                </View>
                <View style={styles.telemetryBox}>
                  <Text style={styles.telemetryLabel}>Entregas Hoy</Text>
                  <Text style={styles.telemetryVal}>{selectedWorker.completedOrdersToday}</Text>
                </View>
              </View>

              <Text style={styles.actionsModalTitle}>Cambiar Estado Operativo:</Text>
              <View style={styles.statusChangeRow}>
                {(['disponible', 'en_ruta', 'en_tienda', 'descanso'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusToggleBtn,
                      selectedWorker.status === st && styles.statusToggleBtnActive,
                    ]}
                    onPress={() => {
                      updateCoworkerStatus(selectedWorker.id, st);
                      setSelectedWorkerId(null);
                    }}
                  >
                    <Text style={styles.statusToggleText}>{st.replace('_', ' ').toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setSelectedWorkerId(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeModalBtnText}>Cerrar Telemetría</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  topKpiBar: {
    flexDirection: 'row',
    backgroundColor: '#181C21',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1F242C',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292E36',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  kpiLabel: {
    fontSize: 9,
    color: '#8B949E',
    marginTop: 1,
  },
  subnav: {
    flexDirection: 'row',
    backgroundColor: '#181C21',
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
  },
  subnavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subnavItemActive: {
    borderBottomColor: '#FF441F',
  },
  subnavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B949E',
  },
  subnavTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  simulateJitterBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(26, 29, 32, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#3F444E',
    zIndex: 100,
  },
  simulateJitterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  workersContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#1F242C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  filterChipActive: {
    backgroundColor: '#FF441F',
    borderColor: '#FF441F',
  },
  filterChipText: {
    fontSize: 11,
    color: '#8B949E',
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  workersScroll: {
    flex: 1,
  },
  workerCard: {
    backgroundColor: '#181C21',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  workerCardTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  workerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#24282D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerDetails: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  workerSub: {
    fontSize: 11,
    color: '#8B949E',
    marginTop: 2,
  },
  workerCardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1F242C',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  metricPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValText: {
    fontSize: 11,
    color: '#D1D7E0',
    fontWeight: '700',
  },
  workerCardActions: {
    marginTop: 10,
  },
  workerActionBtn: {
    backgroundColor: '#24282D',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  workerActionBtnText: {
    color: '#FF441F',
    fontSize: 11,
    fontWeight: '800',
  },
  ordersScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  tabSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B949E',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  orderAdminCard: {
    backgroundColor: '#181C21',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  orderAdminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
    paddingBottom: 8,
  },
  storeEmojiBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#24282D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAdminStore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  orderAdminCode: {
    fontSize: 11,
    color: '#8B949E',
  },
  orderAdminEarnings: {
    fontSize: 15,
    fontWeight: '900',
    color: '#00C853',
  },
  orderAdminBody: {
    paddingTop: 8,
  },
  orderRouteText: {
    fontSize: 11,
    color: '#D1D7E0',
    flex: 1,
  },
  orderStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillLive: {
    backgroundColor: '#2979FF',
  },
  pillDone: {
    backgroundColor: '#00C853',
  },
  orderStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reassignRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#24282D',
    paddingTop: 6,
  },
  reassignLabel: {
    fontSize: 10,
    color: '#8B949E',
    fontWeight: '700',
  },
  reassignChip: {
    backgroundColor: '#24282D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#333842',
  },
  reassignChipText: {
    fontSize: 10,
    color: '#FF441F',
    fontWeight: '700',
  },
  broadcastContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  broadcastCard: {
    backgroundColor: '#181C21',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  broadcastHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  megaphoneCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#24282D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  broadcastSub: {
    fontSize: 11,
    color: '#8B949E',
    marginTop: 2,
  },
  broadcastInput: {
    backgroundColor: '#0F1113',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#292E36',
    textAlignVertical: 'top',
    minHeight: 90,
  },
  sendBroadcastBtn: {
    backgroundColor: '#FF441F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  sendBroadcastBtnDisabled: {
    backgroundColor: '#3F444E',
  },
  sendBroadcastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  presetsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B949E',
    marginTop: 16,
    marginBottom: 8,
  },
  presetsGrid: {
    gap: 6,
  },
  templateBtn: {
    backgroundColor: '#1F242C',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  templateText: {
    fontSize: 11,
    color: '#D1D7E0',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#181C21',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2E343E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalWorkerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalWorkerSub: {
    fontSize: 11,
    color: '#8B949E',
  },
  closeBtn: {
    padding: 6,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  telemetryBox: {
    flex: 1,
    backgroundColor: '#1F242C',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 9,
    color: '#8B949E',
  },
  telemetryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  actionsModalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B949E',
    marginBottom: 10,
  },
  statusChangeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  statusToggleBtn: {
    flex: 1,
    backgroundColor: '#24282D',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusToggleBtnActive: {
    backgroundColor: '#FF441F',
  },
  statusToggleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeModalBtn: {
    backgroundColor: '#24282D',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#8B949E',
    fontSize: 13,
    fontWeight: '700',
  },
});
