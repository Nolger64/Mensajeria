import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityMessage, Coworker } from '../../types';

interface CoworkerRadioModalProps {
  visible: boolean;
  messages: CommunityMessage[];
  coworkers: Coworker[];
  onClose: () => void;
  onSendMessage: (text: string, tag: 'trafico' | 'clima' | 'tienda' | 'alerta' | 'general') => void;
  activeCoworkerFilter?: Coworker | null;
}

export const CoworkerRadioModal: React.FC<CoworkerRadioModalProps> = ({
  visible,
  messages,
  coworkers,
  onClose,
  onSendMessage,
  activeCoworkerFilter,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'general' | 'trafico' | 'clima' | 'tienda' | 'alerta'>('general');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), selectedTag);
    setInputText('');
  };

  const quickAlerts = [
    { label: '🌧️ Lluvia', text: '🌧️ Empezó a llover suave en mi cuadrante, manejen con cuidado.', tag: 'clima' as const },
    { label: '🚨 Retén', text: '🚨 Ojo, control de tránsito en el cruce principal.', tag: 'trafico' as const },
    { label: '🍔 Tienda Rápida', text: '🍔 En esta tienda están despachando rápido sin fila!', tag: 'tienda' as const },
    { label: '⚡ Alta Demanda', text: '⚡ Se activó tarifa dinámica alta en Parque 93.', tag: 'alerta' as const },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.radioIconCircle}>
                <Ionicons name="radio" size={20} color="#FF441F" />
              </View>
              <View>
                <Text style={styles.title}>Radio Comunitaria Soy FHS</Text>
                <Text style={styles.subtitle}>
                  Canal Norte • {coworkers.length} compañeros conectados
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#757575" />
            </TouchableOpacity>
          </View>

          {/* Quick preset buttons */}
          <View style={styles.quickPresetsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsContent}>
              {quickAlerts.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetChip}
                  onPress={() => onSendMessage(preset.text, preset.tag)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages list */}
          <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => {
              const vehicleEmoji = msg.senderVehicle === 'moto' ? '🏍️' : msg.senderVehicle === 'bici' ? '🚲' : '🚗';
              return (
                <View key={msg.id} style={styles.messageBubble}>
                  <View style={styles.messageHeader}>
                    <View style={styles.senderRow}>
                      <Text style={styles.vehicleIcon}>{vehicleEmoji}</Text>
                      <Text style={styles.senderName}>{msg.senderName}</Text>
                    </View>
                    <Text style={styles.timeAgo}>{msg.timeAgo}</Text>
                  </View>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <View style={styles.messageFooter}>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#{msg.tag.toUpperCase()}</Text>
                    </View>
                    <View style={styles.likesRow}>
                      <Ionicons name="thumbs-up" size={12} color="#757575" />
                      <Text style={styles.likesCount}>{msg.likes}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Input Box */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe un aviso para los compañeros..."
              placeholderTextColor="#9E9E9E"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  quickPresetsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FAFAFA',
  },
  presetsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubble: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleIcon: {
    fontSize: 14,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  timeAgo: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  messageText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
    marginVertical: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#546E7A',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCount: {
    fontSize: 11,
    color: '#757575',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1D20',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF441F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
});
