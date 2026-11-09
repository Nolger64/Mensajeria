import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AURA_THEME } from '../../../../src/theme/auraTheme';
import { AdminCentralTab } from '../../../App';

interface AdminDashboardScreenProps {
  activeCentralTab?: AdminCentralTab;
  onSelectTab?: (tab: AdminCentralTab) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  activeCentralTab = 'operaciones',
  onSelectTab,
}) => {
  // Operaciones state
  const [operationalPause, setOperationalPause] = useState(false);
  const [flowFilter, setFlowFilter] = useState<'todos' | 'botica' | 'ruta' | 'alerta'>('todos');

  // Sedes & Stock state
  const [stockSedeFilter, setStockSedeFilter] = useState<'todas' | 'jardines' | 'providencia'>('todas');

  // Flota state
  const [fleetFilter, setFleetFilter] = useState<'todos' | 'ruta' | 'sede' | 'pausa'>('todos');

  // Métricas state
  const [periodFilter, setPeriodFilter] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  // 1. TAB OPERACIONES (Page 12)
  const renderOperacionesTab = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Top action pause bar */}
      <View style={styles.topControlBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.controlBannerTitle}>Red de Boticas Activa</Text>
          <Text style={styles.controlBannerSub}>3/3 Sedes 100% operando con despacho continuo</Text>
        </View>
        <TouchableOpacity
          style={[styles.pauseOpsBtn, operationalPause && styles.pauseOpsBtnActive]}
          onPress={() => {
            const next = !operationalPause;
            setOperationalPause(next);
            Alert.alert(
              next ? '⏸️ Pausa Activada' : '▶️ Operación Reanudada',
              next
                ? 'Se han pausado temporalmente las asignaciones automáticas de pedidos exprés.'
                : 'La red botánica está recibiendo y despachando con normalidad.'
            );
          }}
          activeOpacity={0.8}
        >
          <Ionicons name={operationalPause ? 'play' : 'pause'} size={14} color="#FFFFFF" />
          <Text style={styles.pauseOpsBtnText}>
            {operationalPause ? 'Reanudar Red' : 'Pausa Operativa General'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsQuadRow}>
        <View style={styles.metricQuadCard}>
          <Text style={styles.metricQuadLabel}>EN CURSO</Text>
          <Text style={styles.metricQuadVal}>38 ped.</Text>
          <Text style={styles.metricQuadSub}>14 botica · 19 ruta · 5 val</Text>
        </View>
        <View style={styles.metricQuadCard}>
          <Text style={styles.metricQuadLabel}>FACTURACIÓN</Text>
          <Text style={styles.metricQuadVal}>$28,450</Text>
          <Text style={[styles.metricQuadSub, { color: AURA_THEME.colors.statusGreen }]}>+18.4% vs ayer</Text>
        </View>
        <View style={styles.metricQuadCard}>
          <Text style={styles.metricQuadLabel}>T. DESPACHO</Text>
          <Text style={styles.metricQuadVal}>23 min</Text>
          <Text style={styles.metricQuadSub}>Meta ≤ 25 min</Text>
        </View>
        <View style={styles.metricQuadCard}>
          <Text style={styles.metricQuadLabel}>SERENIDAD</Text>
          <Text style={[styles.metricQuadVal, { color: AURA_THEME.colors.statusGreen }]}>98.6%</Text>
          <Text style={styles.metricQuadSub}>Índice cliente</Text>
        </View>
      </View>

      {/* Atención Requerida */}
      <View style={styles.attentionSection}>
        <View style={styles.attentionHeader}>
          <Text style={styles.sectionTitle}>Atención Requerida</Text>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>2 Urgentes</Text>
          </View>
        </View>

        {/* Urgent Item 1 */}
        <View style={styles.urgentCard}>
          <View style={styles.urgentCardHeader}>
            <Text style={styles.urgentTag}>MANIPULACIÓN FINA</Text>
            <Text style={styles.urgentSede}>Sede Providencia</Text>
          </View>
          <Text style={styles.urgentTitle}>
            #AUR-8924 · Frasco ámbar de infusión floral requiere cofre de lino acolchado antes de sellar.
          </Text>
          <View style={styles.urgentActions}>
            <TouchableOpacity
              style={styles.urgentBtnPrimary}
              onPress={() => Alert.alert('Empaque', 'Instrucciones enviadas al módulo de boticaria.')}
            >
              <Text style={styles.urgentBtnPrimaryText}>Atender Empaque</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.urgentBtnSecondary}
              onPress={() => Alert.alert('Guía', 'Protocolo: envolver frascos ámbar en triple capa de lino.')}
            >
              <Text style={styles.urgentBtnSecondaryText}>Instrucciones</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Urgent Item 2 */}
        <View style={styles.urgentCard}>
          <View style={styles.urgentCardHeader}>
            <Text style={[styles.urgentTag, { color: '#B45309' }]}>SATURACIÓN DE CABINAS</Text>
            <Text style={styles.urgentSede}>85% Ocupación</Text>
          </View>
          <Text style={styles.urgentTitle}>
            Sede Jardines cercana al límite de aromaterapia vespertina. 4 citas simultáneas en 30m.
          </Text>
          <View style={styles.urgentActions}>
            <TouchableOpacity
              style={styles.urgentBtnPrimary}
              onPress={() => Alert.alert('Derivar', 'Flujo derivado a Sede Providencia para envíos express.')}
            >
              <Text style={styles.urgentBtnPrimaryText}>Derivar Flujo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.urgentBtnSecondary}
              onPress={() => Alert.alert('Agenda', 'Consultando turnos de boticarias y terapeutas.')}
            >
              <Text style={styles.urgentBtnSecondaryText}>Ver Agenda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Flujo en Vivo */}
      <View style={styles.liveFlowSection}>
        <View style={styles.liveFlowHeader}>
          <Text style={styles.sectionTitle}>Flujo en Vivo</Text>
          <Text style={styles.updatedText}>Actualizado en tiempo real</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterTabsRow}>
          {[
            { id: 'todos', label: 'Todos (38)' },
            { id: 'botica', label: 'En Botica (14)' },
            { id: 'ruta', label: 'En Ruta (19)' },
            { id: 'alerta', label: 'En Alerta (5)' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTabPill, flowFilter === tab.id && styles.filterTabPillActive]}
              onPress={() => setFlowFilter(tab.id as any)}
            >
              <Text style={[styles.filterTabPillText, flowFilter === tab.id && styles.filterTabPillTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders list items */}
        <View style={styles.flowCard}>
          <View style={styles.flowCardHeader}>
            <Text style={styles.flowOrderCode}>#AUR-8924 · Artesanal</Text>
            <View style={styles.flowBadgeBotica}>
              <Text style={styles.flowBadgeBoticaText}>En Alquimia · -6 min</Text>
            </View>
          </View>
          <Text style={styles.flowRoute}>Jardines → Polanco Residencial</Text>
          <Text style={styles.flowProduct}>Kit Baño de Inmersión Botánica</Text>
          <Text style={styles.flowWorker}>Boticaria Elena V. · Macerando esencias puras</Text>
        </View>

        <View style={styles.flowCard}>
          <View style={styles.flowCardHeader}>
            <Text style={styles.flowOrderCode}>#AUR-8921 · En Ruta</Text>
            <View style={styles.flowBadgeRuta}>
              <Text style={styles.flowBadgeRutaText}>8 min rest.</Text>
            </View>
          </View>
          <Text style={styles.flowRoute}>Providencia → Roma Norte (Ámsterdam 142)</Text>
          <Text style={styles.flowProduct}>Elixir Lavanda & Bruma Facial</Text>
          <Text style={styles.flowWorker}>
            Embajador Mateo R. (Unidad #08) · Cofre térmico a 21°C verificado
          </Text>
        </View>

        <View style={styles.flowCard}>
          <View style={styles.flowCardHeader}>
            <Text style={styles.flowOrderCode}>#AUR-8927 · Despacho Local</Text>
            <View style={styles.flowBadgeAlert}>
              <Text style={styles.flowBadgeAlertText}>Atención Stock</Text>
            </View>
          </View>
          <Text style={styles.flowRoute}>Sede Condesa</Text>
          <Text style={styles.flowProduct}>Aceite esencial de Sándalo Silvestre (1 unidad restante)</Text>
          <View style={styles.stockActionsRow}>
            <TouchableOpacity
              style={styles.stockActionBtn}
              onPress={() => Alert.alert('Lote', 'Lote de reserva 884 autorizado.')}
            >
              <Text style={styles.stockActionBtnText}>Autorizar Lote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stockActionSecBtn}
              onPress={() => Alert.alert('Posponer', 'Notificación enviada al cliente.')}
            >
              <Text style={styles.stockActionSecBtnText}>Posponer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Quick Action CTAs */}
      <View style={styles.bottomQuickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Pedido Manual', 'Abriendo formulario de despacho exprés...')}
        >
          <Ionicons name="add-circle-outline" size={16} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.quickActionText}>Pedido Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Ruta Express', 'Calculando rutas verdes optimizadas...')}
        >
          <Ionicons name="bicycle-outline" size={16} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.quickActionText}>Ruta Express</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 2. TAB SEDES & STOCK (Page 9)
  const renderSedesStockTab = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.pageTitle}>Sedes y Stock</Text>
          <Text style={styles.pageSubtitle}>Monitoreo de inventario botánico y capacidad de boticas</Text>
        </View>
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.smallActionBtn}
            onPress={() => Alert.alert('Lote', 'Escáner QR / Barcode activo para recepción de lotes.')}
          >
            <Ionicons name="qr-code-outline" size={14} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.smallActionText}>Escanear Lote</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sede selector filter */}
      <View style={styles.stockFiltersRow}>
        {[
          { id: 'todas', label: 'Todas (Consolidado)' },
          { id: 'jardines', label: 'Sede Jardines' },
          { id: 'providencia', label: 'Sede Providencia' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.stockPill, stockSedeFilter === tab.id && styles.stockPillActive]}
            onPress={() => setStockSedeFilter(tab.id as any)}
          >
            <Text style={[styles.stockPillText, stockSedeFilter === tab.id && styles.stockPillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inventario Crítico Card */}
      <View style={styles.stockAlertCard}>
        <View style={styles.stockAlertHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="alert-circle" size={18} color={AURA_THEME.colors.terracotta} />
            <Text style={styles.stockAlertTitle}>Inventario Crítico</Text>
          </View>
          <View style={styles.criticalCountBadge}>
            <Text style={styles.criticalCountText}>4 Alertas Hoy</Text>
          </View>
        </View>
        <Text style={styles.stockAlertSub}>
          Se identificaron umbrales bajo reserva mínima. Requiere reposición antes del servicio vespertino.
        </Text>

        {/* Item 1 */}
        <View style={styles.criticalItemRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.criticalItemName}>Aceite Lavanda & Cedro</Text>
              <View style={styles.urgentRedBadge}>
                <Text style={styles.urgentRedBadgeText}>Urgente</Text>
              </View>
            </View>
            <Text style={styles.criticalItemSub}>
              Sede Jardines · 4 uds (Mín: 10) · Central tiene 84 uds disponibles
            </Text>
          </View>
          <TouchableOpacity
            style={styles.transferStockBtn}
            onPress={() => Alert.alert('Transferencia', 'Solicitud enviada a Almacén Central para 12 unidades.')}
          >
            <Text style={styles.transferStockBtnText}>Pedir Transferencia</Text>
          </TouchableOpacity>
        </View>

        {/* Item 2 */}
        <View style={styles.criticalItemRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.criticalItemName}>Vela Cera Soja & Bergamota</Text>
            <Text style={styles.criticalItemSub}>Condesa Boutique · 2 uds (Mín: 6)</Text>
          </View>
          <TouchableOpacity
            style={styles.transferStockBtn}
            onPress={() => Alert.alert('Transferencia', 'Orden de reposición creada.')}
          >
            <Text style={styles.transferStockBtnText}>Pedir</Text>
          </TouchableOpacity>
        </View>

        {/* Item 3 */}
        <View style={styles.criticalItemRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.criticalItemName}>Kit Ritual Nocturno</Text>
            <Text style={styles.criticalItemSub}>Sede Providencia · 3 uds (Mín: 8)</Text>
          </View>
          <TouchableOpacity
            style={styles.transferStockBtn}
            onPress={() => Alert.alert('Transferencia', 'Orden de reposición creada.')}
          >
            <Text style={styles.transferStockBtnText}>Pedir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Salud y Capacidad de Sedes */}
      <View style={styles.sedesCapacityCard}>
        <View style={styles.sedesCapacityHeader}>
          <Text style={styles.sectionTitle}>Capacidad & Recursos</Text>
          <Text style={styles.sedesCapacitySub}>3 activas</Text>
        </View>

        {/* Sede 1 */}
        <View style={styles.sedeHealthItem}>
          <View style={styles.sedeHealthTop}>
            <Text style={styles.sedeHealthName}>Jardines del Valle</Text>
            <View style={styles.loadBadgeHigh}>
              <Text style={styles.loadBadgeHighText}>Carga 85% (Alta)</Text>
            </View>
          </View>
          <Text style={styles.sedeHealthDetail}>
            8 boticarias operando · 4 eco-bikes en turno · Stock General 94%
          </Text>
        </View>

        {/* Sede 2 */}
        <View style={styles.sedeHealthItem}>
          <View style={styles.sedeHealthTop}>
            <Text style={styles.sedeHealthName}>Providencia (Santuario Botánico)</Text>
            <View style={styles.loadBadgeOpt}>
              <Text style={styles.loadBadgeOptText}>Carga 60% (Óptima)</Text>
            </View>
          </View>
          <Text style={styles.sedeHealthDetail}>
            3 boticarias en turno · 6 eco-bikes operando · Stock General 88%
          </Text>
        </View>

        {/* Sede 3 */}
        <View style={styles.sedeHealthItem}>
          <View style={styles.sedeHealthTop}>
            <Text style={styles.sedeHealthName}>Condesa Boutique (Apothecary Bar)</Text>
            <View style={styles.loadBadgeNormal}>
              <Text style={styles.loadBadgeNormalText}>Carga 42% (Normal)</Text>
            </View>
          </View>
          <Text style={styles.sedeHealthDetail}>
            2 boticarias en turno · 5 eco-bikes operando · Stock General 91%
          </Text>
        </View>
      </View>

      {/* Transferencias Activas */}
      <View style={styles.transferCard}>
        <Text style={styles.sectionTitle}>Transferencias Activas (1 en curso)</Text>
        <View style={styles.transferItem}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Text style={styles.transferUnit}>Eco-Bike #04 · Mensajero Mateo Silva</Text>
            <Text style={styles.transferEta}>18 min estimados</Text>
          </View>
          <Text style={styles.transferContent}>
            25 Goteros Caléndula Orgánica & Bruma (Lote #884)
          </Text>
          <Text style={styles.transferRoute}>Almacén Central → Sede Jardines</Text>
        </View>
      </View>

      {/* Sustentabilidad Activa - Retorno de Vidrio */}
      <View style={styles.circularCard}>
        <View style={styles.circularHeader}>
          <MaterialCommunityIcons name="recycle" size={22} color={AURA_THEME.colors.forestDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.circularTitle}>Economía Circular: Retorno de Vidrio</Text>
            <Text style={styles.circularSub}>
              Frascos de botica devueltos por miembros del club y reacondicionados con vaporización biológica.
            </Text>
          </View>
        </View>

        <View style={styles.circularStatsRow}>
          <View style={styles.circularStatCol}>
            <Text style={styles.circularStatNum}>1,240</Text>
            <Text style={styles.circularStatLabel}>Frascos Recolectados</Text>
            <Text style={styles.circularStatSub}>+14% vs meta mensual</Text>
          </View>
          <View style={styles.circularDivider} />
          <View style={styles.circularStatCol}>
            <Text style={styles.circularStatNum}>480</Text>
            <Text style={styles.circularStatLabel}>Esterilizados / Listos</Text>
            <Text style={styles.circularStatSub}>Recarga inmediata</Text>
          </View>
          <View style={styles.circularDivider} />
          <View style={styles.circularStatCol}>
            <Text style={[styles.circularStatNum, { color: AURA_THEME.colors.statusGreen }]}>216 kg</Text>
            <Text style={styles.circularStatLabel}>CO₂ Evitados</Text>
            <Text style={styles.circularStatSub}>Impacto positivo</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // 3. TAB FLOTA (Page 4)
  const renderFlotaTab = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Fleet Hero Banner */}
      <View style={styles.fleetHero}>
        <View style={styles.fleetHeroTop}>
          <View style={styles.onlineFleetPill}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.onlineFleetText}>16/20 En Línea</Text>
          </View>
          <View style={styles.co2SavedPill}>
            <Ionicons name="leaf" size={12} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.co2SavedText}>42.8 kg CO₂ Evitado</Text>
          </View>
        </View>

        <Text style={styles.fleetHeroTitle}>FLOTA BOTÁNICA ACTIVA</Text>
        <Text style={styles.fleetHeroSub}>
          Rutas Verdes & Tráfico Suave • 3 Sedes · 14 Embajadores · Monitoreo GPS HD
        </Text>

        <View style={styles.fleetMetricsRow}>
          <View style={styles.fleetMetricBox}>
            <Text style={styles.fleetMetricVal}>14</Text>
            <Text style={styles.fleetMetricLabel}>En Ruta</Text>
          </View>
          <View style={styles.fleetMetricBox}>
            <Text style={styles.fleetMetricVal}>2</Text>
            <Text style={styles.fleetMetricLabel}>En Sede</Text>
          </View>
          <View style={styles.fleetMetricBox}>
            <Text style={styles.fleetMetricVal}>4</Text>
            <Text style={styles.fleetMetricLabel}>Pausa</Text>
          </View>
        </View>
      </View>

      {/* Fleet Filter Tabs */}
      <View style={styles.fleetFiltersRow}>
        {[
          { id: 'todos', label: 'Todos (20)' },
          { id: 'ruta', label: 'En Ruta (14)' },
          { id: 'sede', label: 'En Sede (2)' },
          { id: 'pausa', label: 'Pausa (4)' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.fleetFilterPill, fleetFilter === tab.id && styles.fleetFilterPillActive]}
            onPress={() => setFleetFilter(tab.id as any)}
          >
            <Text style={[styles.fleetFilterText, fleetFilter === tab.id && styles.fleetFilterTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Couriers Cards matching Page 4 */}
      {/* Courier 1 */}
      <View style={styles.courierCard}>
        <View style={styles.courierCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.courierName}>Mateo R.</Text>
            <View style={styles.lotoBadgeMini}>
              <Text style={styles.lotoBadgeMiniText}>Loto Oro</Text>
            </View>
            <Text style={styles.courierRating}>★ 4.98</Text>
          </View>
          <View style={styles.batteryPill}>
            <Ionicons name="battery-charging" size={13} color={AURA_THEME.colors.statusGreen} />
            <Text style={styles.batteryText}>84%</Text>
          </View>
        </View>

        <Text style={styles.courierVehicleLine}>Eco-Bike #08 · Baúl: 21.2°C (Óptimo)</Text>
        <Text style={styles.courierOrderInfo}>
          Polanco V Secc · Pedido #AUR-8921 · 8 min rest. · Aceites Esenciales
        </Text>

        <View style={styles.courierCardActions}>
          <TouchableOpacity
            style={styles.courierCardBtn}
            onPress={() => Alert.alert('Llamada', 'Conectando con Mateo Silva...')}
          >
            <Ionicons name="call" size={13} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.courierCardBtnText}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.courierCardBtn}
            onPress={() => Alert.alert('Mapa', 'Ruta GPS de Mateo Silva activa sobre Horacio y Polanco.')}
          >
            <Ionicons name="map" size={13} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.courierCardBtnText}>Ver en Mapa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Courier 2 */}
      <View style={styles.courierCard}>
        <View style={styles.courierCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.courierName}>Carlos M.</Text>
            <View style={styles.lotoBadgeMini}>
              <Text style={styles.lotoBadgeMiniText}>Loto Oro</Text>
            </View>
            <Text style={styles.courierRating}>★ 4.95</Text>
          </View>
          <View style={[styles.batteryPill, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="battery-half" size={13} color="#D97706" />
            <Text style={[styles.batteryText, { color: '#D97706' }]}>45% (Baja)</Text>
          </View>
        </View>

        <Text style={styles.courierVehicleLine}>Eco-Bike #12 · Baúl: 20.8°C (Estable)</Text>
        <Text style={styles.courierOrderInfo}>
          San Ángel · Pedido #AUR-8919 · 16 min rest. · Velas de Cera
        </Text>

        <View style={styles.courierCardActions}>
          <TouchableOpacity
            style={styles.courierCardBtn}
            onPress={() => Alert.alert('Llamada', 'Conectando con Carlos M...')}
          >
            <Ionicons name="call" size={13} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.courierCardBtnText}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.courierCardBtn}
            onPress={() => Alert.alert('Mapa', 'Ruta GPS de Carlos M. activa.')}
          >
            <Ionicons name="map" size={13} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.courierCardBtnText}>Ver en Mapa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Courier 3 */}
      <View style={styles.courierCard}>
        <View style={styles.courierCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.courierName}>Sofía T.</Text>
            <View style={styles.availableBadgeMini}>
              <Text style={styles.availableBadgeMiniText}>Disponible</Text>
            </View>
            <Text style={styles.courierRating}>★ 5.0</Text>
          </View>
          <View style={styles.batteryPill}>
            <Ionicons name="battery-full" size={13} color={AURA_THEME.colors.statusGreen} />
            <Text style={styles.batteryText}>92%</Text>
          </View>
        </View>

        <Text style={styles.courierVehicleLine}>Eco-Bike #03 · Sede Jardines del Valle</Text>
        <Text style={styles.courierOrderInfo}>
          En reposo botánico. Lista para asignación inmediata.
        </Text>
      </View>
    </ScrollView>
  );

  // 4. TAB MÉTRICAS & FINANZAS (Page 1)
  const renderMetricasTab = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header and filters */}
      <View style={styles.metricasTopHeader}>
        <View>
          <Text style={styles.pageTitle}>PANEL EJECUTIVO</Text>
          <Text style={styles.pageSubtitle}>Métricas & Finanzas</Text>
        </View>
        <View style={styles.auditPill}>
          <Text style={styles.auditPillText}>Auditoría 21:00</Text>
        </View>
      </View>

      <View style={styles.periodPillsRow}>
        {[
          { id: 'hoy', label: 'Hoy' },
          { id: 'semana', label: 'Esta Semana' },
          { id: 'mes', label: 'Últimos 30 días' },
        ].map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.periodPill, periodFilter === p.id && styles.periodPillActive]}
            onPress={() => setPeriodFilter(p.id as any)}
          >
            <Text style={[styles.periodPillText, periodFilter === p.id && styles.periodPillTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Facturación Neta Hoy Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>FACTURACIÓN NETA HOY</Text>
        <View style={styles.revenueAmountRow}>
          <Text style={styles.revenueAmount}>$28,450.00</Text>
          <Text style={styles.revenueCurrency}>MXN</Text>
          <View style={styles.plusPercentPill}>
            <Text style={styles.plusPercentText}>+18.4%</Text>
          </View>
        </View>
        <Text style={styles.revenueCompared}>
          Superando promedio histórico por $4,420 MXN
        </Text>

        <View style={styles.revenueStatsRow}>
          <View style={styles.revenueStatCol}>
            <Text style={styles.revStatTitle}>Pedidos Completados</Text>
            <Text style={styles.revStatVal}>115 órdenes</Text>
            <Text style={styles.revStatSub}>Ticket: $247.40 MXN</Text>
          </View>
          <View style={styles.revStatDivider} />
          <View style={styles.revenueStatCol}>
            <Text style={styles.revStatTitle}>Cumplimiento en Tiempo</Text>
            <Text style={[styles.revStatVal, { color: AURA_THEME.colors.statusGreen }]}>99.4%</Text>
            <Text style={styles.revStatSub}>Meta operativa: &gt;98%</Text>
          </View>
        </View>
      </View>

      {/* Ventas por Santuario */}
      <View style={styles.salesBySantuarioCard}>
        <View style={styles.cardHeaderBetween}>
          <Text style={styles.sectionTitle}>Ventas por Santuario</Text>
          <Text style={styles.sanctuariesActiveCount}>3 SEDES ACTIVAS</Text>
        </View>

        <View style={styles.sanctuaryBarRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={styles.sancName}>Jardines del Valle</Text>
              <Text style={styles.sancVal}>$12,800 MXN (45%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barProg, { width: '45%', backgroundColor: AURA_THEME.colors.forestDark }]} />
            </View>
          </View>
        </View>

        <View style={styles.sanctuaryBarRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={styles.sancName}>Providencia</Text>
              <Text style={styles.sancVal}>$9,960 MXN (35%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barProg, { width: '35%', backgroundColor: AURA_THEME.colors.forestMedium }]} />
            </View>
          </View>
        </View>

        <View style={styles.sanctuaryBarRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={styles.sancName}>Condesa Boutique</Text>
              <Text style={styles.sancVal}>$5,690 MXN (20%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barProg, { width: '20%', backgroundColor: AURA_THEME.colors.terracotta }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Curva Horaria */}
      <View style={styles.hourlyCard}>
        <View style={styles.cardHeaderBetween}>
          <View>
            <Text style={styles.hourlyLabel}>CURVA HORARIA</Text>
            <Text style={styles.sectionTitle}>Ritmo de Ventas</Text>
          </View>
          <View style={styles.peakBadge}>
            <Text style={styles.peakBadgeText}>Pico 17:00 - 21:00 Vespertino</Text>
          </View>
        </View>
        <Text style={styles.hourlyDesc}>
          Incremento exponencial en despachos de aromaterapia nocturna y rituales de relajación previa al descanso.
        </Text>

        <View style={styles.hourlyTimelineRow}>
          {['10:00', '13:00', '16:00', '19:00 (Zen Peak)', '21:30'].map((hour, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, idx === 3 && styles.timelineDotPeak]} />
              <Text style={[styles.timelineText, idx === 3 && styles.timelineTextPeak]}>{hour}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top 3 Fórmulas Botánicas Destacadas */}
      <View style={styles.topFormulasCard}>
        <View style={styles.cardHeaderBetween}>
          <Text style={styles.sectionTitle}>Fórmulas Botánicas Destacadas</Text>
          <Text style={styles.topTag}>TOP 3 DEL DÍA</Text>
        </View>

        {/* 1 */}
        <View style={styles.formulaRankItem}>
          <View style={styles.rankBadgeFirst}>
            <Text style={styles.rankNum}>1</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.formulaRankName}>Aceite Lavanda & Cedro</Text>
            <Text style={styles.formulaRankSub}>38 unidades despachadas · 32% del catálogo</Text>
          </View>
          <Text style={styles.formulaRankPrice}>$9,120 MXN</Text>
        </View>

        {/* 2 */}
        <View style={styles.formulaRankItem}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNum}>2</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.formulaRankName}>Vela Soja & Bergamota</Text>
            <Text style={styles.formulaRankSub}>29 unidades despachadas · Stock óptimo</Text>
          </View>
          <Text style={styles.formulaRankPrice}>$5,655 MXN</Text>
        </View>

        {/* 3 */}
        <View style={styles.formulaRankItem}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNum}>3</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.formulaRankName}>Bruma Romero Silvestre</Text>
            <Text style={styles.formulaRankSub}>24 unidades despachadas · Alta rotación</Text>
          </View>
          <Text style={styles.formulaRankPrice}>$3,960 MXN</Text>
        </View>
      </View>

      {/* Compensación & Huella Verde */}
      <View style={styles.compensationCard}>
        <View style={styles.cardHeaderBetween}>
          <Text style={styles.sectionTitle}>Compensación & Huella Verde</Text>
          <Text style={styles.liquidatedTag}>Liquidado Hoy</Text>
        </View>

        <View style={styles.compRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.compLabel}>Embajadores & Reparto</Text>
            <Text style={styles.compSub}>100% dispersión automática al día</Text>
          </View>
          <Text style={styles.compAmount}>$6,540 MXN</Text>
        </View>

        <View style={styles.compRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.compLabel}>Propinas Directas Integradas</Text>
            <Text style={styles.compSub}>Sin comisiones intermediarias</Text>
          </View>
          <Text style={styles.compAmount}>$1,420 MXN</Text>
        </View>

        <View style={styles.compRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.compLabel}>Retorno de Envases de Vidrio</Text>
            <Text style={styles.compSub}>48 botellas devueltas en circuito</Text>
          </View>
          <Text style={[styles.compAmount, { color: AURA_THEME.colors.statusGreen }]}>
            $480 MXN
          </Text>
        </View>
      </View>

      {/* Share / Export Actions */}
      <View style={styles.exportActionsRow}>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => Alert.alert('Descarga', 'Generando reporte ejecutivo botánico en PDF...')}
        >
          <Ionicons name="document-text-outline" size={15} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.exportBtnText}>Descargar Resumen Ejecutivo PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Alert.alert('Compartir', 'Enlace seguro generado para socios y junta directiva.')}
        >
          <Ionicons name="share-social-outline" size={15} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.shareBtnText}>Compartir con Socios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {activeCentralTab === 'operaciones' && renderOperacionesTab()}
      {activeCentralTab === 'sedes_stock' && renderSedesStockTab()}
      {activeCentralTab === 'flota' && renderFlotaTab()}
      {activeCentralTab === 'metricas' && renderMetricasTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  topControlBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
    gap: 12,
  },
  controlBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  controlBannerSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  pauseOpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: AURA_THEME.borderRadius.sm,
    gap: 5,
  },
  pauseOpsBtnActive: {
    backgroundColor: AURA_THEME.colors.terracotta,
  },
  pauseOpsBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  metricsQuadRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricQuadCard: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  metricQuadLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricQuadVal: {
    fontSize: 13,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 1,
  },
  metricQuadSub: {
    fontSize: 8.5,
    color: AURA_THEME.colors.textMuted,
  },
  attentionSection: {
    marginBottom: 16,
  },
  attentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertBadge: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C53030',
  },
  urgentCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 8,
  },
  urgentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  urgentTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C53030',
    letterSpacing: 0.8,
  },
  urgentSede: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  urgentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
    lineHeight: 16,
    marginBottom: 8,
  },
  urgentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  urgentBtnPrimary: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  urgentBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  urgentBtnSecondary: {
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  urgentBtnSecondaryText: {
    color: AURA_THEME.colors.forestDark,
    fontSize: 10.5,
    fontWeight: '600',
  },
  liveFlowSection: {
    marginBottom: 16,
  },
  liveFlowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updatedText: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterTabPill: {
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  filterTabPillActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
    borderColor: AURA_THEME.colors.forestDark,
  },
  filterTabPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
  filterTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  flowCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 8,
  },
  flowCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  flowOrderCode: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  flowBadgeBotica: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flowBadgeBoticaText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  flowBadgeRuta: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flowBadgeRutaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  flowBadgeAlert: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flowBadgeAlertText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C53030',
  },
  flowRoute: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
  },
  flowProduct: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginTop: 1,
  },
  flowWorker: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textSecondary,
    marginTop: 2,
  },
  stockActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  stockActionBtn: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockActionBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  stockActionSecBtn: {
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockActionSecBtnText: {
    color: AURA_THEME.colors.forestDark,
    fontSize: 10,
  },
  bottomQuickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    gap: 6,
  },
  quickActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },

  // Sedes & Stock Styles (Page 9)
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  pageSubtitle: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
  },
  topActionsRow: {
    flexDirection: 'row',
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    gap: 4,
  },
  smallActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  stockFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  stockPill: {
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  stockPillActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
  stockPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stockAlertCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  stockAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockAlertTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  criticalCountBadge: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8DCB8',
  },
  criticalCountText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.terracotta,
  },
  stockAlertSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 10,
  },
  criticalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  criticalItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  urgentRedBadge: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  urgentRedBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#C53030',
  },
  criticalItemSub: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    marginTop: 1,
  },
  transferStockBtn: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  transferStockBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sedesCapacityCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  sedesCapacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sedesCapacitySub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  sedeHealthItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  sedeHealthTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sedeHealthName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  loadBadgeHigh: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadBadgeHighText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#991B1B',
  },
  loadBadgeOpt: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadBadgeOptText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  loadBadgeNormal: {
    backgroundColor: '#EBF3EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadBadgeNormalText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.forestMedium,
  },
  sedeHealthDetail: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  transferCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  transferItem: {
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    marginTop: 8,
  },
  transferUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  transferEta: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  transferContent: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    marginTop: 2,
  },
  transferRoute: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    marginTop: 2,
  },
  circularCard: {
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    marginBottom: 14,
  },
  circularHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  circularTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  circularSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 14,
  },
  circularStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
  },
  circularStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  circularStatNum: {
    fontSize: 15,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
  },
  circularStatLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestMedium,
    textAlign: 'center',
  },
  circularStatSub: {
    fontSize: 8.5,
    color: AURA_THEME.colors.textMuted,
  },
  circularDivider: {
    width: 1,
    backgroundColor: AURA_THEME.colors.borderLight,
  },

  // Flota Styles (Page 4)
  fleetHero: {
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    marginBottom: 12,
  },
  fleetHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  onlineFleetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AURA_THEME.colors.statusGreen,
  },
  onlineFleetText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  co2SavedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  co2SavedText: {
    fontSize: 10,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  fleetHeroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.8,
  },
  fleetHeroSub: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 12,
  },
  fleetMetricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fleetMetricBox: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.sm,
    padding: 8,
    alignItems: 'center',
  },
  fleetMetricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  fleetMetricLabel: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
  },
  fleetFiltersRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  fleetFilterPill: {
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  fleetFilterPillActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  fleetFilterText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
  fleetFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  courierCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 10,
  },
  courierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courierName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  lotoBadgeMini: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  lotoBadgeMiniText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#92400E',
  },
  availableBadgeMini: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  availableBadgeMiniText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  courierRating: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.star,
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  batteryText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  courierVehicleLine: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 2,
  },
  courierOrderInfo: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 8,
  },
  courierCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  courierCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
  },
  courierCardBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },

  // Métricas Styles (Page 1)
  metricasTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  auditPill: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  auditPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  periodPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  periodPill: {
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AURA_THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  periodPillActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  periodPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
  periodPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  revenueCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  revenueLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  revenueAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
  },
  revenueCurrency: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.textSecondary,
  },
  plusPercentPill: {
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusPercentText: {
    fontSize: 10,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  revenueCompared: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 14,
  },
  revenueStatsRow: {
    flexDirection: 'row',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 12,
  },
  revenueStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  revStatTitle: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 2,
  },
  revStatVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  revStatSub: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
  },
  revStatDivider: {
    width: 1,
    backgroundColor: AURA_THEME.colors.borderLight,
  },
  salesBySantuarioCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sanctuariesActiveCount: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.terracotta,
    letterSpacing: 0.5,
  },
  sanctuaryBarRow: {
    marginBottom: 10,
  },
  sancName: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  sancVal: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    overflow: 'hidden',
  },
  barProg: {
    height: 6,
    borderRadius: 3,
  },
  hourlyCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  hourlyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.8,
  },
  peakBadge: {
    backgroundColor: AURA_THEME.colors.terracottaBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  peakBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.terracotta,
  },
  hourlyDesc: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
    lineHeight: 15,
    marginBottom: 12,
  },
  hourlyTimelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineItem: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1DDD4',
    marginBottom: 4,
  },
  timelineDotPeak: {
    backgroundColor: AURA_THEME.colors.terracotta,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineText: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
  },
  timelineTextPeak: {
    color: AURA_THEME.colors.forestDark,
    fontWeight: '800',
  },
  topFormulasCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  topTag: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.5,
  },
  formulaRankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  rankBadgeFirst: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AURA_THEME.colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  formulaRankName: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  formulaRankSub: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  formulaRankPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  compensationCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  liquidatedTag: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  compLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  compSub: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  compAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  exportActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    gap: 6,
  },
  exportBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
});
