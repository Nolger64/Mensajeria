// Radio Audio & Walkie-Talkie Sound FX Engine for FHS Repartidor
// Provides realistic radio mic beeps, squelch static, audio tones, and speech playback

class RadioAudioService {
  private audioCtx: AudioContext | null = null;
  private isHandsFreeEnabled: boolean = true;
  private currentlyPlaying: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // ==========================================
  // EFECTOS DE SONIDO DE RADIO (SQUELCH & PTT)
  // ==========================================

  // Bip agudo al presionar el botón PTT (Apertura de canal de radio)
  public playPttStartBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.05);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.setValueAtTime(0.18, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio context error or blocked by browser policy
    }
  }

  // Squelch y Roger Beep al soltar el botón PTT (Cierre de transmisión "Kzzzt-click")
  public playPttReleaseSquelch() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Ráfaga de ruido blanco (estática de radio kzzzt)
      const bufferSize = ctx.sampleRate * 0.1; // 100 ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filtro pasa banda para sonido auténtico de walkie talkie
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2200;
      filter.Q.value = 1.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.1);

      // 2. Roger Beep final corto (click de confirmación)
      const rogerOsc = ctx.createOscillator();
      const rogerGain = ctx.createGain();
      rogerOsc.type = 'triangle';
      rogerOsc.frequency.setValueAtTime(1100, now + 0.08);

      rogerGain.gain.setValueAtTime(0.15, now + 0.08);
      rogerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      rogerOsc.connect(rogerGain);
      rogerGain.connect(ctx.destination);

      rogerOsc.start(now + 0.08);
      rogerOsc.stop(now + 0.16);
    } catch {
      // Audio context error
    }
  }

  // Chime al entrar a una sala de radio
  public playJoinRoomChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.01, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.13);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Chime al desconectarse de la sala
  public playLeaveRoomChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [783.99, 523.25]; // G5, C5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.01, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.13);
      });
    } catch {
      // Ignore audio error
    }
  }

  // ==========================================
  // REPRODUCCIÓN DE VOZ DE COMPAÑEROS
  // ==========================================

  // Reproduce por voz en el altavoz el mensaje de radio transmitido
  public speakTransmission(
    senderName: string,
    text: string,
    senderVehicle: string = 'moto',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onStart?.();
      setTimeout(() => onEnd?.(), 1500);
      return;
    }

    try {
      // Cancelar cualquier audio anterior
      window.speechSynthesis.cancel();

      // Bip de radio antes de hablar
      this.playPttStartBeep();

      this.currentlyPlaying = true;
      onStart?.();

      setTimeout(() => {
        const cleanSender = senderName.split('(')[0].trim();
        const utterance = new SpeechSynthesisUtterance(`${cleanSender} en ${senderVehicle} reporta: ${text}`);

        // Personalización de tono y velocidad según el repartidor
        if (cleanSender.toLowerCase().includes('mateo')) {
          utterance.pitch = 0.9;
          utterance.rate = 1.05;
        } else if (cleanSender.toLowerCase().includes('valentina')) {
          utterance.pitch = 1.25;
          utterance.rate = 1.1;
        } else if (cleanSender.toLowerCase().includes('torre') || cleanSender.toLowerCase().includes('admin')) {
          utterance.pitch = 0.95;
          utterance.rate = 1.0;
        } else {
          utterance.pitch = 1.0;
          utterance.rate = 1.05;
        }

        // Buscar voz en español
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice =
          voices.find((v) => v.lang.startsWith('es-CO')) ||
          voices.find((v) => v.lang.startsWith('es-MX')) ||
          voices.find((v) => v.lang.startsWith('es-US')) ||
          voices.find((v) => v.lang.startsWith('es'));

        if (spanishVoice) {
          utterance.voice = spanishVoice;
          utterance.lang = spanishVoice.lang;
        } else {
          utterance.lang = 'es-CO';
        }

        utterance.onend = () => {
          this.currentlyPlaying = false;
          this.playPttReleaseSquelch();
          onEnd?.();
        };

        utterance.onerror = () => {
          this.currentlyPlaying = false;
          this.playPttReleaseSquelch();
          onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      }, 150);
    } catch {
      this.currentlyPlaying = false;
      onEnd?.();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentlyPlaying = false;
  }

  public isSpeaking(): boolean {
    return this.currentlyPlaying;
  }

  public getHandsFreeEnabled(): boolean {
    return this.isHandsFreeEnabled;
  }

  public setHandsFreeEnabled(enabled: boolean) {
    this.isHandsFreeEnabled = enabled;
  }
}

export const radioAudioService = new RadioAudioService();
