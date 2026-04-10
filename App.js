import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {

  // 🔊 SONIDO
  async function playSound() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('./assets/sound.mp3'),
        {
          shouldPlay: true,
          volume: 1.0,
        }
      );

      await sound.playAsync();
    } catch (error) {
      console.log("ERROR SONIDO:", error);
    }
  }

  // 📳 VIBRACIÓN
  function vibrateStrong() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 200);
  }

  const [time, setTime] = useState(1500);
  const [duration, setDuration] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('P');

  const animated = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  const radius = 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  useEffect(() => {
    if (isRunning) {
      Animated.timing(animated, {
        toValue: 0,
        duration: time * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);

            playSound();      // 🔊 sonido
            vibrateStrong();  // 📳 vibración

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = () => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getColors = () => {
    if (mode === 'P') return ['#ff9a9e', '#fad0c4'];
    if (mode === 'DC') return ['#a18cd1', '#fbc2eb'];
    if (mode === 'DL') return ['#89f7fe', '#66a6ff'];
  };

  const changeMode = (newMode, seconds) => {
    setMode(newMode);
    setTime(seconds);
    setDuration(seconds);
    setIsRunning(false);
    animated.setValue(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <LinearGradient colors={getColors()} style={styles.container}>

      <Text style={styles.subtitle}>POMODORO</Text>

      {/* CÍRCULO */}
      <View style={styles.circleContainer}>
        <Svg width={300} height={300}>
          <Circle
            stroke="rgba(255,255,255,0.2)"
            fill="none"
            cx="150"
            cy="150"
            r={radius}
            strokeWidth={strokeWidth}
          />

          <AnimatedCircle
            stroke="#fff"
            fill="none"
            cx="150"
            cy="150"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="150,150"
          />
        </Svg>

        <Text style={styles.timer}>{formatTime()}</Text>
      </View>

      {/* BOTONES */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => changeMode('P', 1500)}>
          <Text style={styles.btnText}>P</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => changeMode('DC', 300)}>
          <Text style={styles.btnText}>DC</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => changeMode('DL', 600)}>
          <Text style={styles.btnText}>DL</Text>
        </TouchableOpacity>
      </View>

      {/* START */}
      <TouchableOpacity style={styles.startBtn} onPress={() => setIsRunning(!isRunning)}>
        <Text style={styles.startText}>
          {isRunning ? 'Pausar' : 'Iniciar'}
        </Text>
      </TouchableOpacity>

      <StatusBar style="light" />
    </LinearGradient>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtitle: {
    color: '#fff',
    fontSize: 36,
    letterSpacing: 2,
    marginBottom: 20,
    opacity: 0.9,
    fontWeight: '600',
  },

  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  timer: {
    position: 'absolute',
    fontSize: 65,
    color: '#fff',
    fontWeight: '200',
  },

  row: {
    flexDirection: 'row',
    gap: 15,
  },

  btn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 14,
    borderRadius: 20,
    width: 70,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  startBtn: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },

  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});