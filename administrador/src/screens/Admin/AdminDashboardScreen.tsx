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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { AdminFleetMap } from './AdminFleetMap';
import { Coworker, DeliveryOrder, PartnerStore, Product, StoreCategory, PartnerTier } from '../../types';
import { FHSApiService } from '../../services/api';

type AdminTab = 'mapa' | 'tiendas' | 'ubicaciones' | 'trabajadores' | 'pedidos' | 'broadcast';

export const AdminDashboardScreen: React.FC = () => {
  const {
    driver,
    coworkers,
    stores,
    allOrders,
    deliveryStars,
    addStore,
    updateCoworkerStatus,
    assignOrderToCoworker,
    sendCommunityMessage,
    simulateCoworkersMovement,
    dispatchMode,
    setDispatchMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('mapa');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [workerFilter, setWorkerFilter] = useState<'todos' | 'disponible' | 'en_ruta' | 'en_tienda'>('todos');

  // Store Management State
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [editStoreModal, setEditStoreModal] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');
  const [editStoreBonus, setEditStoreBonus] = useState('');
  const [editStoreTier, setEditStoreTier] = useState<PartnerTier>('diamond');
  const [editStoreCategory, setEditStoreCategory] = useState<StoreCategory>('restaurante');
  const [editStoreLat, setEditStoreLat] = useState('');
  const [editStoreLng, setEditStoreLng] = useState('');

  // Product Add State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdEmoji, setNewProdEmoji] = useState('🍔');
  const [showAddProdModal, setShowAddProdModal] = useState(false);

  // Stats calculation
  const totalCouriers = coworkers.length + 1;
  const availableCouriers = coworkers.filter((c) => c.status === 'disponible').length + (driver.isOnline ? 1 : 0);
  const inRouteCouriers = coworkers.filter((c) => c.status === 'en_ruta').length;
  const pendingOrders = allOrders.filter((o) => o.status === 'pendiente');
  const activeOrders = allOrders.filter(
    (o) => o.status === 'rumbo_tienda' || o.status === 'en_tienda' || o.status === 'rumbo_cliente' || o.status === 'ofertado'
  );

  const allFleetWorkers = [
    {
      id: driver.id,
      name: `${driver.name} (Tú)`,
      nickname: `${driver.alias} (Tú)`,
      vehicle: driver.vehicle,
      vehicleModel: driver.vehicleModel,
      status: driver.isOnline ? ('disponible' as const) : ('descanso' as const),
    },
    ...coworkers,
  ];

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

  const openEditStore = (store: PartnerStore) => {
    setSelectedStore(store);
    setEditStoreName(store.name);
    setEditStoreAddress(store.address);
    setEditStoreBonus(store.bonusAmount.toString());
    setEditStoreTier(store.partnerTier);
    setEditStoreCategory(store.category);
    setEditStoreLat(store.coordinates.latitude.toString());
    setEditStoreLng(store.coordinates.longitude.toString());
    setEditStoreModal(true);
  };

  const handleSaveStoreChanges = async () => {
    if (!selectedStore) return;
    const updatedFields: Partial<PartnerStore> = {
      name: editStoreName.trim(),
      address: editStoreAddress.trim(),
      bonusAmount: Number(editStoreBonus) || 0,
      hasBonus: Number(editStoreBonus) > 0,
      partnerTier: editStoreTier,
      category: editStoreCategory,
      coordinates: {
        latitude: parseFloat(editStoreLat) || selectedStore.coordinates.latitude,
        longitude: parseFloat(editStoreLng) || selectedStore.coordinates.longitude,
      },
    };

    // Update in local stores and send PATCH to server
    Object.assign(selectedStore, updatedFields);
    try {
      await fetch(`${FHSApiService.getServerUrl()}/api/stores/${selectedStore.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch {}

    setEditStoreModal(false);
    Alert.alert('¡Cambios Guardados!', `La tienda "${selectedStore.name}" fue actualizada exitosamente.`);
  };

  const handleAddProductToStore = async () => {
    if (!selectedStore || !newProdName.trim() || !newProdPrice.trim()) {
      Alert.alert('Error', 'Ingresa nombre y precio del producto');
      return;
    }

    const newProd: Product = {
      id: `p-${Date.now().toString().slice(-4)}`,
      name: newProdName.trim(),
      price: Number(newProdPrice),
      description: newProdDesc.trim() || 'Producto disponible para pedido inmediato',
      emoji: newProdEmoji,
      available: true,
    };

    if (!selectedStore.products) selectedStore.products = [];
    selectedStore.products.push(newProd);

    try {
      await fetch(`${FHSApiService.getServerUrl()}/api/stores/${selectedStore.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch {}

    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setShowAddProdModal(false);
    Alert.alert('Producto Añadido', `Se agregó "${newProd.name}" al catálogo de ${selectedStore.name}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!selectedStore || !selectedStore.products) return;
    selectedStore.products = selectedStore.products.filter((p) => p.id !== productId);

    try {
      await fetch(`${FHSApiService.getServerUrl()}/api/stores/${selectedStore.id}/products/${productId}`, {
        method: 'DELETE',
      });
    } catch {}

    Alert.alert('Producto Eliminado', 'El producto fue retirado del catálogo.');
  };

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  return (
    <View style={styles.container}>
      {/* Top KPI Header */}
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
          <Text style={[styles.kpiVal, { color: pendingOrders.length > 0 ? '#FF1744' : '#8B949E' }]}>
            {pendingOrders.length}
          </Text>
          <Text style={styles.kpiLabel}>Por Asignar</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#FF441F' }]}>{activeOrders.length}</Text>
          <Text style={styles.kpiLabel}>En Ruta</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#FFB300' }]}>{stores.length}</Text>
          <Text style={styles.kpiLabel}>Tiendas</Text>
        </View>
      </View>

      {/* Control de Modo de Asignación de Pedidos (Solo Administradores) */}
      <View style={styles.modeControlCard}>
        <View style={styles.modeControlHeader}>
          <View style={styles.modeBadgeRow}>
            <View style={[styles.modeStatusDot, dispatchMode === 'manual' ? styles.dotManual : styles.dotAuto]} />
            <Text style={styles.modeStatusTitle}>
              {dispatchMode === 'manual' ? 'MODO MANUAL (POR DEFECTO)' : 'MODO AUTOMÁTICO (POR LA APP)'}
            </Text>
          </View>
          <Text style={styles.modeDescriptionText}>
            {dispatchMode === 'manual'
              ? '📋 El administrador debe asignar manualmente cada domicilio a los repartidores.'
              : '⚡ La app asigna y envía automáticamente los pedidos a los repartidores libres.'}
          </Text>
        </View>

        <View style={styles.modeButtonsRow}>
          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              dispatchMode === 'manual' && styles.modeBtnActiveManual,
            ]}
            onPress={async () => {
              if (dispatchMode !== 'manual') {
                await setDispatchMode('manual');
                Alert.alert('Modo Asignación', 'Modo Manual activado (Por defecto): El administrador asigna cada pedido a los repartidores.');
              }
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="account-check"
              size={15}
              color={dispatchMode === 'manual' ? '#FFFFFF' : '#8B949E'}
            />
            <Text
              style={[
                styles.modeToggleBtnText,
                dispatchMode === 'manual' && styles.modeToggleBtnTextActive,
              ]}
            >
              Manual (Por Defecto)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              dispatchMode === 'automatic' && styles.modeBtnActiveAuto,
            ]}
            onPress={async () => {
              if (dispatchMode !== 'automatic') {
                await setDispatchMode('automatic');
                Alert.alert('Modo Asignación', 'Modo Automático activado: La aplicación asignará los pedidos a los repartidores automáticamente.');
              }
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={15}
              color={dispatchMode === 'automatic' ? '#FFFFFF' : '#8B949E'}
            />
            <Text
              style={[
                styles.modeToggleBtnText,
                dispatchMode === 'automatic' && styles.modeToggleBtnTextActive,
              ]}
            >
              Automático (App)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subnav with Store and Location Tabs */}
      <View style={styles.subnav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subnavScroll}>
          <TouchableOpacity
            style={[styles.subnavItem, activeTab === 'mapa' && styles.subnavItemActive]}
            onPress={() => setActiveTab('mapa')}
          >
            <Ionicons name="map" size={15} color={activeTab === 'mapa' ? '#FF441F' : '#8B949E'} />
            <Text style={[styles.subnavText, activeTab === 'mapa' && styles.subnavTextActive]}>Mapa Flota</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subnavItem, activeTab === 'tiendas' && styles.subnavItemActive]}
            onPress={() => setActiveTab('tiendas')}
          >
            <MaterialCommunityIcons name="storefront-outline" size={15} color={activeTab === 'tiendas' ? '#FF441F' : '#8B949E'} />
            <Text style={[styles.subnavText, activeTab === 'tiendas' && styles.subnavTextActive]}>
              Tiendas & Productos ({stores.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subnavItem, activeTab === 'ubicaciones' && styles.subnavItemActive]}
            onPress={() => setActiveTab('ubicaciones')}
          >
            <Ionicons name="star" size={15} color={activeTab === 'ubicaciones' ? '#FFB300' : '#8B949E'} />
            <Text style={[styles.subnavText, activeTab === 'ubicaciones' && styles.subnavTextActive]}>
              ⭐ Ubicaciones ({deliveryStars.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subnavItem, activeTab === 'trabajadores' && styles.subnavItemActive]}
            onPress={() => setActiveTab('trabajadores')}
          >
            <Ionicons name="people" size={15} color={activeTab === 'trabajadores' ? '#FF441F' : '#8B949E'} />
            <Text style={[styles.subnavText, activeTab === 'trabajadores' && styles.subnavTextActive]}>
              Repartidores ({coworkers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subnavItem, activeTab === 'pedidos' && styles.subnavItemActive]}
            onPress={() => setActiveTab('pedidos')}
          >
            <Ionicons name="cube" size={15} color={activeTab === 'pedidos' ? '#FF441F' : '#8B949E'} />
            <Text style={[styles.subnavText, activeTab === 'pedidos' && styles.subnavTextActive]}>
              Despacho {pendingOrders.length > 0 ? `(${pendingOrders.length} Pendientes)` : `(${allOrders.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subnavItem, activeTab === 'broadcast' && styles.subnavItemActive]}
            onPress={() => setActiveTab('broadcast')}
          >
            <Ionicons name="megaphone" size={15} color={activeTab === 'broadcast' ? '#FF441F' : '#8B949E'} />
            <Text style={[styles.subnavText, activeTab === 'broadcast' && styles.subnavTextActive]}>Avisos</Text>
          </TouchableOpacity>
        </ScrollView>
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
            onSelectStore={(stId) => {
              const st = stores.find((s) => s.id === stId);
              if (st) openEditStore(st);
            }}
          />

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

      {/* TAB 2: STORES & PRODUCTS MANAGEMENT */}
      {activeTab === 'tiendas' && (
        <ScrollView style={styles.scrollSection} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.tabSectionTitle}>Gestión de Comercios Aliados y Catálogo</Text>
          </View>

          {stores.map((st) => (
            <View key={st.id} style={styles.adminStoreCard}>
              <View style={styles.storeCardTop}>
                <View style={styles.storeIconBox}>
                  <Text style={{ fontSize: 24 }}>{st.logo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.storeNameText}>{st.name}</Text>
                    <View style={[styles.tierTag, st.partnerTier === 'diamond' ? styles.tierDiamond : styles.tierGold]}>
                      <Text style={styles.tierTagText}>{st.partnerTier.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.storeAddressText}>📍 {st.address}</Text>
                  <Text style={styles.storeMetaText}>
                    {st.category.toUpperCase()} • Bono: {formatCurrency(st.bonusAmount)} • Coords: {st.coordinates.latitude.toFixed(4)}, {st.coordinates.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              {/* Products preview */}
              <View style={styles.productsMiniBox}>
                <Text style={styles.productsTitle}>Productos ({st.products?.length || 0}):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  {st.products?.map((prod) => (
                    <View key={prod.id} style={styles.productChip}>
                      <Text style={{ fontSize: 13 }}>{prod.emoji}</Text>
                      <Text style={styles.productChipName}>{prod.name}</Text>
                      <Text style={styles.productChipPrice}>{formatCurrency(prod.price)}</Text>
                    </View>
                  ))}
                  {(!st.products || st.products.length === 0) && (
                    <Text style={styles.noProdText}>Sin productos registrados aún</Text>
                  )}
                </ScrollView>
              </View>

              {/* Action button */}
              <TouchableOpacity
                style={styles.editStoreBtn}
                onPress={() => openEditStore(st)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="pencil-box-multiple" size={16} color="#FFFFFF" />
                <Text style={styles.editStoreBtnText}>Editar Tienda & Gestionar Productos</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* TAB 3: RECENT DELIVERY LOCATIONS (Estrellitas) */}
      {activeTab === 'ubicaciones' && (
        <ScrollView style={styles.scrollSection} showsVerticalScrollIndicator={false}>
          <Text style={styles.tabSectionTitle}>Puntos de Entrega Frecuente & Estrellitas ⭐</Text>
          <Text style={styles.tabSectionSub}>
            Direcciones verificadas por los repartidores en calle con consejos de recepción y acceso rápido.
          </Text>

          {deliveryStars.map((star) => (
            <View key={star.id} style={styles.starLocationCard}>
              <View style={styles.starCardHeader}>
                <View style={styles.starBadgeBox}>
                  <Text style={{ fontSize: 20 }}>⭐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.starAddressTitle}>{star.address}</Text>
                  <Text style={styles.starCoordsText}>
                    📍 Lat: {star.coordinates.latitude.toFixed(5)} • Lng: {star.coordinates.longitude.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.ratingPill}>
                  <Text style={styles.ratingPillText}>{star.stars} ⭐</Text>
                </View>
              </View>

              <View style={styles.starNotesBox}>
                <Text style={styles.starNotesLabel}>Tip de Acceso del Domiciliario:</Text>
                <Text style={styles.starNotesText}>"{star.notes}"</Text>
              </View>

              <View style={styles.starFooter}>
                <Text style={styles.starCreatorText}>Registrado por: {star.createdBy}</Text>
                <Text style={styles.starDateText}>{star.createdAt}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* TAB 4: WORKERS LIST */}
      {activeTab === 'trabajadores' && (
        <View style={styles.workersContainer}>
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
                      <Text style={{ fontSize: 20 }}>{cw.vehicle === 'moto' ? '🏍️' : '🚲'}</Text>
                    </View>
                    <View style={styles.workerDetails}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.workerNameText}>{cw.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                          <Text style={styles.statusBadgeText}>{cw.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.workerSub}>{cw.vehicleModel} • {cw.currentZone}</Text>
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

                  <TouchableOpacity
                    style={styles.workerActionBtn}
                    onPress={() => setSelectedWorkerId(cw.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.workerActionBtnText}>Gestionar / Reasignar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* TAB 5: ORDERS DISPATCH */}
      {activeTab === 'pedidos' && (
        <ScrollView style={styles.ordersScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.tabSectionTitle}>Monitoreo de Despacho & Asignaciones</Text>

          {/* SECCIÓN 1: PEDIDOS PENDIENTES DE ASIGNACIÓN */}
          <View style={styles.pendingSection}>
            <View style={styles.pendingSectionHeader}>
              <Ionicons name="alert-circle" size={18} color="#FF1744" />
              <Text style={styles.pendingSectionTitle}>
                🚨 Pedidos Pendientes de Asignación ({pendingOrders.length})
              </Text>
            </View>
            <Text style={styles.pendingSectionSub}>
              {dispatchMode === 'manual'
                ? '📋 MODO MANUAL ACTIVO: Selecciona un repartidor para despachar la orden.'
                : '⚡ MODO AUTOMÁTICO ACTIVO: El sistema asigna automáticamente, o puedes asignar manualmente:'}
            </Text>

            {pendingOrders.length === 0 ? (
              <View style={styles.emptyPendingCard}>
                <Ionicons name="checkmark-done-circle-outline" size={24} color="#00E676" />
                <Text style={styles.emptyPendingText}>No hay pedidos esperando asignación.</Text>
              </View>
            ) : (
              pendingOrders.map((ord) => (
                <View key={ord.id} style={styles.pendingOrderCard}>
                  <View style={styles.orderAdminHeader}>
                    <View style={styles.storeEmojiBox}>
                      <Text style={{ fontSize: 18 }}>{ord.store?.logo || '📦'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderAdminStore}>{ord.store?.name || 'Comercio'}</Text>
                      <Text style={styles.orderAdminCode}>{ord.orderCode} • Para: {ord.customerName}</Text>
                    </View>
                    <Text style={styles.orderAdminEarnings}>{formatCurrency(ord.totalEarnings)}</Text>
                  </View>

                  <View style={styles.orderAdminBody}>
                    <Text style={styles.orderRouteText}>📍 Destino: {ord.customerAddress}</Text>
                    {ord.items && ord.items.length > 0 && (
                      <Text style={styles.orderItemsText}>
                        🛍️ {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </Text>
                    )}

                    <View style={styles.assignPickerBox}>
                      <Text style={styles.assignPickerLabel}>👉 Asignar a Repartidor:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                        {allFleetWorkers.map((cw) => (
                          <TouchableOpacity
                            key={cw.id}
                            style={styles.assignCourierBtn}
                            onPress={() => {
                              assignOrderToCoworker(ord.id, cw.id);
                              Alert.alert('¡Domicilio Asignado!', `El pedido ${ord.orderCode} fue asignado a ${cw.name}.`);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text style={{ fontSize: 13 }}>{cw.vehicle === 'moto' ? '🏍️' : '🚲'}</Text>
                            <Text style={styles.assignCourierBtnText}>{cw.nickname}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* SECCIÓN 2: PEDIDOS ASIGNADOS Y EN CURSO / HISTORIAL */}
          <Text style={[styles.tabSectionTitle, { marginTop: 18 }]}>
            📦 Pedidos Asignados & En Ruta ({allOrders.length - pendingOrders.length})
          </Text>

          {allOrders
            .filter((o) => o.status !== 'pendiente')
            .map((ord) => {
              const isFinished = ord.status === 'entregado';
              const assignedWorker = allFleetWorkers.find((w) => w.id === ord.assignedWorkerId);

              return (
                <View key={ord.id} style={styles.orderAdminCard}>
                  <View style={styles.orderAdminHeader}>
                    <View style={styles.storeEmojiBox}>
                      <Text style={{ fontSize: 18 }}>{ord.store?.logo || '📦'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderAdminStore}>{ord.store?.name || 'Comercio'}</Text>
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

                    {assignedWorker && (
                      <Text style={styles.assignedToText}>
                        👤 Asignado a: <Text style={{ color: '#00E676', fontWeight: '800' }}>{assignedWorker.name}</Text>
                      </Text>
                    )}

                    {!isFinished && (
                      <View style={styles.reassignRow}>
                        <Text style={styles.reassignLabel}>Reasignar a otro courier:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                          {allFleetWorkers.map((cw) => (
                            <TouchableOpacity
                              key={cw.id}
                              style={styles.reassignChip}
                              onPress={() => {
                                assignOrderToCoworker(ord.id, cw.id);
                                Alert.alert('Reasignación', `Orden transferida a ${cw.name}`);
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

      {/* TAB 6: BROADCAST */}
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
                  Alerta masiva para todos los repartidores activos.
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.broadcastInput}
              placeholder="Escribe la directriz o aviso para la flota..."
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
          </View>
        </View>
      )}

      {/* EDIT STORE & PRODUCTS MODAL */}
      {selectedStore && (
        <Modal visible={editStoreModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheetLarge}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Comercio & Catálogo</Text>
                <TouchableOpacity onPress={() => setEditStoreModal(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Nombre de la Tienda:</Text>
                <TextInput style={styles.inputDark} value={editStoreName} onChangeText={setEditStoreName} />

                <Text style={styles.fieldLabel}>Dirección:</Text>
                <TextInput style={styles.inputDark} value={editStoreAddress} onChangeText={setEditStoreAddress} />

                <Text style={styles.fieldLabel}>Bono Especial al Domiciliario (COP):</Text>
                <TextInput style={styles.inputDark} value={editStoreBonus} onChangeText={setEditStoreBonus} keyboardType="numeric" />

                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.fieldLabel}>Latitud:</Text>
                    <TextInput style={styles.inputDark} value={editStoreLat} onChangeText={setEditStoreLat} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Longitud:</Text>
                    <TextInput style={styles.inputDark} value={editStoreLng} onChangeText={setEditStoreLng} keyboardType="numeric" />
                  </View>
                </View>

                {/* Products section */}
                <View style={styles.productsManagerSection}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.sectionSubHeading}>Productos en Venta ({selectedStore.products?.length || 0}):</Text>
                    <TouchableOpacity
                      style={styles.addProdMiniBtn}
                      onPress={() => setShowAddProdModal(true)}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.addProdMiniText}>+ Añadir Producto</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedStore.products?.map((prod) => (
                    <View key={prod.id} style={styles.prodManageRow}>
                      <Text style={{ fontSize: 18, marginRight: 8 }}>{prod.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prodManageName}>{prod.name}</Text>
                        <Text style={styles.prodManagePrice}>{formatCurrency(prod.price)}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteProdBtn}
                        onPress={() => handleDeleteProduct(prod.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooterRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setEditStoreModal(false)}
                >
                  <Text style={styles.cancelModalText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveModalBtn}
                  onPress={handleSaveStoreChanges}
                >
                  <Text style={styles.saveModalText}>Guardar Tienda</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ADD PRODUCT MODAL */}
      <Modal visible={showAddProdModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.addProdCard}>
            <Text style={styles.modalTitle}>Nuevo Producto para {selectedStore?.name}</Text>
            
            <Text style={styles.fieldLabel}>Nombre del Producto:</Text>
            <TextInput style={styles.inputDark} placeholder="Ej. Hamburguesa Doble Carne" placeholderTextColor="#888" value={newProdName} onChangeText={setNewProdName} />

            <Text style={styles.fieldLabel}>Precio (COP):</Text>
            <TextInput style={styles.inputDark} placeholder="25000" placeholderTextColor="#888" value={newProdPrice} onChangeText={setNewProdPrice} keyboardType="numeric" />

            <Text style={styles.fieldLabel}>Emoji Ilustrativo:</Text>
            <View style={styles.emojiPickerRow}>
              {['🍔', '🍕', '🍣', '🍟', '🥤', '🍦', '💊', '🍎', '🥪', '☕'].map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[styles.emojiBtn, newProdEmoji === em && styles.emojiBtnActive]}
                  onPress={() => setNewProdEmoji(em)}
                >
                  <Text style={{ fontSize: 20 }}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Descripción:</Text>
            <TextInput style={styles.inputDark} placeholder="Ingredientes y notas..." placeholderTextColor="#888" value={newProdDesc} onChangeText={setNewProdDesc} />

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowAddProdModal(false)}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleAddProductToStore}
              >
                <Text style={styles.saveModalText}>Añadir al Menú</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Worker Telemetry Modal */}
      {selectedWorker && (
        <Modal visible={!!selectedWorker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View style={styles.rowCenter}>
                  <Text style={{ fontSize: 26, marginRight: 8 }}>{selectedWorker.vehicle === 'moto' ? '🏍️' : '🚲'}</Text>
                  <View>
                    <Text style={styles.modalWorkerName}>{selectedWorker.name}</Text>
                    <Text style={styles.modalWorkerSub}>"{selectedWorker.nickname}" • {selectedWorker.vehicleModel}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedWorkerId(null)}>
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
                    style={[styles.statusToggleBtn, selectedWorker.status === st && styles.statusToggleBtnActive]}
                    onPress={() => {
                      updateCoworkerStatus(selectedWorker.id, st);
                      setSelectedWorkerId(null);
                    }}
                  >
                    <Text style={styles.statusToggleText}>{st.replace('_', ' ').toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1113' },
  topKpiBar: {
    flexDirection: 'row',
    backgroundColor: '#181C21',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
    gap: 6,
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
  kpiVal: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  kpiLabel: { fontSize: 9, color: '#8B949E', marginTop: 1 },
  subnav: {
    backgroundColor: '#181C21',
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
  },
  subnavScroll: {
    paddingHorizontal: 8,
    gap: 6,
  },
  subnavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subnavItemActive: { borderBottomColor: '#FF441F' },
  subnavText: { fontSize: 11, fontWeight: '700', color: '#8B949E' },
  subnavTextActive: { color: '#FFFFFF' },
  mapContainer: { flex: 1, position: 'relative' },
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
  simulateJitterText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  scrollSection: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },
  sectionHeaderRow: { marginBottom: 12 },
  tabSectionTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase' },
  tabSectionSub: { fontSize: 11, color: '#8B949E', marginTop: 2, marginBottom: 14 },
  adminStoreCard: {
    backgroundColor: '#181C21',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  storeCardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  storeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#24282D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeNameText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  storeAddressText: { fontSize: 11, color: '#D1D7E0', marginTop: 2 },
  storeMetaText: { fontSize: 10, color: '#8B949E', marginTop: 2 },
  tierTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tierDiamond: { backgroundColor: '#00C853' },
  tierGold: { backgroundColor: '#FF9100' },
  tierTagText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  productsMiniBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#24282D',
  },
  productsTitle: { fontSize: 11, fontWeight: '700', color: '#8B949E' },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222832',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    gap: 4,
  },
  productChipName: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  productChipPrice: { fontSize: 10, color: '#00C853', fontWeight: '800' },
  noProdText: { fontSize: 11, color: '#666', fontStyle: 'italic' },
  editStoreBtn: {
    backgroundColor: '#2979FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    marginTop: 12,
  },
  editStoreBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  starLocationCard: {
    backgroundColor: '#181C21',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  starCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  starBadgeBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2B2515',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFB300',
  },
  starAddressTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  starCoordsText: { fontSize: 10, color: '#8B949E', marginTop: 2 },
  ratingPill: { backgroundColor: '#FFB300', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingPillText: { fontSize: 10, fontWeight: '900', color: '#1A1D20' },
  starNotesBox: {
    backgroundColor: '#20242B',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  starNotesLabel: { fontSize: 10, fontWeight: '700', color: '#FFB300', marginBottom: 2 },
  starNotesText: { fontSize: 12, color: '#D1D7E0', fontStyle: 'italic' },
  starFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  starCreatorText: { fontSize: 10, color: '#8B949E' },
  starDateText: { fontSize: 10, color: '#666' },
  workersContainer: { flex: 1, paddingHorizontal: 14, paddingTop: 10 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterChip: { backgroundColor: '#1F242C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#292E36' },
  filterChipActive: { backgroundColor: '#FF441F', borderColor: '#FF441F' },
  filterChipText: { fontSize: 11, color: '#8B949E', fontWeight: '700' },
  filterChipTextActive: { color: '#FFFFFF' },
  workersScroll: { flex: 1 },
  workerCard: { backgroundColor: '#181C21', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#292E36' },
  workerCardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  workerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#24282D', alignItems: 'center', justifyContent: 'center' },
  workerDetails: { flex: 1 },
  workerNameText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },
  workerSub: { fontSize: 11, color: '#8B949E', marginTop: 2 },
  workerCardMetrics: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1F242C', padding: 8, borderRadius: 8, marginTop: 10 },
  metricPair: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricValText: { fontSize: 11, color: '#D1D7E0', fontWeight: '700' },
  workerActionBtn: { backgroundColor: '#24282D', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  workerActionBtnText: { color: '#FF441F', fontSize: 11, fontWeight: '800' },
  ordersScroll: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },
  orderAdminCard: { backgroundColor: '#181C21', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#292E36' },
  orderAdminHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#24282D', paddingBottom: 8 },
  storeEmojiBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#24282D', alignItems: 'center', justifyContent: 'center' },
  orderAdminStore: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  orderAdminCode: { fontSize: 11, color: '#8B949E' },
  orderAdminEarnings: { fontSize: 15, fontWeight: '900', color: '#00C853' },
  orderAdminBody: { paddingTop: 8 },
  orderRouteText: { fontSize: 11, color: '#D1D7E0', flex: 1 },
  orderStatusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pillLive: { backgroundColor: '#2979FF' },
  pillDone: { backgroundColor: '#00C853' },
  orderStatusPillText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  reassignRow: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#24282D', paddingTop: 6 },
  reassignLabel: { fontSize: 10, color: '#8B949E', fontWeight: '700' },
  reassignChip: { backgroundColor: '#24282D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 6, borderWidth: 1, borderColor: '#333842' },
  reassignChipText: { fontSize: 10, color: '#FF441F', fontWeight: '700' },
  broadcastContainer: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },
  broadcastCard: { backgroundColor: '#181C21', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#292E36' },
  broadcastHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  megaphoneCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#24282D', alignItems: 'center', justifyContent: 'center' },
  broadcastTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  broadcastSub: { fontSize: 11, color: '#8B949E', marginTop: 2 },
  broadcastInput: { backgroundColor: '#0F1113', borderRadius: 12, padding: 12, fontSize: 13, color: '#FFFFFF', borderWidth: 1, borderColor: '#292E36', textAlignVertical: 'top', minHeight: 90 },
  sendBroadcastBtn: { backgroundColor: '#FF441F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8, marginTop: 12 },
  sendBroadcastBtnDisabled: { backgroundColor: '#3F444E' },
  sendBroadcastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalSheetLarge: { backgroundColor: '#181C21', borderRadius: 20, padding: 20, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: '#2E343E' },
  modalSheet: { backgroundColor: '#181C21', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, width: '100%', borderTopWidth: 1, borderTopColor: '#2E343E' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  modalWorkerName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  modalWorkerSub: { fontSize: 11, color: '#8B949E' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  telemetryGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  telemetryBox: { flex: 1, backgroundColor: '#1F242C', padding: 10, borderRadius: 10, alignItems: 'center' },
  telemetryLabel: { fontSize: 9, color: '#8B949E' },
  telemetryVal: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  actionsModalTitle: { fontSize: 12, fontWeight: '800', color: '#8B949E', marginBottom: 10 },
  statusChangeRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  statusToggleBtn: { flex: 1, backgroundColor: '#24282D', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  statusToggleBtnActive: { backgroundColor: '#FF441F' },
  statusToggleText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#8B949E', marginTop: 10, marginBottom: 4, textTransform: 'uppercase' },
  inputDark: { backgroundColor: '#0F1113', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#FFFFFF', borderWidth: 1, borderColor: '#2E343E' },
  productsManagerSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#282E37' },
  sectionSubHeading: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  addProdMiniBtn: { backgroundColor: '#00C853', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  addProdMiniText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  prodManageRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222832', padding: 8, borderRadius: 8, marginTop: 6 },
  prodManageName: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  prodManagePrice: { fontSize: 11, color: '#00C853', fontWeight: '800' },
  deleteProdBtn: { padding: 6 },
  modalFooterRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelModalBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  cancelModalText: { color: '#8B949E', fontWeight: '700' },
  saveModalBtn: { backgroundColor: '#FF441F', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  saveModalText: { color: '#FFFFFF', fontWeight: '800' },
  addProdCard: { backgroundColor: '#181C21', borderRadius: 18, padding: 20, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: '#2E343E' },
  emojiPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  emojiBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#222832', alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { backgroundColor: '#FF441F' },
  // Dispatch Mode Control Card
  modeControlCard: {
    backgroundColor: '#181C21',
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  modeControlHeader: {
    marginBottom: 8,
  },
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  modeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotManual: {
    backgroundColor: '#FFB300',
  },
  dotAuto: {
    backgroundColor: '#00E676',
  },
  modeStatusTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modeDescriptionText: {
    fontSize: 10,
    color: '#8B949E',
    marginTop: 2,
    lineHeight: 14,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20242B',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E343E',
    gap: 5,
  },
  modeBtnActiveManual: {
    backgroundColor: '#FFB300',
    borderColor: '#FFB300',
  },
  modeBtnActiveAuto: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  modeToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B949E',
  },
  modeToggleBtnTextActive: {
    color: '#1A1D20',
    fontWeight: '900',
  },
  // Pending Orders Section
  pendingSection: {
    backgroundColor: '#201618',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF174440',
    marginBottom: 10,
  },
  pendingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FF5252',
  },
  pendingSectionSub: {
    fontSize: 10,
    color: '#D1D7E0',
    marginVertical: 4,
    lineHeight: 14,
  },
  emptyPendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16221A',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 6,
  },
  emptyPendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E676',
  },
  pendingOrderCard: {
    backgroundColor: '#181C21',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF525260',
  },
  orderItemsText: {
    fontSize: 10,
    color: '#8B949E',
    marginTop: 3,
  },
  assignPickerBox: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#282E37',
  },
  assignPickerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFB300',
  },
  assignCourierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A303A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#3D4452',
  },
  assignCourierBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assignedToText: {
    fontSize: 11,
    color: '#8B949E',
    marginTop: 4,
  },
});
