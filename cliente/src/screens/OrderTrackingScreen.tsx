import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';
import { OrderStep, DeliveryOrder } from '../types';

interface OrderTrackingScreenProps {
  onGoToStores: () => void;
}

const STEP_LABELS: Record<OrderStep, { title: string; subtitle: string; color: string; icon: string }> = {
  pendiente: {
    title: 'Pedido Recibido',
    subtitle: 'Esperando asignación de repartidor por la Torre de Control',
    color: '#FFB300',
    icon: 'hourglass',
  },
  ofertado: {
    title: 'Buscando Repartidor...',
    subtitle: 'Conectando con la flota activa en tu zona',
    color: '#FFB300',
    icon: 'search',
  },
  rumbo_tienda: {
    title: 'Repartidor Asignado',
    subtitle: 'El domiciliario va en camino al punto de recogida',
    color: '#FF9100',
    icon: 'bicycle',
  },
  en_tienda: {
    title: 'En la Tienda',
    subtitle: 'Verificando y empacando tu pedido con cuidado',
    color: '#AB47BC',
    icon: 'storefront',
  },
  rumbo_cliente: {
    title: '¡En Camino a Tu Ubicación!',
    subtitle: 'El repartidor está cerca de tu dirección',
    color: '#2979FF',
    icon: 'navigate',
  },
  entregado: {
    title: '¡Pedido Entregado!',
    subtitle: 'Gracias por pedir con FHS. ¡Que lo disfrutes!',
    color: '#00E676',
    icon: 'checkmark-circle',
  },
};

const STEPS_ORDER: OrderStep[] = ['pendiente', 'ofertado', 'rumbo_tienda', 'en_tienda', 'rumbo_cliente', 'entregado'];

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  onGoToStores,
}) => {
  const { orders, activeOrder, setActiveOrder, refreshOrders, workers, isServerConnected } = useClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  if (!activeOrder && orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="receipt-outline" size={46} color="#FF441F" />
        </View>
        <Text style={styles.emptyTitle}>No tienes pedidos activos</Text>
        <Text style={styles.emptySub}>
          Cuando hagas un pedido en una tienda o solicites un domicilio express, podrás seguirlo en tiempo real aquí.
        </Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={onGoToStores}>
          <Text style={styles.exploreBtnText}>Explorar Tiendas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentOrder = activeOrder || orders[0];
  const stepInfo = STEP_LABELS[currentOrder.status] || STEP_LABELS.ofertado;
  const currentStepIndex = STEPS_ORDER.indexOf(currentOrder.status);

  // Find assigned courier if available
  const assignedCourier = currentOrder.assignedWorkerId
    ? workers.find((w) => w.id === currentOrder.assignedWorkerId)
    : workers.find((w) => w.status === 'en_ruta' || w.status === 'en_tienda') || workers[0];

  return (
    <View style={styles.container}>
      {/* Top Bar with Refresh */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Rastreo en Tiempo Real</Text>
          <Text style={styles.topBarSub}>
            {isServerConnected ? '🟢 Conectado a Servidor' : '🟠 Modo Local'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="reload" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Main Status Tracker Card */}
        <View style={styles.trackerCard}>
          <View style={styles.orderCodeRow}>
            <View>
              <Text style={styles.orderCode}>{currentOrder.orderCode}</Text>
              <Text style={styles.orderStoreName}>{currentOrder.store.name}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: `${stepInfo.color}22` }]}>
              <Text style={[styles.statusPillText, { color: stepInfo.color }]}>
                {currentOrder.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Current Step Big Banner */}
          <View style={[styles.currentStepBox, { borderColor: stepInfo.color }]}>
            <Ionicons name={stepInfo.icon as any} size={28} color={stepInfo.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: stepInfo.color }]}>
                {stepInfo.title}
              </Text>
              <Text style={styles.stepSubtitle}>{stepInfo.subtitle}</Text>
            </View>
          </View>

          {/* 5-Step Progress Pipeline */}
          <View style={styles.progressPipeline}>
            {STEPS_ORDER.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const stepConf = STEP_LABELS[step];

              return (
                <View key={step} style={styles.stepPipelineItem}>
                  <View
                    style={[
                      styles.pipelineNode,
                      isPast && styles.nodePast,
                      isCurrent && [styles.nodeCurrent, { backgroundColor: stepConf.color }],
                    ]}
                  >
                    {isPast ? (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    ) : (
                      <Text style={styles.nodeNumber}>{idx + 1}</Text>
                    )}
                  </View>
                  {idx < STEPS_ORDER.length - 1 && (
                    <View
                      style={[
                        styles.pipelineLine,
                        idx < currentStepIndex && styles.lineActive,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.pipelineLabels}>
            <Text style={styles.pipeLabelText}>Ofertado</Text>
            <Text style={styles.pipeLabelText}>Tienda</Text>
            <Text style={styles.pipeLabelText}>Empacado</Text>
            <Text style={styles.pipeLabelText}>En Ruta</Text>
            <Text style={styles.pipeLabelText}>Entregado</Text>
          </View>

          {/* Security PIN Box */}
          <View style={styles.pinCard}>
            <View style={styles.pinIcon}>
              <Ionicons name="key" size={20} color="#FFD54F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pinLabel}>PIN de Seguridad de Entrega</Text>
              <Text style={styles.pinSub}>
                Compártele este PIN a tu repartidor al momento de recibir el pedido:
              </Text>
            </View>
            <View style={styles.pinBadge}>
              <Text style={styles.pinCode}>{currentOrder.securityPin || '4821'}</Text>
            </View>
          </View>
        </View>

        {/* Assigned Courier Card */}
        {assignedCourier && (
          <View style={styles.courierCard}>
            <Text style={styles.cardHeaderSmall}>Domiciliario Asignado</Text>
            <View style={styles.courierRow}>
              <View
                style={[
                  styles.courierAvatar,
                  { backgroundColor: assignedCourier.avatarColor || '#2979FF' },
                ]}
              >
                <Text style={{ fontSize: 24 }}>
                  {assignedCourier.vehicle === 'moto' ? '🛵' : '🚲'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.courierName}>{assignedCourier.name}</Text>
                <Text style={styles.courierAlias}>
                  "{assignedCourier.nickname}" • {assignedCourier.vehicleModel}
                </Text>
                <View style={styles.courierMeta}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color="#FFB300" />
                    <Text style={styles.ratingText}>{assignedCourier.rating.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.metaText}>
                    {assignedCourier.completedOrdersToday} entregas hoy
                  </Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.metaText}>
                    🔋 {assignedCourier.batteryLevel}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Destination & Notes Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeaderSmall}>Detalles de Entrega</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#FF441F" />
            <Text style={styles.infoText}>{currentOrder.customerAddress}</Text>
          </View>
          {currentOrder.customerNotes ? (
            <View style={[styles.infoRow, { marginTop: 6 }]}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#8C96A5" />
              <Text style={styles.infoSubText}>"{currentOrder.customerNotes}"</Text>
            </View>
          ) : null}
        </View>

        {/* Items Summary Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeaderSmall}>Resumen de Artículos</Text>
          {currentOrder.items.map((item, idx) => (
            <View key={item.id || idx} style={styles.orderItemRow}>
              <Text style={styles.orderItemQty}>{item.quantity}x</Text>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.price > 0 && (
                <Text style={styles.orderItemPrice}>
                  ${(item.price * item.quantity).toLocaleString('es-CO')}
                </Text>
              )}
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderTotalRow}>
            <Text style={styles.orderTotalLabel}>Total Cancelado</Text>
            <Text style={styles.orderTotalVal}>
              ${currentOrder.totalEarnings.toLocaleString('es-CO')} COP
            </Text>
          </View>
        </View>

        {/* Previous Orders Selector */}
        {orders.length > 1 && (
          <View style={styles.historyCard}>
            <Text style={styles.cardHeaderSmall}>Otros Pedidos en Esta Sesión</Text>
            {orders.map((ord) => (
              <TouchableOpacity
                key={ord.id}
                style={[
                  styles.historyItem,
                  ord.id === currentOrder.id && styles.historyItemActive,
                ]}
                onPress={() => setActiveOrder(ord)}
              >
                <View>
                  <Text style={styles.historyCode}>{ord.orderCode}</Text>
                  <Text style={styles.historyStore}>{ord.store.name}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyStatus}>{ord.status}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#8C96A5" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1014',
  },
  topBar: {
    backgroundColor: '#12151B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222834',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  topBarSub: {
    fontSize: 11,
    color: '#8C96A5',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#202633',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3241',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  trackerCard: {
    backgroundColor: '#181C24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  orderCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  orderCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF441F',
  },
  orderStoreName: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  currentStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11141A',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#8C96A5',
    marginTop: 2,
  },
  progressPipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  stepPipelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pipelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#262D3C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodePast: {
    backgroundColor: '#00E676',
  },
  nodeCurrent: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nodeNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  pipelineLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#262D3C',
    marginHorizontal: 2,
  },
  lineActive: {
    backgroundColor: '#00E676',
  },
  pipelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  pipeLabelText: {
    fontSize: 9,
    color: '#687385',
    fontWeight: '600',
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222017',
    borderWidth: 1,
    borderColor: '#FFB300',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  pinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 179, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD54F',
  },
  pinSub: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  pinBadge: {
    backgroundColor: '#FFB300',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pinCode: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 2,
  },
  courierCard: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  cardHeaderSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C96A5',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courierName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  courierAlias: {
    fontSize: 12,
    color: '#8C96A5',
    marginTop: 2,
  },
  courierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252B37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFB300',
  },
  dotSeparator: {
    color: '#4B5563',
    fontSize: 10,
  },
  metaText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  infoCard: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    flex: 1,
  },
  infoSubText: {
    fontSize: 11,
    color: '#8C96A5',
    fontStyle: 'italic',
    flex: 1,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderItemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF441F',
    width: 24,
  },
  orderItemName: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E676',
  },
  divider: {
    height: 1,
    backgroundColor: '#252B37',
    marginVertical: 10,
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  orderTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00E676',
  },
  historyCard: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202632',
  },
  historyItemActive: {
    backgroundColor: '#202633',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  historyCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  historyStore: {
    fontSize: 11,
    color: '#8C96A5',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB300',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0E1014',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 68, 31, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#8C96A5',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#FF441F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
