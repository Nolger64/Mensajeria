import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityMessage, Coworker, MessageTag, RadioParticipant, VoiceTransmission } from '../../types';
import { useApp } from '../../context/AppContext';
import { radioAudioService } from '../../services/radioAudioService';

interface CoworkerRadioModalProps {
  visible: boolean;
  messages?: CommunityMessage[];
  coworkers?: Coworker[];
  onClose: () => void;
  onSendMessage?: (text: string, tag: MessageTag) => void;
  activeCoworkerFilter?: Coworker | null;
}

export const CoworkerRadioModal: React.FC<CoworkerRadioModalProps> = ({
  visible,
  messages: propMessages,
  coworkers: propCoworkers,
  onClose,
  onSendMessage,
  activeCoworkerFilter,
}) => {
  const {
    driver,
    coworkers: contextCoworkers,
    radioRooms,
    activeRadioRoomId,
    activeRadioRoom,
    isInVoiceMeeting,
    isMuted,
    isHandsFreeSpeaker,
    isTransmittingVoice,
    speakingParticipantId,
    joinRadioRoom,
    leaveRadioRoom,
    toggleMute,
    toggleHandsFreeSpeaker,
    startTransmitting,
    stopTransmittingAndSend,
    playTransmissionAudio,
    simulateIncomingCoworkerVoice,
    sendCommunityMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'meeting' | 'history'>('meeting');
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<MessageTag>('general');
  const [pttTimerSec, setPttTimerSec] = useState(0);

  // Pulse animation for active speaker and PTT button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(1)).current;
  const waveAnim2 = useRef(new Animated.Value(1)).current;
  const pttTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isTransmittingVoice || speakingParticipantId) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim1, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim1, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim1.setValue(1);
    }
  }, [isTransmittingVoice, speakingParticipantId]);

  // PTT Timer when holding
  useEffect(() => {
    if (isTransmittingVoice) {
      setPttTimerSec(0);
      pttTimerRef.current = setInterval(() => {
        setPttTimerSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (pttTimerRef.current) clearInterval(pttTimerRef.current);
      setPttTimerSec(0);
    }
    return () => {
      if (pttTimerRef.current) clearInterval(pttTimerRef.current);
    };
  }, [isTransmittingVoice]);

  // Quick voice transmission presets
  const quickVoicePresets: { label: string; text: string; tag: MessageTag }[] = [
    {
      label: '🌧️ Lluvia en Cuadrante',
      text: 'Compañeros, empezó llovizna suave por mi cuadrante. Cuidado con asfalto resbaloso.',
      tag: 'clima',
    },
    {
      label: '🚨 Retén de Tránsito',
      text: 'Ojo, puesto de control preventivo de tránsito en la 85 con 15. Papeles y casco al día.',
      tag: 'trafico',
    },
    {
      label: '🍔 Despacho Rápido',
      text: 'En el restaurante de la 93 están despachando express en 3 minutos sin fila.',
      tag: 'tienda',
    },
    {
      label: '⚡ Tarifa Dinámica',
      text: 'Se activó multiplicador x1.4 en Parque 93, hay alta demanda de pedidos.',
      tag: 'alerta',
    },
    {
      label: '⚠️ Trancón Pesado',
      text: 'Vía principal colapsada por camión varado, les sugiero desviar por la carrera 11.',
      tag: 'trafico',
    },
  ];

  const handleQuickBroadcast = (text: string, tag: MessageTag) => {
    if (activeRadioRoomId) {
      stopTransmittingAndSend(text, tag);
    }
    if (onSendMessage) {
      onSendMessage(text, tag);
    } else {
      sendCommunityMessage(text, tag);
    }
  };

  const handleCustomSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    if (activeRadioRoomId) {
      stopTransmittingAndSend(text, selectedTag);
    }
    if (onSendMessage) {
      onSendMessage(text, selectedTag);
    } else {
      sendCommunityMessage(text, selectedTag);
    }
    setInputText('');
  };

  const handleTestRadioAudio = () => {
    radioAudioService.playPttStartBeep();
    setTimeout(() => {
      radioAudioService.playPttReleaseSquelch();
    }, 220);
  };

  const currentRoom = activeRadioRoom || radioRooms[0];
  const participants = currentRoom?.participants || [];
  const transmissions = currentRoom?.transmissions || [];

  // Active speaker banner
  const activeSpeakerName = isTransmittingVoice
    ? `${driver.name} (Tú)`
    : participants.find((p) => p.id === speakingParticipantId)?.name ||
      (speakingParticipantId ? 'Compañero FHS' : null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.radioIconCircle, isInVoiceMeeting && styles.radioIconActive]}>
                <Ionicons name="radio" size={22} color={isInVoiceMeeting ? '#00C853' : '#FF441F'} />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Sala de Radio FHS</Text>
                  <View style={[styles.livePill, isInVoiceMeeting ? styles.livePillOn : styles.livePillOff]}>
                    <View style={[styles.liveDot, isInVoiceMeeting ? styles.liveDotOn : styles.liveDotOff]} />
                    <Text style={styles.livePillText}>{isInVoiceMeeting ? 'EN VIVO' : 'PAUSADO'}</Text>
                  </View>
                </View>
                <Text style={styles.subtitle}>
                  {currentRoom ? currentRoom.name : 'Canal General'} • {participants.length} conectados
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Channel Selector Pills */}
          <View style={styles.channelsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelsScroll}>
              {radioRooms.map((room) => {
                const isSelected = room.id === activeRadioRoomId;
                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[styles.channelChip, isSelected && styles.channelChipActive]}
                    onPress={() => joinRadioRoom(room.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.channelNumberText}>CH {room.channelNumber}</Text>
                    <Text style={[styles.channelChipText, isSelected && styles.channelChipTextActive]}>
                      {room.zone}
                    </Text>
                    <View style={styles.participantCountBadge}>
                      <Text style={styles.participantCountText}>{room.participants.length}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Quick Voice Mode Controls Bar */}
          <View style={styles.controlsBar}>
            {/* Altavoz Manos Libres Toggle */}
            <TouchableOpacity
              style={[styles.controlButton, isHandsFreeSpeaker ? styles.controlBtnActive : styles.controlBtnMuted]}
              onPress={toggleHandsFreeSpeaker}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isHandsFreeSpeaker ? 'volume-high' : 'volume-mute'}
                size={18}
                color={isHandsFreeSpeaker ? '#007A33' : '#757575'}
              />
              <Text style={[styles.controlBtnText, isHandsFreeSpeaker && styles.controlBtnTextActive]}>
                {isHandsFreeSpeaker ? 'Altavoz Manos Libres: ON' : 'Altavoz: Silenciado'}
              </Text>
            </TouchableOpacity>

            {/* Probar Bip de Radio */}
            <TouchableOpacity style={styles.testAudioBtn} onPress={handleTestRadioAudio} activeOpacity={0.7}>
              <Ionicons name="musical-notes" size={16} color="#FF441F" />
              <Text style={styles.testAudioText}>Probar Bip</Text>
            </TouchableOpacity>

            {/* Simular Audio de Compañero */}
            <TouchableOpacity
              style={styles.simAudioBtn}
              onPress={simulateIncomingCoworkerVoice}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles" size={16} color="#2196F3" />
              <Text style={styles.simAudioText}>Simular Audio</Text>
            </TouchableOpacity>
          </View>

          {/* Active Speaker Banner (Google Meet / Walkie-talkie style) */}
          {activeSpeakerName ? (
            <Animated.View style={[styles.activeSpeakerBanner, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.speakerWaveIndicator}>
                <Ionicons name="mic" size={18} color="#FFFFFF" />
                <Text style={styles.speakerSoundWaves}>~ ▰ ▰ ▰ ▰ ~</Text>
              </View>
              <View style={styles.speakerInfo}>
                <Text style={styles.speakerLabel}>TRANSMITIENDO EN VIVO POR ALTAVOZ:</Text>
                <Text style={styles.speakerNameText}>{activeSpeakerName}</Text>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.idleSpeakerBanner}>
              <Ionicons name="headset-outline" size={16} color="#757575" />
              <Text style={styles.idleSpeakerText}>Canal en escucha libre • Mantén presionado PTT para transmitir</Text>
            </View>
          )}

          {/* Navigation Tabs (Reunión en Vivo / Historial de Transmisiones) */}
          <View style={styles.tabNavRow}>
            <TouchableOpacity
              style={[styles.tabNavItem, activeTab === 'meeting' && styles.tabNavItemActive]}
              onPress={() => setActiveTab('meeting')}
            >
              <Ionicons
                name="people"
                size={17}
                color={activeTab === 'meeting' ? '#FF441F' : '#757575'}
              />
              <Text style={[styles.tabNavText, activeTab === 'meeting' && styles.tabNavTextActive]}>
                Reunión de Repartidores ({participants.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabNavItem, activeTab === 'history' && styles.tabNavItemActive]}
              onPress={() => setActiveTab('history')}
            >
              <Ionicons
                name="radio-outline"
                size={17}
                color={activeTab === 'history' ? '#FF441F' : '#757575'}
              />
              <Text style={[styles.tabNavText, activeTab === 'history' && styles.tabNavTextActive]}>
                Audios Transmitidos ({transmissions.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAIN CONTENT AREA */}
          <ScrollView style={styles.mainContentScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'meeting' ? (
              <View style={styles.meetingTabContent}>
                {/* Visual Meeting Room Grid (Google Meet / Clubhouse style cards) */}
                <Text style={styles.sectionHeaderTitle}>REPARTIDORES CONECTADOS A ESTA SALA</Text>

                <View style={styles.participantsGrid}>
                  {/* You (User Driver) Card */}
                  <View
                    style={[
                      styles.participantCard,
                      isTransmittingVoice && styles.participantCardSpeaking,
                    ]}
                  >
                    <View style={styles.participantAvatarWrapper}>
                      <View style={[styles.participantAvatar, { backgroundColor: '#FF441F' }]}>
                        <Text style={styles.participantAvatarText}>TÚ</Text>
                      </View>
                      <View style={styles.vehicleBadgeOverlay}>
                        <Text style={styles.vehicleBadgeEmoji}>
                          {driver.vehicle === 'moto' ? '🏍️' : driver.vehicle === 'bici' ? '🚲' : '🚗'}
                        </Text>
                      </View>
                      {isTransmittingVoice && (
                        <Animated.View
                          style={[
                            styles.speakingRipple,
                            { transform: [{ scale: pulseAnim }] },
                          ]}
                        />
                      )}
                    </View>
                    <Text style={styles.participantCardName} numberOfLines={1}>
                      {driver.name}
                    </Text>
                    <Text style={styles.participantCardRole}>
                      {isTransmittingVoice ? '🔴 Transmitiendo' : '🎙️ Micrófono Listo'}
                    </Text>
                    <View style={styles.participantStatusRow}>
                      <Ionicons
                        name={isTransmittingVoice ? 'mic' : isMuted ? 'mic-off' : 'mic-outline'}
                        size={14}
                        color={isTransmittingVoice ? '#FF441F' : '#00C853'}
                      />
                      <Text style={styles.batteryText}>🔋 94%</Text>
                    </View>
                  </View>

                  {/* Connected Coworkers in Room */}
                  {participants
                    .filter((p) => p.id !== driver.id)
                    .map((part) => {
                      const isSpeakingNow = speakingParticipantId === part.id;
                      const vehicleIcon =
                        part.vehicle === 'moto' ? '🏍️' : part.vehicle === 'bici' ? '🚲' : '🚗';
                      return (
                        <View
                          key={part.id}
                          style={[
                            styles.participantCard,
                            isSpeakingNow && styles.participantCardSpeaking,
                          ]}
                        >
                          <View style={styles.participantAvatarWrapper}>
                            <View
                              style={[
                                styles.participantAvatar,
                                { backgroundColor: part.avatarColor || '#2196F3' },
                              ]}
                            >
                              <Text style={styles.participantAvatarText}>
                                {part.name.slice(0, 2).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.vehicleBadgeOverlay}>
                              <Text style={styles.vehicleBadgeEmoji}>{vehicleIcon}</Text>
                            </View>
                            {isSpeakingNow && (
                              <Animated.View
                                style={[
                                  styles.speakingRipple,
                                  { transform: [{ scale: pulseAnim }] },
                                ]}
                              />
                            )}
                          </View>
                          <Text style={styles.participantCardName} numberOfLines={1}>
                            {part.name}
                          </Text>
                          <Text
                            style={[
                              styles.participantCardRole,
                              isSpeakingNow && styles.participantCardRoleSpeaking,
                            ]}
                          >
                            {isSpeakingNow ? '🗣️ Hablando...' : '🎧 Escuchando'}
                          </Text>
                          <View style={styles.participantStatusRow}>
                            <Ionicons
                              name={isSpeakingNow ? 'volume-high' : 'volume-medium-outline'}
                              size={14}
                              color={isSpeakingNow ? '#00C853' : '#757575'}
                            />
                            <Text style={styles.batteryText}>
                              🔋 {part.batteryLevel || 85}%
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                </View>

                {/* CENTRAL PUSH-TO-TALK (PTT) WALKIE TALKIE CONTROLS */}
                <View style={styles.pttSection}>
                  <Text style={styles.pttInstructionTitle}>INTERCOMUNICADOR WALKIE-TALKIE</Text>
                  <Text style={styles.pttInstructionSubtitle}>
                    Mantén presionado para hablarle a los {participants.length} compañeros conectados
                  </Text>

                  <View style={styles.pttButtonOuterContainer}>
                    {isTransmittingVoice && (
                      <Animated.View
                        style={[
                          styles.pttHaloRing,
                          { transform: [{ scale: waveAnim1 }] },
                        ]}
                      />
                    )}

                    <TouchableOpacity
                      style={[
                        styles.pttBigButton,
                        isTransmittingVoice && styles.pttBigButtonActive,
                      ]}
                      onPressIn={startTransmitting}
                      onPressOut={() => stopTransmittingAndSend('Aviso por intercomunicador')}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={isTransmittingVoice ? 'radio' : 'mic'}
                        size={36}
                        color="#FFFFFF"
                      />
                      <Text style={styles.pttButtonLabel}>
                        {isTransmittingVoice ? 'TRANSMITIENDO...' : 'MANTÉN PARA HABLAR'}
                      </Text>
                      {isTransmittingVoice ? (
                        <Text style={styles.pttTimerText}>00:0{pttTimerSec}s • SUELTA PARA ENVIAR</Text>
                      ) : (
                        <Text style={styles.pttHintText}>Push-to-Talk (PTT)</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick 1-Tap Voice Alerts Bar */}
                <View style={styles.quickVoiceSection}>
                  <Text style={styles.quickVoiceTitle}>ALERTAS RÁPIDAS DE VOZ (1-TOQUE)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickVoiceScroll}>
                    {quickVoicePresets.map((preset, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.quickVoiceChip}
                        onPress={() => handleQuickBroadcast(preset.text, preset.tag)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickVoiceChipText}>{preset.label}</Text>
                        <Ionicons name="volume-medium" size={14} color="#FF441F" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              /* HISTORY TAB: Transmissions list with audio players */
              <View style={styles.historyTabContent}>
                <Text style={styles.sectionHeaderTitle}>ÚLTIMAS TRANSMISIONES EN ESTA SALA</Text>

                {transmissions.length === 0 ? (
                  <View style={styles.emptyTransmissions}>
                    <Ionicons name="radio" size={40} color="#CCCCCC" />
                    <Text style={styles.emptyTransmissionsText}>No hay transmisiones grabadas en esta sala.</Text>
                  </View>
                ) : (
                  transmissions.map((tx) => {
                    const isPlaying = speakingParticipantId === tx.senderId;
                    const vehicleEmoji =
                      tx.senderVehicle === 'moto' ? '🏍️' : tx.senderVehicle === 'bici' ? '🚲' : '🚗';
                    return (
                      <View key={tx.id} style={[styles.transmissionCard, isPlaying && styles.transmissionCardActive]}>
                        <View style={styles.txHeader}>
                          <View style={styles.txSenderRow}>
                            <Text style={styles.txVehicleIcon}>{vehicleEmoji}</Text>
                            <Text style={styles.txSenderName}>{tx.senderName}</Text>
                          </View>
                          <Text style={styles.txTimeAgo}>{tx.timeAgo}</Text>
                        </View>

                        <Text style={styles.txBodyText}>"{tx.audioText}"</Text>

                        <View style={styles.txFooter}>
                          <View style={styles.txTagPill}>
                            <Text style={styles.txTagText}>#{tx.tag.toUpperCase()}</Text>
                          </View>

                          {/* Audio Player Button */}
                          <TouchableOpacity
                            style={[styles.playAudioBtn, isPlaying && styles.playAudioBtnPlaying]}
                            onPress={() => playTransmissionAudio(tx)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={isPlaying ? 'volume-high' : 'play'}
                              size={16}
                              color="#FFFFFF"
                            />
                            <Text style={styles.playAudioBtnText}>
                              {isPlaying ? 'Reproduciendo audio...' : `Escuchar audio (${tx.durationSec}s)`}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>

          {/* Bottom Custom Voice Input Bar */}
          <View style={styles.bottomBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe o dicta tu reporte para hablar a la sala..."
              placeholderTextColor="#9E9E9E"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleCustomSend}
            />
            <TouchableOpacity
              style={[styles.sendVoiceBtn, !inputText.trim() && styles.sendVoiceBtnDisabled]}
              onPress={handleCustomSend}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: '88%',
    display: 'flex',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIconActive: {
    backgroundColor: '#E8F5E9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  livePillOn: {
    backgroundColor: '#E8F5E9',
  },
  livePillOff: {
    backgroundColor: '#EEEEEE',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveDotOn: {
    backgroundColor: '#00C853',
  },
  liveDotOff: {
    backgroundColor: '#9E9E9E',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007A33',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
  },
  channelsBar: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  channelsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  channelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  channelChipActive: {
    backgroundColor: '#FF441F',
    borderColor: '#FF441F',
  },
  channelNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#757575',
  },
  channelChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
  },
  channelChipTextActive: {
    color: '#FFFFFF',
  },
  participantCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  participantCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#424242',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  controlBtnActive: {
    backgroundColor: '#E8F5E9',
  },
  controlBtnMuted: {
    backgroundColor: '#F5F5F5',
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#616161',
  },
  controlBtnTextActive: {
    color: '#007A33',
  },
  testAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  testAudioText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF441F',
  },
  simAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  simAudioText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1976D2',
  },
  activeSpeakerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  speakerWaveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speakerSoundWaves: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E8F5E9',
    letterSpacing: 0.5,
  },
  speakerNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  idleSpeakerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  idleSpeakerText: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  tabNavRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginTop: 8,
  },
  tabNavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  tabNavItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF441F',
  },
  tabNavText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
  },
  tabNavTextActive: {
    color: '#FF441F',
    fontWeight: '700',
  },
  mainContentScroll: {
    flex: 1,
  },
  meetingTabContent: {
    padding: 16,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9E9E9E',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  participantCardSpeaking: {
    borderColor: '#00C853',
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
  },
  participantAvatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  participantAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  vehicleBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  vehicleBadgeEmoji: {
    fontSize: 13,
  },
  speakingRipple: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00C853',
  },
  participantCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  participantCardRole: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  participantCardRoleSpeaking: {
    color: '#007A33',
    fontWeight: '700',
  },
  participantStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  batteryText: {
    fontSize: 10,
    color: '#757575',
  },
  pttSection: {
    marginTop: 22,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  pttInstructionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#212121',
    letterSpacing: 0.5,
  },
  pttInstructionSubtitle: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  pttButtonOuterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pttHaloRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 68, 31, 0.25)',
  },
  pttBigButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF441F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF441F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  pttBigButtonActive: {
    backgroundColor: '#D32F2F',
    transform: [{ scale: 1.05 }],
  },
  pttButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  pttHintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  pttTimerText: {
    color: '#FFF9C4',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  quickVoiceSection: {
    marginTop: 20,
  },
  quickVoiceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9E9E9E',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  quickVoiceScroll: {
    gap: 8,
  },
  quickVoiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFCCBC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickVoiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D84315',
  },
  historyTabContent: {
    padding: 16,
  },
  emptyTransmissions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTransmissionsText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 10,
  },
  transmissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  transmissionCardActive: {
    borderColor: '#00C853',
    backgroundColor: '#F9FBE7',
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  txSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txVehicleIcon: {
    fontSize: 14,
  },
  txSenderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
  },
  txTimeAgo: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  txBodyText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
    marginBottom: 10,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTagPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  txTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#616161',
  },
  playAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF441F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  playAudioBtnPlaying: {
    backgroundColor: '#00C853',
  },
  playAudioBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13,
    color: '#212121',
  },
  sendVoiceBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF441F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendVoiceBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
});
