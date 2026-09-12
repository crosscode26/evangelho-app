import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as Speech from "expo-speech";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { fonts } from "@/theme/typography";
import { PlaybackSpeed, PlaybackState } from "@/types";

interface AudioPlayerProps {
  text: string;
}

const SPEEDS: PlaybackSpeed[] = [1.0, 1.25, 1.5];

// Rough words-per-minute for Portuguese TTS at normal rate, used only to
// estimate a progress bar — expo-speech does not report real playback time
// on every platform.
const ESTIMATED_WPM = 155;

// Escolhe a melhor voz em português disponível no aparelho.
// Android: vozes de "rede" do Google (identifier contém "network") soam bem
// mais naturais que as vozes locais compactas.
// iOS: vozes com quality "Enhanced" (Siri aprimorada) soam mais naturais que
// as "Default".
function pickBestPortugueseVoice(voices: Speech.Voice[]): string | undefined {
  const ptVoices = voices.filter((v) => v.language?.toLowerCase().startsWith("pt"));
  if (ptVoices.length === 0) return undefined;

  // Preferência: pt-BR antes de outras variantes (pt-PT etc.)
  const ptBR = ptVoices.filter((v) => v.language?.toLowerCase() === "pt-br");
  const pool = ptBR.length > 0 ? ptBR : ptVoices;

  if (Platform.OS === "ios") {
    const enhanced = pool.find((v) => v.quality === Speech.VoiceQuality.Enhanced);
    return (enhanced ?? pool[0]).identifier;
  }

  // Android: procura identificadores de vozes de rede (mais naturais)
  const network = pool.find((v) => v.identifier?.toLowerCase().includes("network"));
  return (network ?? pool[0]).identifier;
}

export function AudioPlayer({ text }: AudioPlayerProps) {
  const { colors } = useAppTheme();
  const [state, setState] = useState<PlaybackState>("idle");
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const estimatedDurationMsRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);

  const canPause = Platform.OS === "ios"; // expo-speech pause/resume is not reliable on Android

  // Busca a melhor voz pt disponível assim que o componente monta
  useEffect(() => {
    let isMounted = true;
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (!isMounted) return;
        setVoiceId(pickBestPortugueseVoice(voices));
      })
      .catch(() => {
        // Se falhar, segue sem voice explícita (usa o padrão do sistema)
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const clearProgressTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    clearProgressTimer();
    intervalRef.current = setInterval(() => {
      const elapsed = pausedElapsedRef.current + (Date.now() - startedAtRef.current);
      const pct = Math.min(elapsed / estimatedDurationMsRef.current, 1);
      setProgress(pct);
      if (pct >= 1) clearProgressTimer();
    }, 200);
  }, [clearProgressTimer]);

  const estimateDuration = useCallback(
    (currentSpeed: PlaybackSpeed) => {
      const wordCount = text.trim().split(/\s+/).length;
      const minutes = wordCount / (ESTIMATED_WPM * currentSpeed);
      return Math.max(minutes * 60 * 1000, 1000);
    },
    [text]
  );

  const stop = useCallback(() => {
    Speech.stop();
    clearProgressTimer();
    setState("idle");
    setProgress(0);
    pausedElapsedRef.current = 0;
  }, [clearProgressTimer]);

  const play = useCallback(
    (fromSpeed: PlaybackSpeed = speed) => {
      Speech.stop();
      estimatedDurationMsRef.current = estimateDuration(fromSpeed);
      pausedElapsedRef.current = 0;
      startedAtRef.current = Date.now();

      Speech.speak(text, {
        language: "pt-BR",
        voice: voiceId,
        rate: fromSpeed,
        onDone: () => {
          clearProgressTimer();
          setState("idle");
          setProgress(1);
        },
        onStopped: () => {
          clearProgressTimer();
        },
        onError: () => {
          clearProgressTimer();
          setState("idle");
        },
      });

      setState("playing");
      startProgressTimer();
    },
    [speed, text, voiceId, estimateDuration, startProgressTimer, clearProgressTimer]
  );

  const togglePlayPause = useCallback(() => {
    if (state === "idle") {
      play();
      return;
    }
    if (state === "playing") {
      if (canPause) {
        Speech.pause();
        clearProgressTimer();
        pausedElapsedRef.current += Date.now() - startedAtRef.current;
        setState("paused");
      } else {
        stop();
      }
      return;
    }
    if (state === "paused") {
      Speech.resume();
      startedAtRef.current = Date.now();
      startProgressTimer();
      setState("playing");
    }
  }, [state, canPause, play, stop, clearProgressTimer, startProgressTimer]);

  const changeSpeed = useCallback(
    (newSpeed: PlaybackSpeed) => {
      setSpeed(newSpeed);
      if (state !== "idle") {
        play(newSpeed);
      }
    },
    [state, play]
  );

  useEffect(() => {
    return () => {
      Speech.stop();
      clearProgressTimer();
    };
  }, [clearProgressTimer]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: colors.accent },
          ]}
        />
      </View>

      <View style={styles.controlsRow}>
        <Pressable onPress={stop} style={styles.iconButton} disabled={state === "idle"}>
          <Feather name="square" size={20} color={state === "idle" ? colors.textMuted : colors.text} />
        </Pressable>

        <Pressable
          onPress={togglePlayPause}
          style={[styles.playButton, { backgroundColor: colors.accent }]}
        >
          <Feather name={state === "playing" ? "pause" : "play"} size={26} color="#FFFFFF" />
        </Pressable>

        <View style={styles.speedGroup}>
          {SPEEDS.map((s) => (
            <Pressable
              key={s}
              onPress={() => changeSpeed(s)}
              style={[
                styles.speedChip,
                {
                  borderColor: colors.border,
                  backgroundColor: speed === s ? colors.accent : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.speedLabel,
                  { color: speed === s ? "#FFFFFF" : colors.textMuted },
                ]}
              >
                {s}x
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={[styles.statusText, { color: colors.textMuted }]}>
        {state === "playing" && "Lendo em voz alta…"}
        {state === "paused" && "Pausado"}
        {state === "idle" && progress >= 1 && "Leitura concluída"}
        {state === "idle" && progress === 0 && "Toque em reproduzir para ouvir a passagem"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(150,140,120,0.25)",
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  speedGroup: {
    flexDirection: "row",
  },
  speedChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 6,
  },
  speedLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  statusText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    textAlign: "center",
    marginTop: 14,
  },
});