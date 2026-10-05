import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { PartnerStore, Coworker, DeliveryOrder, StoreCategory, PartnerTier, VehicleType } from '../../types';

type TestLabTab = 'triggers' | 'tienda' | 'trabajador' | 'pedido';

export const TestLabScreen: React.FC = () => {
  const {
    stores,
    coworkers,
    addStore,
    addCoworker,
    createAndDispatchOrder,
    simulateCoworkersMovement,
    sendCommunityMessage,
    resetToMockData,
    setRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TestLabTab>('triggers');

  // Form State: New Store
  const [storeName, setStoreName] = useState('Pizzería Trattoria Romana');
  const [storeCategory, setStoreCategory] = useState<StoreCategory>('restaurante');
  const [storeTier, setStoreTier] = useState<PartnerTier>('diamond');
  const [storeBonus, setStoreBonus] = useState('3500');
  const [storeAddress, setStoreAddress] = useState('Cra. 13 #85-22, Zona Rosa');

  // Form State: New Coworker
  const [workerName, setWorkerName] = useState('Santiago Roldán');
  const [workerNickname, setWorkerNickname] = useState('Santi Moto');
  const [workerVehicle, setWorkerVehicle] = useState<VehicleType>('moto');
  const [workerModel, setWorkerModel] = useState('KTM Duke 200');
  const [workerStatus, setWorkerStatus] = useState<Coworker['status']>('disponible');
  const [workerBattery, setWorkerBattery] = useState('92');

  // Form State: New Test Order
  const [customerName, setCustomerName] = useState('Camila Osorio');
  const [customerAddress, setCustomerAddress] = useState('Cl. 90 #14-25, Apto 402');
  const [orderPay, setOrderPay] = useState('16500');
  const [orderTip, setOrderTip] = useState('4500');

  // Location presets around Bogotá Chicó/Zona Rosa
  const locationPresets = [
    { label: 'Parque de la 93', lat: 4.6775, lng: -74.0538 },
    { label: 'Zona Rosa / Calle 85', lat: 4.6690, lng: -74.0535 },
    { label: 'Chicó Norte', lat: 4.6805, lng: -74.0510 },
    { label: 'El Virrey', lat: 4.6725, lng: -74.0585 },
  ];
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // Handle Add Store
  const handleCreateStore = () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del comercio');
      return;
    }

    const preset = locationPresets[selectedPresetIndex];
    const categoryIcons: Record<string, string> = {
      restaurante: '🍕',
      supermercado: '🛒',
      farmacia: '💊',
      turbo: '⚡',
      express: '🏪',
      licores: '🍾',
    };

    const newStore: PartnerStore = {
      id: `store-${Date.now().toString().slice(-4)}`,
      name: storeName.trim(),
      category: storeCategory,
      partnerTier: storeTier,
      rating: 4.9,
      reviewCount: 150,
      address: storeAddress,
      coordinates: {
        latitude: preset.lat + (Math.random() - 0.5) * 0.001,
        longitude: preset.lng + (Math.random() - 0.5) * 0.001,
      },
      distanceKm: 0.6,
      averagePrepTimeMin: 7,
      activeOrdersWaiting: 3,
      hasBonus: Number(storeBonus) > 0,
      bonusAmount: Number(storeBonus) || 0,
      bonusDescription: `Bono +$${Number(storeBonus).toLocaleString('es-CO')} por convenio especial de prueba`,
      logo: categoryIcons[storeCategory] || '🏪',
      bannerColor: storeTier === 'diamond' ? '#007A33' : '#FF9100',
      openingHours: 'Abierto 24 Horas',
      phone: '+57 311 000 9988',
      tags: ['Convenio Test', 'Despacho Rápido', 'Verificado'],
    };

    addStore(newStore);
    Alert.alert(
      '¡Comercio Aliado Creado!',
      `La tienda "${newStore.name}" fue añadida en ${preset.label} con convenio ${storeTier.toUpperCase()}. ¡Ya aparece en el mapa!`,
      [
        { text: 'Ir a ver al Mapa Repartidor', onPress: () => setRole('repartidor') },
        { text: 'Seguir en Test Lab', style: 'cancel' },
      ]
    );
  };

  // Handle Add Coworker
  const handleCreateCoworker = () => {
    if (!workerName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del repartidor');
      return;
    }

    const preset = locationPresets[selectedPresetIndex];
    const newCoworker: Coworker = {
      id: `cow-${Date.now().toString().slice(-4)}`,
      name: workerName.trim(),
      nickname: workerNickname.trim() || workerName.split(' ')[0],
      vehicle: workerVehicle,
      vehicleModel: workerModel.trim() || 'Moto Urbana',
      status: workerStatus,
      rating: 4.95,
      completedOrdersToday: Math.floor(Math.random() * 8) + 5,
      batteryLevel: Number(workerBattery) || 85,
      coordinates: {
        latitude: preset.lat + (Math.random() - 0.5) * 0.0015,
        longitude: preset.lng + (Math.random() - 0.5) * 0.0015,
      },
      distanceMeters: Math.floor(Math.random() * 400) + 150,
      currentZone: preset.label,
      lastUpdate: 'Recién desplegado',
      avatarColor: workerStatus === 'disponible' ? '#00C853' : '#2979FF',
    };

    addCoworker(newCoworker);
    Alert.alert(
      '¡Repartidor Creado!',
      `${newCoworker.name} (${newCoworker.vehicleModel}) ha sido ubicado en ${preset.label}.`,
      [
        { text: 'Ver en Mapa Repartidor', onPress: () => setRole('repartidor') },
        { text: 'Ver en Torre Admin', onPress: () => setRole('admin') },
        { text: 'Continuar en Sandbox', style: 'cancel' },
      ]
    );
  };

  // Handle Trigger Test Order
  const handleDispatchOrder = (target: 'repartidor' | 'fleet') => {
    const selectedStore = stores[0];
    const newOrder: DeliveryOrder = {
      id: `ord-test-${Date.now().toString().slice(-4)}`,
      orderCode: `#FHS-T${Date.now().toString().slice(-3)}`,
      store: selectedStore,
      customerName: customerName.trim(),
      customerPhone: '+57 312 888 7766',
      customerAddress: customerAddress.trim(),
      customerNotes: 'Timbrar 2 veces. Pago ya verificado.',
      customerCoordinates: {
        latitude: 4.6780 + (Math.random() - 0.5) * 0.002,
        longitude: -74.0540 + (Math.random() - 0.5) * 0.002,
      },
      items: [
        { id: 't-1', name: 'Pedido Gourmet de Prueba (Especial)', quantity: 2, price: 34000, checked: false },
        { id: 't-2', name: 'Bebida Premium Helada', quantity: 2, price: 12000, checked: false },
      ],
      basePay: Number(orderPay) - Number(orderTip),
      customerTip: Number(orderTip),
      partnerBonus: selectedStore.hasBonus ? selectedStore.bonusAmount : 2000,
      totalEarnings: Number(orderPay),
      distanceToStoreKm: 0.5,
      distanceToCustomerKm: 0.9,
      estimatedMinutes: 15,
      paymentMethod: 'Tarjeta (Pagado)',
      securityPin: '4821',
      status: target === 'repartidor' ? 'ofertado' : 'rumbo_tienda',
      createdAt: 'Generado en Sandbox',
    };

    createAndDispatchOrder(newOrder, target);

    if (target === 'repartidor') {
      Alert.alert(
        '¡Alerta de Pedido Enviada al Repartidor!',
        `El pedido ${newOrder.orderCode} (${newOrder.store.name} -> ${newOrder.customerName}) por $${Number(orderPay).toLocaleString('es-CO')} COP está sonando en la app de repartidor.`,
        [
          { text: 'Ir a Aceptar como Repartidor', onPress: () => setRole('repartidor') },
          { text: 'Quedarme aquí', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert('Pedido Despachado', 'El pedido se añadió a la cola de monitoreo de la flota.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.labIconBox}>
            <Ionicons name="flask" size={20} color="#9C27B0" />
          </View>
          <View>
            <Text style={styles.title}>Laboratorio de Pruebas (Test Lab)</Text>
            <Text style={styles.subtitle}>Crea tiendas, trabajadores y eventos en vivo</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.subnav}>
        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'triggers' && styles.subnavItemActive]}
          onPress={() => setActiveTab('triggers')}
        >
          <Ionicons name="flash" size={16} color={activeTab === 'triggers' ? '#9C27B0' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'triggers' && styles.subnavTextActive]}>
            Disparadores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'tienda' && styles.subnavItemActive]}
          onPress={() => setActiveTab('tienda')}
        >
          <MaterialCommunityIcons name="store-plus" size={16} color={activeTab === 'tienda' ? '#9C27B0' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'tienda' && styles.subnavTextActive]}>
            + Tienda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'trabajador' && styles.subnavItemActive]}
          onPress={() => setActiveTab('trabajador')}
        >
          <MaterialCommunityIcons name="account-plus" size={16} color={activeTab === 'trabajador' ? '#9C27B0' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'trabajador' && styles.subnavTextActive]}>
            + Repartidor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subnavItem, activeTab === 'pedido' && styles.subnavItemActive]}
          onPress={() => setActiveTab('pedido')}
        >
          <MaterialCommunityIcons name="package-variant" size={16} color={activeTab === 'pedido' ? '#9C27B0' : '#8B949E'} />
          <Text style={[styles.subnavText, activeTab === 'pedido' && styles.subnavTextActive]}>
            + Pedido
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: TRIGGERS & SIMULATORS */}
        {activeTab === 'triggers' && (
          <View style={styles.sectionCol}>
            <Text style={styles.sectionHeader}>Simuladores y Eventos en Tiempo Real</Text>

            {/* Trigger 1: Move Workers */}
            <TouchableOpacity
              style={styles.triggerCard}
              onPress={() => {
                simulateCoworkersMovement();
                Alert.alert('Telemetría Actualizada', 'Los repartidores cambiaron de posición y batería en el mapa.');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.triggerIconBox, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="map-marker-distance" size={24} color="#00C853" />
              </View>
              <View style={styles.triggerDetails}>
                <Text style={styles.triggerTitle}>Simular Movimiento de Repartidores</Text>
                <Text style={styles.triggerDesc}>
                  Actualiza el GPS y nivel de batería de los {coworkers.length} repartidores en el mapa en vivo.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Trigger 2: Dispatch Order to Repartidor */}
            <TouchableOpacity
              style={styles.triggerCard}
              onPress={() => handleDispatchOrder('repartidor')}
              activeOpacity={0.8}
            >
              <View style={[styles.triggerIconBox, { backgroundColor: '#FFF0ED' }]}>
                <MaterialCommunityIcons name="bell-ring" size={24} color="#FF441F" />
              </View>
              <View style={styles.triggerDetails}>
                <Text style={styles.triggerTitle}>Disparar Pedido Entrante Inmediato</Text>
                <Text style={styles.triggerDesc}>
                  Genera la alerta emergente con temporizador de 30s en la app del repartidor.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Trigger 3: Rain alert */}
            <TouchableOpacity
              style={styles.triggerCard}
              onPress={() => {
                sendCommunityMessage('🌧️ Alerta lluvia: Empieza aguacero fuerte en el cuadrante norte.', 'clima', 'Admin Test Lab');
                Alert.alert('Radio Actualizada', 'Alerta de lluvia enviada a la radio comunitaria.');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.triggerIconBox, { backgroundColor: '#E1F5FE' }]}>
                <Ionicons name="rainy" size={24} color="#0288D1" />
              </View>
              <View style={styles.triggerDetails}>
                <Text style={styles.triggerTitle}>Disparar Alerta de Clima (Lluvia)</Text>
                <Text style={styles.triggerDesc}>
                  Envía un reporte meteorológico al canal de radio y notificaciones.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Trigger 4: Traffic block */}
            <TouchableOpacity
              style={styles.triggerCard}
              onPress={() => {
                sendCommunityMessage('🚨 Retén en Calle 85 con Cra 15, tomen la 11.', 'trafico', 'Admin Test Lab');
                Alert.alert('Radio Actualizada', 'Alerta vial enviada a los repartidores.');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.triggerIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="warning" size={24} color="#F57C00" />
              </View>
              <View style={styles.triggerDetails}>
                <Text style={styles.triggerTitle}>Disparar Alerta de Tránsito</Text>
                <Text style={styles.triggerDesc}>
                  Avisa de trancones o controles de tránsito a toda la flota.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Reset Data */}
            <TouchableOpacity
              style={[styles.triggerCard, styles.resetCard]}
              onPress={() => {
                resetToMockData();
                Alert.alert('Restablecido', 'Se restauraron los comercios, repartidores y pedidos originales.');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.triggerIconBox, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="refresh" size={24} color="#D32F2F" />
              </View>
              <View style={styles.triggerDetails}>
                <Text style={[styles.triggerTitle, { color: '#D32F2F' }]}>Restablecer Datos Iniciales</Text>
                <Text style={styles.triggerDesc}>
                  Vuelve a los valores por defecto del sistema FHS.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: CREATE TEST STORE */}
        {activeTab === 'tienda' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Registrar Comercio Aliado en el Mapa</Text>

            <Text style={styles.fieldLabel}>Nombre del Comercio:</Text>
            <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} />

            <Text style={styles.fieldLabel}>Categoría de Establecimiento:</Text>
            <View style={styles.pillsRow}>
              {(['restaurante', 'supermercado', 'farmacia', 'turbo', 'express'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, storeCategory === cat && styles.pillActive]}
                  onPress={() => setStoreCategory(cat)}
                >
                  <Text style={[styles.pillText, storeCategory === cat && styles.pillTextActive]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Nivel de Convenio:</Text>
            <View style={styles.pillsRow}>
              {(['diamond', 'gold', 'silver'] as const).map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={[styles.pill, storeTier === tier && styles.pillActiveDiamond]}
                  onPress={() => setStoreTier(tier)}
                >
                  <Text style={[styles.pillText, storeTier === tier && styles.pillTextActive]}>
                    {tier === 'diamond' ? '💎 DIAMANTE' : tier === 'gold' ? '🥇 ORO' : '🥈 PLATA'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Bono Especial por Pedido (COP):</Text>
            <TextInput
              style={styles.input}
              value={storeBonus}
              onChangeText={setStoreBonus}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Ubicación en el Mapa (Zona):</Text>
            <View style={styles.presetsGrid}>
              {locationPresets.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetLocBtn, selectedPresetIndex === idx && styles.presetLocBtnActive]}
                  onPress={() => setSelectedPresetIndex(idx)}
                >
                  <Text style={[styles.presetLocText, selectedPresetIndex === idx && styles.presetLocTextActive]}>
                    📍 {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Dirección Visible:</Text>
            <TextInput style={styles.input} value={storeAddress} onChangeText={setStoreAddress} />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateStore} activeOpacity={0.85}>
              <MaterialCommunityIcons name="store-plus" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Añadir Tienda al Mapa</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: CREATE TEST WORKER */}
        {activeTab === 'trabajador' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Desplegar Nuevo Repartidor en el Mapa</Text>

            <Text style={styles.fieldLabel}>Nombre Completo:</Text>
            <TextInput style={styles.input} value={workerName} onChangeText={setWorkerName} />

            <Text style={styles.fieldLabel}>Alias / Apodo:</Text>
            <TextInput style={styles.input} value={workerNickname} onChangeText={setWorkerNickname} />

            <Text style={styles.fieldLabel}>Tipo de Vehículo:</Text>
            <View style={styles.pillsRow}>
              {(['moto', 'bici', 'auto'] as const).map((veh) => (
                <TouchableOpacity
                  key={veh}
                  style={[styles.pill, workerVehicle === veh && styles.pillActive]}
                  onPress={() => setWorkerVehicle(veh)}
                >
                  <Text style={[styles.pillText, workerVehicle === veh && styles.pillTextActive]}>
                    {veh === 'moto' ? '🏍️ MOTOCICLETA' : veh === 'bici' ? '🚲 BICICLETA' : '🚗 AUTO'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Modelo de Vehículo:</Text>
            <TextInput style={styles.input} value={workerModel} onChangeText={setWorkerModel} />

            <Text style={styles.fieldLabel}>Estado Operativo Inicial:</Text>
            <View style={styles.pillsRow}>
              {(['disponible', 'en_ruta', 'en_tienda'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.pill, workerStatus === st && styles.pillActive]}
                  onPress={() => setWorkerStatus(st)}
                >
                  <Text style={[styles.pillText, workerStatus === st && styles.pillTextActive]}>
                    {st.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Ubicación Inicial en el Mapa:</Text>
            <View style={styles.presetsGrid}>
              {locationPresets.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetLocBtn, selectedPresetIndex === idx && styles.presetLocBtnActive]}
                  onPress={() => setSelectedPresetIndex(idx)}
                >
                  <Text style={[styles.presetLocText, selectedPresetIndex === idx && styles.presetLocTextActive]}>
                    📍 {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Batería Inicial (%):</Text>
            <TextInput
              style={styles.input}
              value={workerBattery}
              onChangeText={setWorkerBattery}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateCoworker} activeOpacity={0.85}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Desplegar Trabajador en el Mapa</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 4: CREATE TEST ORDER */}
        {activeTab === 'pedido' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Crear y Despachar Pedido de Prueba</Text>

            <Text style={styles.fieldLabel}>Tienda de Origen:</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>🏪 {stores[0]?.name || 'Tienda Principal'}</Text>
            </View>

            <Text style={styles.fieldLabel}>Nombre del Cliente de Prueba:</Text>
            <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} />

            <Text style={styles.fieldLabel}>Dirección de Entrega:</Text>
            <TextInput style={styles.input} value={customerAddress} onChangeText={setCustomerAddress} />

            <Text style={styles.fieldLabel}>Ganancia Total Ofrecida al Repartidor (COP):</Text>
            <TextInput
              style={styles.input}
              value={orderPay}
              onChangeText={setOrderPay}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Propina Incluida (COP):</Text>
            <TextInput
              style={styles.input}
              value={orderTip}
              onChangeText={setOrderTip}
              keyboardType="numeric"
            />

            <View style={styles.orderActionsRow}>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#FF441F' }]}
                onPress={() => handleDispatchOrder('repartidor')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="bell-ring" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Disparar a Mi App (Repartidor)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#1A1D20', marginTop: 10 }]}
                onPress={() => handleDispatchOrder('fleet')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Despachar a la Flota General</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  labIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1D20',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 1,
  },
  subnav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  subnavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subnavItemActive: {
    borderBottomColor: '#9C27B0',
  },
  subnavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
  },
  subnavTextActive: {
    color: '#9C27B0',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionCol: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#616161',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  triggerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resetCard: {
    borderColor: '#FFCDD2',
    marginTop: 8,
  },
  triggerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerDetails: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D20',
  },
  triggerDesc: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
    lineHeight: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1D20',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#616161',
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1A1D20',
  },
  readOnlyBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readOnlyText: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pillActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  pillActiveDiamond: {
    backgroundColor: '#00C853',
    borderColor: '#00C853',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#616161',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetLocBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presetLocBtnActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  presetLocText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#424242',
  },
  presetLocTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginTop: 18,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  orderActionsRow: {
    marginTop: 10,
  },
});
