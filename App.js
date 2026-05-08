import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [time, setTime] = useState(1500);
  const [duration, setDuration] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("P"); // 'P' 专注, 'S' 短休, 'L' 长休

  const animated = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  const radius = 130;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
  }, []);

  async function playClick() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/dragon-studio-new-notification-3-398649.mp3"),
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function playAlarm() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/sound.mp3"),
      );
      await sound.playAsync();
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            playAlarm();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: time / duration,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [time]);

  function handleMode(m, t) {
    playClick();
    setMode(m);
    setTime(t);
    setDuration(t);
    setIsRunning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const getColors = () => {
    if (mode === "P") return ["#F5F5DC", "#FFD1DC"];
    if (mode === "S") return ["#E0F7FA", "#B2EBF2"];
    return ["#F5F5DC", "#E0F7FA"];
  };

  const activeColor = mode === "S" || mode === "L" ? "#4A90E2" : "#D48192";

  return (
    <LinearGradient colors={getColors()} style={styles.container}>
      <StatusBar style="dark" />

      <Text style={[styles.label, { color: activeColor }]}>
        {mode === "P" ? "专注模式" : mode === "S" ? "短时间休息" : "长时间休息"}
      </Text>

      <View style={styles.timerWrapper}>
        <Svg width={radius * 2 + 20} height={radius * 2 + 20}>
          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={[styles.timerText, { color: activeColor }]}>
          {formatTime(time)}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => handleMode("P", 1500)}
            style={mode === "P" && styles.activeTab}
          >
            <Text style={[styles.tabText, { color: activeColor }]}>专注</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMode("S", 300)}
            style={mode === "S" && styles.activeTab}
          >
            <Text style={[styles.tabText, { color: activeColor }]}>短休</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMode("L", 900)}
            style={mode === "L" && styles.activeTab}
          >
            <Text style={[styles.tabText, { color: activeColor }]}>长休</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.playBtn, { borderBottomColor: activeColor }]}
          onPress={() => {
            playClick();
            setIsRunning(!isRunning);
          }}
        >
          <Text style={[styles.playText, { color: activeColor }]}>
            {isRunning ? "暂停" : "开始"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 60,
  },
  label: { fontSize: 16, letterSpacing: 3, fontWeight: "600" },
  timerWrapper: { justifyContent: "center", alignItems: "center" },
  timerText: { position: "absolute", fontSize: 75, fontWeight: "200" },
  footer: { alignItems: "center", width: "100%" },
  tabs: { flexDirection: "row", gap: 20, marginBottom: 40 },
  tabText: { fontSize: 15, fontWeight: "500", paddingHorizontal: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "rgba(0,0,0,0.1)" },
  playBtn: {
    borderBottomWidth: 1,
    paddingBottom: 5,
    width: 120,
    alignItems: "center",
  },
  playText: { fontSize: 18, letterSpacing: 2, fontWeight: "700" },
});
