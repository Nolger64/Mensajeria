import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AURA_THEME } from '../../../src/theme/auraTheme';

export const OrdersHistoryScreen: React.FC = () => {
  const [inDestinationMode, setInDestinationMode] = useState(false);
  const [pinDigits, setPinDigits] = useState(['8', '9', '2', '1']);
  const [ecoGlassReturn, setEcoGlassReturn] = useState(false);
  const [thermalBoxChecked, setThermalBoxChecked] = useState(true);
  const [lavenderChecked, setLavenderChecked] = useState(true);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [deliveryComplete, setDeliveryComplete] = useState(false);

  const handleValidatePin = () => {
    const entered = pinDigits.join('');
    if (entered.length < 4) {
      Alert.alert('PIN incompleto', 'Ingresa los 4 dígitos provistos por el cliente.');
      return;
    }
    setDeliveryComplete(true);
    Alert.alert(
      '🌸 ¡Entrega Botánica Finalizada!',
      `Pedido verificado con éxito. Ganancia de $${ecoGlassReturn ? '97.50' : '82.50'} MXN acreditada a tu Billetera de Embajador.`,
      [
        {
          text: 'Entendido',
          onPress: () => {
            setInDestinationMode(false);
            setDeliveryComplete(false);
          },
        },
      ]
    );
  };

  if (inDestinationMode) {
    // PAGE 2: Confirmación Entrega (En Destino)
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Destination Header */}
          <View style={styles.destHeader}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.destTitle}>Confirmación Entrega</Text>
              <View style={styles.destBadge}>
                <Text style={styles.destBadgeText}>EN DESTINO</Text>
              </View>
            </View>
            <Text style={styles.destSub}>
              En puerta del santuario del cliente • Residencia Los Olivos, Torre Ámbar · Timbre 4B
            </Text>
          </View>

          {/* Order banner */}
          <View style={styles.ritualBanner}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={styles.ritualBannerTag}>RITUAL A DOMICILIO</Text>
              <View style={styles.fragilePill}>
                <Text style={styles.fragilePillText}>Fragilidad Alta</Text>
              </View>
            </View>
            <Text style={styles.ritualName}>Kit Bruma & Óleos de Lavanda</Text>
            <Text style={styles.clientDestName}>Cliente: Marcela De la Vega</Text>
          </View>

          {/* Validación de Seguridad PIN */}
          <View style={styles.pinCard}>
            <Text style={styles.pinCardTitle}>Validación de Seguridad</Text>
            <Text style={styles.pinCardSub}>
              Solicita el código PIN de 4 dígitos al cliente para completar la entrega segura.
            </Text>

            <View style={styles.pinRow}>
              {pinDigits.map((digit, index) => (
                <View key={index} style={styles.pinBox}>
                  <Text style={styles.pinDigit}>{digit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.pinStatusRow}>
              <View style={styles.greenCheckDot}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
              <Text style={styles.pinStatusText}>PIN cargado listo para verificar</Text>
              <TouchableOpacity onPress={() => setPinDigits(['', '', '', ''])}>
                <Text style={styles.reenterText}>Reingresar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.validatePinBtn}
              onPress={handleValidatePin}
              activeOpacity={0.85}
            >
              <Text style={styles.validatePinBtnText}>Validar PIN y Finalizar Entrega</Text>
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Protocolo de Entrega Botánica */}
          <View style={styles.protocolCard}>
            <Text style={styles.protocolTitle}>Protocolo de Entrega Botánica</Text>

            <TouchableOpacity
              style={styles.checkItemRow}
              onPress={() => setThermalBoxChecked(!thermalBoxChecked)}
            >
              <View style={[styles.checkBox, thermalBoxChecked && styles.checkBoxActive]}>
                {thermalBoxChecked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkItemLabel}>Empaque térmico sin derrames</Text>
                <Text style={styles.checkItemSub}>Temperatura controlada de botánicos y óleos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkItemRow}
              onPress={() => setLavenderChecked(!lavenderChecked)}
            >
              <View style={[styles.checkBox, lavenderChecked && styles.checkBoxActive]}>
                {lavenderChecked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkItemLabel}>Ramillete de lavanda fresca intacto</Text>
                <Text style={styles.checkItemSub}>Elemento aromático de bienvenida entregado</Text>
              </View>
            </TouchableOpacity>

            {/* Retorno de frasco eco-spa */}
            <TouchableOpacity
              style={styles.ecoReturnRow}
              onPress={() => setEcoGlassReturn(!ecoGlassReturn)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.ecoReturnTitle}>¿Retorno de frasco eco-spa?</Text>
                  <View style={styles.ecoBonusBadge}>
                    <Text style={styles.ecoBonusText}>+ $15.00 MXN</Text>
                  </View>
                </View>
                <Text style={styles.ecoReturnSub}>
                  El cliente devuelve frasco/empaque anterior para reciclaje consciente.
                </Text>
              </View>
              <View style={[styles.togglePill, ecoGlassReturn && styles.togglePillActive]}>
                <View style={[styles.toggleCircle, ecoGlassReturn && styles.toggleCircleActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Evidencia de Entrega */}
          <View style={styles.evidenceCard}>
            <View style={styles.evidenceHeader}>
              <Text style={styles.evidenceTitle}>Evidencia de Entrega</Text>
              <Text style={styles.evidenceOptional}>OPCIONAL</Text>
            </View>
            <Text style={styles.evidenceDesc}>
              Tomar foto del paquete en puerta si el cliente solicitó entrega sin contacto o para respaldo.
            </Text>

            <TouchableOpacity
              style={[styles.photoBtn, photoTaken && styles.photoBtnDone]}
              onPress={() => {
                setPhotoTaken(true);
                Alert.alert('Foto capturada', 'Foto almacenada en el expediente botánico.');
              }}
            >
              <Ionicons
                name={photoTaken ? 'checkmark-circle' : 'camera-outline'}
                size={18}
                color={photoTaken ? AURA_THEME.colors.forestDark : AURA_THEME.colors.forestDark}
              />
              <Text style={styles.photoBtnText}>
                {photoTaken ? 'Foto del paquete guardada ✓' : 'Capturar foto del paquete'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ganancia de este viaje */}
          <View style={styles.earningsCard}>
            <View style={styles.earningsHeader}>
              <Text style={styles.earningsLabel}>Ganancia de este viaje</Text>
              <Text style={styles.courierTag}>Aura Courier Pro</Text>
            </View>

            <View style={styles.earningsRow}>
              <Text style={styles.earnItemText}>Tarifa base garantizada</Text>
              <Text style={styles.earnItemVal}>$48.00 MXN</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earnItemText}>Multiplicador de zona (San Ángel)</Text>
              <Text style={styles.earnItemVal}>$18.50 MXN</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earnItemText}>Propina prepagada del cliente</Text>
              <Text style={styles.earnItemVal}>$16.00 MXN</Text>
            </View>
            {ecoGlassReturn && (
              <View style={styles.earningsRow}>
                <Text style={[styles.earnItemText, { color: AURA_THEME.colors.statusGreen }]}>
                  Bono retorno frasco eco-spa
                </Text>
                <Text style={[styles.earnItemVal, { color: AURA_THEME.colors.statusGreen }]}>
                  +$15.00 MXN
                </Text>
              </View>
            )}

            <View style={styles.earningsDivider} />

            <View style={styles.totalEarnRow}>
              <Text style={styles.totalEarnLabel}>Total estimado del viaje</Text>
              <Text style={styles.totalEarnVal}>
                ${ecoGlassReturn ? '97.50' : '82.50'} MXN
              </Text>
            </View>
          </View>

          {/* Back to navigation button */}
          <TouchableOpacity
            style={styles.backToNavBtn}
            onPress={() => setInDestinationMode(false)}
          >
            <Ionicons name="arrow-back" size={14} color={AURA_THEME.colors.textSecondary} />
            <Text style={styles.backToNavText}>Regresar a Navegación en Ruta</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // PAGE 3: Navegación (En Ruta hacia el cliente #AUR-8921)
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Banner */}
        <View style={styles.navHeaderCard}>
          <View style={styles.navTopRow}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>#AUR-8921</Text>
            </View>
            <Text style={styles.navTitleSub}>EN RUTA HACIA EL CLIENTE</Text>
          </View>

          <View style={styles.navStatsPill}>
            <Text style={styles.navStatsMain}>8 min · 1.4 km restante</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.navStatsSpeed}>Vel. sugerida 18 km/h</Text>
          </View>

          <View style={styles.amberWarningBanner}>
            <Ionicons name="shield" size={13} color="#8B4E38" />
            <Text style={styles.amberWarningText}>
              Manejo sereno: Frascos ámbar presurizados
            </Text>
          </View>
        </View>

        {/* Siguiente Maniobra */}
        <View style={styles.maneuverCard}>
          <View style={styles.maneuverIconBox}>
            <MaterialCommunityIcons name="arrow-top-right" size={26} color={AURA_THEME.colors.forestDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.maneuverLabel}>SIGUIENTE MANIOBRA</Text>
            <Text style={styles.maneuverTitle}>Girar a la derecha en Av. Horacio</Text>
            <Text style={styles.maneuverSub}>en 150 metros · Tráfico fluido</Text>
          </View>
        </View>

        {/* Waypoints line */}
        <View style={styles.waypointCard}>
          <View style={styles.waypointRow}>
            <View style={styles.waypointDotOrigin} />
            <Text style={styles.waypointText}>Sede Jardines</Text>
            <View style={styles.waypointLine} />
            <View style={styles.waypointDotDest} />
            <Text style={styles.waypointText}>Almendros 402</Text>
            <View style={styles.co2Pill}>
              <Text style={styles.co2PillText}>0g CO₂</Text>
            </View>
          </View>
        </View>

        {/* Client Card */}
        <View style={styles.clientCard}>
          <View style={styles.clientCardHeader}>
            <View>
              <Text style={styles.clientName}>Valeria M.</Text>
              <Text style={styles.clientFrequency}>Cliente Frecuente Aura · 14 pedidos</Text>
            </View>
            <View style={styles.clientQuickActions}>
              <TouchableOpacity
                style={styles.quickIconBtn}
                onPress={() => Alert.alert('Llamar', 'Llamando a Valeria M...')}
              >
                <Ionicons name="call" size={16} color={AURA_THEME.colors.forestDark} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickIconBtn}
                onPress={() => Alert.alert('Chat', 'Abriendo chat con Valeria M...')}
              >
                <Ionicons name="chatbubble" size={16} color={AURA_THEME.colors.forestDark} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.addressLine}>Calle Los Almendros 402, Depto 3B</Text>
          <Text style={styles.addressSubLine}>Colonia Bosques · Portón de madera clara</Text>

          <View style={styles.clientNoteBox}>
            <Text style={styles.clientNoteLabel}>NOTA DE LLEGADA DEL CLIENTE</Text>
            <Text style={styles.clientNoteText}>
              "Timbre 3B suave o llamar al celular. Por favor no tocar timbre fuerte, bebé durmiendo en la sala."
            </Text>
          </View>
        </View>

        {/* Contenido Delicado */}
        <View style={styles.itemsContentCard}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsLabel}>Contenido Delicado</Text>
            <Text style={styles.itemsCount}>2 elixires</Text>
          </View>

          <View style={styles.formulaItemRow}>
            <Text style={{ fontSize: 18 }}>💧</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.formulaName}>Elixir Nocturno Ciprés & Lavanda</Text>
              <Text style={styles.formulaDesc}>100ml · Frasco ámbar sellado</Text>
            </View>
          </View>

          <View style={styles.formulaItemRow}>
            <Text style={{ fontSize: 18 }}>🌸</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.formulaName}>Bruma Áurea Romero Silvestre</Text>
              <Text style={styles.formulaDesc}>150ml · Caja térmica sellada</Text>
            </View>
          </View>
        </View>

        {/* Protocolo de Entrega Serena */}
        <View style={styles.sereneProtocolCard}>
          <Text style={styles.sereneProtocolTitle}>PROTOCOLO DE ENTREGA SERENA</Text>
          <Text style={styles.sereneProtocolText}>
            Saludo pausado y voz cálida. Consultar amablemente si desea devolver el estuche de lino de su pedido anterior para reciclaje consciente.
          </Text>
        </View>

        {/* Main Arrival Action CTA */}
        <TouchableOpacity
          style={styles.arrivalBtn}
          onPress={() => setInDestinationMode(true)}
          activeOpacity={0.88}
        >
          <Text style={styles.arrivalBtnTitle}>Llegué al Domicilio / Notificar Llegada</Text>
          <Text style={styles.arrivalBtnSub}>
            Al confirmar, se enviará una notificación serena y silenciosa al dispositivo de Valeria.
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  navHeaderCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  navTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  orderBadge: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  navTitleSub: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.8,
  },
  navStatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  navStatsMain: {
    fontSize: 13,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AURA_THEME.colors.borderMedium,
  },
  navStatsSpeed: {
    fontSize: 11.5,
    color: AURA_THEME.colors.textSecondary,
  },
  amberWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: AURA_THEME.borderRadius.sm,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8DCB8',
  },
  amberWarningText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#76422F',
  },
  maneuverCard: {
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
  maneuverIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maneuverLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.8,
  },
  maneuverTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  maneuverSub: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
  },
  waypointCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waypointDotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  waypointDotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AURA_THEME.colors.terracotta,
  },
  waypointText: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  waypointLine: {
    flex: 1,
    height: 1,
    backgroundColor: AURA_THEME.colors.borderMedium,
    marginHorizontal: 8,
  },
  co2Pill: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  co2PillText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  clientCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  clientCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  clientFrequency: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  clientQuickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
  },
  addressLine: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 1,
  },
  addressSubLine: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 10,
  },
  clientNoteBox: {
    backgroundColor: '#F8F5F0',
    borderRadius: AURA_THEME.borderRadius.sm,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: AURA_THEME.colors.terracotta,
  },
  clientNoteLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8B4E38',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  clientNoteText: {
    fontSize: 11,
    color: '#5C5449',
    lineHeight: 15,
    fontStyle: 'italic',
  },
  itemsContentCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  itemsCount: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  formulaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  formulaName: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  formulaDesc: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  sereneProtocolCard: {
    backgroundColor: '#EEF6F0',
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 12,
    marginBottom: 14,
  },
  sereneProtocolTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sereneProtocolText: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 15,
  },
  arrivalBtn: {
    backgroundColor: AURA_THEME.colors.terracotta,
    borderRadius: AURA_THEME.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: AURA_THEME.colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  arrivalBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  arrivalBtnSub: {
    color: '#FFDBCF',
    fontSize: 10,
    textAlign: 'center',
  },
  // Destination Styles (Page 2)
  destHeader: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  destTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  destBadge: {
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  destBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  destSub: {
    fontSize: 11.5,
    color: AURA_THEME.colors.textSecondary,
  },
  ritualBanner: {
    backgroundColor: '#FAF5EE',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8DCB8',
    marginBottom: 12,
  },
  ritualBannerTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8B4E38',
    letterSpacing: 0.5,
  },
  fragilePill: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fragilePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C53030',
  },
  ritualName: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  clientDestName: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
  },
  pinCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
    alignItems: 'center',
  },
  pinCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 4,
  },
  pinCardSub: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pinBox: {
    width: 48,
    height: 54,
    borderRadius: 8,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: AURA_THEME.colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontSize: 24,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
  },
  pinStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  greenCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AURA_THEME.colors.statusGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinStatusText: {
    fontSize: 11,
    color: AURA_THEME.colors.statusGreen,
    fontWeight: '600',
  },
  reenterText: {
    fontSize: 11,
    color: AURA_THEME.colors.terracotta,
    fontWeight: '700',
    marginLeft: 4,
  },
  validatePinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.terracotta,
    width: '100%',
    paddingVertical: 12,
    borderRadius: AURA_THEME.borderRadius.md,
    gap: 6,
  },
  validatePinBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  protocolCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  protocolTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 10,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: AURA_THEME.colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
    borderColor: AURA_THEME.colors.forestDark,
  },
  checkItemLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  checkItemSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  ecoReturnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8DCB8',
    marginTop: 4,
  },
  ecoReturnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  ecoBonusBadge: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ecoBonusText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  ecoReturnSub: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  togglePill: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1DDD4',
    padding: 2,
  },
  togglePillActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    transform: [{ translateX: 16 }],
  },
  evidenceCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  evidenceOptional: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
  },
  evidenceDesc: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 10,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.sm,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
  },
  photoBtnDone: {
    backgroundColor: AURA_THEME.colors.sageBadge,
  },
  photoBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  earningsCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  courierTag: {
    fontSize: 10,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  earnItemText: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
  },
  earnItemVal: {
    fontSize: 11,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: AURA_THEME.colors.borderLight,
    marginVertical: 6,
  },
  totalEarnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEarnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  totalEarnVal: {
    fontSize: 15,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
  },
  backToNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backToNavText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
});
