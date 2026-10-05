import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';

interface ExpressDeliveryScreenProps {
  onOrderPlaced: () => void;
}

export const ExpressDeliveryScreen: React.FC<ExpressDeliveryScreenProps> = ({
  onOrderPlaced,
}) => {
  const { deliveryAddress, placeExpressDelivery } = useClient();

  const [pickupAddress, setPickupAddress] = useState('Cl. 90 #12-40, Droguería Acuña');
  const [dropoffAddress, setDropoffAddress] = useState(deliveryAddress);
  const [errandDescription, setErrandDescription] = useState('Comprar medicina recetada y traer cambio en efectivo');
  const [courierNotes, setCourierNotes] = useState('Pedir factura a nombre de Santiago. Timbrar al 502 al llegar.');
  const [packageSize, setPackageSize] = useState<'pequeno' | 'mediano' | 'documentos'>('pequeno');
  const [selectedTip, setSelectedTip] = useState<number>(3000);
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta (Pagado)' | 'Efectivo contraentrega'>('Tarjeta (Pagado)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseFee = 6800;
  const expressBonus = 1500;
  const totalCost = baseFee + expressBonus + selectedTip;

  const handleOrder = async () => {
    if (!pickupAddress.trim()) {
      Alert.alert('Falta dirección', 'Ingresa la dirección donde debemos recoger.');
      return;
    }
    if (!dropoffAddress.trim()) {
      Alert.alert('Falta dirección', 'Ingresa la dirección donde debemos entregar.');
      return;
    }
    if (!errandDescription.trim()) {
      Alert.alert('Falta detalle', 'Cuéntanos qué necesitas que lleve el domiciliario.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeExpressDelivery({
        pickupAddress,
        deliveryAddress: dropoffAddress,
        errandDescription,
        notes: courierNotes,
        tip: selectedTip,
        paymentMethod,
      });

      if (order) {
        Alert.alert(
          '🛵 ¡Domiciliario Solicitado!',
          `Tu pedido express #${order.orderCode} está en la red central. Un repartidor cercano lo aceptará en segundos.`,
          [{ text: 'Ver Seguimiento', onPress: onOrderPlaced }]
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 32 }}>🛵</Text>
        </View>
        <Text style={styles.title}>Pedir Servicio de Domicilio Express</Text>
        <Text style={styles.subtitle}>
          ¿Olvidaste las llaves? ¿Necesitas enviar un paquete o hacer una compra urgente? Nuestros repartidores se encargan de todo en minutos.
        </Text>
      </View>

      {/* Origin / Pickup */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.dotCircle, { backgroundColor: '#FF6F00' }]} />
          <Text style={styles.cardTitle}>1. ¿Dónde recogemos? (Origen)</Text>
        </View>
        <TextInput
          style={styles.input}
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="Dirección exacta del punto de recogida"
          placeholderTextColor="#687385"
        />

        <View style={styles.quickOptions}>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => setPickupAddress('Cra. 15 #90-33, Farmatodo 24H')}
          >
            <Text style={styles.quickChipText}>💊 Farmatodo Cra 15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => setPickupAddress('Cl. 85 #15-28, Carulla')}
          >
            <Text style={styles.quickChipText}>🛒 Carulla 85</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Destination / Dropoff */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.dotCircle, { backgroundColor: '#00E676' }]} />
          <Text style={styles.cardTitle}>2. ¿Dónde entregamos? (Destino)</Text>
        </View>
        <TextInput
          style={styles.input}
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
          placeholder="Dirección exacta de entrega"
          placeholderTextColor="#687385"
        />
      </View>

      {/* Errand description */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={18} color="#FFD54F" />
          <Text style={styles.cardTitle}>3. ¿Qué necesitas que hagamos?</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={errandDescription}
          onChangeText={setErrandDescription}
          placeholder="Describe el mandado, compra o paquete a recoger..."
          placeholderTextColor="#687385"
          multiline
          numberOfLines={3}
        />

        {/* Package size selectors */}
        <Text style={styles.miniLabel}>Tipo de encargo:</Text>
        <View style={styles.sizeRow}>
          {[
            { id: 'documentos', label: '📄 Documentos / Llaves' },
            { id: 'pequeno', label: '📦 Paquete Pequeño' },
            { id: 'mediano', label: '🛍️ Mandado / Compra' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sizeBtn,
                packageSize === item.id && styles.sizeBtnActive,
              ]}
              onPress={() => setPackageSize(item.id as any)}
            >
              <Text
                style={[
                  styles.sizeBtnText,
                  packageSize === item.id && styles.sizeBtnTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Courier notes */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubbles-outline" size={18} color="#81D4FA" />
          <Text style={styles.cardTitle}>4. Instrucciones para el domiciliario</Text>
        </View>
        <TextInput
          style={styles.input}
          value={courierNotes}
          onChangeText={setCourierNotes}
          placeholder="Ej: Timbrar al 502, dejar con don Pedro en recepción..."
          placeholderTextColor="#687385"
        />
      </View>

      {/* Tip selector */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-outline" size={18} color="#FF4081" />
          <Text style={styles.cardTitle}>5. Propina para tu repartidor</Text>
        </View>
        <View style={styles.tipRow}>
          {[0, 2000, 3000, 5000, 8000].map((tip) => (
            <TouchableOpacity
              key={tip}
              style={[styles.tipBtn, selectedTip === tip && styles.tipBtnActive]}
              onPress={() => setSelectedTip(tip)}
            >
              <Text
                style={[
                  styles.tipBtnText,
                  selectedTip === tip && styles.tipBtnTextActive,
                ]}
              >
                {tip === 0 ? '$0' : `+$${(tip / 1000).toFixed(0)}k`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment method */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="card-outline" size={18} color="#4FC3F7" />
          <Text style={styles.cardTitle}>6. Método de Pago</Text>
        </View>
        <View style={styles.paymentRow}>
          <TouchableOpacity
            style={[
              styles.paymentBtn,
              paymentMethod === 'Tarjeta (Pagado)' && styles.paymentBtnActive,
            ]}
            onPress={() => setPaymentMethod('Tarjeta (Pagado)')}
          >
            <Ionicons
              name="card"
              size={18}
              color={paymentMethod === 'Tarjeta (Pagado)' ? '#00E676' : '#8C96A5'}
            />
            <Text
              style={[
                styles.paymentBtnText,
                paymentMethod === 'Tarjeta (Pagado)' && styles.paymentBtnTextActive,
              ]}
            >
              Tarjeta de Crédito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentBtn,
              paymentMethod === 'Efectivo contraentrega' && styles.paymentBtnActive,
            ]}
            onPress={() => setPaymentMethod('Efectivo contraentrega')}
          >
            <Ionicons
              name="cash"
              size={18}
              color={paymentMethod === 'Efectivo contraentrega' ? '#00E676' : '#8C96A5'}
            />
            <Text
              style={[
                styles.paymentBtnText,
                paymentMethod === 'Efectivo contraentrega' && styles.paymentBtnTextActive,
              ]}
            >
              Efectivo al recibir
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cost Breakdown */}
      <View style={styles.costCard}>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Tarifa base de mensajería express</Text>
          <Text style={styles.costVal}>${baseFee.toLocaleString('es-CO')} COP</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Bono de prioridad y rapidez</Text>
          <Text style={styles.costVal}>${expressBonus.toLocaleString('es-CO')} COP</Text>
        </View>
        {selectedTip > 0 && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Propina voluntaria repartidor</Text>
            <Text style={styles.costVal}>${selectedTip.toLocaleString('es-CO')} COP</Text>
          </View>
        )}
        <View style={styles.costDivider} />
        <View style={styles.costRow}>
          <Text style={styles.costTotalLabel}>Total a Pagar</Text>
          <Text style={styles.costTotalVal}>
            ${totalCost.toLocaleString('es-CO')} COP
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleOrder}
        disabled={isSubmitting}
        activeOpacity={0.88}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <View style={styles.submitRow}>
            <Ionicons name="flash" size={20} color="#FFF" />
            <Text style={styles.submitBtnText}>Solicitar Domiciliario Express</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1014',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 111, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF6F00',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#8C96A5',
    textAlign: 'center',
    lineHeight: 17,
  },
  sectionCard: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dotCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  input: {
    backgroundColor: '#101319',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#2D3545',
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  quickOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    backgroundColor: '#202632',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickChipText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  miniLabel: {
    fontSize: 11,
    color: '#8C96A5',
    marginTop: 10,
    marginBottom: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeBtn: {
    flex: 1,
    backgroundColor: '#12151B',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3241',
  },
  sizeBtnActive: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  sizeBtnText: {
    fontSize: 10,
    color: '#8C96A5',
    fontWeight: '600',
    textAlign: 'center',
  },
  sizeBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    backgroundColor: '#202633',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2B3344',
  },
  tipBtnActive: {
    backgroundColor: 'rgba(255, 68, 31, 0.2)',
    borderColor: '#FF441F',
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C96A5',
  },
  tipBtnTextActive: {
    color: '#FF441F',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E232E',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A3241',
  },
  paymentBtnActive: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  paymentBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C96A5',
  },
  paymentBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  costCard: {
    backgroundColor: '#151921',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222834',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  costLabel: {
    fontSize: 12,
    color: '#8C96A5',
  },
  costVal: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#262D3C',
    marginVertical: 8,
  },
  costTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  costTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00E676',
  },
  submitBtn: {
    backgroundColor: '#FF6F00',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF6F00',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
});
